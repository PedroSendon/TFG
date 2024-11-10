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


class GetAllMealPlansTests(APITestCase):

    def setUp(self):
        # Crear un usuario
        self.user = User.objects.create_user(
            email='user@example.com',
            password='password123',
            role='cliente'
        )

    def test_get_all_mealplans_success(self):
        """
        Test para obtener todos los planes de comida cuando existen planes.
        """
        # Crear planes de comida
        MealPlan.objects.create(name="Plan A", diet_type="maintenance", calories=2000, proteins=100, carbs=200, fats=70)
        MealPlan.objects.create(name="Plan B", diet_type="weightLoss", calories=1500, proteins=90, carbs=150, fats=50)

        self.client.force_authenticate(user=self.user)
        url = reverse('get_all_mealplans')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue("data" in response.data)
        self.assertEqual(len(response.data["data"]), 2)  # Asegura que se devuelvan dos planes

    def test_get_all_mealplans_not_found(self):
        """
        Test para verificar que se retorne un error 404 si no existen planes de comida.
        """
        self.client.force_authenticate(user=self.user)
        url = reverse('get_all_mealplans')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("No se encontraron planes de comida.", response.data["error"])

    def test_get_all_mealplans_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación da un error 401.
        """
        url = reverse('get_all_mealplans')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])

class GetMacronutrientByIdTests(APITestCase):

    def setUp(self):
        # Crear un usuario y autenticarlo para las pruebas
        self.user = User.objects.create_user(
            email='user@example.com',
            password='password123',
            role='cliente'
        )
        self.client.force_authenticate(user=self.user)

        # Crear un plan de comida para pruebas
        self.meal_plan = MealPlan.objects.create(
            name="Plan de Mantenimiento",
            diet_type="maintenance",
            calories=2000,
            proteins=100,
            carbs=200,
            fats=70,
            meal_distribution={"desayuno": 30, "almuerzo": 40, "cena": 30},
            description="Plan de mantenimiento para usuario medio"
        )

    def test_get_macronutrient_by_id_success(self):
        """
        Test para obtener los detalles de una recomendación de macronutrientes por ID con éxito.
        """
        url = reverse('get_macronutrient_by_id')
        response = self.client.get(url, {'id': self.meal_plan.id})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.meal_plan.id)
        self.assertEqual(response.data['kcal'], self.meal_plan.calories)
        self.assertEqual(response.data['dietType'], self.meal_plan.diet_type)

    def test_get_macronutrient_by_id_not_found(self):
        """
        Test para verificar que se devuelve un error 404 si la recomendación no existe.
        """
        url = reverse('get_macronutrient_by_id')
        response = self.client.get(url, {'id': 999})  # ID inexistente

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Recomendación no encontrada", response.data["error"])

    def test_get_macronutrient_by_id_invalid_id(self):
        """
        Test para verificar que se devuelve un error 400 si el ID no es un número.
        """
        url = reverse('get_macronutrient_by_id')
        response = self.client.get(url, {'id': 'abc'})  # ID no válido

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("El parámetro 'id' debe ser un número.", response.data["error"])

    def test_get_macronutrient_by_id_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación da un error 401.
        """
        self.client.logout()  # Desautenticar al usuario
        url = reverse('get_macronutrient_by_id')
        response = self.client.get(url, {'id': self.meal_plan.id})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])


class AddMealPlanTests(APITestCase):

    def setUp(self):
        # Crear usuarios con diferentes roles
        self.nutritionist = User.objects.create_user(
            email='nutritionist@example.com',
            password='password123',
            role='nutricionista'
        )
        self.client.force_authenticate(user=self.nutritionist)

        self.valid_data = {
            "name": "Plan de Ganancia",
            "kcal": 2500,
            "proteins": 150.0,
            "carbs": 300.0,
            "fats": 80.0,
            "dietType": "muscleGain",
            "mealDistribution": [30, 30, 20, 20]
        }

    def test_add_mealplan_success(self):
        """
        Test para añadir un plan de comidas con éxito.
        """
        url = reverse('add_mealplan')
        response = self.client.post(url, self.valid_data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['data']['dietType'], self.valid_data['dietType'])
        self.assertEqual(response.data['data']['kcal'], self.valid_data['kcal'])

    def test_add_mealplan_permission_error(self):
        """
        Test para verificar error de permisos cuando el usuario no es nutricionista o administrador.
        """
        # Crear un usuario con rol diferente
        self.client.logout()
        client_user = User.objects.create_user(
            email='client@example.com',
            password='password123',
            role='cliente'
        )
        self.client.force_authenticate(user=client_user)
        
        url = reverse('add_mealplan')
        response = self.client.post(url, self.valid_data)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("No tienes permisos para agregar planes de comidas", response.data["error"])

    def test_add_mealplan_missing_fields(self):
        """
        Test para verificar error cuando faltan campos obligatorios.
        """
        invalid_data = self.valid_data.copy()
        del invalid_data['kcal']  # Eliminar un campo obligatorio

        url = reverse('add_mealplan')
        response = self.client.post(url, invalid_data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Faltan los campos obligatorios", response.data["error"])

    def test_add_mealplan_invalid_diet_type(self):
        """
        Test para verificar error cuando el tipo de dieta es inválido.
        """
        invalid_data = self.valid_data.copy()
        invalid_data['dietType'] = 'invalidType'

        url = reverse('add_mealplan')
        response = self.client.post(url, invalid_data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Categoría inválida", response.data["error"])

    def test_add_mealplan_invalid_meal_distribution(self):
        """
        Test para verificar error cuando meal_distribution no es una lista o sus valores no suman 100.
        """
        invalid_data = self.valid_data.copy()
        invalid_data['mealDistribution'] = [40, 30, 20]  # Suma incorrecta

        url = reverse('add_mealplan')
        response = self.client.post(url, invalid_data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("meal_distribution debe ser una lista de porcentajes que sumen 100", response.data["error"])

    def test_add_mealplan_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación da un error 401.
        """
        self.client.logout()
        url = reverse('add_mealplan')
        response = self.client.post(url, self.valid_data)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])

class GetMealPlanByIdTests(APITestCase):

    def setUp(self):
        # Crear un usuario nutricionista y autenticarlo
        self.nutritionist = User.objects.create_user(
            email='nutritionist@example.com',
            password='password123',
            role='nutricionista'
        )
        self.client.force_authenticate(user=self.nutritionist)

        # Crear un plan de comidas para usar en las pruebas
        self.meal_plan = MealPlan.objects.create(
            name="Plan de Mantenimiento",
            diet_type="maintenance",
            calories=2000,
            proteins=150.0,
            carbs=250.0,
            fats=70.0,
            meal_distribution={"desayuno": 25, "almuerzo": 35, "cena": 25, "merienda": 15},
            description="Plan de comidas de mantenimiento"
        )

    def test_get_mealplan_by_id_success(self):
        """
        Test para obtener los detalles de un plan de comidas existente por su ID.
        """
        url = reverse('get_mealplan_by_id', args=[self.meal_plan.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.meal_plan.id)
        self.assertEqual(response.data["name"], self.meal_plan.name)
        self.assertEqual(response.data["dietType"], self.meal_plan.diet_type)

    def test_get_mealplan_by_id_not_found(self):
        """
        Test para verificar el manejo de un ID de plan de comidas inexistente.
        """
        url = reverse('get_mealplan_by_id', args=[9999])  # ID que no existe
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Plan de comidas no encontrado", response.data["error"])

    def test_get_mealplan_by_id_unauthenticated(self):
        """
        Test para verificar que el acceso sin autenticación da un error 401.
        """
        self.client.logout()
        url = reverse('get_mealplan_by_id', args=[self.meal_plan.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Authentication credentials were not provided", response.data["detail"])

class UpdateMealPlanTests(APITestCase):

    def setUp(self):
        # Crear un usuario nutricionista y autenticarlo
        self.nutritionist = User.objects.create_user(
            email='nutritionist@example.com',
            password='password123',
            role='nutricionista'
        )
        self.client.force_authenticate(user=self.nutritionist)

        # Crear un plan de comidas para usar en las pruebas
        self.meal_plan = MealPlan.objects.create(
            name="Plan de Mantenimiento",
            diet_type="maintenance",
            calories=2000,
            proteins=150.0,
            carbs=250.0,
            fats=70.0,
            meal_distribution={"desayuno": 25, "almuerzo": 35, "cena": 25, "merienda": 15},
            description="Plan de comidas de mantenimiento"
        )

    def test_update_mealplan_success(self):
        """
        Test para actualizar un plan de comidas existente con datos válidos.
        """
        url = reverse('update_mealplan', args=['maintenance', self.meal_plan.id])
        data = {
            "name": "Plan Modificado",
            "kcal": 2100,
            "proteins": 160.0,
            "carbs": 260.0,
            "fats": 75.0,
            "mealDistribution": {"desayuno": 20, "almuerzo": 40, "cena": 25, "merienda": 15},
            "description": "Plan de mantenimiento actualizado"
        }
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Plan de comidas actualizado correctamente", response.data["message"])

    def test_update_mealplan_not_found(self):
        """
        Test para verificar que el endpoint maneje un ID o categoría de plan de comidas inexistente.
        """
        url = reverse('update_mealplan', args=['weightLoss', 9999])  # ID que no existe
        data = {
            "kcal": 2100,
            "proteins": 160.0,
            "carbs": 260.0,
            "fats": 75.0,
            "mealDistribution": {"desayuno": 20, "almuerzo": 40, "cena": 25, "merienda": 15}
        }
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("El plan de comidas no existe o el tipo de dieta no coincide.", response.data["error"])

    def test_update_mealplan_missing_fields(self):
        """
        Test para verificar el manejo de campos obligatorios faltantes en la actualización.
        """
        url = reverse('update_mealplan', args=['maintenance', self.meal_plan.id])
        data = {
            "kcal": 2100,  # Datos incompletos, faltan 'proteins', 'carbs', 'fats', 'mealDistribution'
        }
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Faltan los campos obligatorios", response.data["error"])

    def test_update_mealplan_unauthorized(self):
        """
        Test para verificar que un usuario sin permisos no pueda modificar el plan de comidas.
        """
        # Crear un usuario sin permisos y autenticarlo
        client_user = User.objects.create_user(
            email='client@example.com',
            password='password123',
            role='cliente'
        )
        self.client.force_authenticate(user=client_user)

        url = reverse('update_mealplan', args=['maintenance', self.meal_plan.id])
        data = {
            "kcal": 2100,
            "proteins": 160.0,
            "carbs": 260.0,
            "fats": 75.0,
            "mealDistribution": {"desayuno": 20, "almuerzo": 40, "cena": 25, "merienda": 15}
        }
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("No tienes permisos para modificar ejercicios", response.data["error"])



class DeleteMealPlanTests(APITestCase):

    def setUp(self):
        # Crear un usuario nutricionista y autenticarlo
        self.nutritionist = User.objects.create_user(
            email='nutritionist@example.com',
            password='password123',
            role='nutricionista'
        )
        self.client.force_authenticate(user=self.nutritionist)

        # Crear un plan de comidas para usar en las pruebas
        self.meal_plan = MealPlan.objects.create(
            name="Plan de Mantenimiento",
            diet_type="maintenance",
            calories=2000,
            proteins=150.0,
            carbs=250.0,
            fats=70.0,
            meal_distribution={"desayuno": 25, "almuerzo": 35, "cena": 25, "merienda": 15},
            description="Plan de comidas de mantenimiento"
        )

    def test_delete_mealplan_success(self):
        """
        Test para eliminar un plan de comidas existente con permisos válidos.
        """
        url = reverse('delete_mealplan', args=['maintenance', self.meal_plan.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("Plan de comidas eliminado correctamente", response.data["message"])

    def test_delete_mealplan_not_found(self):
        """
        Test para verificar que el endpoint maneje un ID o categoría de plan de comidas inexistente.
        """
        url = reverse('delete_mealplan', args=['maintenance', 9999])  # ID que no existe
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Plan de comidas no encontrado", response.data["error"])

    def test_delete_mealplan_invalid_category(self):
        """
        Test para verificar que el endpoint maneje una categoría inválida.
        """
        url = reverse('delete_mealplan', args=['invalidCategory', self.meal_plan.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Categoría inválida. Debe ser weightLoss, muscleGain o maintenance.", response.data["error"])

    def test_delete_mealplan_unauthorized(self):
        """
        Test para verificar que un usuario sin permisos no pueda eliminar el plan de comidas.
        """
        # Crear un usuario sin permisos y autenticarlo
        client_user = User.objects.create_user(
            email='client@example.com',
            password='password123',
            role='cliente'
        )
        self.client.force_authenticate(user=client_user)

        url = reverse('delete_mealplan', args=['maintenance', self.meal_plan.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("No tienes permisos para eliminar planes de nutrición", response.data["error"])        

class GetMealPlanTests(APITestCase):

    def setUp(self):
        # Crear un usuario autenticado
        self.user = User.objects.create_user(
            email='user@example.com',
            password='password123',
            role='cliente'
        )
        self.client.force_authenticate(user=self.user)

        # Crear un plan de comidas para pruebas
        self.meal_plan = MealPlan.objects.create(
            name="Plan de Mantenimiento",
            diet_type="maintenance",
            calories=2000,
            proteins=150.0,
            carbs=250.0,
            fats=70.0,
            meal_distribution={"desayuno": 25, "almuerzo": 35, "cena": 25, "merienda": 15},
            description="Plan de comidas de mantenimiento"
        )

    def test_get_mealplan_success(self):
        """
        Test para obtener los detalles de un plan de comidas existente.
        """
        url = reverse('get_mealplan', args=['maintenance', self.meal_plan.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.meal_plan.id)
        self.assertEqual(response.data['dietType'], "maintenance")
        self.assertIn("kcal", response.data)
        self.assertIn("proteins", response.data)
        self.assertIn("carbs", response.data)
        self.assertIn("fats", response.data)

    def test_get_mealplan_invalid_category(self):
        """
        Test para verificar que el endpoint maneje una categoría inválida.
        """
        url = reverse('get_mealplan', args=['invalidCategory', self.meal_plan.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Categoría inválida. Debe ser weightLoss, muscleGain o maintenance.", response.data["error"])

    def test_get_mealplan_not_found(self):
        """
        Test para verificar que el endpoint maneje un ID o categoría de plan de comidas inexistente.
        """
        url = reverse('get_mealplan', args=['maintenance', 9999])  # ID que no existe
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("Plan de comidas no encontrado", response.data["error"])

class GetMealPlansByCategoryTests(APITestCase):

    def setUp(self):
        # Crear un usuario autenticado
        self.user = User.objects.create_user(
            email='user@example.com',
            password='password123',
            role='cliente'
        )
        self.client.force_authenticate(user=self.user)

        # Crear algunos planes de comidas para pruebas
        self.meal_plan1 = MealPlan.objects.create(
            name="Plan Pérdida de Peso 1",
            diet_type="weightLoss",
            calories=1500,
            proteins=100.0,
            carbs=150.0,
            fats=50.0,
            meal_distribution={"desayuno": 25, "almuerzo": 35, "cena": 25, "merienda": 15},
            description="Plan para pérdida de peso"
        )

        self.meal_plan2 = MealPlan.objects.create(
            name="Plan Ganancia Muscular 1",
            diet_type="muscleGain",
            calories=2500,
            proteins=200.0,
            carbs=300.0,
            fats=80.0,
            meal_distribution={"desayuno": 30, "almuerzo": 40, "cena": 20, "merienda": 10},
            description="Plan para ganancia muscular"
        )

    def test_get_mealplans_by_category_success(self):
        """
        Test para obtener los planes de comidas en una categoría válida con resultados.
        """
        url = reverse('get_mealplans_by_category', args=['weightLoss'])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)  # Asegura que hay al menos un plan en la respuesta
        self.assertEqual(response.data[0]['dietType'], "weightLoss")

    def test_get_mealplans_by_category_invalid_category(self):
        """
        Test para verificar que el endpoint maneje una categoría inválida.
        """
        url = reverse('get_mealplans_by_category', args=['invalidCategory'])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Categoría inválida. Debe ser weightLoss, muscleGain o maintenance.", response.data["error"])

    def test_get_mealplans_by_category_no_plans_found(self):
        """
        Test para verificar que el endpoint maneje una categoría válida sin planes de comidas.
        """
        url = reverse('get_mealplans_by_category', args=['maintenance'])  # No hemos creado planes de mantenimiento
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("No se encontraron planes de comidas", response.data["error"])


class ListDietCategoriesTests(APITestCase):
    
    def test_list_diet_categories(self):
        """
        Test para verificar que el endpoint devuelve las categorías de dieta correctamente.
        """
        url = reverse('list_diet_categories')
        response = self.client.get(url)

        # Verificar que la respuesta sea 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar que la estructura de datos sea correcta
        expected_categories = [
            {"name": "weightLoss", "description": "Pérdida de Peso"},
            {"name": "muscleGain", "description": "Ganancia Muscular"},
            {"name": "maintenance", "description": "Mantenimiento"}
        ]
        
        self.assertEqual(response.data["categories"], expected_categories)