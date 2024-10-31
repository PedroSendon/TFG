from api.models.user import User
from api.models.exercise import Exercise
from api.models.workout import UserWorkout, Workout, WorkoutExercise
from api.models.process import ExerciseLog
from django.db.models import Sum
from datetime import datetime

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
    def create_exercise(name, description, muscle_groups, instructions, media=None):
        """
        Crear un nuevo ejercicio en el sistema.
        :param name: Nombre del ejercicio.
        :param description: Descripción del ejercicio.
        :param muscle_groups: Lista de grupos musculares trabajados.
        :param instructions: Instrucciones para realizar el ejercicio.
        :param media: URL o base64 de la imagen o video del ejercicio (opcional).
        :return: Un diccionario con los datos del ejercicio creado.
        """
        # Crear un nuevo ejercicio
        exercise = Exercise.objects.create(
            name=name,
            description=description,
            instructions=instructions,
            media=media
        )
        
        # Usar el método set_muscle_groups para almacenar la lista como una cadena separada por comas
        exercise.set_muscle_groups(muscle_groups)
        exercise.save()

        return {
            "id": exercise.id,
            "name": exercise.name,
            "description": exercise.description,
            "muscleGroups": exercise.get_muscle_groups(),
            "instructions": exercise.instructions,
            "media": exercise.media
        }

    
    @staticmethod
    def update_exercise(exercise_id: int, data: dict):
        try:
            exercise = Exercise.objects.get(id=exercise_id)
            if 'name' in data:
                exercise.name = data['name']
            if 'description' in data:
                exercise.description = data['description']
            if 'muscle_groups' in data:
                exercise.muscle_groups = ','.join(data['muscle_groups'])
            if 'instructions' in data:
                exercise.instructions = data['instructions']
            if 'media' in data:
                exercise.media = data['media']
            
            exercise.save()

            return {
                "id": exercise.id,
                "name": exercise.name,
                "description": exercise.description,
                "muscle_groups": exercise.muscle_groups.split(","),
                "instructions": exercise.instructions,
                "media": exercise.media
            }
        except Exercise.DoesNotExist:
            return None
        
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
            "muscleGroups": exercise.get_muscle_groups(),  # Acceder directamente a la lista de grupos musculares
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
            
            print(f"No se encontró el ejercicio con ID {exercise_id} en el workout con ID {workout_id}")
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
            "muscleGroups": exercise.exercise.get_muscle_groups(),  # Acceder directamente a la lista de grupos musculares
            "instructions": exercise.exercise.instructions,
            "media": exercise.exercise.media,
            "sets": exercise.sets,
            "reps": exercise.reps,
            "rest": exercise.rest
        } for exercise in exercises]
