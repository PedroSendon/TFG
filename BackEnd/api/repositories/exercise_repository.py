from pydantic import ValidationError
from api.repositories.user_repository import UserRepository
from api.schemas.exercise import CreateExerciseSchema
from api.models.user import User
from api.models.exercise import Exercise
from api.models.workout import UserWorkout, WorkoutExercise
from rest_framework import status
from api.utils.googleCloud import upload_to_gcs, delete_file_from_gcs

class ExerciseRepository:


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
            # Verificar roles
            check_result = UserRepository.check_user_role(user, ['entrenador', 'administrador'])
            if "error" in check_result:
                return check_result

            # Validar datos obligatorios
            required_fields = ['name', 'description', 'muscleGroups', 'instructions']
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return {"error": f"Faltan los siguientes campos obligatorios: {', '.join(missing_fields)}", "status": status.HTTP_400_BAD_REQUEST}

            # Validar que muscleGroups sea una lista y convertir si es posible
            muscle_groups = data.get('muscleGroups')
            if not isinstance(muscle_groups, list):
                return {"error": "El campo 'muscleGroups' debe ser una lista", "status": status.HTTP_400_BAD_REQUEST}

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
            exercise.set_muscle_groups(muscle_groups)
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
        except Exception as e:
            # Registrar cualquier error no manejado
            print(f"Error en create_exercise: {str(e)}")
            return {"error": "Error interno del servidor", "status": status.HTTP_500_INTERNAL_SERVER_ERROR}

    @staticmethod
    def update_exercise(user, data, files):
        """
        Modificar un ejercicio existente.
        """
        if user.role not in ['entrenador', 'administrador']:
            return {"error": "No tienes permisos para modificar ejercicios", "status": status.HTTP_403_FORBIDDEN}

        try:
            exercise = Exercise.objects.get(id=data['id'])
            old_media_url = exercise.media  # Guardar URL de la imagen actual

            if not data.get('name'):
                return {"error": "El campo 'name' no puede estar vacío", "status": status.HTTP_400_BAD_REQUEST}
            if 'muscleGroups' in data and not isinstance(data['muscleGroups'], list):
                return {"error": "El campo 'muscleGroups' debe ser una lista de cadenas de texto", "status": status.HTTP_400_BAD_REQUEST}
            if not data.get('instructions'):
                return {"error": "El campo 'instructions' no puede estar vacío", "status": status.HTTP_400_BAD_REQUEST}
            if not data.get('description'):
                return {"error": "El campo 'description' no puede estar vacío", "status": status.HTTP_400_BAD_REQUEST}

            # Actualizar los campos
            if 'name' in data:
                exercise.name = data['name']
            if 'description' in data:
                exercise.description = data['description']
            if 'muscleGroups' in data:
                exercise.set_muscle_groups(data.get('muscleGroups'))
            if 'instructions' in data:
                exercise.instructions = data['instructions']

            # Subir nueva imagen si se envió un archivo
            media_file = files.get('media')
            if media_file:
                try:
                    new_media_url = upload_to_gcs(media_file, f"exercises/{data['name']}_media.jpg")
                    exercise.media = new_media_url  # Actualizar URL de la imagen
                    if old_media_url:
                        delete_file_from_gcs(old_media_url)  # Eliminar la imagen anterior
                except Exception as e:
                    return {"error": f"Error al subir la nueva imagen: {str(e)}", "status": status.HTTP_500_INTERNAL_SERVER_ERROR}

            exercise.save()

            return {
                "data": {
                    "id": exercise.id,
                    "name": exercise.name,
                    "description": exercise.description,
                    "muscleGroups": exercise.get_muscle_groups(),
                    "instructions": exercise.instructions,
                    "media": exercise.media,
                },
                "status": status.HTTP_200_OK,
            }
        except Exercise.DoesNotExist:
            return {"error": "Ejercicio no encontrado", "status": status.HTTP_404_NOT_FOUND}
        except Exception as e:
            return {"error": str(e), "status": status.HTTP_500_INTERNAL_SERVER_ERROR}

        
    @staticmethod
    def delete_exercise_by_id(exercise_id: int) -> bool:
        """
        Elimina un ejercicio por su ID, incluyendo su imagen en Google Cloud Storage.

        :param exercise_id: ID del ejercicio a eliminar.
        :return: True si el ejercicio fue eliminado, False si no se encontró.
        """
        try:
            # Obtener el ejercicio por su ID
            exercise = Exercise.objects.get(id=exercise_id)

            # Si tiene una imagen asociada, eliminarla de Google Cloud Storage
            if exercise.media:
                delete_success = delete_file_from_gcs(exercise.media)
                if not delete_success:
                    print(f"Advertencia: No se pudo eliminar la imagen asociada al ejercicio con ID {exercise_id}.")

            # Eliminar el registro del ejercicio en la base de datos
            exercise.delete()
            return True

        except Exercise.DoesNotExist:
            return False
        except Exception as e:
            # Agregar un log o manejar el error adecuadamente
            print(f"Error al eliminar el ejercicio o la imagen: {e}")
            return False




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
