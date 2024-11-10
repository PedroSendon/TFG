from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from api.models.exercise import Exercise
from api.models.user import User
from api.models.workout import Workout, WorkoutExercise

class ExerciseCreationTests(APITestCase):
    
    def setUp(self):
        # Crear usuarios con diferentes roles
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='password123',
            role='administrador'
        )
        self.trainer_user = User.objects.create_user(
            email='trainer@example.com',
            password='password123',
            role='entrenador'
        )
        self.nutritionist_user = User.objects.create_user(
            email='nutritionist@example.com',
            password='password123',
            role='nutricionista'
        )
        self.client_user = User.objects.create_user(
            email='client@example.com',
            password='password123',
            role='cliente'
        )
        
        # URL para crear un ejercicio
        self.url = reverse('create_exercise')

    def test_create_exercise_as_admin(self):
        """
        Test para crear un ejercicio con un usuario autorizado (administrador).
        """
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "name": "Push-up",
            "description": "Push-up exercise description",
            "muscleGroups": ["Pectorales", "Tríceps"],
            "instructions": "Baja hasta que los codos estén a 90 grados. Empuja hacia arriba.",
            "media": "http://example.com/media/push-up.jpg"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("Ejercicio creado con éxito", response.data["message"])
        self.assertEqual(Exercise.objects.count(), 1)

    def test_create_exercise_as_trainer(self):
        """
        Test para crear un ejercicio con un usuario autorizado (entrenador).
        """
        self.client.force_authenticate(user=self.trainer_user)
        data = {
            "name": "Squat",
            "description": "Squat exercise description",
            "muscleGroups": ["Cuádriceps", "Glúteos"],
            "instructions": "Baja hasta que tus rodillas estén a 90 grados. Empuja hacia arriba.",
            "media": "http://example.com/media/squat.jpg"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("Ejercicio creado con éxito", response.data["message"])
        self.assertEqual(Exercise.objects.count(), 1)

    def test_create_exercise_unauthorized_user(self):
        """
        Test para verificar que un usuario no autorizado (cliente o nutricionista) no pueda crear ejercicios.
        """
        # Usuario con rol de cliente
        self.client.force_authenticate(user=self.client_user)
        data = {
            "name": "Push-up",
            "description": "Push-up exercise description",
            "muscleGroups": ["Pectorales", "Tríceps"],
            "instructions": "Baja hasta que los codos estén a 90 grados. Empuja hacia arriba.",
            "media": "http://example.com/media/push-up.jpg"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("No tienes permisos para crear ejercicios", response.data["error"])

        # Usuario con rol de nutricionista
        self.client.force_authenticate(user=self.nutritionist_user)
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("No tienes permisos para crear ejercicios", response.data["error"])
        self.assertEqual(Exercise.objects.count(), 0)

    def test_create_exercise_missing_fields(self):
        """
        Test para verificar el manejo de errores cuando faltan campos obligatorios.
        """
        self.client.force_authenticate(user=self.trainer_user)
        data = {
            "name": "Push-up"
            # Falta "description", "muscleGroups" y "instructions"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Faltan los campos obligatorios", response.data["error"])
        self.assertEqual(Exercise.objects.count(), 0)

    def test_create_exercise_invalid_muscle_groups_format(self):
        """
        Test para verificar el manejo de errores cuando el formato de muscleGroups es incorrecto.
        """
        self.client.force_authenticate(user=self.trainer_user)
        data = {
            "name": "Push-up",
            "description": "Push-up exercise description",
            "muscleGroups": "Pectorales, Tríceps",  # Debería ser una lista, no una cadena
            "instructions": "Baja hasta que los codos estén a 90 grados. Empuja hacia arriba.",
            "media": "http://example.com/media/push-up.jpg"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("muscleGroups debe ser una lista", response.data["error"])
        self.assertEqual(Exercise.objects.count(), 0)

class ExerciseRetrievalTests(APITestCase):
    
    def setUp(self):
        # Crear un usuario autorizado para las pruebas
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='password123',
            role='administrador'
        )

        # Crear un ejercicio para probar la obtención de datos
        self.exercise = Exercise.objects.create(
            name="Push-up",
            description="Push-up exercise description",
            muscleGroups="Pectorales, Tríceps",
            media="http://example.com/media/push-up.jpg",
            instructions="Baja hasta que los codos estén a 90 grados. Empuja hacia arriba."
        )

    def test_get_exercise_by_id_success(self):
        """
        Test para obtener un ejercicio por su ID con un usuario autorizado.
        """
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('get_exercise_by_id', args=[self.exercise.id])
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Push-up")
        self.assertEqual(response.data["description"], "Push-up exercise description")
        self.assertEqual(response.data["muscleGroups"], ["Pectorales", "Tríceps"])
        self.assertEqual(response.data["media"], "http://example.com/media/push-up.jpg")
        self.assertEqual(response.data["instructions"], "Baja hasta que los codos estén a 90 grados. Empuja hacia arriba.")

    def test_get_exercise_by_id_not_found(self):
        """
        Test para intentar obtener un ejercicio que no existe, esperando un error 404.
        """
        self.client.force_authenticate(user=self.admin_user)
        non_existent_id = 999  # ID que no existe
        url = reverse('get_exercise_by_id', args=[non_existent_id])
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Exercise not found", response.data["error"])

    def test_get_exercise_by_id_unauthenticated(self):
        """
        Test para intentar obtener un ejercicio sin autenticación, esperando un error 401.
        """
        url = reverse('get_exercise_by_id', args=[self.exercise.id])
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])


class ExerciseDetailsTests(APITestCase):

    def setUp(self):
        # Crear un usuario autorizado para las pruebas
        self.user = User.objects.create_user(
            email='user@example.com',
            password='password123',
            role='cliente'
        )
        
        # Crear otro usuario para verificar que el acceso es exclusivo
        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='password123',
            role='cliente'
        )

        # Crear un ejercicio y un workout para el usuario
        self.exercise = Exercise.objects.create(
            name="Push-up",
            description="Push-up exercise description",
            muscleGroups="Pectorales, Tríceps",
            media="http://example.com/media/push-up.jpg",
            instructions="Baja hasta que los codos estén a 90 grados. Empuja hacia arriba."
        )
        self.workout = Workout.objects.create(
            name="Workout Day 1",
            description="Day 1 workout description"
        )
        self.workout.exercises.add(self.exercise)

    def test_get_exercise_details_success(self):
        """
        Test para obtener detalles de un ejercicio dentro de un workout con parámetros correctos.
        """
        self.client.force_authenticate(user=self.user)
        url = reverse('get_exercise_details')
        data = {
            "day_id": self.workout.id,
            "exerciseId": self.exercise.id
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Push-up")
        self.assertEqual(response.data["description"], "Push-up exercise description")

    def test_get_exercise_details_missing_parameters(self):
        """
        Test para verificar que se retorna un error cuando faltan parámetros.
        """
        self.client.force_authenticate(user=self.user)
        url = reverse('get_exercise_details')
        data = {
            "day_id": self.workout.id
            # Falta exerciseId
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("day_id y exercise_id son requeridos", response.data["error"])

    def test_get_exercise_details_not_found(self):
        """
        Test para verificar que se retorna un error cuando el ejercicio no está en el workout especificado.
        """
        self.client.force_authenticate(user=self.user)
        url = reverse('get_exercise_details')
        data = {
            "day_id": self.workout.id,
            "exerciseId": 999  # ID de ejercicio inexistente
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Ejercicio no encontrado en el workout especificado", response.data["error"])

    def test_get_exercise_details_non_numeric_parameters(self):
        """
        Test para verificar que se retorna un error cuando los parámetros no son numéricos.
        """
        self.client.force_authenticate(user=self.user)
        url = reverse('get_exercise_details')
        data = {
            "day_id": "abc",  # Parámetro no numérico
            "exerciseId": "xyz"  # Parámetro no numérico
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Los parámetros 'day_id' y 'exercise_id' deben ser números", response.data["error"])

    def test_get_exercise_details_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación da un error 401.
        """
        url = reverse('get_exercise_details')
        data = {
            "day_id": self.workout.id,
            "exerciseId": self.exercise.id
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])


class GetExercisesByTrainingTests(APITestCase):

    def setUp(self):
        # Crear un usuario autorizado para las pruebas
        self.user = User.objects.create_user(
            email='user@example.com',
            password='password123',
            role='cliente'
        )

        # Crear un workout y ejercicios para el entrenamiento
        self.workout = Workout.objects.create(
            name="Workout Day 1",
            description="Day 1 workout description"
        )

        self.exercise1 = Exercise.objects.create(
            name="Push-up",
            description="Push-up exercise description",
            muscleGroups="Pectorales, Tríceps",
            media="http://example.com/media/push-up.jpg",
            instructions="Baja hasta que los codos estén a 90 grados. Empuja hacia arriba."
        )

        self.exercise2 = Exercise.objects.create(
            name="Squat",
            description="Squat exercise description",
            muscleGroups="Cuádriceps, Glúteos",
            media="http://example.com/media/squat.jpg",
            instructions="Mantén la espalda recta y baja hasta que las rodillas estén a 90 grados."
        )

        # Asociar ejercicios al workout
        WorkoutExercise.objects.create(
            workout=self.workout,
            exercise=self.exercise1,
            sets=3,
            reps=12,
            rest=60
        )
        WorkoutExercise.objects.create(
            workout=self.workout,
            exercise=self.exercise2,
            sets=4,
            reps=10,
            rest=90
        )

    def test_get_exercises_by_training_success(self):
        """
        Test para obtener todos los ejercicios de un entrenamiento específico con un trainingId válido.
        """
        self.client.force_authenticate(user=self.user)
        url = reverse('get_exercises_by_training')
        response = self.client.get(url, {'trainingId': self.workout.id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 2)
        self.assertEqual(response.data["data"][0]["name"], "Push-up")
        self.assertEqual(response.data["data"][1]["name"], "Squat")

    def test_get_exercises_by_training_missing_parameter(self):
        """
        Test para verificar que se retorna un error cuando falta el parámetro 'trainingId'.
        """
        self.client.force_authenticate(user=self.user)
        url = reverse('get_exercises_by_training')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("El parámetro 'trainingId' es obligatorio", response.data["error"])

    def test_get_exercises_by_training_non_numeric_parameter(self):
        """
        Test para verificar que se retorna un error cuando el parámetro 'trainingId' no es numérico.
        """
        self.client.force_authenticate(user=self.user)
        url = reverse('get_exercises_by_training')
        response = self.client.get(url, {'trainingId': 'abc'})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("El parámetro 'trainingId' debe ser un número", response.data["error"])

    def test_get_exercises_by_training_no_exercises_found(self):
        """
        Test para verificar que se retorna un error cuando no hay ejercicios asociados al 'trainingId' especificado.
        """
        self.client.force_authenticate(user=self.user)
        workout_empty = Workout.objects.create(name="Empty Workout", description="No exercises")
        url = reverse('get_exercises_by_training')
        response = self.client.get(url, {'trainingId': workout_empty.id})
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("No se encontraron ejercicios para el entrenamiento especificado", response.data["error"])

    def test_get_exercises_by_training_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación da un error 401.
        """
        url = reverse('get_exercises_by_training')
        response = self.client.get(url, {'trainingId': self.workout.id})
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])

class UpdateExerciseTests(APITestCase):

    def setUp(self):
        # Crear usuarios con diferentes roles
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='password123',
            role='administrador'
        )

        self.client_user = User.objects.create_user(
            email='client@example.com',
            password='password123',
            role='cliente'
        )

        # Crear un ejercicio para realizar la actualización
        self.exercise = Exercise.objects.create(
            name="Push-up",
            description="Original description",
            muscleGroups="Pectorales, Tríceps",
            media="http://example.com/media/push-up.jpg",
            instructions="Baja hasta que los codos estén a 90 grados. Empuja hacia arriba."
        )

    def test_update_exercise_success(self):
        """
        Test para actualizar un ejercicio con éxito con permisos de administrador.
        """
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('update_exercise')
        data = {
            "id": self.exercise.id,
            "name": "Modified Push-up",
            "description": "Updated description",
            "muscleGroups": ["Pectorales", "Tríceps", "Hombros"],
            "instructions": "Updated instructions."
        }
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["name"], "Modified Push-up")
        self.assertEqual(response.data["data"]["description"], "Updated description")
        self.assertIn("Hombros", response.data["data"]["muscleGroups"])

    def test_update_exercise_permission_denied(self):
        """
        Test para verificar que un cliente no puede modificar ejercicios.
        """
        self.client.force_authenticate(user=self.client_user)
        url = reverse('update_exercise')
        data = {"id": self.exercise.id, "name": "Unauthorized Update"}
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("No tienes permisos para modificar ejercicios", response.data["error"])

    def test_update_exercise_not_found(self):
        """
        Test para verificar el error cuando el ID del ejercicio no existe.
        """
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('update_exercise')
        data = {"id": 999, "name": "Non-existent Exercise"}
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Ejercicio no encontrado", response.data["error"])

    def test_update_exercise_invalid_data(self):
        """
        Test para verificar que se maneja correctamente un error de datos inválidos.
        """
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('update_exercise')
        data = {
            "id": self.exercise.id,
            "name": "",  # Nombre vacío no debería ser permitido
            "description": "Updated description"
        }
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Datos no válidos", response.data["error"])

    def test_update_exercise_missing_id(self):
        """
        Test para verificar el error cuando falta el parámetro 'id'.
        """
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('update_exercise')
        data = {"name": "No ID Exercise"}
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("El parámetro 'id' es obligatorio", response.data["error"])

    def test_update_exercise_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación da un error 401.
        """
        url = reverse('update_exercise')
        data = {"id": self.exercise.id, "name": "New Name"}
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])

