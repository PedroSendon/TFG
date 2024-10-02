from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from api.models import User, Exercise, Workout, ExerciseLog
from datetime import datetime

class GetExercisePopularityTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear un usuario y un ejercicio de prueba
        self.user = User.objects.create_user(first_name="John", last_name="Doe", email="john@example.com", password="TestPassword123!")
        self.workout = Workout.objects.create(name="Full Body", description="Full body workout")
        
        self.exercise1 = Exercise.objects.create(name="Squats", muscle_groups="Legs", description="Squats description", instructions="Do squats", media="")
        self.exercise2 = Exercise.objects.create(name="Push-ups", muscle_groups="Chest", description="Push-ups description", instructions="Do push-ups", media="")

        # Crear logs de ejercicios para simular popularidad
        ExerciseLog.objects.create(user=self.user, workout=self.workout, exercise=self.exercise1, sets_completed=3, reps_completed=12, rest_time=60, date=datetime.now())
        ExerciseLog.objects.create(user=self.user, workout=self.workout, exercise=self.exercise1, sets_completed=2, reps_completed=15, rest_time=60, date=datetime.now())
        ExerciseLog.objects.create(user=self.user, workout=self.workout, exercise=self.exercise2, sets_completed=4, reps_completed=10, rest_time=60, date=datetime.now())

        # URL del endpoint
        self.url = reverse('get-exercise-popularity')

    def test_get_exercise_popularity_success(self):
        """
        Verifica que se obtenga la popularidad de los ejercicios correctamente.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertEqual(len(response.data['data']), 2)
        self.assertEqual(response.data['data'][0]['exercise'], "Squats")
        self.assertEqual(response.data['data'][0]['timesRepeated'], 5)  # 3 + 2 sets completados

    def test_get_exercise_popularity_for_specific_year(self):
        """
        Verifica que la popularidad de los ejercicios se filtre correctamente por año.
        """
        response = self.client.get(self.url, {'year': datetime.now().year})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)

    def test_get_exercise_popularity_invalid_year(self):
        """
        Verifica que se devuelva un error si el parámetro 'year' es inválido.
        """
        response = self.client.get(self.url, {'year': 'invalid'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)


class GetPlatformGrowthTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear usuarios de prueba
        self.user1 = User.objects.create_user(first_name="John", last_name="Doe", email="john1@example.com", password="TestPassword123!", date_joined=datetime(2024, 1, 15))
        self.user2 = User.objects.create_user(first_name="Jane", last_name="Smith", email="jane@example.com", password="TestPassword123!", date_joined=datetime(2024, 2, 10))
        self.user3 = User.objects.create_user(first_name="Alice", last_name="Johnson", email="alice@example.com", password="TestPassword123!", date_joined=datetime(2024, 2, 20))

        # URL del endpoint
        self.url = reverse('get-platform-growth')

    def test_get_platform_growth_success(self):
        """
        Verifica que se obtenga el crecimiento de la plataforma correctamente por mes.
        """
        response = self.client.get(self.url, {'year': '2024'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertEqual(len(response.data['data']), 2)
        self.assertEqual(response.data['data'][0]['month'], "Jan")
        self.assertEqual(response.data['data'][0]['newUsers'], 1)
        self.assertEqual(response.data['data'][1]['month'], "Feb")
        self.assertEqual(response.data['data'][1]['newUsers'], 2)

    def test_get_platform_growth_invalid_year(self):
        """
        Verifica que se devuelva un error si el parámetro 'year' es inválido.
        """
        response = self.client.get(self.url, {'year': 'invalid'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_get_platform_growth_default_year(self):
        """
        Verifica que se obtenga el crecimiento de la plataforma para el año actual si no se proporciona un año.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)


