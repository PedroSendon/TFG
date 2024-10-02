from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from api.models import Workout, Exercise, WorkoutExercise, UserWorkout, ProgressTracking, ExerciseLog
from django.contrib.auth.models import User

class GetWorkoutsTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        self.url = reverse('workouts')

        # Crear entrenamientos de prueba
        Workout.objects.create(name="FULL BODY", description="Workout for the whole body", media="https://example.com/fullbody.jpg")
        Workout.objects.create(name="LEGS", description="Leg workout", media="https://example.com/legs.jpg")
        Workout.objects.create(name="ARM", description="Arm workout", media="https://example.com/arm.jpg")
        Workout.objects.create(name="CARDIO", description="Cardio workout", media="https://example.com/cardio.jpg")

    def test_get_all_workouts(self):
        """
        Verifica que se devuelvan todos los entrenamientos.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar que se devuelvan 4 entrenamientos
        self.assertEqual(len(response.data), 4)

    def test_get_workouts_by_user(self):
        """
        Verifica que los entrenamientos personalizados por usuario funcionen (si está implementado).
        """
        user_id = "some-user-id"  # Suponiendo que hay entrenamientos personalizados por usuario
        response = self.client.get(f"{self.url}?userId={user_id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Añadir más pruebas según la lógica de personalización si es necesario

class GetWorkoutByDayTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear ejercicios de prueba
        self.squats = Exercise.objects.create(name="Squats", muscle_groups="Legs", description="Squats exercise", instructions="Do squats.", media="https://example.com/squats.jpg")
        self.pushups = Exercise.objects.create(name="Push Ups", muscle_groups="Chest", description="Push ups exercise", instructions="Do pushups.", media="https://example.com/pushups.jpg")

        # Crear entrenamiento de prueba
        self.workout = Workout.objects.create(name="FULL BODY", description="Este entrenamiento se enfoca en todo el cuerpo...", media="https://example.com/fullbody.jpg")
        
        # Asociar los ejercicios con el entrenamiento
        WorkoutExercise.objects.create(workout=self.workout, exercise=self.squats, sets=3, reps=12, rest=60)
        WorkoutExercise.objects.create(workout=self.workout, exercise=self.pushups, sets=3, reps=15, rest=60)

        # URL del endpoint
        self.url = reverse('get-workout-by-day', args=[self.workout.id])

    def test_get_workout_by_day_success(self):
        """
        Verifica que los detalles del entrenamiento se obtengan correctamente.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar que el nombre del entrenamiento es correcto
        self.assertEqual(response.data['workoutName'], "FULL BODY")
        
        # Verificar que se obtuvieron los ejercicios correctos
        self.assertEqual(len(response.data['exercises']), 2)
        self.assertEqual(response.data['exercises'][0]['name'], "Squats")
        self.assertEqual(response.data['exercises'][0]['reps'], "3x12")
        self.assertEqual(response.data['exercises'][1]['name'], "Push Ups")
        self.assertEqual(response.data['exercises'][1]['reps'], "3x15")

    def test_get_workout_by_day_not_found(self):
        """
        Verifica que se devuelva un error si el entrenamiento no existe.
        """
        invalid_url = reverse('get-workout-by-day', args=[999])  # Un ID que no existe
        response = self.client.get(invalid_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class GetWorkoutExercisesByDayTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear ejercicios de prueba
        self.squats = Exercise.objects.create(name="Squats", muscle_groups="Legs", description="Squats exercise", instructions="Do squats.", media="https://example.com/squats.jpg")
        self.bench_press = Exercise.objects.create(name="Bench Press", muscle_groups="Chest", description="Bench press exercise", instructions="Do bench press.", media="https://example.com/bench_press.jpg")

        # Crear entrenamiento de prueba
        self.workout = Workout.objects.create(name="FULL BODY", description="Este entrenamiento se enfoca en todo el cuerpo...", media="https://example.com/fullbody.jpg")
        
        # Asociar los ejercicios con el entrenamiento
        WorkoutExercise.objects.create(workout=self.workout, exercise=self.squats, sets=4, reps=12, rest=60)
        WorkoutExercise.objects.create(workout=self.workout, exercise=self.bench_press, sets=3, reps=10, rest=60)

        # URL del endpoint
        self.url = reverse('get-workout-exercises-by-day', args=[self.workout.id])

    def test_get_workout_exercises_by_day_success(self):
        """
        Verifica que los detalles de los ejercicios se obtengan correctamente para un día de entrenamiento.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar que los ejercicios sean correctos
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['name'], "Squats")
        self.assertEqual(response.data[0]['sets'], 4)
        self.assertEqual(response.data[0]['reps'], 12)
        self.assertEqual(response.data[1]['name'], "Bench Press")
        self.assertEqual(response.data[1]['sets'], 3)
        self.assertEqual(response.data[1]['reps'], 10)

    def test_get_workout_exercises_by_day_not_found(self):
        """
        Verifica que se devuelva un error si el entrenamiento no existe.
        """
        invalid_url = reverse('get-workout-exercises-by-day', args=[999])  # Un ID que no existe
        response = self.client.get(invalid_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class MarkWorkoutDayCompleteTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear usuario de prueba
        self.user = User.objects.create_user(first_name="Test", last_name="User", email="testuser@example.com", password="TestPassword123!")

        # Crear ejercicios de prueba
        self.squats = Exercise.objects.create(name="Squats", muscle_groups="Legs", description="Squats exercise", instructions="Do squats.", media="https://example.com/squats.jpg")
        self.bench_press = Exercise.objects.create(name="Bench Press", muscle_groups="Chest", description="Bench press exercise", instructions="Do bench press.", media="https://example.com/bench_press.jpg")

        # Crear entrenamiento de prueba
        self.workout = Workout.objects.create(name="FULL BODY", description="Este entrenamiento se enfoca en todo el cuerpo...", media="https://example.com/fullbody.jpg")
        
        # Asociar los ejercicios con el entrenamiento
        WorkoutExercise.objects.create(workout=self.workout, exercise=self.squats, sets=4, reps=12, rest=60)
        WorkoutExercise.objects.create(workout=self.workout, exercise=self.bench_press, sets=3, reps=10, rest=90)

        # URL del endpoint
        self.url = reverse('mark-workout-day-complete', args=[self.workout.id])

        # Autenticar al usuario
        self.client.force_authenticate(user=self.user)

    def test_mark_workout_day_complete_success(self):
        """
        Verifica que se pueda marcar un día de entrenamiento como completado.
        """
        data = {
            "completedExercises": [
                { "name": "Squats", "sets_completed": 4, "reps_completed": 12, "rest_time": 60, "completed": True },
                { "name": "Bench Press", "sets_completed": 3, "reps_completed": 10, "rest_time": 90, "completed": True }
            ]
        }
        
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertIn('completed_workouts', response.data)

        # Verificar que los registros de progreso y ejercicios completados se hayan creado
        progress = ProgressTracking.objects.get(user=self.user)
        self.assertEqual(progress.completed_workouts, 1)

        exercise_logs = ExerciseLog.objects.filter(user=self.user, workout=self.workout)
        self.assertEqual(exercise_logs.count(), 2)

    def test_mark_workout_day_complete_no_exercises(self):
        """
        Verifica que no se pueda marcar un día de entrenamiento sin ejercicios completados.
        """
        response = self.client.post(self.url, {"completedExercises": []}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_mark_workout_day_complete_not_found(self):
        """
        Verifica que se devuelva un error si el día de entrenamiento no existe.
        """
        invalid_url = reverse('mark-workout-day-complete', args=[999])  # Un ID que no existe
        response = self.client.post(invalid_url, {"completedExercises": []}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)

class GetWorkoutsByUserTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear un usuario y entrenamientos de prueba
        self.user = User.objects.create_user(first_name="John", last_name="Doe", email="john@example.com", password="TestPassword123!")
        
        self.workout1 = Workout.objects.create(name="Full Body", description="Full body workout", media="https://example.com/fullbody_image.png")
        self.workout2 = Workout.objects.create(name="Legs Day", description="Legs workout", media="https://example.com/legsday_image.png")

        # Relacionar los entrenamientos con el usuario
        UserWorkout.objects.create(user=self.user, workout=self.workout1)
        UserWorkout.objects.create(user=self.user, workout=self.workout2)

        # URL del endpoint
        self.url = reverse('get-workouts-by-user')

    def test_get_workouts_by_user_success(self):
        """
        Verifica que se obtengan los entrenamientos del usuario correctamente.
        """
        response = self.client.get(self.url, {'userId': self.user.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertEqual(len(response.data['data']), 2)
        self.assertEqual(response.data['data'][0]['name'], "Full Body")
        self.assertEqual(response.data['data'][1]['name'], "Legs Day")

    def test_get_workouts_by_user_not_found(self):
        """
        Verifica que se devuelva un error si el usuario no tiene entrenamientos asociados.
        """
        response = self.client.get(self.url, {'userId': 999})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)

class CreateWorkoutTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear ejercicios de prueba
        self.exercise1 = Exercise.objects.create(
            name="Squats",
            muscle_groups="Legs,Glutes",
            description="An exercise targeting the lower body.",
            instructions="Stand with your feet shoulder-width apart and squat down.",
            media="https://example.com/squats_image.png"
        )

        self.exercise2 = Exercise.objects.create(
            name="Push-ups",
            muscle_groups="Chest,Triceps",
            description="A bodyweight exercise for upper body strength.",
            instructions="Start in a plank position and lower your body towards the floor.",
            media="https://example.com/pushups_image.png"
        )

        # URL del endpoint
        self.url = reverse('create-workout')

    def test_create_workout_success(self):
        """
        Verifica que el entrenamiento se cree correctamente.
        """
        data = {
            "name": "Full Body Workout",
            "description": "A complete full-body workout designed to improve strength and endurance.",
            "exercises": [
                {"name": "Squats", "series": 4, "reps": 10, "rest": 60},
                {"name": "Push-ups", "series": 3, "reps": 12, "rest": 45}
            ],
            "media": "https://example.com/fullbody_image.png"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertIn('data', response.data)
        self.assertEqual(response.data['data']['name'], "Full Body Workout")
        self.assertEqual(len(response.data['data']['exercises']), 2)

    def test_create_workout_missing_fields(self):
        """
        Verifica que se devuelva un error si faltan campos obligatorios.
        """
        data = {
            "name": "Full Body Workout",
            "description": "A complete full-body workout designed to improve strength and endurance."
            # Faltan los ejercicios
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

class UpdateWorkoutTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear un entrenamiento y ejercicios de prueba
        self.workout = Workout.objects.create(name="Full Body", description="Full body workout", media="https://example.com/fullbody_image.png")
        
        self.exercise1 = Exercise.objects.create(
            name="Squats",
            muscle_groups="Legs,Glutes",
            description="An exercise targeting the lower body.",
            instructions="Stand with your feet shoulder-width apart and squat down.",
            media="https://example.com/squats_image.png"
        )

        self.exercise2 = Exercise.objects.create(
            name="Push-ups",
            muscle_groups="Chest,Triceps",
            description="A bodyweight exercise for upper body strength.",
            instructions="Start in a plank position and lower your body towards the floor.",
            media="https://example.com/pushups_image.png"
        )

        WorkoutExercise.objects.create(workout=self.workout, exercise=self.exercise1, sets=3, reps=10, rest=60)

        # URL del endpoint
        self.url = reverse('update-workout', args=[self.workout.id])

    def test_update_workout_success(self):
        """
        Verifica que el entrenamiento se actualice correctamente.
        """
        data = {
            "name": "Updated Full Body Workout",
            "description": "Updated description for the full body workout.",
            "exercises": [
                {"name": "Squats", "series": 4, "reps": 10, "rest": 60},
                {"name": "Push-ups", "series": 3, "reps": 12, "rest": 45}
            ],
            "media": "https://example.com/updated_image.png"
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertIn('data', response.data)
        self.assertEqual(response.data['data']['name'], "Updated Full Body Workout")
        self.assertEqual(len(response.data['data']['exercises']), 2)

    def test_update_workout_not_found(self):
        """
        Verifica que se devuelva un error si el entrenamiento no existe.
        """
        data = {
            "name": "Nonexistent Workout",
            "description": "This workout does not exist.",
            "exercises": [
                {"name": "Squats", "series": 4, "reps": 10, "rest": 60}
            ]
        }
        response = self.client.put(reverse('update-workout', args=[999]), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)

class DeleteWorkoutTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear un entrenamiento de prueba
        self.workout = Workout.objects.create(name="Full Body", description="Full body workout", media="https://example.com/fullbody_image.png")

        # URL del endpoint
        self.url = reverse('delete-workout', args=[self.workout.id])

    def test_delete_workout_success(self):
        """
        Verifica que el entrenamiento se elimine correctamente.
        """
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

    def test_delete_workout_not_found(self):
        """
        Verifica que se devuelva un error si el entrenamiento no existe.
        """
        response = self.client.delete(reverse('delete-workout', args=[999]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)