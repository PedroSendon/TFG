from api.models.exercise import Exercise
from api.models.workout import WorkoutExercise
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
            muscle_groups=",".join(muscle_groups),  # Guardar los grupos musculares como una cadena separada por comas
            instructions=instructions,
            media=media
        )

        return {
            "id": exercise.id,
            "name": exercise.name,
            "description": exercise.description,
            "muscleGroups": muscle_groups,
            "instructions": exercise.instructions,
            "media": exercise.media
        }
    
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
            "muscleGroups": exercise.muscle_groups.split(","),
            "instructions": exercise.instructions,
            "media": exercise.media
        } for exercise in exercises]
    
    @staticmethod
    def get_exercise_by_id(exercise_id):
        """
        Obtener un ejercicio por su ID.
        :param exercise_id: ID del ejercicio.
        :return: Un diccionario con los detalles del ejercicio o None si no existe.
        """
        try:
            exercise = Exercise.objects.get(id=exercise_id)
            return {
                "id": exercise.id,
                "name": exercise.name,
                "description": exercise.description,
                "muscleGroups": exercise.muscle_groups.split(","),
                "instructions": exercise.instructions,
                "media": exercise.media
            }
        except Exercise.DoesNotExist:
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
            "muscleGroups": exercise.exercise.muscle_groups.split(","),
            "instructions": exercise.exercise.instructions,
            "media": exercise.exercise.media,
            "sets": exercise.sets,
            "reps": exercise.reps,
            "rest": exercise.rest
        } for exercise in exercises]