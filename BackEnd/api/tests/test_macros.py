from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse
from api.models.user import User
from api.models.macros import MealPlan, UserNutritionPlan

class GetAllMealPlansTests(APITestCase):

    def setUp(self):
        # Crear un usuario autenticado
        self.user = User.objects.create(
            email='user@example.com',
            password='password123',
            role='cliente',  # Puede ser cualquier rol con acceso permitido
            birth_date='1995-09-15'
        )

        # Crear algunos planes de comida en la base de datos
        self.meal_plan1 = MealPlan.objects.create(
            name="Plan de pérdida de peso",
            diet_type="weightLoss",
            calories=1500,
            proteins=100,
            carbs=150,
            fats=50,
            meal_distribution={'desayuno': 20, 'almuerzo': 40, 'cena': 25, 'merienda': 15},
            description="Plan diseñado para la pérdida de peso"
        )

        self.meal_plan2 = MealPlan.objects.create(
            name="Plan de ganancia muscular",
            diet_type="muscleGain",
            calories=2500,
            proteins=200,
            carbs=300,
            fats=100,
            meal_distribution={'desayuno': 25, 'almuerzo': 35, 'cena': 30, 'merienda': 10},
            description="Plan diseñado para la ganancia muscular"
        )

    def test_get_all_mealplans_success(self):
        """
        Test para listar todos los planes de comida con éxito.
        """
        # Autenticar al usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET al endpoint
        url = reverse('get-all-mealplans')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que la respuesta contiene los datos de los planes de comida
        meal_plans_data = response.data["data"]
        self.assertEqual(len(meal_plans_data), 2)  # Debe haber dos planes de comida

        # Verificar que el primer plan tiene los datos correctos
        self.assertEqual(meal_plans_data[0]["id"], self.meal_plan1.id)
        self.assertEqual(meal_plans_data[0]["name"], "Plan de pérdida de peso")
        self.assertEqual(meal_plans_data[0]["dietType"], "weightLoss")

    def test_get_all_mealplans_not_found(self):
        """
        Test para verificar el error cuando no se encuentran planes de comida.
        """
        # Borrar todos los planes de comida creados en setUp
        MealPlan.objects.all().delete()

        # Autenticar al usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET al endpoint
        url = reverse('get-all-mealplans')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 404 NOT FOUND
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "No se encontraron planes de comida.")

    def test_get_all_mealplans_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación está prohibido.
        """
        # Realizar la solicitud GET sin autenticación
        url = reverse('get-all-mealplans')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])


class GetMealPlanTests(APITestCase):

    def setUp(self):
        # Crear un usuario autenticado
        self.user = User.objects.create(
            email='user@example.com',
            password='password123',
            role='cliente',
            birth_date='1995-09-15'
        )

        # Crear un plan de comidas en la base de datos
        self.meal_plan = MealPlan.objects.create(
            name="Plan de mantenimiento",
            diet_type="maintenance",
            calories=2000,
            proteins=150,
            carbs=250,
            fats=70,
            meal_distribution={'desayuno': 25, 'almuerzo': 35, 'cena': 25, 'merienda': 15},
            description="Plan de mantenimiento calórico"
        )

        # Asignar el plan de comidas al usuario
        UserNutritionPlan.objects.create(user=self.user, plan=self.meal_plan)


    def test_get_mealplan_success(self):
        """
        Test para obtener los detalles de un plan de comidas con éxito.
        """
        # Autenticar al usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET al endpoint
        url = reverse('get-mealplan', args=['maintenance', self.meal_plan.id])
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que la respuesta contiene los detalles correctos del plan de comidas
        mealplan_data = response.data
        self.assertEqual(mealplan_data["id"], self.meal_plan.id)
        self.assertEqual(mealplan_data["name"], "Plan de mantenimiento")
        self.assertEqual(mealplan_data["dietType"], "maintenance")
        self.assertEqual(mealplan_data["kcal"], self.meal_plan.calories)
        self.assertEqual(mealplan_data["proteins"], float(self.meal_plan.proteins))
        self.assertEqual(mealplan_data["carbs"], float(self.meal_plan.carbs))
        self.assertEqual(mealplan_data["fats"], float(self.meal_plan.fats))
        self.assertEqual(mealplan_data["meal_distribution"], self.meal_plan.meal_distribution)

    def test_get_mealplan_invalid_category(self):
        """
        Test para verificar el error cuando se proporciona una categoría inválida.
        """
        # Autenticar al usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET con una categoría inválida
        url = reverse('get-mealplan', args=['invalidCategory', self.meal_plan.id])
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 400 BAD REQUEST
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Categoría inválida. Debe ser weightLoss, muscleGain o maintenance.")

    def test_get_mealplan_not_found(self):
        """
        Test para verificar el error cuando el plan de comidas no se encuentra.
        """
        # Autenticar al usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET para un ID de plan de comidas inexistente
        url = reverse('get-mealplan', args=['maintenance', 999])
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 404 NOT FOUND
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Plan de comidas no encontrado")

    def test_get_mealplan_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación está prohibido.
        """
        # Realizar la solicitud GET sin autenticación
        url = reverse('get-mealplan', args=['maintenance', self.meal_plan.id])
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])

class GetMealPlanByIdTests(APITestCase):

    def setUp(self):
        # Crear un usuario autenticado
        self.user = User.objects.create(
            email='user@example.com',
            password='password123',
            role='cliente',
            birth_date='1995-09-15'
        )

        # Crear un plan de comidas en la base de datos
        self.meal_plan = MealPlan.objects.create(
            name="Plan de mantenimiento",
            diet_type="maintenance",
            calories=2000,
            proteins=150,
            carbs=250,
            fats=70,
            meal_distribution={'desayuno': 25, 'almuerzo': 35, 'cena': 25, 'merienda': 15},
            description="Plan de mantenimiento calórico"
        )

    def test_get_mealplan_by_id_success(self):
        """
        Test para obtener los detalles de un plan de comidas con éxito por ID.
        """
        # Autenticar al usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET al endpoint
        url = reverse('get-mealplan', args=[self.meal_plan.id])
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que la respuesta contiene los detalles correctos del plan de comidas
        mealplan_data = response.data
        self.assertEqual(mealplan_data["id"], self.meal_plan.id)
        self.assertEqual(mealplan_data["name"], "Plan de mantenimiento")
        self.assertEqual(mealplan_data["dietType"], "maintenance")
        self.assertEqual(mealplan_data["kcal"], self.meal_plan.calories)
        self.assertEqual(mealplan_data["proteins"], float(self.meal_plan.proteins))
        self.assertEqual(mealplan_data["carbs"], float(self.meal_plan.carbs))
        self.assertEqual(mealplan_data["fats"], float(self.meal_plan.fats))
        self.assertEqual(mealplan_data["meal_distribution"], self.meal_plan.meal_distribution)
        self.assertEqual(mealplan_data["description"], self.meal_plan.description)

    def test_get_mealplan_by_id_not_found(self):
        """
        Test para verificar el error cuando el plan de comidas no se encuentra.
        """
        # Autenticar al usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET para un ID de plan de comidas inexistente
        url = reverse('get-mealplan', args=[999])
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 404 NOT FOUND
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Plan de comidas no encontrado.")

    def test_get_mealplan_by_id_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación está prohibido.
        """
        # Realizar la solicitud GET sin autenticación
        url = reverse('get-mealplan', args=[self.meal_plan.id])
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])

class UpdateMealPlanTests(APITestCase):

    def setUp(self):
        # Crear usuarios con diferentes roles
        self.nutritionist_user = User.objects.create(
            email='nutritionist@example.com',
            password='password123',
            role='nutricionista',
            birth_date='1990-01-01'
        )
        
        self.regular_user = User.objects.create(
            email='user@example.com',
            password='password123',
            role='cliente',
            birth_date='1995-09-15'
        )

        # Crear un plan de comidas en la base de datos
        self.meal_plan = MealPlan.objects.create(
            name="Plan de mantenimiento",
            diet_type="maintenance",
            calories=2000,
            proteins=150,
            carbs=250,
            fats=70,
            meal_distribution={'desayuno': 25, 'almuerzo': 35, 'cena': 25, 'merienda': 15},
            description="Plan de mantenimiento calórico"
        )

    def test_update_mealplan_success(self):
        """
        Test para actualizar un plan de comidas con éxito.
        """
        # Autenticar como nutricionista
        self.client.force_authenticate(user=self.nutritionist_user)

        # Datos de actualización
        data = {
            "name": "Plan de mantenimiento actualizado",
            "kcal": 2200,
            "proteins": 160,
            "carbs": 270,
            "fats": 80,
            "mealDistribution": {'desayuno': 30, 'almuerzo': 35, 'cena': 20, 'merienda': 15},
            "description": "Plan de mantenimiento actualizado"
        }

        # Realizar la solicitud PUT al endpoint
        url = reverse('update-mealplan', args=['maintenance', self.meal_plan.id])
        response = self.client.put(url, data, format='json')

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Plan de comidas actualizado correctamente")

        # Verificar que los valores se actualizaron en la base de datos
        self.meal_plan.refresh_from_db()
        self.assertEqual(self.meal_plan.calories, 2200)
        self.assertEqual(self.meal_plan.proteins, 160)
        self.assertEqual(self.meal_plan.carbs, 270)
        self.assertEqual(self.meal_plan.fats, 80)
        self.assertEqual(self.meal_plan.meal_distribution, {'desayuno': 30, 'almuerzo': 35, 'cena': 20, 'merienda': 15})

    def test_update_mealplan_permission_denied(self):
        """
        Test para verificar el error de permisos insuficientes.
        """
        # Autenticar como usuario regular
        self.client.force_authenticate(user=self.regular_user)

        # Datos de actualización
        data = {
            "name": "Plan sin permisos",
            "kcal": 2000,
            "proteins": 150,
            "carbs": 250,
            "fats": 70,
            "mealDistribution": {'desayuno': 25, 'almuerzo': 35, 'cena': 25, 'merienda': 15}
        }

        # Realizar la solicitud PUT al endpoint
        url = reverse('update-mealplan', args=['maintenance', self.meal_plan.id])
        response = self.client.put(url, data, format='json')

        # Verificar que el estado de la respuesta es 403 FORBIDDEN
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("No tienes permisos para realizar esta acción", response.data["error"])


    def test_update_mealplan_missing_fields(self):
        """
        Test para verificar el error cuando faltan campos obligatorios.
        """
        # Autenticar como nutricionista
        self.client.force_authenticate(user=self.nutritionist_user)

        # Datos de actualización incompletos (falta "fats")
        data = {
            "kcal": 2200,
            "proteins": 160,
            "carbs": 270,
            "mealDistribution": {'desayuno': 30, 'almuerzo': 35, 'cena': 20, 'merienda': 15}
        }

        # Realizar la solicitud PUT al endpoint
        url = reverse('update-mealplan', args=['maintenance', self.meal_plan.id])
        response = self.client.put(url, data, format='json')

        # Verificar que el estado de la respuesta es 400 BAD REQUEST
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Faltan los campos obligatorios: fats", response.data["error"])

    def test_update_mealplan_not_found(self):
        """
        Test para verificar el error cuando el plan de comidas no se encuentra.
        """
        # Autenticar como nutricionista
        self.client.force_authenticate(user=self.nutritionist_user)

        # Datos de actualización
        data = {
            "kcal": 2200,
            "proteins": 160,
            "carbs": 270,
            "fats": 80,
            "mealDistribution": {'desayuno': 30, 'almuerzo': 35, 'cena': 20, 'merienda': 15},
            "description": "Plan de mantenimiento no encontrado"
        }

        # Realizar la solicitud PUT para un ID de plan inexistente
        url = reverse('update-mealplan', args=['maintenance', 999])
        response = self.client.put(url, data, format='json')

        # Verificar que el estado de la respuesta es 404 NOT FOUND
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "El plan de comidas no existe o el tipo de dieta no coincide.")

    def test_update_mealplan_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación está prohibido.
        """
        # Datos de actualización
        data = {
            "kcal": 2200,
            "proteins": 160,
            "carbs": 270,
            "fats": 80,
            "mealDistribution": {'desayuno': 30, 'almuerzo': 35, 'cena': 20, 'merienda': 15},
            "description": "Plan de mantenimiento sin autenticación"
        }

        # Realizar la solicitud PUT sin autenticación
        url = reverse('update-mealplan', args=['maintenance', self.meal_plan.id])
        response = self.client.put(url, data, format='json')

        # Verificar que el estado de la respuesta es 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])

class DeleteMealPlanTests(APITestCase):

    def setUp(self):
        # Crear usuarios con diferentes roles
        self.nutritionist_user = User.objects.create(
            email='nutritionist@example.com',
            password='password123',
            role='nutricionista',
            birth_date='1990-01-01'
        )
        
        self.regular_user = User.objects.create(
            email='user@example.com',
            password='password123',
            role='cliente',
            birth_date='1995-09-15'
        )

        # Crear un plan de comidas en la base de datos
        self.meal_plan = MealPlan.objects.create(
            name="Plan de mantenimiento",
            diet_type="maintenance",
            calories=2000,
            proteins=150,
            carbs=250,
            fats=70,
            meal_distribution={'desayuno': 25, 'almuerzo': 35, 'cena': 25, 'merienda': 15},
            description="Plan de mantenimiento calórico"
        )
        UserNutritionPlan.objects.create(user=self.nutritionist_user, plan=self.meal_plan)


    def test_delete_mealplan_success(self):
        """
        Test para eliminar un plan de comidas con éxito.
        """
        # Autenticar como nutricionista
        self.client.force_authenticate(user=self.nutritionist_user)

        # Realizar la solicitud DELETE al endpoint
        url = reverse('delete-mealplan', args=['maintenance', self.meal_plan.id])
        response = self.client.delete(url)

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Plan de comidas eliminado correctamente")

        # Verificar que el plan de comidas ha sido eliminado de la base de datos
        self.assertFalse(MealPlan.objects.filter(id=self.meal_plan.id).exists())

    def test_delete_mealplan_permission_denied(self):
        """
        Test para verificar el error de permisos insuficientes.
        """
        # Autenticar como usuario regular
        self.client.force_authenticate(user=self.regular_user)

        # Realizar la solicitud DELETE al endpoint
        url = reverse('delete-mealplan', args=['maintenance', self.meal_plan.id])
        response = self.client.delete(url)

        # Verificar que el estado de la respuesta es 403 FORBIDDEN
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["error"], "No tienes permisos para eliminar planes de nutrición.")

    def test_delete_mealplan_invalid_category(self):
        """
        Test para verificar el error cuando se proporciona una categoría inválida.
        """
        # Autenticar como nutricionista
        self.client.force_authenticate(user=self.nutritionist_user)

        # Realizar la solicitud DELETE con una categoría inválida
        url = reverse('delete-mealplan', args=['invalidCategory', self.meal_plan.id])
        response = self.client.delete(url)

        # Verificar que el estado de la respuesta es 400 BAD REQUEST
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Categoría inválida. Debe ser weightLoss, muscleGain o maintenance.")

    def test_delete_mealplan_not_found(self):
        """
        Test para verificar el error cuando el plan de comidas no se encuentra.
        """
        # Autenticar como nutricionista
        self.client.force_authenticate(user=self.nutritionist_user)

        # Realizar la solicitud DELETE al endpoint con un ID inexistente
        url = reverse('delete-mealplan', args=['maintenance', 999])  # ID inexistente
        response = self.client.delete(url)

        # Verificar que el estado de la respuesta es 404 NOT FOUND
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "El plan de comidas no existe.")


    def test_delete_mealplan_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación está prohibido.
        """
        # Realizar la solicitud DELETE sin autenticación
        url = reverse('delete-mealplan', args=['maintenance', self.meal_plan.id])
        response = self.client.delete(url)

        # Verificar que el estado de la respuesta es 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])

class GetUserMealPlanTests(APITestCase):

    def setUp(self):
        # Crear un usuario autenticado y otro sin permisos
        self.user = User.objects.create(
            email='user@example.com',
            password='password123',
            role='cliente',
            birth_date='1995-09-15'
        )

        self.other_user = User.objects.create(
            email='other@example.com',
            password='password123',
            role='cliente',
            birth_date='1993-03-10'
        )

        # Crear un plan de comidas en la base de datos
        self.meal_plan = MealPlan.objects.create(
            name="Plan de mantenimiento",
            diet_type="maintenance",
            calories=2000,
            proteins=150,
            carbs=250,
            fats=70,
            meal_distribution={'desayuno': 25, 'almuerzo': 35, 'cena': 25, 'merienda': 15},
            description="Plan de mantenimiento calórico"
        )

        # Asociar el plan de comidas con el usuario
        UserNutritionPlan.objects.create(user=self.user, plan=self.meal_plan)

    def test_get_user_mealplan_success(self):
        """
        Test para obtener los datos de macronutrientes del usuario con éxito.
        """
        # Autenticar como usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET al endpoint
        url = reverse('get-mealplans')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que los datos de macronutrientes están presentes en la respuesta
        macros_data = response.data
        self.assertEqual(macros_data["totalKcal"], 2000)
        self.assertEqual(macros_data["name"], "Plan de mantenimiento")
        self.assertEqual(macros_data["macros"]["carbs"]["grams"], 250)
        self.assertEqual(macros_data["macros"]["protein"]["grams"], 150)
        self.assertEqual(macros_data["macros"]["fat"]["grams"], 70)
        self.assertEqual(macros_data["meal_distribution"], {'desayuno': 25, 'almuerzo': 35, 'cena': 25, 'merienda': 15})

    def test_get_user_mealplan_not_found(self):
        """
        Test para verificar el error cuando el usuario no tiene un plan de nutrición.
        """
        # Autenticar como otro usuario sin plan de nutrición
        self.client.force_authenticate(user=self.other_user)

        # Realizar la solicitud GET al endpoint
        url = reverse('get-mealplans')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 404 NOT FOUND
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "No se encontraron datos de macronutrientes para el usuario.")

    def test_get_user_mealplan_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación está prohibido.
        """
        # Realizar la solicitud GET sin autenticación
        url = reverse('get-mealplans')
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])

class GetMealPlansByCategoryTests(APITestCase):

    def setUp(self):
        # Crear un usuario autenticado
        self.user = User.objects.create(
            email='user@example.com',
            password='password123',
            role='cliente',
            birth_date='1995-09-15'
        )

        # Crear planes de comidas en diferentes categorías en la base de datos
        self.meal_plan1 = MealPlan.objects.create(
            name="Plan de pérdida de peso",
            diet_type="weightLoss",
            calories=1500,
            proteins=120,
            carbs=100,
            fats=50,
            meal_distribution={'desayuno': 25, 'almuerzo': 35, 'cena': 30, 'merienda': 10},
            description="Plan diseñado para perder peso"
        )

        self.meal_plan2 = MealPlan.objects.create(
            name="Plan de ganancia muscular",
            diet_type="muscleGain",
            calories=2500,
            proteins=200,
            carbs=300,
            fats=80,
            meal_distribution={'desayuno': 20, 'almuerzo': 40, 'cena': 30, 'merienda': 10},
            description="Plan diseñado para ganar masa muscular"
        )

    def test_get_mealplans_by_category_success(self):
        """
        Test para obtener todos los planes de comidas por categoría con éxito.
        """
        # Autenticar como usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET al endpoint con la categoría 'weightLoss'
        url = reverse('get-mealplans-by-category', args=['weightLoss'])
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que los datos del plan de comidas están en la respuesta
        meal_plans = response.data
        self.assertEqual(len(meal_plans), 1)
        self.assertEqual(meal_plans[0]["name"], "Plan de pérdida de peso")
        self.assertEqual(meal_plans[0]["kcal"], 1500)
        self.assertEqual(meal_plans[0]["proteins"], 120)
        self.assertEqual(meal_plans[0]["carbs"], 100)
        self.assertEqual(meal_plans[0]["fats"], 50)

    def test_get_mealplans_by_category_invalid_category(self):
        """
        Test para verificar el error cuando se proporciona una categoría que no está contemplada.
        """
        # Autenticar como usuario
        self.client.force_authenticate(user=self.user)

        # Construir la URL manualmente con una categoría inválida
        url = '/api/mealplans/invalidCategory/'
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 400 BAD REQUEST
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Categoría inválida. Debe ser weightLoss, muscleGain o maintenance.")





    def test_get_mealplans_by_category_not_found(self):
        """
        Test para verificar el caso cuando no hay planes de comidas en la categoría solicitada.
        """
        # Autenticar como usuario
        self.client.force_authenticate(user=self.user)

        # Realizar la solicitud GET al endpoint con la categoría 'maintenance' (sin planes asociados)
        url = reverse('get-mealplans-by-category', args=['maintenance'])
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 404 NOT FOUND
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "No se encontraron planes de comidas")

    def test_get_mealplans_by_category_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación está prohibido.
        """
        # Realizar la solicitud GET sin autenticación
        url = reverse('get-mealplans-by-category', args=['weightLoss'])
        response = self.client.get(url)

        # Verificar que el estado de la respuesta es 401 UNAUTHORIZED
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])
