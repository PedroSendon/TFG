from api.models.workout import Workout, WorkoutExercise, Exercise, UserWorkout, TrainingPlan
from api.models.exercise import Exercise
from api.models.user import User
from api.models.process import ProgressTracking, ExerciseLog
from django.utils import timezone
from typing import List
from api.schemas.workout import TrainingPlanSchema  # Import TrainingPlanSchema

class WorkoutRepository:

    @staticmethod
    def get_workouts(user_id=None):
        """
        Obtener la lista de entrenamientos. Si se proporciona un user_id, filtrar por entrenamientos personalizados.
        :param user_id: ID del usuario (opcional).
        :return: Lista de diccionarios con los datos de cada entrenamiento.
        """
        if user_id:
            # Si hay lógica para entrenamientos personalizados, implementarla aquí.
            workouts = Workout.objects.filter(user__id=user_id)
        else:
            # Obtener todos los entrenamientos disponibles
            workouts = Workout.objects.all()

        # Serializamos los datos de los entrenamientos de la misma manera que list_all_exercises
        return [{
            "id": workout.id,
            "name": workout.name,
            "description": workout.description,
            "media": workout.media,
            # Puedes incluir más campos según tu modelo de Workout si es necesario
        } for workout in workouts]

    @staticmethod
    def get_training_plans_by_user(user_id):
        """
        Obtener todos los planes de entrenamiento asignados a un usuario.
        :param user_id: ID del usuario.
        :return: Una lista de diccionarios con los detalles de cada plan de entrenamiento y sus entrenamientos.
        """
        user_training_plans = UserWorkout.objects.filter(user_id=user_id).select_related('training_plan')

        training_plans_data = []
        
        for user_plan in user_training_plans:
            plan = user_plan.training_plan
            # Obtener los entrenamientos dentro de cada plan
            workouts = plan.workouts.all()

            workouts_data = [{
                "id": workout.id,
                "name": workout.name,
                "description": workout.description,
                "media": workout.media
            } for workout in workouts]

            training_plans_data.append({
                "plan_id": plan.id,
                "plan_name": plan.name,
                "plan_description": plan.description,
                "plan_media": plan.media,
                "workouts": workouts_data
            })

        return training_plans_data


    @staticmethod
    def get_workout_by_day(day):
        """
            Obtener los detalles de un entrenamiento basado en el día.
            :param day: Día del entrenamiento.
            :return: El objeto Workout correspondiente al día.
            """
        try:
            # Suponemos que existe alguna lógica que asocia el día con el entrenamiento
            # Aquí estamos simplificando, podrías tener una relación entre los días y las rutinas
            workout = Workout.objects.get(id=day)
            return workout
        except Workout.DoesNotExist:
            return None
        
    
    @staticmethod
    def get_workout_exercises_by_day(day_id):
        """
        Obtener los detalles de los ejercicios para un día de entrenamiento específico.
        :param day_id: El identificador del día de entrenamiento.
        :return: Una lista de ejercicios asociados con el entrenamiento del día.
        """
        try:
            workout = Workout.objects.get(id=day_id)
            exercises = workout.workoutexercise_set.all()  # Obtener todos los ejercicios asociados al entrenamiento
            return exercises
        except Workout.DoesNotExist:
            return None


    @staticmethod
    def mark_workout_day_complete(user, day_id, completed_exercises):
        """
        Marcar un día de entrenamiento como completado y registrar los ejercicios completados.
        :param user: El usuario que completó el entrenamiento.
        :param day_id: El identificador del día de entrenamiento.
        :param completed_exercises: Lista de ejercicios completados.
        """
        try:
            workout = Workout.objects.get(id=day_id)
        except Workout.DoesNotExist:
            return None

        # Registrar o actualizar el progreso del usuario
        progress, created = ProgressTracking.objects.get_or_create(
            user=user,
            date=timezone.now().date(),
            defaults={'completed_workouts': 1}
        )

        if not created:
            # Si ya existe un registro de progreso para el día, simplemente incrementamos los entrenamientos completados
            progress.completed_workouts += 1
            progress.save()

        # Registrar cada ejercicio completado
        for exercise_data in completed_exercises:
            try:
                exercise = Exercise.objects.get(name=exercise_data['name'])
                ExerciseLog.objects.create(
                    user=user,
                    workout=workout,
                    exercise=exercise,
                    sets_completed=exercise_data.get('sets_completed', 0),
                    reps_completed=exercise_data.get('reps_completed', 0),
                    rest_time=exercise_data.get('rest_time', 0)
                )
            except Exercise.DoesNotExist:
                # Si el ejercicio no existe, simplemente lo omitimos
                continue

        return progress
    
    @staticmethod
    def get_workout_by_id(workout_id):
        """
        Obtener los detalles de un entrenamiento específico.
        :param workout_id: ID del entrenamiento.
        :return: Un diccionario con los detalles del entrenamiento o None si no existe.
        """
        try:
            workout = Workout.objects.get(id=workout_id)
            exercises = WorkoutExercise.objects.filter(workout_id=workout_id).select_related('exercise')

            exercises_data = [{
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

            return {
                "id": workout.id,
                "name": workout.name,
                "description": workout.description,
                "media": workout.media,
                "exercises": exercises_data
            }

        except Workout.DoesNotExist:
            return None

        
    @staticmethod
    def create_workout(name, description, exercises, media=None, days_per_week=None, duration=None, difficulty=None, equipment=None):
        """
        Crear un nuevo entrenamiento en el sistema.
        :param name: Nombre del entrenamiento.
        :param description: Descripción del entrenamiento.
        :param exercises: Lista de ejercicios asociados al entrenamiento.
        :param media: URL o base64 de la imagen o video asociado al entrenamiento (opcional).
        :param days_per_week: Número de días a la semana que se realiza el entrenamiento.
        :param duration: Duración total del entrenamiento en minutos.
        :param difficulty: Nivel de dificultad del entrenamiento.
        :param equipment: Equipos necesarios para realizar el entrenamiento.
        :return: Un diccionario con los datos del entrenamiento creado.
        """
        # Crear el entrenamiento
        workout = Workout.objects.create(
            name=name,
            description=description,
            media=media,
            days_per_week=days_per_week,
            duration=duration,
            difficulty=difficulty,
            equipment=equipment,
        )

        # Añadir los ejercicios al entrenamiento
        for exercise in exercises:
            try:
                existing_exercise = Exercise.objects.get(name=exercise['name'])
                WorkoutExercise.objects.create(
                    workout=workout,
                    exercise=existing_exercise,
                    sets=exercise['sets'],
                    reps=exercise['reps'],
                    rest=exercise['rest']
                )
            except Exercise.DoesNotExist:
                continue  # Si no existe el ejercicio, se ignora

        # Recopilar los datos de los ejercicios añadidos
        exercises_data = [{
            "name": ex['name'],
            "sets": ex['sets'],
            "reps": ex['reps'],
            "rest": ex['rest']
        } for ex in exercises]

        return {
            "id": workout.id,
            "name": workout.name,
            "description": workout.description,
            "exercises": exercises_data,
            "media": workout.media,
            "days_per_week": workout.days_per_week,
            "duration": workout.duration,
            "difficulty": workout.difficulty,
            "equipment": workout.equipment,
        }

    @staticmethod
    def update_workout(workout_id, name, description, exercises, media=None):
        """
        Actualizar un entrenamiento existente en el sistema.
        :param workout_id: ID del entrenamiento a actualizar.
        :param name: Nuevo nombre del entrenamiento.
        :param description: Nueva descripción del entrenamiento.
        :param exercises: Lista de ejercicios asociados al entrenamiento.
        :param media: Nueva URL o base64 de la imagen o video asociado al entrenamiento (opcional).
        :return: Un diccionario con los datos del entrenamiento actualizado o None si no existe.
        """
        try:
            workout = Workout.objects.get(id=workout_id)
            workout.name = name
            workout.description = description
            workout.media = media
            workout.save()

            # Eliminar los ejercicios anteriores asociados con el entrenamiento
            WorkoutExercise.objects.filter(workout=workout).delete()

            # Añadir los nuevos ejercicios al entrenamiento
            for exercise in exercises:
                try:
                    existing_exercise = Exercise.objects.get(name=exercise['name'])
                    WorkoutExercise.objects.create(
                        workout=workout,
                        exercise=existing_exercise,
                        sets=exercise['series'],
                        reps=exercise['reps'],
                        rest=exercise['rest']
                    )
                except Exercise.DoesNotExist:
                    continue  # Si no existe el ejercicio, se ignora

            # Recopilar los datos de los ejercicios actualizados
            exercises_data = [{
                "name": ex['name'],
                "series": ex['series'],
                "reps": ex['reps'],
                "rest": ex['rest']
            } for ex in exercises]

            return {
                "id": workout.id,
                "name": workout.name,
                "description": workout.description,
                "exercises": exercises_data,
                "media": workout.media
            }
        except Workout.DoesNotExist:
            return None
        
    @staticmethod
    def delete_workout(workout_id):
        """
        Eliminar un entrenamiento existente en el sistema.
        :param workout_id: ID del entrenamiento a eliminar.
        :return: True si el entrenamiento fue eliminado, False si no se encontró.
        """
        try:
            workout = Workout.objects.get(id=workout_id)
            workout.delete()
            return True
        except Workout.DoesNotExist:
            return False
        
class TrainingPlanRepository:

    @staticmethod
    def create_training_plan(name: str, description: str, workout_ids: List[int], media: str, difficulty: str, equipment: str, duration: int):
        """
        Crear un nuevo plan de entrenamiento.
        :param name: Nombre del plan.
        :param description: Descripción del plan.
        :param workout_ids: Lista de IDs de entrenamientos asociados.
        :param media: URL del media (imagen/video).
        :param difficulty: Dificultad del plan.
        :param equipment: Equipamiento necesario.
        :param duration: Duración del plan.
        :return: Un diccionario con los detalles del plan creado.
        """
        workouts = Workout.objects.filter(id__in=workout_ids)
        
        if not workouts.exists():
            raise ValueError("Los entrenamientos asociados no existen.")
        
        training_plan = TrainingPlan.objects.create(
            name=name,
            description=description,
            media=media,
            difficulty=difficulty,
            equipment=equipment,
            duration=duration
        )
        training_plan.workouts.set(workouts)  # Asignamos los entrenamientos al plan
        training_plan.save()

        return {
            "id": training_plan.id,
            "name": training_plan.name,
            "description": training_plan.description,
            "media": training_plan.media,
            "difficulty": training_plan.difficulty,
            "equipment": training_plan.equipment,
            "duration": training_plan.duration,
            "workouts": [workout.id for workout in training_plan.workouts.all()]
        }
    
    @staticmethod
    def get_all_training_plans() -> List[TrainingPlanSchema]:
        """
        Obtener todos los planes de entrenamiento.
        :return: Una lista de esquemas de planes de entrenamiento.
        """
        training_plans = TrainingPlan.objects.all()  # Suponiendo que usas un ORM como Django ORM
        return [TrainingPlanSchema.from_orm(plan) for plan in training_plans]
    
    @staticmethod
    def get_training_plan_by_id(training_plan_id: int) -> TrainingPlanSchema:
        """
        Obtener un plan de entrenamiento por su ID.
        :param training_plan_id: El identificador del plan de entrenamiento.
        :return: Un esquema del plan de entrenamiento o None si no existe.
        """
        try:
            training_plan = TrainingPlan.objects.get(id=training_plan_id)
            return TrainingPlanSchema.from_orm(training_plan)
        except TrainingPlan.DoesNotExist:
            return None
