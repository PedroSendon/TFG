from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse
from api.models.process import ExerciseLog, ProgressTracking
from api.models.trainingplan import TrainingPlan
from api.models.user import User
from api.models.exercise import Exercise
from api.models.workout import UserWorkout, WeeklyWorkout, Workout, WorkoutExercise

class GetWorkoutsTests(APITestCase):

    def setUp(self):
        # Crear un usuario autenticado
        self.user = User.objects.create(
            email='user@example.com',
            password='password123',
            role='cliente',
            birth_date='1990-01-01'
        )

        # Crear un segundo usuario
        self.another_user = User.objects.create(
            email='anotheruser@example.com',
            password='password123',
            role='cliente',
            birth_date='1992-02-02'
        )

        # Crear un TrainingPlan y asociar Workouts
        training_plan = TrainingPlan.objects.create(
            name="Plan de Prueba",
            description="Descripción del plan de prueba",
            difficulty="moderado",
            equipment="Ninguno",
            duration=4
        )
        self.workout1 = Workout.objects.create(
            name="Morning Cardio",
            description="Cardio session in the morning"
        )
        self.workout2 = Workout.objects.create(
            name="Strength Training",
            description="Strength training session"
        )
        training_plan.workouts.set([self.workout1, self.workout2])

        # Asignar el TrainingPlan al UserWorkout del usuario
        self.user.user_workouts.create(training_plan=training_plan)


    def test_get_all_workouts_success(self):
        """
        Test para obtener todos los entrenamientos disponibles con éxito.
        """
        # Autenticar como el usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET al endpoint sin `user_id`
        url = reverse('get-workouts')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar que se devuelvan ambos entrenamientos
        workouts = response.data["data"]
        self.assertEqual(len(workouts), 2)
        self.assertEqual(workouts[0]["name"], "Morning Cardio")
        self.assertEqual(workouts[1]["name"], "Strength Training")

    def test_get_workouts_by_user_id_success(self):
        """
        Test para obtener entrenamientos específicos para un `user_id`.
        """
        # Autenticar como el usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET al endpoint con `user_id` en los parámetros
        url = f"{reverse('get-workouts')}?userId={self.user.id}"
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar que solo se devuelvan los entrenamientos específicos del usuario
        workouts = response.data["data"]
        self.assertEqual(len(workouts), 2)  # Suponiendo que solo hay entrenamientos específicos para `user.id`

    def test_get_workouts_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación está prohibido.
        """
        # Realizar la solicitud GET sin autenticación
        url = reverse('get-workouts')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])

class CreateWorkoutTests(APITestCase):

    def setUp(self):
        # Crear un usuario con rol de entrenador para la autenticación
        self.trainer = User.objects.create(
            email='trainer@example.com',
            password='password123',
            role='entrenador',
            birth_date='1980-05-15'
        )

        # Crear ejercicios existentes en la base de datos
        self.exercise1 = Exercise.objects.create(name="Push-up", description="A basic push-up exercise")
        self.exercise2 = Exercise.objects.create(name="Squat", description="A basic squat exercise")

        # Endpoint para crear entrenamientos
        self.url = reverse('create-workout')

    def test_create_workout_success(self):
        """
        Test para verificar la creación de un entrenamiento exitoso con ejercicios válidos.
        """
        self.client.force_authenticate(user=self.trainer)

        # Datos válidos para la creación del entrenamiento
        data = {
            "name": "Morning Routine",
            "description": "A morning workout routine",
            "duration": 30,
            "exercises": [
                {"name": "Push-up", "sets": 3, "reps": 10, "rest": 60},
                {"name": "Squat", "sets": 4, "reps": 12, "rest": 90}
            ]
        }

        response = self.client.post(self.url, data, format='json')

        # Verificar que el estado de la respuesta es 201 CREATED
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Entrenamiento creado con éxito.")
        
        # Verificar que los datos del entrenamiento son correctos
        workout_data = response.data["data"]
        self.assertEqual(workout_data["name"], "Morning Routine")
        self.assertEqual(len(workout_data["exercises"]), 2)

    def test_create_workout_missing_fields(self):
        """
        Test para verificar el error cuando faltan campos obligatorios.
        """
        self.client.force_authenticate(user=self.trainer)

        # Datos con campo obligatorio 'duration' faltante
        data = {
            "name": "Incomplete Workout",
            "description": "Workout with missing duration",
            "exercises": [
                {"name": "Push-up", "sets": 3, "reps": 10, "rest": 60}
            ]
        }

        response = self.client.post(self.url, data, format='json')

        # Verificar que el estado de la respuesta es 400 BAD REQUEST
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Faltan parámetros obligatorios", response.data["error"])

    def test_create_workout_with_nonexistent_exercise(self):
        """
        Test para verificar la respuesta cuando se incluye un ejercicio que no existe.
        """
        self.client.force_authenticate(user=self.trainer)

        # Datos con un ejercicio inexistente "Pull-up"
        data = {
            "name": "Mixed Workout",
            "description": "Workout with existing and nonexistent exercises",
            "duration": 30,
            "exercises": [
                {"name": "Push-up", "sets": 3, "reps": 10, "rest": 60},
                {"name": "Pull-up", "sets": 2, "reps": 8, "rest": 90}  # "Pull-up" no existe en la base de datos
            ]
        }

        response = self.client.post(self.url, data, format='json')

        # Verificar que el estado de la respuesta es 201 CREATED
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Entrenamiento creado con éxito.")

        # Verificar que solo el ejercicio "Push-up" está en los datos del entrenamiento
        workout_data = response.data["data"]
        self.assertEqual(len(workout_data["exercises"]), 1)
        self.assertEqual(workout_data["exercises"][0]["name"], "Push-up")

    def test_create_workout_with_invalid_user_role(self):
        """
        Test para verificar que un usuario sin permisos no pueda crear un entrenamiento.
        """
        unauth_user = User.objects.create(
            email='unauthorized@example.com',
            password='password123',
            role='cliente',
            birth_date='1995-09-21'
        )
        self.client.force_authenticate(user=unauth_user)

        data = {
            "name": "Unauthorized Workout",
            "description": "This workout should not be created by a cliente",
            "duration": 30,
            "exercises": [
                {"name": "Push-up", "sets": 3, "reps": 10, "rest": 60}
            ]
        }

        response = self.client.post(self.url, data, format='json')

        # Verificar que el estado de la respuesta es 403 FORBIDDEN
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("No tienes permisos para realizar esta acción", response.data["error"])

class UpdateWorkoutTests(APITestCase):

    def setUp(self):
        # Crear un usuario con permisos de entrenador
        self.trainer = User.objects.create(
            email='trainer@example.com',
            password='password123',
            role='entrenador',
            birth_date='1985-01-01'
        )

        # Crear ejercicios para asociar al entrenamiento
        self.exercise1 = Exercise.objects.create(
            name="Push-up",
            description="A basic push-up exercise"
        )
        self.exercise2 = Exercise.objects.create(
            name="Squat",
            description="A basic squat exercise"
        )

        # Crear un entrenamiento
        self.workout = Workout.objects.create(
            name="Initial Workout",
            description="Initial workout description"
        )
        WorkoutExercise.objects.create(
            workout=self.workout,
            exercise=self.exercise1,
            sets=3,
            reps=10,
            rest=60
        )

        # URL para actualizar el entrenamiento
        self.url = reverse('update-workout', args=[self.workout.id])

    def test_update_workout_success(self):
        """
        Test para verificar la actualización exitosa de un entrenamiento.
        """
        self.client.force_authenticate(user=self.trainer)

        # Datos para actualizar el entrenamiento
        data = {
            "name": "Updated Workout",
            "description": "Updated description",
            "media": "http://example.com/updated_media.jpg",
            "exercises": [
                {"name": "Push-up", "series": 4, "reps": 12, "rest": 70},
                {"name": "Squat", "series": 3, "reps": 15, "rest": 80}
            ]
        }

        response = self.client.put(self.url, data, format='json')

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Entrenamiento actualizado con éxito.")

        # Verificar que los detalles del entrenamiento se actualizaron correctamente
        workout_data = response.data["data"]
        self.assertEqual(workout_data["name"], "Updated Workout")
        self.assertEqual(workout_data["description"], "Updated description")
        self.assertEqual(len(workout_data["exercises"]), 2)
        self.assertEqual(workout_data["exercises"][0]["name"], "Push-up")
        self.assertEqual(workout_data["exercises"][1]["name"], "Squat")

    def test_update_workout_invalid_user_role(self):
        """
        Test para verificar que un usuario sin permisos no pueda actualizar un entrenamiento.
        """
        unauthorized_user = User.objects.create(
            email='unauthorized@example.com',
            password='password123',
            role='cliente',
            birth_date='1992-05-12'
        )
        self.client.force_authenticate(user=unauthorized_user)

        data = {
            "name": "Attempted Update",
            "description": "Should not be allowed",
            "exercises": [{"name": "Push-up", "series": 4, "reps": 12, "rest": 70}]
        }

        response = self.client.put(self.url, data, format='json')

        # Verificar que el estado de la respuesta es 403 FORBIDDEN
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("No tienes permisos para realizar esta acción", response.data["error"])

    def test_update_workout_with_nonexistent_exercise(self):
        """
        Test para verificar que se ignore un ejercicio inexistente durante la actualización.
        """
        self.client.force_authenticate(user=self.trainer)

        # Datos que incluyen un ejercicio inexistente "Pull-up"
        data = {
            "name": "Updated Workout",
            "description": "Updated description with non-existent exercise",
            "exercises": [
                {"name": "Push-up", "series": 4, "reps": 12, "rest": 70},
                {"name": "Nonexistent Exercise", "series": 3, "reps": 10, "rest": 60}
            ]
        }

        response = self.client.put(self.url, data, format='json')

        # Verificar que el estado de la respuesta es 200 OK y que el ejercicio inexistente fue ignorado
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        workout_data = response.data["data"]
        self.assertEqual(len(workout_data["exercises"]), 1)
        self.assertEqual(workout_data["exercises"][0]["name"], "Push-up")

    def test_update_nonexistent_workout(self):
        """
        Test para verificar la respuesta cuando se intenta actualizar un entrenamiento que no existe.
        """
        self.client.force_authenticate(user=self.trainer)

        # Intentar actualizar un entrenamiento con un ID inexistente
        url = reverse('update-workout', args=[9999])
        data = {
            "name": "Nonexistent Workout Update",
            "description": "This should not succeed",
            "exercises": [{"name": "Push-up", "series": 4, "reps": 12, "rest": 70}]
        }

        response = self.client.put(url, data, format='json')

        # Verificar que el estado de la respuesta es 404 NOT FOUND
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Entrenamiento no encontrado", response.data["error"])

class DeleteWorkoutTests(APITestCase):
    
    def setUp(self):
        # Crear usuarios
        self.admin_user = User.objects.create(
            email="admin@example.com",
            password="password123",
            role="administrador",
            birth_date="1980-01-01"  # Añadir un valor para birth_date
        )
        
        self.trainer_user = User.objects.create(
            email="trainer@example.com",
            password="password123",
            role="entrenador",
            birth_date="1980-01-01"
        )
        
        self.client_user = User.objects.create(
            email="client@example.com",
            password="password123",
            role="cliente",
            birth_date="1980-01-01"
        )
        
        # Crear un entrenamiento
        self.workout = Workout.objects.create(
            name="Test Workout",
            description="This is a test workout."
        )

    def test_delete_workout_success(self):
        """
        Test para eliminar un entrenamiento con éxito por un usuario con permisos.
        """
        # Autenticar como administrador
        self.client.force_authenticate(user=self.admin_user)

        # Eliminar el entrenamiento
        url = reverse("delete-workout", args=[self.workout.id])
        response = self.client.delete(url)

        # Verificar la respuesta
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Entrenamiento eliminado con éxito.")

    def test_delete_nonexistent_workout(self):
        """
        Test para verificar la respuesta al intentar eliminar un entrenamiento que no existe.
        """
        # Autenticar como administrador
        self.client.force_authenticate(user=self.admin_user)

        # Intentar eliminar un entrenamiento con un ID que no existe
        url = reverse("delete-workout", args=[999])
        response = self.client.delete(url)

        # Verificar la respuesta
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Entrenamiento no encontrado.")

    def test_delete_workout_invalid_user_role(self):
        """
        Test para verificar que un usuario sin permisos no pueda eliminar un entrenamiento.
        """
        # Autenticar como un cliente (sin permisos de eliminación)
        self.client.force_authenticate(user=self.client_user)

        # Intentar eliminar el entrenamiento
        url = reverse("delete-workout", args=[self.workout.id])
        response = self.client.delete(url)

        # Verificar la respuesta
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("No tienes permisos para realizar esta acción", response.data["error"])

class GetWorkoutsByUserTests(APITestCase):

    def setUp(self):
        # Crear un usuario y asignarle un plan de entrenamiento
        self.user = User.objects.create(
            email='user@example.com',
            password='password123',
            role='cliente',
            birth_date='1990-01-01'
        )
        self.training_plan = TrainingPlan.objects.create(
            name="Plan de Ejemplo",
            description="Descripción del plan de ejemplo",
            media="http://example.com/media.png",
            difficulty="Intermedio",
            equipment="Pesas",
            duration=30
        )
        self.user_workout = UserWorkout.objects.create(
            user=self.user,
            training_plan=self.training_plan,
            progress=0
        )
        # Crear un entrenamiento asociado al plan
        self.workout = Workout.objects.create(
            name="Entrenamiento 1",
            description="Primer entrenamiento",
            media="http://example.com/workout1.png",
            duration=60
        )
        self.training_plan.workouts.add(self.workout)

    def test_get_workouts_by_user_success(self):
        """
        Test para obtener los planes de entrenamiento asociados a un usuario existente.
        """
        # Autenticar al usuario
        self.client.force_authenticate(user=self.user)
        
        # Realizar la solicitud GET
        url = f"{reverse('get-workouts-by-user')}?userId={self.user.id}"
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar que el plan y los entrenamientos estén presentes en la respuesta
        data = response.data["data"]
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["plan_id"], self.training_plan.id)
        self.assertEqual(data[0]["plan_name"], self.training_plan.name)
        self.assertEqual(len(data[0]["workouts"]), 1)
        self.assertEqual(data[0]["workouts"][0]["id"], self.workout.id)

    def test_get_workouts_by_user_no_plans(self):
        """
        Test para un usuario sin planes de entrenamiento.
        """
        # Crear un nuevo usuario sin planes
        new_user = User.objects.create(
            email='newuser@example.com',
            password='password123',
            role='cliente',
            birth_date='1995-05-05'
        )
        # Autenticar al usuario
        self.client.force_authenticate(user=new_user)
        
        # Realizar la solicitud GET
        url = f"{reverse('get-workouts-by-user')}?userId={new_user.id}"
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 404 NOT FOUND y que se retorne el mensaje de error adecuado
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "No se encontraron planes de entrenamiento para el usuario especificado.")

    def test_get_workouts_by_user_invalid_user_id(self):
        """
        Test para un parámetro 'userId' no numérico.
        """
        # Autenticar al usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET con un userId no válido
        url = f"{reverse('get-workouts-by-user')}?userId=abc"
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 400 BAD REQUEST y que se retorne el mensaje de error adecuado
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "El parámetro 'userId' debe ser un número.")

    def test_get_workouts_by_user_missing_user_id(self):
        """
        Test para la falta del parámetro 'userId' en la solicitud.
        """
        # Autenticar al usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET sin el parámetro userId
        url = reverse('get-workouts-by-user')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 400 BAD REQUEST y que se retorne el mensaje de error adecuado
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "El parámetro 'userId' es obligatorio.")

class GetWorkoutDetailsTests(APITestCase):

    def setUp(self):
        # Crear un usuario y autenticarse
        self.user = User.objects.create(
            email='user@example.com',
            password='password123',
            role='cliente',
            birth_date='1990-01-01'
        )
        self.client.force_authenticate(user=self.user)

        # Crear un entrenamiento y ejercicios asociados
        self.workout = Workout.objects.create(
            name="Entrenamiento de Prueba",
            description="Descripción del entrenamiento de prueba",
            media="http://example.com/workout.png",
            duration=60
        )
        self.exercise = Exercise.objects.create(
            name="Ejercicio 1",
            description="Descripción del ejercicio 1"
        )
        WorkoutExercise.objects.create(
            workout=self.workout,
            exercise=self.exercise,
            sets=3,
            reps=12,
            rest=60
        )

    def test_get_workout_details_success(self):
        """
        Test para obtener los detalles de un entrenamiento existente con éxito.
        """
        # Realizar la solicitud GET con el id del workout
        url = f"{reverse('get-workout-details')}?id={self.workout.id}"
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar que los detalles del entrenamiento están presentes en la respuesta
        data = response.data
        self.assertEqual(data["id"], self.workout.id)
        self.assertEqual(data["name"], self.workout.name)
        self.assertEqual(len(data["exercises"]), 1)
        self.assertEqual(data["exercises"][0]["name"], self.exercise.name)

    def test_get_workout_details_missing_id(self):
        """
        Test para verificar la respuesta cuando falta el parámetro 'id'.
        """
        # Realizar la solicitud GET sin el parámetro 'id'
        url = reverse('get-workout-details')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 400 BAD REQUEST y que el mensaje de error es adecuado
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "El parámetro 'id' es obligatorio.")

    def test_get_workout_details_invalid_id(self):
        """
        Test para verificar la respuesta cuando el parámetro 'id' no es numérico.
        """
        # Realizar la solicitud GET con un 'id' no numérico
        url = f"{reverse('get-workout-details')}?id=abc"
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 400 BAD REQUEST y que el mensaje de error es adecuado
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "El parámetro 'id' debe ser un número.")

    def test_get_workout_details_not_found(self):
        """
        Test para verificar la respuesta cuando el entrenamiento no existe.
        """
        # Realizar la solicitud GET con un 'id' de un entrenamiento inexistente
        url = f"{reverse('get-workout-details')}?id=9999"
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 404 NOT FOUND y que el mensaje de error es adecuado
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Entrenamiento no encontrado.")

class GetWorkoutByDayTests(APITestCase):

    def setUp(self):
        # Crear usuario y autenticarse
        self.user = User.objects.create(
            email='user@example.com',
            password='password123',
            role='cliente',
            birth_date='1990-01-01'
        )
        self.client.force_authenticate(user=self.user)

        # Crear un entrenamiento y ejercicios asociados para el día específico
        self.workout = Workout.objects.create(
            name="Entrenamiento Día 1",
            description="Entrenamiento especial para el primer día",
            media="http://example.com/workout_day1.png",
            duration=60
        )
        self.exercise1 = Exercise.objects.create(
            name="Push-up",
            description="Flexiones de pecho"
        )
        WorkoutExercise.objects.create(
            workout=self.workout,
            exercise=self.exercise1,
            sets=3,
            reps=12,
            rest=60
        )

    def test_get_workout_by_day_success(self):
        """
        Test para obtener el entrenamiento de un día específico con éxito.
        """
        # Realizar la solicitud GET para el día específico
        url = reverse('get-workout-by-day', args=[self.workout.id])
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 200 OK y que los datos son correctos
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertEqual(data["day"], self.workout.id)
        self.assertEqual(data["workoutName"], self.workout.name)
        self.assertEqual(len(data["exercises"]), 1)
        self.assertEqual(data["exercises"][0]["name"], self.exercise1.name)
        self.assertEqual(data["exercises"][0]["reps"], "3x12")

    def test_get_workout_by_day_not_found(self):
        """
        Test para verificar la respuesta cuando no se encuentra un entrenamiento para el día.
        """
        # Realizar la solicitud GET para un día sin entrenamiento asociado
        url = reverse('get-workout-by-day', args=[999])
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 404 NOT FOUND
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Entrenamiento no encontrado")

    def test_get_workout_by_day_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación está prohibido.
        """
        # Desautenticar al usuario
        self.client.force_authenticate(user=None)

        # Realizar la solicitud GET para el día específico
        url = reverse('get-workout-by-day', args=[self.workout.id])
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", str(response.data))

class GetWorkoutExercisesByDayTests(APITestCase):

    def setUp(self):
        # Crear usuario y autenticarse
        self.user = User.objects.create(
            email='user@example.com',
            password='password123',
            role='cliente',
            birth_date='1990-01-01'
        )
        self.client.force_authenticate(user=self.user)

        # Crear un plan de entrenamiento y asignarlo al usuario
        self.training_plan = TrainingPlan.objects.create(
            name="Plan de Ejemplo",
            description="Plan de entrenamiento de prueba",
            duration=30  # Agregar un valor para duration
        )
        self.user_workout = UserWorkout.objects.create(
            user=self.user,
            training_plan=self.training_plan
        )

        # Crear un workout y ejercicios para el día específico dentro del plan de entrenamiento
        self.workout = Workout.objects.create(
            name="Entrenamiento Día 1",
            description="Rutina para el día 1",
            media="http://example.com/workout_image.png",
            duration=60
        )
        self.training_plan.workouts.add(self.workout)

        # Añadir ejercicios al workout
        self.exercise1 = Exercise.objects.create(name="Push-up", description="Flexiones de pecho")
        self.exercise2 = Exercise.objects.create(name="Squat", description="Sentadillas")

        WorkoutExercise.objects.create(workout=self.workout, exercise=self.exercise1, sets=3, reps=10, rest=60)
        WorkoutExercise.objects.create(workout=self.workout, exercise=self.exercise2, sets=3, reps=15, rest=60)

    def test_get_workout_exercises_by_day_success(self):
        """
        Test para obtener los ejercicios de un entrenamiento en un día específico con éxito.
        """
        # Realizar la solicitud GET al endpoint con el día específico
        url = reverse('get-workout-exercises-by-day', args=[self.workout.id])
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 200 OK y que los datos son correctos
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        exercises = response.data
        self.assertEqual(len(exercises), 2)
        self.assertEqual(exercises[0]["name"], self.exercise1.name)
        self.assertEqual(exercises[1]["name"], self.exercise2.name)
        self.assertEqual(exercises[0]["sets"], 3)
        self.assertEqual(exercises[1]["reps"], 15)

    def test_get_workout_exercises_by_day_not_found(self):
        """
        Test para verificar la respuesta cuando no se encuentra un entrenamiento para el día específico.
        """
        # Realizar la solicitud GET para un día sin workout asociado en el plan de entrenamiento
        url = reverse('get-workout-exercises-by-day', args=[999])
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 404 NOT FOUND
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Entrenamiento no encontrado para el usuario especificado")

    def test_get_workout_exercises_by_day_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación está prohibido.
        """
        # Desautenticar al usuario
        self.client.force_authenticate(user=None)

        # Realizar la solicitud GET al endpoint con el día específico
        url = reverse('get-workout-exercises-by-day', args=[self.workout.id])
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", str(response.data))


class MarkWorkoutDayCompleteTests(APITestCase):

    def setUp(self):
        # Crear usuario y autenticar
        self.user = User.objects.create(
            email='user@example.com',
            password='password123',
            role='cliente',
            birth_date='1990-01-01'
        )
        self.client.force_authenticate(user=self.user)

        # Crear entrenamiento y ejercicios para el día específico
        self.workout = Workout.objects.create(
            name="Entrenamiento Día 1",
            description="Rutina para el día 1",
            duration=60
        )
        self.exercise1 = Exercise.objects.create(name="Push-up", description="Flexiones de pecho")
        self.exercise2 = Exercise.objects.create(name="Squat", description="Sentadillas")

        # Crear URL del endpoint
        self.url = reverse('mark-workout-day-complete', kwargs={'day_id': self.workout.id})

    def test_mark_workout_day_complete_success(self):
        """
        Test para marcar un día de entrenamiento como completado con éxito.
        """
        data = {
            "completedExercises": [
                {"name": "Push-up", "sets_completed": 3, "reps_completed": 10, "rest_time": 60},
                {"name": "Squat", "sets_completed": 3, "reps_completed": 15, "rest_time": 60}
            ]
        }
        response = self.client.post(self.url, data, format='json')

        # Verificar que la respuesta sea 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Día de entrenamiento marcado como completado.")

        # Verificar que los logs de los ejercicios se hayan creado
        exercise_logs = ExerciseLog.objects.filter(user=self.user, workout=self.workout)
        self.assertEqual(exercise_logs.count(), 2)

        # Verificar el progreso del usuario
        progress = ProgressTracking.objects.get(user=self.user, date=timezone.now().date())
        self.assertEqual(progress.completed_workouts, 1)

    def test_mark_workout_day_complete_missing_exercises(self):
        """
        Test para verificar la respuesta cuando faltan ejercicios completados en la solicitud.
        """
        response = self.client.post(self.url, {"completedExercises": []}, format='json')

        # Verificar que la respuesta sea 400 BAD REQUEST
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "No se proporcionaron ejercicios completados.")

    def test_mark_workout_day_complete_nonexistent_workout(self):
        """
        Test para verificar la respuesta cuando el entrenamiento no existe.
        """
        nonexistent_url = reverse('mark-workout-day-complete', kwargs={'day_id': 999})
        data = {
            "completedExercises": [
                {"name": "Push-up", "sets_completed": 3, "reps_completed": 10, "rest_time": 60}
            ]
        }
        response = self.client.post(nonexistent_url, data, format='json')

        # Verificar que la respuesta sea 404 NOT FOUND
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Entrenamiento no encontrado.")

    def test_mark_workout_day_complete_nonexistent_exercise(self):
        """
        Test para verificar la respuesta cuando un ejercicio especificado no existe.
        """
        data = {
            "completedExercises": [
                {"name": "Nonexistent Exercise", "sets_completed": 3, "reps_completed": 10, "rest_time": 60}
            ]
        }
        response = self.client.post(self.url, data, format='json')

        # Verificar que la respuesta sea 200 OK, pero sin crear logs para ejercicios inexistentes
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Día de entrenamiento marcado como completado.")
        
        # Verificar que no se hayan creado logs de ejercicios
        exercise_logs = ExerciseLog.objects.filter(user=self.user, workout=self.workout)
        self.assertEqual(exercise_logs.count(), 0)

class CompleteWorkoutTests(APITestCase):
    def setUp(self):
        # Crear un usuario autenticado
        self.user = User.objects.create(
            email='user@example.com',
            password='password123',
            role='cliente',
            birth_date='1990-01-01'
        )
        self.client.force_authenticate(user=self.user)

        # Crear el plan de entrenamiento y los entrenamientos semanales
        self.user_workout = UserWorkout.objects.create(user=self.user)
        self.workout1 = Workout.objects.create(name="Workout 1")
        self.workout2 = Workout.objects.create(name="Workout 2")
        self.weekly_workout1 = WeeklyWorkout.objects.create(
            user_workout=self.user_workout, workout=self.workout1, completed=False
        )
        self.weekly_workout2 = WeeklyWorkout.objects.create(
            user_workout=self.user_workout, workout=self.workout2, completed=False
        )

    def test_mark_workout_as_completed_success(self):
        """
        Test para marcar un workout como completado con éxito.
        """
        url = reverse('mark-workout-as-completed', args=[self.workout1.id])
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.weekly_workout1.refresh_from_db()
        self.assertTrue(self.weekly_workout1.completed)
        self.assertEqual(response.data["message"], "Workout marked as completed")

    def test_mark_all_workouts_completed_and_reset(self):
        """
        Test para marcar todos los workouts como completos y verificar el reseteo.
        """
        # Marcar el primer workout como completado
        url1 = reverse('mark-workout-as-completed', args=[self.workout1.id])
        self.client.post(url1)
        self.weekly_workout1.refresh_from_db()
        self.assertTrue(self.weekly_workout1.completed)

        # Marcar el segundo workout como completado y verificar el reset
        url2 = reverse('mark-workout-as-completed', args=[self.workout2.id])
        response = self.client.post(url2)

        # Comprobar que el estado de la respuesta es exitoso
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Workout marked as completed")

        # Verificar que todos los entrenamientos se hayan reseteado a incompletos
        self.weekly_workout1.refresh_from_db()
        self.weekly_workout2.refresh_from_db()
        self.assertFalse(self.weekly_workout1.completed)
        self.assertFalse(self.weekly_workout2.completed)

    def test_mark_nonexistent_workout_as_completed(self):
        """
        Test para verificar la respuesta al intentar completar un workout no existente.
        """
        url = reverse('mark-workout-as-completed', args=[999])  # ID no existente
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Workout not found for the user")
    
    def test_mark_workout_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación está prohibido.
        """
        self.client.logout()
        url = reverse('mark-workout-as-completed', args=[self.workout1.id])
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)