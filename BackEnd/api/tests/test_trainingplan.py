from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse
from api.models.trainingplan import TrainingPlan
from api.models.workout import UserWorkout, WeeklyWorkout, Workout
from api.models.user import User

class CreateTrainingPlanTests(APITestCase):

    def setUp(self):
        # Crear un usuario autenticado con permisos necesarios
        self.user = User.objects.create(
            email='trainer@example.com',
            password='password123',
            role='entrenador',
            birth_date='1990-01-01'
        )

        # Crear entrenamientos en la base de datos para asociarlos al plan
        self.workout1 = Workout.objects.create(name="Cardio Workout", description="High-intensity cardio session")
        self.workout2 = Workout.objects.create(name="Strength Workout", description="Strength and conditioning")

    def test_create_training_plan_success(self):
        """
        Test para crear un plan de entrenamiento con éxito.
        """
        # Autenticar como usuario
        self.client.force_authenticate(user=self.user)

        # Datos para crear un plan de entrenamiento
        data = {
            "name": "Plan Avanzado",
            "description": "Este es un plan avanzado de entrenamiento",
            "selectedTraining": [self.workout1.id, self.workout2.id],
            "difficulty": "avanzado",
            "equipment": "Dumbbells, Kettlebells",
            "duration": 30
        }

        # Realizar la solicitud POST al endpoint
        url = reverse('create-training-plan')
        response = self.client.post(url, data, format='json')

        # Verificar que el estado de la respuesta es 201 CREATED
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verificar que el plan de entrenamiento fue creado correctamente
        training_plan = response.data["data"]
        self.assertEqual(training_plan["name"], "Plan Avanzado")
        self.assertEqual(training_plan["description"], "Este es un plan avanzado de entrenamiento")
        self.assertEqual(training_plan["difficulty"], "avanzado")
        self.assertEqual(training_plan["equipment"], "Dumbbells, Kettlebells")
        self.assertEqual(training_plan["duration"], 30)
        self.assertEqual(training_plan["workouts"], [self.workout1.id, self.workout2.id])

    def test_create_training_plan_workouts_not_found(self):
        """
        Test para verificar el error cuando los entrenamientos no existen.
        """
        # Autenticar como usuario
        self.client.force_authenticate(user=self.user)

        # Datos para crear un plan de entrenamiento con IDs de entrenamientos inexistentes
        data = {
            "name": "Plan Intermedio",
            "description": "Entrenamiento de nivel intermedio",
            "selectedTraining": [999, 1000],  # IDs inexistentes
            "difficulty": "intermedio",
            "equipment": "Barbells",
            "duration": 30
        }

        # Realizar la solicitud POST al endpoint
        url = reverse('create-training-plan')
        response = self.client.post(url, data, format='json')

        # Verificar que el estado de la respuesta es 400 BAD REQUEST
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Los entrenamientos asociados no existen.", response.data["error"])

    def test_create_training_plan_invalid_duration(self):
        """
        Test para verificar el error cuando se proporciona una duración inválida.
        """
        # Autenticar como usuario
        self.client.force_authenticate(user=self.user)

        # Datos para crear un plan de entrenamiento con duración inválida
        data = {
            "name": "Plan Moderado",
            "description": "Entrenamiento moderado",
            "selectedTraining": [self.workout1.id, self.workout2.id],
            "difficulty": "moderado",
            "equipment": "None",
            "duration": "invalid_duration"  # Duración no válida
        }

        # Realizar la solicitud POST al endpoint
        url = reverse('create-training-plan')
        response = self.client.post(url, data, format='json')

        # Verificar que el estado de la respuesta es 400 BAD REQUEST
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("La duración debe ser un número entero válido.", response.data["error"])


    def test_create_training_plan_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación está prohibido.
        """
        # Datos para crear un plan de entrenamiento
        data = {
            "name": "Plan Básico",
            "description": "Entrenamiento básico",
            "selectedTraining": [self.workout1.id, self.workout2.id],
            "difficulty": "ligero",
            "equipment": "None",
            "duration": 15
        }

        # Realizar la solicitud POST sin autenticación
        url = reverse('create-training-plan')
        response = self.client.post(url, data, format='json')

        # Verificar que el estado de la respuesta es 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])


class GetTrainingPlansTests(APITestCase):

    def setUp(self):
        # Crear un usuario autenticado con permisos
        self.user = User.objects.create(
            email='user@example.com',
            password='password123',
            role='entrenador',
            birth_date='1990-01-01'
        )
        
        # Crear entrenamientos para asociar con los planes
        self.workout1 = Workout.objects.create(name="Cardio Session", description="Cardio intenso")
        self.workout2 = Workout.objects.create(name="Strength Session", description="Entrenamiento de fuerza")

        # Crear planes de entrenamiento
        self.training_plan1 = TrainingPlan.objects.create(
            name="Plan Básico",
            description="Entrenamiento básico para principiantes",
            difficulty="ligero",
            equipment="Ninguno",
            duration=30,
        )
        self.training_plan1.workouts.set([self.workout1, self.workout2])

        self.training_plan2 = TrainingPlan.objects.create(
            name="Plan Avanzado",
            description="Entrenamiento avanzado para atletas",
            difficulty="avanzado",
            equipment="Barra, Mancuernas",
            duration=60,
        )
        self.training_plan2.workouts.set([self.workout1])

    def test_get_training_plans_success(self):
        """
        Test para obtener todos los planes de entrenamiento con éxito.
        """
        # Autenticar como usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET al endpoint
        url = reverse('training-plans')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar que los datos de los planes de entrenamiento están presentes en la respuesta
        training_plans = response.data["data"]
        self.assertEqual(len(training_plans), 2)
        
        # Verificar los datos de cada plan de entrenamiento
        self.assertEqual(training_plans[0]["name"], "Plan Básico")
        self.assertEqual(training_plans[0]["duration"], 30)
        self.assertEqual(training_plans[0]["workouts"], [self.workout1.id, self.workout2.id])

        self.assertEqual(training_plans[1]["name"], "Plan Avanzado")
        self.assertEqual(training_plans[1]["duration"], 60)
        self.assertEqual(training_plans[1]["workouts"], [self.workout1.id])

    def test_get_training_plans_no_plans_found(self):
        """
        Test para verificar el mensaje cuando no hay planes de entrenamiento disponibles.
        """
        # Eliminar todos los planes de entrenamiento
        TrainingPlan.objects.all().delete()

        # Autenticar como usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET al endpoint
        url = reverse('training-plans')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 404 NOT FOUND
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["message"], "No training plans found.")

    def test_get_training_plans_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación está prohibido.
        """
        # Realizar la solicitud GET sin autenticación
        url = reverse('training-plans')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])

class DeleteTrainingPlanTests(APITestCase):

    def setUp(self):
        # Crear un usuario autenticado con permisos
        self.user = User.objects.create(
            email='trainer@example.com',
            password='password123',
            role='entrenador',
            birth_date='1990-01-01'
        )

        # Crear un plan de entrenamiento en la base de datos para eliminarlo en las pruebas
        self.training_plan = TrainingPlan.objects.create(
            name="Plan de prueba",
            description="Entrenamiento de prueba",
            difficulty="moderado",
            equipment="Dumbbells",
            duration=45,
        )

    def test_delete_training_plan_success(self):
        """
        Test para eliminar un plan de entrenamiento con éxito.
        """
        # Autenticar como usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud DELETE al endpoint
        url = reverse('delete-training-plan', args=[self.training_plan.id])
        response = self.client.delete(url)

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Training plan deleted successfully.")

        # Confirmar que el plan de entrenamiento fue eliminado
        self.assertFalse(TrainingPlan.objects.filter(id=self.training_plan.id).exists())

    def test_delete_training_plan_not_found(self):
        """
        Test para verificar el error cuando el plan de entrenamiento no existe.
        """
        # Autenticar como usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud DELETE con un ID inexistente
        url = reverse('delete-training-plan', args=[999])  # ID inexistente
        response = self.client.delete(url)

        # Verificar que el estado de la respuesta es 404 NOT FOUND
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Training plan not found.")

    def test_delete_training_plan_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación está prohibido.
        """
        # Realizar la solicitud DELETE sin autenticación
        url = reverse('delete-training-plan', args=[self.training_plan.id])
        response = self.client.delete(url)

        # Verificar que el estado de la respuesta es 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])

class GetTrainingPlanTests(APITestCase):

    def setUp(self):
        # Crear un usuario autenticado con permisos
        self.user = User.objects.create(
            email='user@example.com',
            password='password123',
            role='entrenador',
            birth_date='1990-01-01'
        )

        # Crear entrenamientos para asociar con el plan
        self.workout1 = Workout.objects.create(name="Cardio Session", description="Intensive cardio session")
        self.workout2 = Workout.objects.create(name="Strength Session", description="Strength and conditioning")

        # Crear un plan de entrenamiento en la base de datos
        self.training_plan = TrainingPlan.objects.create(
            name="Plan de Prueba",
            description="Este es un plan de prueba",
            difficulty="intermedio",
            equipment="Pesas",
            duration=30,
        )
        self.training_plan.workouts.set([self.workout1, self.workout2])

    def test_get_training_plan_success(self):
        """
        Test para obtener los detalles de un plan de entrenamiento con éxito.
        """
        # Autenticar como usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET al endpoint
        url = reverse('get-training-plan', args=[self.training_plan.id])
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar los datos del plan de entrenamiento en la respuesta
        training_plan = response.data
        self.assertEqual(training_plan["name"], "Plan de Prueba")
        self.assertEqual(training_plan["description"], "Este es un plan de prueba")
        self.assertEqual(training_plan["difficulty"], "intermedio")
        self.assertEqual(training_plan["equipment"], "Pesas")
        self.assertEqual(training_plan["duration"], 30)
        self.assertEqual(len(training_plan["workouts"]), 2)

    def test_get_training_plan_not_found(self):
        """
        Test para verificar el error cuando el plan de entrenamiento no existe.
        """
        # Autenticar como usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET con un ID inexistente
        url = reverse('get-training-plan', args=[999])  # ID inexistente
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 404 NOT FOUND
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Training Plan not found.")

    def test_get_training_plan_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación está prohibido.
        """
        # Realizar la solicitud GET sin autenticación
        url = reverse('get-training-plan', args=[self.training_plan.id])
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])

class UpdateTrainingPlanTests(APITestCase):

    def setUp(self):
        # Crear un usuario con permisos y otro sin permisos
        self.admin_user = User.objects.create(
            email='admin@example.com',
            password='password123',
            role='administrador',
            birth_date='1990-01-01'
        )
        self.client_user = User.objects.create(
            email='client@example.com',
            password='password123',
            role='cliente',
            birth_date='1990-01-01'
        )

        # Crear entrenamientos para asociar con el plan
        self.workout1 = Workout.objects.create(name="Cardio Session", description="Intensive cardio session")
        self.workout2 = Workout.objects.create(name="Strength Session", description="Strength and conditioning")

        # Crear un plan de entrenamiento en la base de datos
        self.training_plan = TrainingPlan.objects.create(
            name="Plan de Prueba",
            description="Este es un plan de prueba",
            difficulty="intermedio",
            equipment="Pesas",
            duration=30,
        )
        self.training_plan.workouts.set([self.workout1, self.workout2])

    def test_update_training_plan_success(self):
        """
        Test para modificar un plan de entrenamiento con éxito.
        """
        # Autenticar como administrador
        self.client.force_authenticate(user=self.admin_user)

        # Datos para actualizar el plan de entrenamiento
        data = {
            "training_plan_id": self.training_plan.id,
            "name": "Plan Actualizado",
            "description": "Descripción actualizada",
            "difficulty": "avanzado",
            "equipment": "Ninguno",
            "duration": 45,
            "workouts": [self.workout1.id]
        }

        # Realizar la solicitud PUT al endpoint
        url = reverse('update-training-plan')
        response = self.client.put(url, data, format='json')

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar los datos actualizados del plan de entrenamiento
        training_plan = response.data
        self.assertEqual(training_plan["name"], "Plan Actualizado")
        self.assertEqual(training_plan["description"], "Descripción actualizada")
        self.assertEqual(training_plan["difficulty"], "avanzado")
        self.assertEqual(training_plan["equipment"], "Ninguno")
        self.assertEqual(training_plan["duration"], 45)
        self.assertEqual(len(training_plan["workouts"]), 1)
        self.assertEqual(training_plan["workouts"][0]["id"], self.workout1.id)

    def test_update_training_plan_not_found(self):
        """
        Test para verificar el error cuando el plan de entrenamiento no existe.
        """
        # Autenticar como administrador
        self.client.force_authenticate(user=self.admin_user)

        # Datos para actualizar el plan con un ID inexistente
        data = {
            "training_plan_id": 999,  # ID inexistente
            "name": "Plan Actualizado"
        }

        # Realizar la solicitud PUT al endpoint
        url = reverse('update-training-plan')
        response = self.client.put(url, data, format='json')

        # Verificar que el estado de la respuesta es 404 NOT FOUND
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Training Plan not found.")

    def test_update_training_plan_permission_denied(self):
        """
        Test para verificar el error cuando un usuario sin permisos intenta modificar un plan.
        """
        # Autenticar como usuario sin permisos
        self.client.force_authenticate(user=self.client_user)

        # Datos para actualizar el plan de entrenamiento
        data = {
            "training_plan_id": self.training_plan.id,
            "name": "Intento de actualización sin permisos"
        }

        # Realizar la solicitud PUT al endpoint
        url = reverse('update-training-plan')
        response = self.client.put(url, data, format='json')

        # Verificar que el estado de la respuesta es 403 FORBIDDEN
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["error"], "No tienes permisos para modificar ejercicios")

    def test_update_training_plan_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación está prohibido.
        """
        # Datos para actualizar el plan de entrenamiento
        data = {
            "training_plan_id": self.training_plan.id,
            "name": "Nuevo nombre"
        }

        # Realizar la solicitud PUT sin autenticación
        url = reverse('update-training-plan')
        response = self.client.put(url, data, format='json')

        # Verificar que el estado de la respuesta es 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])

    def test_update_training_plan_missing_id(self):
        """
        Test para verificar el error cuando falta el `training_plan_id`.
        """
        # Autenticar como administrador
        self.client.force_authenticate(user=self.admin_user)

        # Datos sin `training_plan_id`
        data = {
            "name": "Nuevo nombre"
        }

        # Realizar la solicitud PUT al endpoint
        url = reverse('update-training-plan')
        response = self.client.put(url, data, format='json')

        # Verificar que el estado de la respuesta es 400 BAD REQUEST
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "El ID del plan de entrenamiento es obligatorio.")

class DeleteTrainingPlanTests(APITestCase):

    def setUp(self):
        # Crear un usuario autenticado con permisos
        self.admin_user = User.objects.create(
            email='admin@example.com',
            password='password123',
            role='administrador',
            birth_date='1990-01-01'
        )

        # Crear un plan de entrenamiento en la base de datos
        self.training_plan = TrainingPlan.objects.create(
            name="Plan de prueba",
            description="Entrenamiento de prueba",
            difficulty="moderado",
            equipment="Dumbbells",
            duration=45,
        )

    def test_delete_training_plan_success(self):
        """
        Test para eliminar un plan de entrenamiento con éxito.
        """
        # Autenticar como administrador
        self.client.force_authenticate(user=self.admin_user)

        # Realizar la solicitud DELETE al endpoint
        url = reverse('delete-training-plan', args=[self.training_plan.id])
        response = self.client.delete(url)

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Training plan deleted successfully.")

        # Confirmar que el plan de entrenamiento fue eliminado
        self.assertFalse(TrainingPlan.objects.filter(id=self.training_plan.id).exists())

    def test_delete_training_plan_not_found(self):
        """
        Test para verificar el error cuando el plan de entrenamiento no existe.
        """
        # Autenticar como administrador
        self.client.force_authenticate(user=self.admin_user)

        # Realizar la solicitud DELETE con un ID inexistente
        url = reverse('delete-training-plan', args=[999])  # ID inexistente
        response = self.client.delete(url)

        # Verificar que el estado de la respuesta es 404 NOT FOUND
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Training plan not found.")

    def test_delete_training_plan_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación está prohibido.
        """
        # Realizar la solicitud DELETE sin autenticación
        url = reverse('delete-training-plan', args=[self.training_plan.id])
        response = self.client.delete(url)

        # Verificar que el estado de la respuesta es 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])

class GetAssignedTrainingPlanTests(APITestCase):

    def setUp(self):
        # Crear un usuario autenticado
        self.user = User.objects.create(
            email='user@example.com',
            password='password123',
            role='cliente',
            birth_date='1990-01-01'
        )

        # Crear un plan de entrenamiento y asignarlo al usuario
        self.training_plan = TrainingPlan.objects.create(
            name="Plan Asignado",
            description="Este es un plan asignado al usuario.",
            difficulty="intermedio",
            equipment="Pesas",
            duration=30,
        )

        # Crear una relación de UserWorkout para asociar el usuario con el plan de entrenamiento
        self.user_workout = UserWorkout.objects.create(
            user=self.user,
            training_plan=self.training_plan,
            progress=50,
            date_started="2023-01-01",
            date_completed=None
        )

        # Crear entrenamientos semanales y asignarlos con estado completado o progreso
        self.workout1 = Workout.objects.create(name="Cardio Session", description="Intensive cardio session")
        self.workout2 = Workout.objects.create(name="Strength Session", description="Strength and conditioning")

        # Agregar estos entrenamientos a WeeklyWorkout
        WeeklyWorkout.objects.create(user_workout=self.user_workout, workout=self.workout1, completed=True, progress=100)
        WeeklyWorkout.objects.create(user_workout=self.user_workout, workout=self.workout2, completed=False, progress=60)

    def test_get_assigned_training_plan_success(self):
        """
        Test para obtener el plan de entrenamiento asignado al usuario con éxito.
        """
        # Autenticar como el usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET al endpoint
        url = reverse('get-assigned-training-plan')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar los datos del plan de entrenamiento en la respuesta
        training_plan = response.data
        self.assertEqual(training_plan["name"], "Plan Asignado")
        self.assertEqual(training_plan["description"], "Este es un plan asignado al usuario.")
        self.assertEqual(training_plan["difficulty"], "intermedio")
        self.assertEqual(training_plan["equipment"], "Pesas")
        self.assertEqual(training_plan["duration"], 30)
        self.assertEqual(training_plan["progress"], 50)
        self.assertEqual(len(training_plan["workouts"]), 2)

    def test_get_assigned_training_plan_not_found(self):
        """
        Test para verificar el error cuando el usuario no tiene un plan de entrenamiento asignado.
        """
        # Crear un nuevo usuario sin plan asignado
        new_user = User.objects.create(
            email='newuser@example.com',
            password='password123',
            role='cliente',
            birth_date='1990-01-01'
        )

        # Autenticar como el nuevo usuario
        self.client.force_authenticate(user=new_user)

        # Realizar la solicitud GET al endpoint
        url = reverse('get-assigned-training-plan')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 404 NOT FOUND
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Training plan not found for the user.")

    def test_get_assigned_training_plan_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación está prohibido.
        """
        # Realizar la solicitud GET sin autenticación
        url = reverse('get-assigned-training-plan')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])

class GetNextPendingWorkoutTests(APITestCase):

    def setUp(self):
        # Crear un usuario autenticado
        self.user = User.objects.create(
            email='user@example.com',
            password='password123',
            role='cliente',
            birth_date='1990-01-01'
        )

        # Crear un plan de entrenamiento y asignarlo al usuario
        self.training_plan = TrainingPlan.objects.create(
            name="Plan Asignado",
            description="Plan de entrenamiento para el usuario.",
            difficulty="intermedio",
            equipment="Pesas",
            duration=30,
        )

        # Crear la relación de UserWorkout para el plan del usuario
        self.user_workout = UserWorkout.objects.create(
            user=self.user,
            training_plan=self.training_plan,
            progress=50,
            date_started="2023-01-01"
        )

        # Crear entrenamientos y asignarlos como WeeklyWorkout al UserWorkout
        self.workout1 = Workout.objects.create(name="Cardio Session", description="Intensive cardio session")
        self.workout2 = Workout.objects.create(name="Strength Session", description="Strength and conditioning")

        # Asignar entrenamientos semanales, marcando uno como completado y otro como pendiente
        WeeklyWorkout.objects.create(user_workout=self.user_workout, workout=self.workout1, completed=True, progress=100)
        WeeklyWorkout.objects.create(user_workout=self.user_workout, workout=self.workout2, completed=False, progress=50)

    def test_get_next_pending_workout_success(self):
        """
        Test para obtener el próximo entrenamiento pendiente con éxito.
        """
        # Autenticar como el usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET al endpoint
        url = reverse('get-next-pending-workout')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar los detalles del próximo entrenamiento pendiente
        next_workout = response.data
        self.assertEqual(next_workout["name"], "Strength Session")
        self.assertEqual(next_workout["progress"], 50)

    def test_get_next_pending_workout_no_pending_found(self):
        """
        Test para verificar el error cuando no hay entrenamientos pendientes.
        """
        # Marcar todos los entrenamientos como completados
        WeeklyWorkout.objects.filter(user_workout=self.user_workout).update(completed=True)

        # Autenticar como el usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET al endpoint
        url = reverse('get-next-pending-workout')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 404 NOT FOUND
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "No pending workouts found.")

    def test_get_next_pending_workout_no_user_workout(self):
        """
        Test para verificar el error cuando el usuario no tiene un plan de entrenamiento asignado.
        """
        # Crear un nuevo usuario sin plan de entrenamiento asignado
        new_user = User.objects.create(
            email='newuser@example.com',
            password='password123',
            role='cliente',
            birth_date='1990-01-01'
        )

        # Autenticar como el nuevo usuario
        self.client.force_authenticate(user=new_user)

        # Realizar la solicitud GET al endpoint
        url = reverse('get-next-pending-workout')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 404 NOT FOUND
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "User workout not found.")

    def test_get_next_pending_workout_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación está prohibido.
        """
        # Realizar la solicitud GET sin autenticación
        url = reverse('get-next-pending-workout')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])

class MarkWorkoutCompleteTests(APITestCase):

    def setUp(self):
        # Crear un usuario autenticado
        self.user = User.objects.create(
            email='user@example.com',
            password='password123',
            role='cliente',
            birth_date='1990-01-01'
        )

        # Crear un plan de entrenamiento y asignarlo al usuario
        self.training_plan = TrainingPlan.objects.create(
            name="Plan Asignado",
            description="Plan de entrenamiento para el usuario.",
            difficulty="intermedio",
            equipment="Pesas",
            duration=30,
        )

        # Crear la relación de UserWorkout para el plan del usuario
        self.user_workout = UserWorkout.objects.create(
            user=self.user,
            training_plan=self.training_plan,
            progress=0,
            date_started="2023-01-01"
        )

        # Crear entrenamientos y asignarlos como WeeklyWorkout al UserWorkout
        self.workout1 = Workout.objects.create(name="Cardio Session", description="Intensive cardio session")
        self.workout2 = Workout.objects.create(name="Strength Session", description="Strength and conditioning")

        # Asignar entrenamientos semanales
        self.weekly_workout1 = WeeklyWorkout.objects.create(user_workout=self.user_workout, workout=self.workout1, completed=False, progress=0)
        self.weekly_workout2 = WeeklyWorkout.objects.create(user_workout=self.user_workout, workout=self.workout2, completed=False, progress=0)

    def test_mark_workout_complete_success(self):
        """
        Test para marcar un entrenamiento como completado con éxito.
        """
        # Autenticar como el usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud POST al endpoint
        url = reverse('mark-workout-complete', args=[self.workout1.id])
        response = self.client.post(url, {"progress": 100}, format='json')

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Workout marked as complete.")

        # Confirmar que el entrenamiento ha sido marcado como completado
        self.weekly_workout1.refresh_from_db()
        self.assertTrue(self.weekly_workout1.completed)
        self.assertEqual(self.weekly_workout1.progress, 100)

    def test_mark_workout_complete_already_completed(self):
        """
        Test para verificar el error cuando el entrenamiento ya está completado.
        """
        # Marcar el entrenamiento como completado
        self.weekly_workout1.completed = True
        self.weekly_workout1.progress = 100
        self.weekly_workout1.save()

        # Autenticar como el usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud POST al endpoint
        url = reverse('mark-workout-complete', args=[self.workout1.id])
        response = self.client.post(url, {"progress": 100}, format='json')

        # Verificar que el estado de la respuesta es 400 BAD REQUEST
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Workout not found or already completed.")

    def test_mark_workout_complete_not_found(self):
        """
        Test para verificar el error cuando el entrenamiento no existe para el usuario.
        """
        # Autenticar como el usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud POST al endpoint con un ID de entrenamiento inexistente
        url = reverse('mark-workout-complete', args=[999])  # ID inexistente
        response = self.client.post(url, {"progress": 100}, format='json')

        # Verificar que el estado de la respuesta es 400 BAD REQUEST
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Workout not found or already completed.")

    def test_mark_workout_complete_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación está prohibido.
        """
        # Realizar la solicitud POST sin autenticación
        url = reverse('mark-workout-complete', args=[self.workout1.id])
        response = self.client.post(url, {"progress": 100}, format='json')

        # Verificar que el estado de la respuesta es 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])

