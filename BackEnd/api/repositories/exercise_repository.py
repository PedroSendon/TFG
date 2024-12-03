from pydantic import ValidationError
from api.repositories.user_repository import UserRepository
from api.schemas.exercise import ExerciseUpdateSchema, CreateExerciseSchema
from api.models.user import User
from api.models.exercise import Exercise
from api.models.workout import UserWorkout, Workout, WorkoutExercise
from api.models.process import ExerciseLog
from django.db.models import Sum
from datetime import datetime
from rest_framework import status
from google.cloud import storage
from datetime import timedelta
from api.utils.googleCloud import upload_to_gcs, delete_file_from_gcs

class ExerciseRepository:

    @staticmethod
    def get_exercise_popularity(year=None):
        """
        Obtener la popularidad de los ejercicios más realizados en la plataforma.
        :param year: Año para filtrar los datos.
        :return: Una lista de diccionarios con el nombre del ejercicio y las veces repetidas.
        """
        if year is None:
            year = datetime.now().year

        # Filtrar los registros de ejercicios por año y agrupar por ejercicio
        popularity = (
            ExerciseLog.objects
            .filter(date__year=year)
            .values('exercise__name')
            .annotate(times_repeated=Sum('sets_completed'))
            .order_by('-times_repeated')
        )

        # Convertir el resultado a una lista de diccionarios
        return [{"exercise": entry['exercise__name'], "timesRepeated": entry['times_repeated']} for entry in popularity]

    @staticmethod
    def get_exercise_by_id(exercise_id):
        """
        Obtener un ejercicio específico por su ID.
        :param exercise_id: ID del ejercicio.
        :return: Un diccionario con los detalles del ejercicio o None si no se encuentra.
        """
        try:
            exercise = Exercise.objects.get(id=exercise_id)
            return {
                "id": exercise.id,
                "name": exercise.name,
                "description": exercise.description,
                "muscleGroups": exercise.get_muscle_groups(),
                "instructions": exercise.get_instructions_list(),
                "media": exercise.media,
            }
        except Exercise.DoesNotExist:
            return None
    
    @staticmethod
    def create_exercise(user, data):
        try:
            check_result = UserRepository.check_user_role(user, ['entrenador', 'administrador'])
            if "error" in check_result:
                return check_result

            # Validar datos
            required_fields = ['name', 'description', 'muscleGroups', 'instructions']
            if not all(field in data for field in required_fields):
                return {"error": "Faltan campos obligatorios", "status": status.HTTP_400_BAD_REQUEST}

   
            # Subir la imagen si existe
            media_url = None
            media_file = data.get('media')  # El archivo viene de request.FILES

            if media_file:
                try:
                    media_url = upload_to_gcs(media_file, f"exercises/{data['name']}_media.jpg")
                except Exception as e:
                    return {"error": f"Error al subir la imagen: {str(e)}", "status": status.HTTP_500_INTERNAL_SERVER_ERROR}

            # Crear el ejercicio
            exercise = Exercise.objects.create(
                name=data['name'],
                description=data['description'],
                instructions=data['instructions'],
                media=media_url
            )

            # Asignar los grupos musculares
            muscle_groups_str = ','.join(data['muscleGroups'])
            exercise.set_muscle_groups(muscle_groups_str)
            exercise.save()

            return {
                "data": {
                    "id": exercise.id,
                    "name": exercise.name,
                    "description": exercise.description,
                    "muscleGroups": exercise.get_muscle_groups(),
                    "instructions": exercise.instructions,
                    "media": exercise.media
                }
            }
        except ValidationError as e:
            return {"error": e.errors(), "status": status.HTTP_400_BAD_REQUEST}
        except Exception as e:
            return {"error": str(e), "status": status.HTTP_500_INTERNAL_SERVER_ERROR}


    @staticmethod
    def update_exercise(exercise_id: int, user, data: dict):
        """
        Modificar un ejercicio existente.
        """
        # Verificar permisos
        if user.role not in ['entrenador', 'administrador']:
            return {"error": "No tienes permisos para modificar ejercicios", "status": status.HTTP_403_FORBIDDEN}

        # Validar datos con ExerciseUpdateSchema
        try:
            schema = ExerciseUpdateSchema(**data)
            validated_data = schema.dict(exclude_unset=True)
        except ValidationError as e:
            return {"error": "Datos no válidos", "details": e.errors(), "status": status.HTTP_400_BAD_REQUEST}

        # Intentar obtener y actualizar el ejercicio
        try:
            exercise = Exercise.objects.get(id=exercise_id)
            old_media_url = exercise.media  # Guardar la URL anterior de la imagen

            # Actualizar los campos con los datos validados
            if 'name' in validated_data:
                exercise.name = validated_data['name']
            if 'description' in validated_data:
                exercise.description = validated_data['description']
            if 'muscleGroups' in validated_data:
                exercise.muscleGroups = ','.join(validated_data['muscleGroups'])
            if 'instructions' in validated_data:
                exercise.instructions = validated_data['instructions']
            # Gestionar la actualización de la imagen
            media_file = data.get('media')  # Obtener la nueva imagen si está en los datos
            if media_file:
                try:
                    # Subir la nueva imagen
                    new_media_url = upload_to_gcs(media_file, f"exercises/{data['name']}_media.jpg")
                    exercise.media = new_media_url
                    delete_file_from_gcs(old_media_url)
                except Exception as e:
                    return {"error": f"Error al subir la nueva imagen: {str(e)}", "status": status.HTTP_500_INTERNAL_SERVER_ERROR}


            exercise.save()

            # Retornar datos del ejercicio actualizado con el estado 200
            return {
                "data": {
                    "id": exercise.id,
                    "name": exercise.name,
                    "description": exercise.description,
                    "muscleGroups": exercise.get_muscle_groups(),
                    "instructions": exercise.instructions,
                    "media": exercise.media
                },
                "status": status.HTTP_200_OK
            }
        except Exercise.DoesNotExist:
            # Si no se encuentra el ejercicio, devolver 404
            return {"error": "Ejercicio no encontrado", "status": status.HTTP_404_NOT_FOUND}
        
        
    @staticmethod
    def delete_workout(user, workout_id):
        """
        Eliminar un entrenamiento existente en el sistema, incluyendo su imagen asociada en Google Cloud Storage.

        :param user: Usuario que realiza la solicitud.
        :param workout_id: ID del entrenamiento a eliminar.
        :return: True si el entrenamiento fue eliminado, False si no se encontró, o un mensaje de error.
        """
        # Verificar el rol del usuario
        check_result = UserRepository.check_user_role(user, ['entrenador', 'administrador'])
        if "error" in check_result:
            return {"error": check_result["error"], "status": check_result["status"]}

        try:
            # Obtener el entrenamiento
            workout = Workout.objects.get(id=workout_id)

            # Si tiene una imagen asociada, eliminarla usando el método `delete_file_from_gcs`
            if workout.media:  # Si el modelo tiene un campo `media` asociado
                delete_success = delete_file_from_gcs(workout.media)
                if not delete_success:
                    print(f"Advertencia: No se pudo eliminar la imagen asociada del entrenamiento {workout_id}.")

            # Eliminar las relaciones ManyToMany (si existen)
            workout.exercises.clear()  # Limpiar relaciones con ejercicios

            # Eliminar el registro del entrenamiento en la base de datos
            workout.delete()
            return True
        except Workout.DoesNotExist:
            return False
        except Exception as e:
             # Agregar un log o manejar el error adecuadamente
            print(f"Error al eliminar el entrenamiento o la imagen: {e}")
            return {"error": str(e), "status": status.HTTP_500_INTERNAL_SERVER_ERROR}


    @staticmethod
    def list_all_exercises():
        """
        Listar todos los ejercicios disponibles en el sistema.
        :return: Una lista de diccionarios con los datos de cada ejercicio.
        """
        exercises = Exercise.objects.all()
        return [{
            "id": exercise.id,
            "name": exercise.name,
            "description": exercise.description,
            # Acceder directamente a la lista de grupos musculares
            "muscleGroups": exercise.get_muscle_groups(),
            "instructions": exercise.instructions,
            "media": exercise.media
        } for exercise in exercises]

    @staticmethod
    def get_exercise_by_user_workout_and_id(user, workout_id, exercise_id):
        """
        Obtener un ejercicio por su ID y el ID del workout dentro del training plan del usuario.
        :param user: Usuario autenticado.
        :param workout_id: ID del workout.
        :param exercise_id: ID del ejercicio.
        :return: Un diccionario con los detalles del ejercicio o None si no existe.
        """
        try:
            # Verificar que `user` es una instancia del modelo User
            if not isinstance(user, User):
                user = User.objects.get(id=user.id)

            # Primero, obtenemos el UserWorkout y el TrainingPlan asociado
            user_workout = UserWorkout.objects.get(user=user)
            training_plan = user_workout.training_plan

            # Iteramos sobre los workouts en el training plan
            for workout in training_plan.workouts.all():
                if workout.id == workout_id:
                    # Una vez que encontramos el workout correcto, iteramos sobre los ejercicios
                    for workout_exercise in workout.workoutexercise_set.all():
                        if workout_exercise.exercise_id == exercise_id:
                            # Ejercicio encontrado, retornamos los detalles
                            exercise = workout_exercise.exercise
                            return {
                                "id": exercise.id,
                                "name": exercise.name,
                                "description": exercise.description,
                                "muscleGroups": exercise.get_muscle_groups(),
                                "instructions": exercise.get_instructions_list(),
                                "media": exercise.media,
                                "sets": workout_exercise.sets,
                                "reps": workout_exercise.reps,
                                "rest": workout_exercise.rest
                            }

            print(f"No se encontró el ejercicio con ID {
                  exercise_id} en el workout con ID {workout_id}")
            return None
        except UserWorkout.DoesNotExist:
            print(f"No se encontró un UserWorkout para el usuario {user}")
            return None
        except Exception as e:
            print(f"Error inesperado: {e}")
            return None

    @staticmethod
    def get_exercises_by_training(training_id):
        """
        Obtener todos los ejercicios de un entrenamiento específico.
        :param training_id: ID del entrenamiento.
        :return: Una lista de diccionarios con los datos de cada ejercicio.
        """
        exercises = (
            WorkoutExercise.objects
            .filter(workout_id=training_id)
            .select_related('exercise')
        )

        return [{
            "id": exercise.exercise.id,
            "name": exercise.exercise.name,
            "description": exercise.exercise.description,
            # Acceder directamente a la lista de grupos musculares
            "muscleGroups": exercise.exercise.get_muscle_groups(),
            "instructions": exercise.exercise.instructions,
            "media": exercise.exercise.media,
            "sets": exercise.sets,
            "reps": exercise.reps,
            "rest": exercise.rest
        } for exercise in exercises]
