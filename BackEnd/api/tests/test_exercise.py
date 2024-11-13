from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from api.models.trainingplan import TrainingPlan
from api.models.exercise import Exercise
from api.models.user import User
from api.models.workout import UserWorkout, Workout, WorkoutExercise

class ExerciseCreationTests(APITestCase):
    
    def setUp(self):
        # Crear usuarios con diferentes roles, incluyendo el campo 'birth_date'
        self.admin_user = User.objects.create(
            email='admin@example.com',
            password='password123',
            role='administrador',
            birth_date='1990-01-01'
        )
        self.trainer_user = User.objects.create(
            email='trainer@example.com',
            password='password123',
            role='entrenador',
            birth_date='1992-05-05'
        )
        self.nutritionist_user = User.objects.create(
            email='nutritionist@example.com',
            password='password123',
            role='nutricionista',
            birth_date='1988-08-08'
        )
        self.client_user = User.objects.create(
            email='client@example.com',
            password='password123',
            role='cliente',
            birth_date='1995-09-15'
        )
        
        # URL para crear un ejercicio
        self.url = reverse('create-exercise')

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
        self.assertIn("No tienes permisos para realizar esta acción", response.data["error"])

        # Usuario con rol de nutricionista
        self.client.force_authenticate(user=self.nutritionist_user)
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("No tienes permisos para realizar esta acción", response.data["error"])
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
        # Verificar que el mensaje de error contiene la descripción correcta del problema
        error_message = response.data["error"]
        # Remueve los saltos de línea antes de realizar la verificación
        formatted_error_message = error_message['error'].replace('\n', ' ')
        self.assertIn("Input should be a valid list", formatted_error_message)


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
        
        # Verificar que el mensaje de error contiene cada campo requerido
        error_message = response.data["error"]
        self.assertIn("description: Field required muscleGroups: Field required instructions: Field required", error_message['error'].replace('\n', ' '))
        self.assertEqual(Exercise.objects.count(), 0)


class ExerciseRetrievalTests(APITestCase):
    
    def setUp(self):
        # Crear un usuario autorizado para las pruebas
        self.admin_user = User.objects.create(
            email='admin@example.com',
            password='password123',
            role='administrador',
            birth_date='1990-01-01'
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

        self.client.force_authenticate(user=self.admin_user)
        url = reverse('get-exercise-by-id', args=[self.exercise.id])
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Push-up")
        self.assertEqual(response.data["description"], "Push-up exercise description")
        self.assertEqual(response.data["muscleGroups"], ["Pectorales", "Tríceps"])
        self.assertEqual(response.data["media"], "http://example.com/media/push-up.jpg")
        self.assertEqual(response.data["instructions"], ["Baja hasta que los codos estén a 90 grados", "Empuja hacia arriba"])

    def test_get_exercise_by_id_not_found(self):

        self.client.force_authenticate(user=self.admin_user)
        non_existent_id = 999  # ID que no existe
        url = reverse('get-exercise-by-id', args=[non_existent_id])
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Exercise not found", response.data["error"])

    def test_get_exercise_by_id_unauthenticated(self):

        url = reverse('get-exercise-by-id', args=[self.exercise.id])
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])


class ExerciseDetailsTests(APITestCase):

    def setUp(self):
        # Crear un usuario autorizado para las pruebas
        self.client_user = User.objects.create(
            email='client@example.com',
            password='password123',
            role='cliente',
            birth_date='1995-09-15'
        )
        
        # Crear otro usuario para verificar que el acceso es exclusivo
        self.other_user = User.objects.create(
            email='other@example.com',
            password='password123',
            role='cliente',
            birth_date='1995-09-15'
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
        
        # Crear la relación WorkoutExercise con valores obligatorios
        WorkoutExercise.objects.create(
            workout=self.workout,
            exercise=self.exercise,
            sets=3,
            reps=12,
            rest=60
        )

        # Crear un TrainingPlan con los campos obligatorios
        self.training_plan = TrainingPlan.objects.create(
            name="Training Plan 1",
            description="Sample training plan",
            duration=30,  # Duración en días o semanas
            difficulty="intermedio",  # Nivel de dificultad
            equipment="Pesas"  # Equipamiento necesario
        )
        self.training_plan.workouts.add(self.workout)

        # Crear un UserWorkout y asociarlo al usuario y al TrainingPlan
        self.user_workout = UserWorkout.objects.create(user=self.client_user, training_plan=self.training_plan)


    def test_get_exercise_details_success(self):
        """
        Test para obtener detalles de un ejercicio dentro de un workout con parámetros correctos.
        """
        self.client.force_authenticate(user=self.client_user)
        url = reverse('get-exercise-details')
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
        self.client.force_authenticate(user=self.client_user)
        url = reverse('get-exercise-details')
        data = {
            "day_id": self.workout.id  # Falta exerciseId
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("day_id y exercise_id son requeridos", response.data["error"])

    def test_get_exercise_details_not_found(self):
        """
        Test para verificar que se retorna un error cuando el ejercicio no está en el workout especificado.
        """
        self.client.force_authenticate(user=self.client_user)
        url = reverse('get-exercise-details')
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
        self.client.force_authenticate(user=self.client_user)
        url = reverse('get-exercise-details')
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
        url = reverse('get-exercise-details')
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
        self.user = User.objects.create(
            email='user@example.com',
            password='password123',
            role='cliente',
            birth_date='1995-09-15'
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
        self.admin_user = User.objects.create(
            email='admin@example.com',
            password='password123',
            role='administrador',
            birth_date='1995-09-15'
        )

        self.client_user = User.objects.create(
            email='client@example.com',
            password='password123',
            role='cliente',
            birth_date='1995-09-15'
        )

        # Crear un ejercicio para realizar la actualización
        self.exercise = Exercise.objects.create(
            name="Push-up",
            description="Original description",
            muscleGroups="Pectorales, Tríceps",
            media="http://example.com/media/push-up.jpg",
            instructions="Baja hasta que los codos estén a 90 grados. Empuja hacia arriba."
        )
    '''
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
            
            # Confirmamos que el estado devuelto es 200 OK
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data["data"]["name"], "Modified Push-up")
            self.assertEqual(response.data["data"]["description"], "Updated description")
            self.assertIn("Hombros", response.data["data"]["muscleGroups"])

    

    def test_update_exercise_not_found(self):
        """
        Test para verificar el error cuando el ID del ejercicio no existe.
        """
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('update_exercise')
        data = {"id": 999, "name": "Non-existent Exercise"}
        response = self.client.put(url, data, format='json')
        
        # Confirmamos que el estado devuelto es 404 NOT FOUND
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Ejercicio no encontrado", response.data["error"])
    '''

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

class DeleteExerciseTests(APITestCase):
    
    def setUp(self):
        # Crear un usuario administrador para autenticación
        self.admin_user = User.objects.create(
            email='admin@example.com',
            password='password123',
            role='administrador',
            birth_date='1995-09-15'
        )

        # Crear un ejercicio para eliminar en las pruebas
        self.exercise = Exercise.objects.create(
            name="Push-up",
            description="Ejercicio de prueba",
            muscleGroups="Pectorales, Tríceps",
            media="http://example.com/media/push-up.jpg",
            instructions="Instrucciones de prueba"
        )

    def test_delete_exercise_success(self):
        """
        Test para eliminar un ejercicio con éxito.
        """
        # Autenticar como usuario administrador
        self.client.force_authenticate(user=self.admin_user)

        # Realizar la solicitud DELETE al endpoint
        url = reverse('delete-exercise', args=[self.exercise.id])
        response = self.client.delete(url)

        # Verificar que el estado devuelto es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Ejercicio eliminado exitosamente.")

        # Verificar que el ejercicio ha sido eliminado de la base de datos
        self.assertFalse(Exercise.objects.filter(id=self.exercise.id).exists())

    def test_delete_exercise_not_found(self):
        """
        Test para verificar el error cuando el ejercicio no existe.
        """
        # Autenticar como usuario administrador
        self.client.force_authenticate(user=self.admin_user)

        # Realizar la solicitud DELETE para un ID de ejercicio inexistente
        url = reverse('delete-exercise', args=[999])
        response = self.client.delete(url)

        # Verificar que el estado devuelto es 404 NOT FOUND
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Ejercicio no encontrado.")

    def test_delete_exercise_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación da un error 401.
        """
        # Realizar la solicitud DELETE sin autenticación
        url = reverse('delete-exercise', args=[self.exercise.id])
        response = self.client.delete(url)

        # Verificar que el estado devuelto es 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])


class ListAllExercisesTests(APITestCase):
    
    def setUp(self):
        # Crear un usuario autenticado
        self.user = User.objects.create(
            email='user@example.com',
            password='password123',
            role='cliente',  # Puede ser cualquier rol con acceso permitido
            birth_date='1995-09-15'
        )

        # Crear algunos ejercicios en la base de datos
        self.exercise1 = Exercise.objects.create(
            name="Push-up",
            description="Ejercicio para pecho y tríceps",
            muscleGroups="Pectorales, Tríceps",
            media="http://example.com/media/push-up.jpg",
            instructions="Instrucciones de push-up"
        )

        self.exercise2 = Exercise.objects.create(
            name="Squat",
            description="Ejercicio para piernas",
            muscleGroups="Cuádriceps, Glúteos",
            media="http://example.com/media/squat.jpg",
            instructions="Instrucciones de squat"
        )

    def test_list_all_exercises_success(self):
        """
        Test para listar todos los ejercicios con éxito.
        """
        # Autenticar al usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET al endpoint
        url = reverse('list-all-exercises')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que la respuesta contiene los datos de los ejercicios
        exercises_data = response.data["data"]
        self.assertEqual(len(exercises_data), 2)  # Debe haber dos ejercicios

        # Verificar que el primer ejercicio tiene los datos correctos
        self.assertEqual(exercises_data[0]["id"], self.exercise1.id)
        self.assertEqual(exercises_data[0]["name"], "Push-up")
        self.assertEqual(exercises_data[0]["description"], "Ejercicio para pecho y tríceps")
        self.assertEqual(exercises_data[0]["muscleGroups"], ["Pectorales", "Tríceps"])
        self.assertEqual(exercises_data[0]["instructions"], "Instrucciones de push-up")
        self.assertEqual(exercises_data[0]["media"], "http://example.com/media/push-up.jpg")

    def test_list_all_exercises_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación está prohibido.
        """
        # Realizar la solicitud GET sin autenticación
        url = reverse('list-all-exercises')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])
    
    def test_list_all_exercises_empty(self):
        """
        Test para verificar que se maneja correctamente una lista vacía de ejercicios.
        """
        # Autenticar al usuario
        self.client.force_authenticate(user=self.user)

        # Eliminar todos los ejercicios de la base de datos
        Exercise.objects.all().delete()

        # Realizar la solicitud GET al endpoint
        url = reverse('list-all-exercises')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que la respuesta contiene una lista vacía de ejercicios
        exercises_data = response.data["data"]
        self.assertEqual(len(exercises_data), 0)
