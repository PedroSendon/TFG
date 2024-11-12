import os
from typing import List
from BackEnd import settings
from api.models.user import User
from api.schemas.workout import TrainingPlanSchema  # Import TrainingPlanSchema
from api.models.workout import UserWorkout, WeeklyWorkout, Workout
from api.models.trainingplan import TrainingPlan
from rest_framework import status


class TrainingPlanRepository:

    @staticmethod
    def get_training_plan_images():
        images_dir = os.path.join(settings.MEDIA_ROOT, 'productos')
        images = []

        # Verifica si el directorio de imágenes existe
        if os.path.exists(images_dir):
            # Recorre los archivos en el directorio de imágenes
            for file_name in os.listdir(images_dir):
                if file_name.endswith(('.png', '.jpg', '.jpeg')):
                    # Construye la URL de acceso a la imagen
                    images.append(f"{settings.MEDIA_URL}productos/{file_name}")
        
        return images

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
        print("Creating training plan...")
        print(workout_ids)
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
        # Asignamos los entrenamientos al plan
        training_plan.workouts.set(workouts)
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
    def get_next_pending_workout(user):
        """
        Obtener el primer entrenamiento no completado del usuario.
        """
        try:
            # Busca el UserWorkout relacionado con el usuario
            if not isinstance(user, User):
                user = User.objects.get(id=user.id)

            user_workout = UserWorkout.objects.get(user_id=user.id)
            training_plan = user_workout.training_plan

            # Encuentra el primer entrenamiento no completado
            next_workout = WeeklyWorkout.objects.filter(
                user_workout=user_workout,
                completed=False
                # Ordena para asegurar obtener el primero
            ).order_by('workout__id').first()

            if not next_workout:
                return None, "No pending workouts found."

            return {
                "id": next_workout.workout.id,
                "name": next_workout.workout.name,
                "description": next_workout.workout.description,
                "progress": user_workout.progress,
            }, None
        except UserWorkout.DoesNotExist:
            return None, "User workout not found."

    @staticmethod
    def get_all_training_plans() -> List[TrainingPlanSchema]:
        """
        Obtener todos los planes de entrenamiento.
        :return: Una lista de esquemas de planes de entrenamiento.
        """
        training_plans = TrainingPlan.objects.all(
        )  # Suponiendo que usas un ORM como Django ORM
        return training_plans

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



    @staticmethod
    def get_training_plan_by_id2(training_plan_id):
        """
        Obtiene un plan de entrenamiento específico por su ID.
        """
        try:
            training_plan = TrainingPlan.objects.prefetch_related(
                'workouts').get(id=training_plan_id)
            workouts = training_plan.workouts.all()

            return {
                "id": training_plan.id,
                "name": training_plan.name,
                "description": training_plan.description,
                "media": training_plan.media,
                "difficulty": training_plan.difficulty,
                "equipment": training_plan.equipment,
                "duration": training_plan.duration,
                "workouts": [
                    {
                        "id": workout.id,
                        "name": workout.name,
                        "description": workout.description
                    }
                    for workout in workouts
                ]
            }, None
        except TrainingPlan.DoesNotExist:
            return None, "Training Plan not found."

    @staticmethod
    def update_training_plan(user, training_plan_id, data):
        """
        Actualiza un plan de entrenamiento específico con los datos proporcionados.
        """
        if not isinstance(user, User):
            user = User.objects.get(id=user.id)
            
        if user.role not in ['entrenador', 'administrador']:
            return None, "No tienes permisos para modificar ejercicios"
        
        try:
            training_plan = TrainingPlan.objects.get(id=training_plan_id)

            # Actualizamos los campos básicos
            training_plan.name = data.get("name", training_plan.name)
            training_plan.description = data.get("description", training_plan.description)
            training_plan.media = data.get("media", training_plan.media)
            training_plan.difficulty = data.get("difficulty", training_plan.difficulty)
            training_plan.equipment = data.get("equipment", training_plan.equipment)
            training_plan.duration = data.get("duration", training_plan.duration)
            training_plan.save()

            # Actualizamos los entrenamientos asociados si se proporcionan
            workout_ids = data.get("workouts", [])
            if workout_ids:
                workouts = Workout.objects.filter(id__in=workout_ids)
                training_plan.workouts.set(workouts)

            return {
                "id": training_plan.id,
                "name": training_plan.name,
                "description": training_plan.description,
                "media": training_plan.media,
                "difficulty": training_plan.difficulty,
                "equipment": training_plan.equipment,
                "duration": training_plan.duration,
                "workouts": [{"id": workout.id, "name": workout.name} for workout in training_plan.workouts.all()]
            }, None
        except TrainingPlan.DoesNotExist:
            return None, "Training Plan not found."
        except Exception as e:
            return None, str(e)

    @staticmethod
    def delete_training_plan(training_plan_id):
        """
        Elimina un plan de entrenamiento específico.
        """
        try:
            training_plan = TrainingPlan.objects.get(id=training_plan_id)
            training_plan.delete()
            return True, "Training plan deleted successfully."
        except TrainingPlan.DoesNotExist:
            return False, "Training plan not found."
        except Exception as e:
            return False, str(e)

    @staticmethod
    def get_training_plan_by_user_id(user_id):
        """
        Obtener el plan de entrenamiento asignado a un usuario específico.
        :param user_id: ID del usuario
        :return: Un diccionario con los detalles del plan de entrenamiento o un error.
        """
        try:
            # Buscamos el `UserWorkout` relacionado al usuario para obtener el `TrainingPlan`
            user_workout = UserWorkout.objects.get(user__id=user_id)
            training_plan = user_workout.training_plan
            weekly_workouts = WeeklyWorkout.objects.filter(
                user_workout=user_workout).select_related('workout')

            # Construimos la lista de entrenamientos con el estado `completed`
            workouts = [
                {
                    "id": weekly_workout.workout.id,
                    "name": weekly_workout.workout.name,
                    "description": weekly_workout.workout.description,
                    "completed": weekly_workout.completed,
                    "progress": weekly_workout.progress
                }
                for weekly_workout in weekly_workouts
            ]

            return {
                "id": training_plan.id,
                "name": training_plan.name,
                "description": training_plan.description,
                "media": training_plan.media,
                "difficulty": training_plan.difficulty,
                "equipment": training_plan.equipment,
                "duration": training_plan.duration,
                "workouts": workouts,
                "progress": user_workout.progress,  # Progreso del usuario en el plan
                "date_started": user_workout.date_started,
                "date_completed": user_workout.date_completed
            }, None
        except UserWorkout.DoesNotExist:
            return None, "Training plan not found for the user."

    @staticmethod
    def mark_workout_as_complete(user, day_id, progress):
        try:
            # Verificar si el objeto `user` es una instancia de `User`
            if not isinstance(user, User):
                user = User.objects.get(id=user.id)

            # Obtener el `UserWorkout` del usuario
            user_workout = UserWorkout.objects.get(user_id=user.id)
            print(user_workout)

            # Encontrar el primer `WeeklyWorkout` que no esté completado y coincida con `day_id`
            weekly_workout = WeeklyWorkout.objects.filter(
                user_workout=user_workout, completed=False, workout_id=day_id).first()

            if not weekly_workout:
                return False, "Workout not found or already completed."

            # Marcar el entrenamiento como completado
            weekly_workout.completed = True
            weekly_workout.progress = progress  # Actualiza el progreso individual del entrenamiento
            weekly_workout.save()

            # Actualizar el progreso del `UserWorkout`
            completed_workouts_count = user_workout.weekly_workouts.filter(
                completed=True).count()
            total_workouts = user_workout.weekly_workouts.count()
            user_workout.progress = min(
                int((completed_workouts_count / total_workouts) * 100), progress)
            user_workout.save()

            # Si todos los entrenamientos están completados, restablecer todos los `WeeklyWorkout` a incompleto
            if completed_workouts_count == total_workouts:
                user_workout.weekly_workouts.update(completed=False)
                user_workout.progress = 0  # Restablece el progreso también a 0
                user_workout.save()

                return True, "All workouts completed. Resetting to incomplete."

            return True, "Workout marked as complete."

        except WeeklyWorkout.DoesNotExist:
            return False, "Workout not found."
        except Exception as e:
            return False, str(e)
