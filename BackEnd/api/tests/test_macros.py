from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from BackEnd.api.models.macros import MacrosRecommendation
from api.models import User, MealPlan

class GetUserMacronutrientsTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear usuario de prueba
        self.user = User.objects.create_user(first_name="Pedro", last_name="Sendon", email="pedro@example.com", password="TestPassword123!")

        # Crear un plan de comidas para el usuario
        MealPlan.objects.create(user=self.user, diet_type="weightLoss", meal_name="Desayuno", calories=500, proteins=20, carbs=60, fats=15)
        MealPlan.objects.create(user=self.user, diet_type="weightLoss", meal_name="Almuerzo", calories=1000, proteins=40, carbs=120, fats=30)
        MealPlan.objects.create(user=self.user, diet_type="weightLoss", meal_name="Cena", calories=800, proteins=30, carbs=90, fats=25)

        # URL del endpoint
        self.url = reverse('get-macronutrients')

        # Autenticar al usuario
        self.client.force_authenticate(user=self.user)

    def test_get_user_macronutrients_success(self):
        """
        Verifica que los datos de macronutrientes del usuario se obtengan correctamente.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar que los datos de macronutrientes sean correctos
        self.assertEqual(response.data['totalKcal'], 2300)  # 500 + 1000 + 800
        self.assertEqual(response.data['macros']['carbs']['grams'], 270)  # 60 + 120 + 90
        self.assertEqual(response.data['macros']['protein']['grams'], 90)  # 20 + 40 + 30
        self.assertEqual(response.data['macros']['fat']['grams'], 70)  # 15 + 30 + 25

    def test_get_user_macronutrients_not_found(self):
        """
        Verifica que se devuelva un error si el usuario no tiene un plan de comidas.
        """
        # Crear un usuario sin plan de comidas
        new_user = User.objects.create_user(first_name="Maria", last_name="Garcia", email="maria@example.com", password="TestPassword123!")
        self.client.force_authenticate(user=new_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)

class AddMacronutrientRecommendationTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # URL del endpoint
        self.url = reverse('add-macronutrient-recommendation')

    def test_add_macronutrient_recommendation_success(self):
        """
        Verifica que la recomendación de macronutrientes se añada correctamente.
        """
        data = {
            "kcal": 2500,
            "proteins": 150,
            "carbs": 300,
            "fats": 70,
            "dietType": "muscleGain",
            "description": "Dieta ajustada para ganancia muscular"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertIn('data', response.data)
        self.assertEqual(response.data['data']['kcal'], 2500)
        self.assertEqual(response.data['data']['proteins'], 150)
        self.assertEqual(response.data['data']['carbs'], 300)
        self.assertEqual(response.data['data']['fats'], 70)
        self.assertEqual(response.data['data']['dietType'], "muscleGain")
        self.assertEqual(response.data['data']['description'], "Dieta ajustada para ganancia muscular")

    def test_add_macronutrient_recommendation_missing_fields(self):
        """
        Verifica que se devuelva un error si faltan campos obligatorios.
        """
        data = {
            "kcal": 2500,
            "proteins": 150,
            # Falta 'carbs', 'fats', y 'dietType'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_add_macronutrient_recommendation_invalid_category(self):
        """
        Verifica que se devuelva un error si el tipo de dieta es inválido.
        """
        data = {
            "kcal": 2500,
            "proteins": 150,
            "carbs": 300,
            "fats": 70,
            "dietType": "invalidCategory",  # Categoría inválida
            "description": "Dieta ajustada para ganancia muscular"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

class UpdateMacronutrientRecommendationTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear una recomendación de macronutrientes de prueba
        self.recommendation = MacrosRecommendation.objects.create(
            diet_type='weightLoss',
            kcal=1600,
            proteins=110,
            carbs=130,
            fats=55
        )

        # URL del endpoint
        self.url = reverse('update-macronutrient-recommendation', args=['weightLoss', self.recommendation.id])

    def test_update_macronutrient_recommendation_success(self):
        """
        Verifica que la recomendación de macronutrientes se actualice correctamente.
        """
        data = {
            "kcal": 1700,
            "proteins": 115,
            "carbs": 135,
            "fats": 60
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

        # Verificar que los datos de la recomendación se actualizaron
        self.recommendation.refresh_from_db()
        self.assertEqual(self.recommendation.kcal, 1700)
        self.assertEqual(self.recommendation.proteins, 115)
        self.assertEqual(self.recommendation.carbs, 135)
        self.assertEqual(self.recommendation.fats, 60)

    def test_update_macronutrient_recommendation_not_found(self):
        """
        Verifica que se devuelva un error si la recomendación no existe.
        """
        invalid_url = reverse('update-macronutrient-recommendation', args=['weightLoss', 9999])
        data = {
            "kcal": 1700,
            "proteins": 115,
            "carbs": 135,
            "fats": 60
        }
        response = self.client.put(invalid_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)

    def test_update_macronutrient_recommendation_missing_fields(self):
        """
        Verifica que se devuelva un error si faltan campos obligatorios.
        """
        data = {
            "kcal": 1700,
            "proteins": 115
            # Faltan 'carbs' y 'fats'
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

class DeleteMacronutrientRecommendationTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear una recomendación de macronutrientes de prueba
        self.recommendation = MacrosRecommendation.objects.create(
            diet_type='weightLoss',
            kcal=1600,
            proteins=110,
            carbs=130,
            fats=55
        )

        # URL del endpoint
        self.url = reverse('delete-macronutrient-recommendation', args=['weightLoss', self.recommendation.id])

    def test_delete_macronutrient_recommendation_success(self):
        """
        Verifica que la recomendación de macronutrientes se elimine correctamente.
        """
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

        # Verificar que la recomendación se haya eliminado
        self.assertFalse(MacrosRecommendation.objects.filter(id=self.recommendation.id).exists())

    def test_delete_macronutrient_recommendation_not_found(self):
        """
        Verifica que se devuelva un error si la recomendación no existe.
        """
        invalid_url = reverse('delete-macronutrient-recommendation', args=['weightLoss', 9999])
        response = self.client.delete(invalid_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)

class GetMacronutrientRecommendationTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear una recomendación de macronutrientes de prueba
        self.recommendation = MacrosRecommendation.objects.create(
            diet_type='weightLoss',
            kcal=2500,
            proteins=150,
            carbs=300,
            fats=70
        )

        # URL del endpoint
        self.url = reverse('get-macronutrient-recommendation', args=['weightLoss', self.recommendation.id])

    def test_get_macronutrient_recommendation_success(self):
        """
        Verifica que la recomendación de macronutrientes se obtenga correctamente.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.recommendation.id)
        self.assertEqual(response.data['kcal'], 2500)
        self.assertEqual(response.data['proteins'], 150)
        self.assertEqual(response.data['carbs'], 300)
        self.assertEqual(response.data['fats'], 70)

    def test_get_macronutrient_recommendation_not_found(self):
        """
        Verifica que se devuelva un error si la recomendación no existe.
        """
        invalid_url = reverse('get-macronutrient-recommendation', args=['weightLoss', 9999])
        response = self.client.get(invalid_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)


class GetMacronutrientByIdTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear una recomendación de macronutrientes de prueba
        self.recommendation = MacrosRecommendation.objects.create(
            diet_type='muscleGain',
            kcal=2500,
            proteins=160,
            carbs=320,
            fats=75,
            description="Dieta ajustada para mayor ganancia muscular"
        )

        # URL del endpoint
        self.url = reverse('get-macronutrient-by-id')

    def test_get_macronutrient_by_id_success(self):
        """
        Verifica que se obtengan los detalles de la recomendación de macronutrientes por ID.
        """
        response = self.client.get(self.url, {'id': self.recommendation.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.recommendation.id)
        self.assertEqual(response.data['kcal'], 2500)
        self.assertEqual(response.data['proteins'], 160)
        self.assertEqual(response.data['carbs'], 320)
        self.assertEqual(response.data['fats'], 75)
        self.assertEqual(response.data['dietType'], "muscleGain")
        self.assertEqual(response.data['description'], "Dieta ajustada para mayor ganancia muscular")

    def test_get_macronutrient_by_id_not_found(self):
        """
        Verifica que se devuelva un error si la recomendación no existe.
        """
        response = self.client.get(self.url, {'id': 9999})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)

    def test_get_macronutrient_by_id_invalid_id(self):
        """
        Verifica que se devuelva un error si el parámetro 'id' no es un número.
        """
        response = self.client.get(self.url, {'id': 'invalid'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

