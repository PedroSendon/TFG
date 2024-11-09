from pydantic import ValidationError
from api.schemas.exercise import ExerciseUpdateSchema, CreateExerciseSchema
from api.models.user import User
from api.models.exercise import Exercise
from api.models.workout import UserWorkout, Workout, WorkoutExercise
from api.models.process import ExerciseLog
from django.db.models import Sum
from datetime import datetime
from rest_framework import status


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
        """
        Crear un nuevo ejercicio en el sistema.
        :param user: El usuario que realiza la solicitud.
        :param data: Los datos de la solicitud.
        :return: Un diccionario con los datos del ejercicio creado o un mensaje de error.
        """
        # Crear el nuevo ejercicio
        try:
            # Verificar si el objeto `user` es una instancia de `User`
            if not isinstance(user, User):
                user = User.objects.get(id=user.id)

            # Verificar permisos
            if user.role not in ['entrenador', 'administrador']:
                return {"error": "No tienes permisos para crear ejercicios", "status": status.HTTP_403_FORBIDDEN}

            schema = CreateExerciseSchema(**data)
            validated_data = schema.dict()
            exercise = Exercise.objects.create(
                name=validated_data['name'],
                description=validated_data['description'],
                instructions=validated_data['instructions'],
                media=validated_data.get('media')
            )

            # Usar el método set_muscle_groups para almacenar la lista como una cadena separada por comas
            muscle_groups_str = ','.join(validated_data['muscleGroups'])
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
        except Exception as e:
            return {"error": str(e), "status": status.HTTP_500_INTERNAL_SERVER_ERROR}

    @staticmethod
    def update_exercise(exercise_id: int, user, data: dict):
        """
        Modificar un ejercicio existente.
        :param exercise_id: ID del ejercicio a modificar.
        :param user: Usuario que realiza la petición.
        :param data: Datos actualizados del ejercicio.
        :return: Un diccionario con los datos del ejercicio actualizado o un mensaje de error.
        """

        # Verificar si el objeto `user` es una instancia de `User`
        if not isinstance(user, User):
            user = User.objects.get(id=user.id)

        if user.role not in ['entrenador', 'administrador']:
            return {"error": "No tienes permisos para modificar ejercicios", "status": status.HTTP_403_FORBIDDEN}

        # Validar los datos con el schema
        try:
            schema = ExerciseUpdateSchema(**data)
            validated_data = schema.dict(exclude_unset=True)
        except ValidationError as e:
            return {"error": "Datos no válidos", "status": status.HTTP_400_BAD_REQUEST}

        # En la función update_exercise del repositorio
        try:
            exercise = Exercise.objects.get(id=exercise_id)

            if 'name' in validated_data:
                exercise.name = validated_data['name']
            if 'description' in validated_data:
                exercise.description = validated_data['description']
            if 'muscleGroups' in validated_data:  # Cambia aquí el nombre del campo si es necesario
                exercise.muscleGroups = ','.join(
                    validated_data['muscleGroups'])
            if 'instructions' in validated_data:
                exercise.instructions = validated_data['instructions']
            if 'media' in validated_data:
                exercise.media = validated_data['media']

            exercise.save()

            return {
                "data": {
                    "id": exercise.id,
                    "name": exercise.name,
                    "description": exercise.description,
                    # Cambia aquí si el nombre es correcto
                    "muscleGroups": exercise.muscleGroups.split(","),
                    "instructions": exercise.instructions,
                    "media": exercise.media
                }
            }
        except Exercise.DoesNotExist:
            return {"error": "Ejercicio no encontrado", "status": status.HTTP_404_NOT_FOUND}

    @staticmethod
    def delete_exercise_by_id(exercise_id: int) -> bool:
        """
        Elimina un ejercicio por su ID.

        :param exercise_id: ID del ejercicio a eliminar.
        :return: True si el ejercicio fue eliminado, False si no se encontró.
        """
        try:
            exercise = Exercise.objects.get(id=exercise_id)
            exercise.delete()
            return True
        except Exercise.DoesNotExist:
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
