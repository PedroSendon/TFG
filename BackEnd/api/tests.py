# Create your tests here.
from django.test import TestCase
from .models.exercise import Exercise

class ExerciseTestCase(TestCase):

    def setUp(self):
        Exercise.objects.create(name="Push Ups", description="Upper body exercise", muscleGroups="Chest,Triceps")

    def test_exercise_creation(self):
        exercise = Exercise.objects.get(name="Push Ups")
        self.assertEqual(exercise.name, "Push Ups")
