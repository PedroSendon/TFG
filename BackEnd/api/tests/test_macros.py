from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from api.models.macros import MealPlan, UserNutritionPlan
from api.models.user import User


class GetUserMealPlanTests(APITestCase):

    def setUp(self):
        # Crear un usuario y un plan de comidas
        self.user = User.objects.create_user(
            email='user@example.com',
            password='password123',
            role='cliente'
        )

        self.meal_plan = MealPlan.objects.create(
            name="Plan de Ejemplo",
            diet_type="maintenance",
            calories=2000,
            proteins=150,
            carbs=250,
            fats=70,
            meal_distribution={"desayuno": 25, "almuerzo": 35, "cena": 40},
            description="Plan de mantenimiento básico"
        )

        # Asignar el plan de comidas al usuario
        self.user_nutrition_plan = UserNutritionPlan.objects.create(
            user=self.user,
            plan=self.meal_plan
        )

    def test_get_user_mealplan_success(self):
        """
        Test para obtener los datos de macronutrientes de un usuario con plan asignado.
        """
        self.client.force_authenticate(user=self.user)
        url = reverse('get_user_mealplan')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["totalKcal"], self.meal_plan.calories)
        self.assertEqual(response.data["macros"]["carbs"]["grams"], float(self.meal_plan.carbs))
        self.assertEqual(response.data["meal_distribution"]["desayuno"], 25)

    def test_get_user_mealplan_not_found(self):
        """
        Test para verificar que se retorne un error 404 si el usuario no tiene un plan de comidas asignado.
        """
        # Crear un usuario sin plan de comidas asignado
        user_without_plan = User.objects.create_user(
            email='noplan@example.com',
            password='password123',
            role='cliente'
        )
        self.client.force_authenticate(user=user_without_plan)
        url = reverse('get_user_mealplan')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("No se encontraron datos de macronutrientes para el usuario.", response.data["error"])

    def test_get_user_mealplan_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación da un error 401.
        """
        url = reverse('get_user_mealplan')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])
