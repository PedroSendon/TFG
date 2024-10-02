from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from api.models import WorkoutExercise, Exercise, Workout  # Import the Workout model

class CreateExerciseTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # URL del endpoint
        self.url = reverse('create-exercise')

    def test_create_exercise_success(self):
        """
        Verifica que el ejercicio se cree correctamente.
        """
        data = {
            "name": "Squats",
            "description": "An exercise targeting the lower body.",
            "muscleGroups": ["Legs", "Glutes"],
            "instructions": "Stand with your feet shoulder-width apart and squat down.",
            "media": "https://example.com/squats_image.png"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertIn('data', response.data)
        self.assertEqual(response.data['data']['name'], "Squats")
        self.assertEqual(response.data['data']['muscleGroups'], ["Legs", "Glutes"])
        self.assertEqual(response.data['data']['media'], "https://example.com/squats_image.png")

    def test_create_exercise_missing_fields(self):
        """
        Verifica que se devuelva un error si faltan campos obligatorios.
        """
        data = {
            "name": "Squats",
            "description": "An exercise targeting the lower body."
            # Falta 'muscleGroups' e 'instructions'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_create_exercise_invalid_muscle_groups(self):
        """
        Verifica que se devuelva un error si 'muscleGroups' no es una lista de cadenas de texto.
        """
        data = {
            "name": "Squats",
            "description": "An exercise targeting the lower body.",
            "muscleGroups": "Legs",  # Debe ser una lista, no una cadena de texto
            "instructions": "Stand with your feet shoulder-width apart and squat down."
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

class ExerciseEndpointsTestCase(APITestCase):

    def setUp(self):
        self.create_url = reverse('create-exercise')
        self.list_url = reverse('list-all-exercises')
        self.details_url = reverse('get-exercise-details')

    def test_create_exercise_success(self):
        data = {
            "name": "Squats",
            "description": "An exercise targeting the lower body.",
            "muscleGroups": ["Legs", "Glutes"],
            "instructions": "Stand with your feet shoulder-width apart and squat down.",
            "media": "https://example.com/squats_image.png"
        }
        response = self.client.post(self.create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_all_exercises(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_exercise_details_success(self):
        # First, create an exercise
        create_data = {
            "name": "Push Ups",
            "description": "A bodyweight exercise for upper body strength.",
            "muscleGroups": ["Chest", "Triceps"],
            "instructions": "Start in a plank position and lower your body towards the floor.",
            "media": "https://example.com/pushups_image.png"
        }
        self.client.post(self.create_url, create_data, format='json')

        # Now fetch the details
        response = self.client.get(self.details_url, {'id': 1})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_exercise_details_not_found(self):
        response = self.client.get(self.details_url, {'id': 999})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class GetExercisesByTrainingTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear un entrenamiento y ejercicios de prueba
        self.workout = Workout.objects.create(name="Full Body", description="Full body workout")
        
        self.exercise1 = Exercise.objects.create(
            name="Squats",
            muscle_groups="Legs,Glutes",
            description="An exercise targeting the lower body.",
            instructions="Stand with your feet shoulder-width apart and squat down.",
            media="https://example.com/squats_image.png"
        )

        self.exercise2 = Exercise.objects.create(
            name="Push Ups",
            muscle_groups="Chest,Triceps",
            description="A bodyweight exercise for upper body strength.",
            instructions="Start in a plank position and lower your body towards the floor.",
            media="https://example.com/pushups_image.png"
        )

        # Relacionar los ejercicios con el entrenamiento
        WorkoutExercise.objects.create(workout=self.workout, exercise=self.exercise1, sets=3, reps=12, rest=60)
        WorkoutExercise.objects.create(workout=self.workout, exercise=self.exercise2, sets=3, reps=10, rest=90)

        # URL del endpoint
        self.url = reverse('get-exercises-by-training')

    def test_get_exercises_by_training_success(self):
        """
        Verifica que se obtengan los ejercicios de un entrenamiento correctamente.
        """
        response = self.client.get(self.url, {'trainingId': self.workout.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertEqual(len(response.data['data']), 2)
        self.assertEqual(response.data['data'][0]['name'], "Squats")
        self.assertEqual(response.data['data'][1]['name'], "Push Ups")

    def test_get_exercises_by_training_not_found(self):
        """
        Verifica que se devuelva un error si el entrenamiento no tiene ejercicios asociados.
        """
        response = self.client.get(self.url, {'trainingId': 999})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)

