from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from api.models.workout import Workout, WeeklyWorkout, UserWorkout
from api.models.trainingplan import TrainingPlan
from datetime import date

User = get_user_model()

class GetTrainingPlanTests(APITestCase):

    def setUp(self):
        # Crear un usuario y autenticarlo
        self.user = User.objects.create_user(email='testuser@example.com', password='testpass123')
        self.client.force_authenticate(user=self.user)

        # Crear un Workout y un TrainingPlan para los tests
        self.workout = Workout.objects.create(name="Workout 1", description="Description for Workout 1")
        self.training_plan = TrainingPlan.objects.create(
            name="Training Plan 1",
            description="Description for Training Plan 1",
            media="http://example.com/media.jpg",
            difficulty="moderado",
            equipment="Dumbbells",
            duration=30
        )
        self.training_plan.workouts.add(self.workout)

    def test_get_training_plan(self):
        """
        Test para obtener los detalles de un plan de entrenamiento específico.
        """
        url = reverse('get_training_plan', args=[self.training_plan.id])
        response = self.client.get(url)

        # Verificar que la respuesta sea 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar que los datos devueltos son correctos
        self.assertEqual(response.data["id"], self.training_plan.id)
        self.assertEqual(response.data["name"], "Training Plan 1")
        self.assertEqual(response.data["description"], "Description for Training Plan 1")
        self.assertEqual(response.data["media"], "http://example.com/media.jpg")
        self.assertEqual(response.data["difficulty"], "moderado")
        self.assertEqual(response.data["equipment"], "Dumbbells")
        self.assertEqual(response.data["duration"], 30)
        self.assertEqual(len(response.data["workouts"]), 1)
        self.assertEqual(response.data["workouts"][0]["id"], self.workout.id)
        self.assertEqual(response.data["workouts"][0]["name"], "Workout 1")

    def test_get_training_plan_not_found(self):
        """
        Test para obtener un plan de entrenamiento inexistente.
        """
        url = reverse('get_training_plan', args=[999])  # ID que no existe
        response = self.client.get(url)

        # Verificar que la respuesta sea 404 Not Found
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Training Plan not found.")

class UpdateTrainingPlanTests(APITestCase):

    def setUp(self):
        # Crear un usuario con rol 'entrenador' y autenticarlo
        self.user = User.objects.create_user(email='trainer@example.com', password='testpass123', role='entrenador')
        self.client.force_authenticate(user=self.user)

        # Crear un Workout y un TrainingPlan para los tests
        self.workout1 = Workout.objects.create(name="Workout 1", description="Description for Workout 1")
        self.workout2 = Workout.objects.create(name="Workout 2", description="Description for Workout 2")
        self.training_plan = TrainingPlan.objects.create(
            name="Original Training Plan",
            description="Original description",
            media="http://example.com/original.jpg",
            difficulty="moderado",
            equipment="Dumbbells",
            duration=30
        )
        self.training_plan.workouts.add(self.workout1)

    def test_update_training_plan(self):
        """
        Test para actualizar un plan de entrenamiento específico.
        """
        url = reverse('update_training_plan')
        data = {
            "training_plan_id": self.training_plan.id,
            "name": "Updated Training Plan",
            "description": "Updated description",
            "media": "http://example.com/updated.jpg",
            "difficulty": "avanzado",
            "equipment": "Kettlebells",
            "duration": 45,
            "workouts": [self.workout1.id, self.workout2.id]
        }
        response = self.client.put(url, data, format='json')

        # Verificar que la respuesta sea 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar que los datos fueron actualizados correctamente
        self.assertEqual(response.data["name"], "Updated Training Plan")
        self.assertEqual(response.data["description"], "Updated description")
        self.assertEqual(response.data["media"], "http://example.com/updated.jpg")
        self.assertEqual(response.data["difficulty"], "avanzado")
        self.assertEqual(response.data["equipment"], "Kettlebells")
        self.assertEqual(response.data["duration"], 45)
        self.assertEqual(len(response.data["workouts"]), 2)
        self.assertEqual(response.data["workouts"][0]["id"], self.workout1.id)
        self.assertEqual(response.data["workouts"][1]["id"], self.workout2.id)

    def test_update_training_plan_not_found(self):
        """
        Test para intentar actualizar un plan de entrenamiento inexistente.
        """
        url = reverse('update_training_plan')
        data = {
            "training_plan_id": 999,  # ID inexistente
            "name": "Updated Training Plan"
        }
        response = self.client.put(url, data, format='json')

        # Verificar que la respuesta sea 404 Not Found
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Training Plan not found.")

    def test_update_training_plan_without_permission(self):
        """
        Test para intentar actualizar un plan de entrenamiento sin permisos adecuados.
        """
        # Cambiar el rol del usuario a 'cliente' que no tiene permisos
        self.user.role = 'cliente'
        self.user.save()

        url = reverse('update_training_plan')
        data = {
            "training_plan_id": self.training_plan.id,
            "name": "Updated Training Plan"
        }
        response = self.client.put(url, data, format='json')

        # Verificar que la respuesta sea 403 Forbidden
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["error"], "No tienes permisos para modificar ejercicios")

class DeleteTrainingPlanTests(APITestCase):

    def setUp(self):
        # Crear un usuario con rol 'entrenador' y autenticarlo
        self.user = User.objects.create_user(email='trainer@example.com', password='testpass123', role='entrenador')
        self.client.force_authenticate(user=self.user)

        # Crear un TrainingPlan para los tests
        self.training_plan = TrainingPlan.objects.create(
            name="Sample Training Plan",
            description="Sample description",
            difficulty="moderado",
            equipment="Dumbbells",
            duration=30
        )

    def test_delete_training_plan_success(self):
        """
        Test para eliminar un plan de entrenamiento existente.
        """
        url = reverse('delete_training_plan', args=[self.training_plan.id])
        response = self.client.delete(url)

        # Verificar que la respuesta sea 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Training plan deleted successfully.")

        # Verificar que el plan ya no exista en la base de datos
        self.assertFalse(TrainingPlan.objects.filter(id=self.training_plan.id).exists())

    def test_delete_training_plan_not_found(self):
        """
        Test para intentar eliminar un plan de entrenamiento inexistente.
        """
        url = reverse('delete_training_plan', args=[9999])  # ID inexistente
        response = self.client.delete(url)

        # Verificar que la respuesta sea 404 Not Found
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Training plan not found.")

    def test_delete_training_plan_without_permission(self):
        """
        Test para intentar eliminar un plan de entrenamiento sin permisos adecuados.
        """
        # Cambiar el rol del usuario a 'cliente' que no tiene permisos
        self.user.role = 'cliente'
        self.user.save()

        url = reverse('delete_training_plan', args=[self.training_plan.id])
        response = self.client.delete(url)

        # Verificar que la respuesta sea 403 Forbidden
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["error"], "No tienes permisos para eliminar planes de entrenamiento")


class GetAssignedTrainingPlanTests(APITestCase):

    def setUp(self):
        # Crear un usuario con rol 'cliente' y autenticarlo
        self.user = User.objects.create_user(email='client@example.com', password='testpass123', role='cliente')
        self.client.force_authenticate(user=self.user)

        # Crear un TrainingPlan y un UserWorkout para el usuario
        self.training_plan = TrainingPlan.objects.create(
            name="Sample Training Plan",
            description="Sample description",
            difficulty="moderado",
            equipment="Dumbbells",
            duration=30
        )
        self.user_workout = UserWorkout.objects.create(
            user=self.user,
            training_plan=self.training_plan,
            date_started=date.today(),
            progress=50  # Ejemplo de progreso en el plan
        )

        # Crear un Workout y WeeklyWorkout asociados
        self.workout = Workout.objects.create(
            name="Sample Workout",
            description="Workout description",
            duration=60
        )
        self.weekly_workout = WeeklyWorkout.objects.create(
            user_workout=self.user_workout,
            workout=self.workout,
            completed=False,
            progress=20  # Ejemplo de progreso en el entrenamiento
        )

    def test_get_assigned_training_plan_success(self):
        """
        Test para obtener el plan de entrenamiento asignado al usuario autenticado.
        """
        url = reverse('get_assigned_training_plan')
        response = self.client.get(url)

        # Verificar que la respuesta sea 200 OK y que el contenido sea correcto
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.training_plan.id)
        self.assertEqual(response.data["name"], self.training_plan.name)
        self.assertEqual(response.data["progress"], self.user_workout.progress)
        self.assertEqual(len(response.data["workouts"]), 1)
        self.assertEqual(response.data["workouts"][0]["id"], self.workout.id)

    def test_get_assigned_training_plan_not_found(self):
        """
        Test para verificar el caso en que el usuario no tiene un plan de entrenamiento asignado.
        """
        # Eliminar el UserWorkout para simular que el usuario no tiene plan asignado
        self.user_workout.delete()

        url = reverse('get_assigned_training_plan')
        response = self.client.get(url)

        # Verificar que la respuesta sea 404 Not Found
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Training plan not found for the user.")


class CreateTrainingPlanTests(APITestCase):

    def setUp(self):
        # Crear un usuario con rol 'entrenador' y autenticarlo
        self.user = User.objects.create_user(email='trainer@example.com', password='testpass123', role='entrenador')
        self.client.force_authenticate(user=self.user)

        # Crear un Workout para asociarlo al plan
        self.workout1 = Workout.objects.create(
            name="Sample Workout 1",
            description="Description for workout 1",
            duration=60
        )
        self.workout2 = Workout.objects.create(
            name="Sample Workout 2",
            description="Description for workout 2",
            duration=45
        )

    def test_create_training_plan_success(self):
        """
        Test para crear un nuevo plan de entrenamiento exitosamente.
        """
        url = reverse('create_training_plan')
        data = {
            "name": "New Training Plan",
            "description": "This is a test training plan",
            "selectedTraining": [self.workout1.id, self.workout2.id],
            "media": "http://example.com/media.png",
            "difficulty": "moderado",
            "equipment": "Dumbbells",
            "duration": 30
        }
        response = self.client.post(url, data, format='json')

        # Verificar que la respuesta sea 201 Created y el contenido sea correcto
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["name"], data["name"])
        self.assertEqual(len(response.data["data"]["workouts"]), 2)

    def test_create_training_plan_missing_fields(self):
        """
        Test para verificar la respuesta cuando faltan campos obligatorios.
        """
        url = reverse('create_training_plan')
        data = {
            "name": "Incomplete Training Plan",
            # Falta 'description', 'selectedTraining', 'difficulty', 'equipment', y 'duration'
        }
        response = self.client.post(url, data, format='json')

        # Verificar que la respuesta sea 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_training_plan_invalid_workouts(self):
        """
        Test para verificar el manejo de errores cuando los IDs de entrenamientos no existen.
        """
        url = reverse('create_training_plan')
        data = {
            "name": "Invalid Training Plan",
            "description": "This is a test training plan with invalid workouts",
            "selectedTraining": [9999, 8888],  # IDs inexistentes
            "media": "http://example.com/media.png",
            "difficulty": "moderado",
            "equipment": "Kettlebells",
            "duration": 30
        }
        response = self.client.post(url, data, format='json')

        # Verificar que la respuesta sea 400 Bad Request con mensaje de error adecuado
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Los entrenamientos asociados no existen.", response.data["error"])


class GetTrainingPlansTests(APITestCase):

    def setUp(self):
        # Crear un usuario con rol 'entrenador' y autenticarlo
        self.user = User.objects.create_user(email='trainer@example.com', password='testpass123', role='entrenador')
        self.client.force_authenticate(user=self.user)

        # Crear algunos planes de entrenamiento y entrenamientos asociados
        self.workout1 = Workout.objects.create(name="Workout 1", description="Desc 1", duration=45)
        self.workout2 = Workout.objects.create(name="Workout 2", description="Desc 2", duration=60)

        self.training_plan1 = TrainingPlan.objects.create(
            name="Training Plan 1",
            description="Desc Plan 1",
            difficulty="ligero",
            equipment="Equipment 1",
            media="http://example.com/media1.png",
            duration=30
        )
        self.training_plan1.workouts.add(self.workout1, self.workout2)

        self.training_plan2 = TrainingPlan.objects.create(
            name="Training Plan 2",
            description="Desc Plan 2",
            difficulty="moderado",
            equipment="Equipment 2",
            media="http://example.com/media2.png",
            duration=45
        )
        self.training_plan2.workouts.add(self.workout1)

    def test_get_all_training_plans_success(self):
        """
        Test para obtener todos los planes de entrenamiento exitosamente.
        """
        url = reverse('get_training_plans')  # Ajusta el nombre del endpoint según tu configuración
        response = self.client.get(url)

        # Verificar que la respuesta sea 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que se devuelvan los datos correctos
        self.assertIn("data", response.data)
        self.assertEqual(len(response.data["data"]), 2)
        self.assertEqual(response.data["data"][0]["name"], "Training Plan 1")
        self.assertEqual(response.data["data"][1]["name"], "Training Plan 2")

    def test_get_all_training_plans_empty(self):
        """
        Test para verificar el caso en el que no hay planes de entrenamiento.
        """
        # Primero eliminar los planes creados en setUp
        TrainingPlan.objects.all().delete()

        url = reverse('get_training_plans')
        response = self.client.get(url)

        # Verificar que la respuesta sea 404 Not Found con mensaje adecuado
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["message"], "No training plans found.")

class GetNextPendingWorkoutTests(APITestCase):

    def setUp(self):
        # Crear un usuario y autenticarlo
        self.user = User.objects.create_user(email='user@example.com', password='testpass123', role='cliente')
        self.client.force_authenticate(user=self.user)

        # Crear un plan de entrenamiento, entrenamientos y asociarlos con el usuario
        self.workout1 = Workout.objects.create(name="Workout 1", description="Description for Workout 1")
        self.workout2 = Workout.objects.create(name="Workout 2", description="Description for Workout 2")

        self.training_plan = TrainingPlan.objects.create(
            name="Training Plan 1",
            description="Description for Training Plan 1",
            difficulty="ligero",
            equipment="Basic Equipment",
            duration=30
        )
        self.training_plan.workouts.add(self.workout1, self.workout2)

        self.user_workout = UserWorkout.objects.create(user=self.user, training_plan=self.training_plan)

        # Crear WeeklyWorkouts asociados con el UserWorkout, donde el primer workout está sin completar
        self.weekly_workout1 = WeeklyWorkout.objects.create(user_workout=self.user_workout, workout=self.workout1, completed=False)
        self.weekly_workout2 = WeeklyWorkout.objects.create(user_workout=self.user_workout, workout=self.workout2, completed=True)

    def test_get_next_pending_workout_success(self):
        """
        Test para obtener el próximo entrenamiento pendiente exitosamente.
        """
        url = reverse('get_next_pending_workout')  # Ajusta el nombre del endpoint si es necesario
        response = self.client.get(url)

        # Verifica que la respuesta sea 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verifica que el workout devuelto es el primero sin completar
        self.assertEqual(response.data["id"], self.weekly_workout1.workout.id)
        self.assertEqual(response.data["name"], self.weekly_workout1.workout.name)
        self.assertEqual(response.data["description"], self.weekly_workout1.workout.description)

    def test_get_next_pending_workout_no_pending_workouts(self):
        """
        Test para el caso en el que no hay entrenamientos pendientes.
        """
        # Marcar todos los entrenamientos como completados
        self.weekly_workout1.completed = True
        self.weekly_workout1.save()

        url = reverse('get_next_pending_workout')
        response = self.client.get(url)

        # Verifica que la respuesta sea 404 Not Found y el mensaje sea adecuado
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "No pending workouts found.")

    def test_get_next_pending_workout_no_user_workout(self):
        """
        Test para el caso en el que el usuario no tiene un plan de entrenamiento asignado.
        """
        # Elimina el UserWorkout
        self.user_workout.delete()

        url = reverse('get_next_pending_workout')
        response = self.client.get(url)

        # Verifica que la respuesta sea 404 Not Found y el mensaje sea adecuado
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "User workout not found.")

class MarkWorkoutCompleteTests(APITestCase):

    def setUp(self):
        # Crear un usuario y autenticarlo
        self.user = User.objects.create_user(email='user@example.com', password='testpass123', role='cliente')
        self.client.force_authenticate(user=self.user)

        # Crear un plan de entrenamiento, entrenamientos y asociarlos con el usuario
        self.workout1 = Workout.objects.create(name="Workout 1", description="Description for Workout 1")
        self.workout2 = Workout.objects.create(name="Workout 2", description="Description for Workout 2")

        self.training_plan = TrainingPlan.objects.create(
            name="Training Plan 1",
            description="Description for Training Plan 1",
            difficulty="ligero",
            equipment="Basic Equipment",
            duration=30
        )
        self.training_plan.workouts.add(self.workout1, self.workout2)

        self.user_workout = UserWorkout.objects.create(user=self.user, training_plan=self.training_plan)

        # Crear WeeklyWorkouts asociados con el UserWorkout, donde el primer workout está sin completar
        self.weekly_workout1 = WeeklyWorkout.objects.create(user_workout=self.user_workout, workout=self.workout1, completed=False)
        self.weekly_workout2 = WeeklyWorkout.objects.create(user_workout=self.user_workout, workout=self.workout2, completed=False)

    def test_mark_workout_complete_success(self):
        """
        Test para marcar un entrenamiento como completado exitosamente.
        """
        url = reverse('mark_workout_complete', args=[self.weekly_workout1.workout.id])
        response = self.client.post(url, {"progress": 50})

        # Verifica que la respuesta sea 200 OK y que el mensaje sea adecuado
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Workout marked as complete.")
        
        # Verifica que el entrenamiento esté marcado como completado
        self.weekly_workout1.refresh_from_db()
        self.assertTrue(self.weekly_workout1.completed)
        self.assertEqual(self.weekly_workout1.progress, 50)

    def test_mark_workout_already_completed(self):
        """
        Test para intentar marcar un entrenamiento que ya está completado.
        """
        self.weekly_workout1.completed = True
        self.weekly_workout1.save()

        url = reverse('mark_workout_complete', args=[self.weekly_workout1.workout.id])
        response = self.client.post(url, {"progress": 100})

        # Verifica que la respuesta sea 400 Bad Request y que el mensaje indique que ya está completado
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Workout not found or already completed.")

    def test_mark_nonexistent_workout(self):
        """
        Test para intentar marcar un entrenamiento inexistente.
        """
        url = reverse('mark_workout_complete', args=[9999])  # ID inexistente
        response = self.client.post(url, {"progress": 100})

        # Verifica que la respuesta sea 400 Bad Request y que el mensaje indique que no se encontró el entrenamiento
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Workout not found or already completed.")

    def test_mark_all_workouts_complete_and_reset(self):
        """
        Test para completar todos los entrenamientos y verificar que el plan se restablece.
        """
        # Completa el primer entrenamiento
        url1 = reverse('mark_workout_complete', args=[self.weekly_workout1.workout.id])
        self.client.post(url1, {"progress": 50})

        # Completa el segundo entrenamiento
        url2 = reverse('mark_workout_complete', args=[self.weekly_workout2.workout.id])
        response = self.client.post(url2, {"progress": 100})

        # Verifica que la respuesta sea 200 OK y que el mensaje indique el restablecimiento
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "All workouts completed. Resetting to incomplete.")

        # Verifica que ambos entrenamientos estén marcados como incompletos después del restablecimiento
        self.weekly_workout1.refresh_from_db()
        self.weekly_workout2.refresh_from_db()
        self.assertFalse(self.weekly_workout1.completed)
        self.assertFalse(self.weekly_workout2.completed)
        self.user_workout.refresh_from_db()
        self.assertEqual(self.user_workout.progress, 0)  # Verifica que el progreso se restablece también
