from api.repositories.user_repository import UserRepository
from api.models.user import User
from api.models.workout import Workout, WorkoutExercise, Exercise, UserWorkout
from api.models.exercise import Exercise
from api.models.process import ProgressTracking, ExerciseLog
from django.utils import timezone
from rest_framework import status

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
    def get_workout_exercises_by_user_and_day(user, day_id):
        """
        Obtener los detalles de los ejercicios para un día de entrenamiento específico dentro del plan de entrenamiento del usuario.
        :param user: Usuario autenticado.
        :param day_id: El identificador del día de entrenamiento (workout).
        :return: Una lista de diccionarios con los detalles de cada ejercicio asociado con el workout del día o None si no existe.
        """
        try:
            # Verificar que `user` es una instancia del modelo User
            if not isinstance(user, User):
                user = User.objects.get(id=user.id)
            # Obtener el plan de entrenamiento del usuario
            user_workout = UserWorkout.objects.get(user=user)
            training_plan = user_workout.training_plan

            # Obtener el workout específico dentro del training plan
            workout = training_plan.workouts.get(id=day_id)
            
            # Preparar los detalles de cada ejercicio en el workout
            exercise_data = [
                {
                    "id": workout_exercise.exercise.id,
                    "name": workout_exercise.exercise.name,
                    "imageUrl": workout_exercise.exercise.media,
                    "sets": workout_exercise.sets,
                    "reps": workout_exercise.reps,
                    "rest": workout_exercise.rest,
                    "completed": False  # Puedes personalizar este campo si tienes información de progreso
                }
                for workout_exercise in workout.workoutexercise_set.all()
            ]
            
            return exercise_data
        except UserWorkout.DoesNotExist:
            print(f"No se encontró un plan de entrenamiento para el usuario {user}")
            return None
        except Workout.DoesNotExist:
            print(f"No se encontró el workout con ID {day_id} en el plan de entrenamiento del usuario {user}")
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
    def create_workout(user, data):
        """
        Crear un nuevo entrenamiento en el sistema.
        :param user: Usuario que realiza la solicitud.
        :param data: Datos del entrenamiento.
        :return: Un diccionario con los datos del entrenamiento creado o un mensaje de error.
        """
        # Verificar el rol del usuario
        check_result = UserRepository.check_user_role(user, ['entrenador', 'administrador'])
        if "error" in check_result:
            return check_result

        # Validar los datos obligatorios
        required_fields = ['name', 'description', 'exercises', 'duration']
        if not all(field in data and data[field] for field in required_fields):
            return {"error": "Faltan parámetros obligatorios o hay valores no válidos.", "status": status.HTTP_400_BAD_REQUEST}

        exercises = data.get('exercises')
        
        # Validar que 'exercises' sea una lista de diccionarios
        if not isinstance(exercises, list) or not all(isinstance(ex, dict) for ex in exercises):
            return {"error": "El parámetro 'exercises' debe ser una lista de objetos.", "status": status.HTTP_400_BAD_REQUEST}

        # Crear el entrenamiento
        workout = Workout.objects.create(
            name=data['name'],
            description=data['description'],
            media=data.get('media'),
            duration=data['duration']
        )

        # Añadir los ejercicios al entrenamiento
        exercises_data = []
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
                exercises_data.append({
                    "name": exercise['name'],
                    "sets": exercise['sets'],
                    "reps": exercise['reps'],
                    "rest": exercise['rest']
                })
            except Exercise.DoesNotExist:
                continue  # Si no existe el ejercicio, se ignora

        return {
            "data": {
                "id": workout.id,
                "name": workout.name,
                "description": workout.description,
                "exercises": exercises_data,
                "media": workout.media,
                "duration": workout.duration
            }
        }

    @staticmethod
    def update_workout(user, workout_id, name, description, exercises, media=None):
        """
        Actualizar un entrenamiento existente en el sistema.
        :param user: El usuario que realiza la solicitud.
        :param workout_id: ID del entrenamiento a actualizar.
        :param name: Nuevo nombre del entrenamiento.
        :param description: Nueva descripción del entrenamiento.
        :param exercises: Lista de ejercicios asociados al entrenamiento.
        :param media: Nueva URL o base64 de la imagen o video asociado al entrenamiento (opcional).
        :return: Un diccionario con los datos del entrenamiento actualizado o un mensaje de error.
        """
        try:
            if not isinstance(user, User):
                user = User.objects.get(id=user.id)
            
            # Validar el rol del usuario
            if user.role not in ['entrenador', 'administrador']:
                return {"error": "No tienes permisos para actualizar entrenamientos"}
            
            # Obtener el entrenamiento
            workout = Workout.objects.get(id=workout_id)
            
            # Actualizar los detalles del entrenamiento
            workout.name = name
            workout.description = description
            workout.media = media
            workout.save()

            # Eliminar los ejercicios anteriores asociados con el entrenamiento
            WorkoutExercise.objects.filter(workout=workout).delete()

            # Añadir los nuevos ejercicios al entrenamiento
            exercises_data = []
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
                    exercises_data.append({
                        "name": exercise['name'],
                        "series": exercise['series'],
                        "reps": exercise['reps'],
                        "rest": exercise['rest']
                    })
                except Exercise.DoesNotExist:
                    continue  # Ignorar el ejercicio si no existe

            # Devolver los datos del entrenamiento actualizado
            return {
                "id": workout.id,
                "name": workout.name,
                "description": workout.description,
                "exercises": exercises_data,
                "media": workout.media
            }

        except Workout.DoesNotExist:
            return {"error": "Entrenamiento no encontrado"}
        
    @staticmethod
    def delete_workout(user, workout_id):
        """
        Eliminar un entrenamiento existente en el sistema.
        :param user: Usuario que realiza la solicitud.
        :param workout_id: ID del entrenamiento a eliminar.
        :return: True si el entrenamiento fue eliminado, False si no se encontró, o un mensaje de error.
        """
        # Verificar el rol del usuario
        check_result = UserRepository.check_user_role(user, ['entrenador', 'administrador'])
        if "error" in check_result:
            return {"error": check_result["error"], "status": check_result["status"]}

        try:
            workout = Workout.objects.get(id=workout_id)
            
            # Si el modelo tiene relaciones a través de WorkoutExercise, asegúrate de eliminar esas relaciones.
            workout.exercises.clear()  # Elimina la relación ManyToMany antes de eliminar el workout

            workout.delete()
            return True
        except Workout.DoesNotExist:
            return False
        except Exception as e:
            return {"error": str(e), "status": status.HTTP_500_INTERNAL_SERVER_ERROR}
