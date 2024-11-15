from datetime import date
from decimal import Decimal
from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse
from api.repositories.user_repository import UserDetailsRepository
from api.models.macros import MealPlan, UserNutritionPlan
from api.models.trainingplan import TrainingPlan
from api.models.workout import UserWorkout
from api.models.user import DietPreferences, User, UserDetails, WeightRecord
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken

class RegisterTests(APITestCase):

    def setUp(self):
        self.register_url = reverse('register')
        self.user_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "password": "strong_password123",
            "birth_date": "1990-01-01",
            "gender": "M",
            "terms_accepted": True  # Booleano, no cadena
        }

    def test_register_success(self):
        """
        Test para un registro exitoso de usuario.
        """
        response = self.client.post(self.register_url, data=self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["message"], "Usuario registrado exitosamente")

    def test_register_user_already_exists(self):
        """
        Test para verificar que no se pueda registrar un usuario con un email ya existente.
        """
        User.objects.create(
            first_name="John",
            last_name="Doe",
            email=self.user_data["email"],
            password=self.user_data["password"],
            birth_date=self.user_data["birth_date"],
            gender=self.user_data["gender"]
        )

        response = self.client.post(self.register_url, data=self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "El usuario con este correo electrónico ya existe.")

    def test_register_terms_not_accepted(self):
        """
        Test para verificar que no se pueda registrar un usuario sin aceptar los términos.
        """
        self.user_data["terms_accepted"] = False
        response = self.client.post(self.register_url, data=self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Debes aceptar los términos y condiciones.")

    def test_register_missing_data(self):
        """
        Test para verificar que el registro falla cuando faltan datos requeridos.
        """
        incomplete_data = {
            "first_name": "John",
            "email": "john.doe@example.com",
            "terms_accepted": True  # Mantener booleano
        }
        response = self.client.post(self.register_url, data=incomplete_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_register_invalid_email(self):
        """
        Test para verificar que el registro falla cuando se proporciona un correo electrónico inválido.
        """
        invalid_email_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "invalid_email",
            "password": "strong_password123",
            "birth_date": "1990-01-01",
            "gender": "M",
            "terms_accepted": True
        }
        response = self.client.post(self.register_url, data=invalid_email_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["error"],
            "Error de validación en los datos proporcionados: 1 validation error for UserCreate\n"
            "email\n"
            "  value is not a valid email address: The email address is not valid. It must have exactly one @-sign. "
            "[type=value_error, input_value='invalid_email', input_type=str]"
        )

    def test_register_weak_password(self):
        weak_password_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.weakpassword@example.com",
            "password": "123",  # Contraseña débil para el test
            "birth_date": "1990-01-01",
            "gender": "M",
            "terms_accepted": True
        }
        response = self.client.post(self.register_url, data=weak_password_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Adaptar el mensaje de error para ignorar detalles adicionales.
        self.assertIn("error", response.data)
        self.assertIn("String should have at least 8 characters", response.data["error"])



class LoginTests(APITestCase):

    def setUp(self):
        self.login_url = reverse('login')
        
        # Crear un usuario con contraseña hasheada
        self.user_data = {
            "email": "john.doe@example.com",
            "password": "strong_password123"
        }
        self.user = User.objects.create(
            first_name="John",
            last_name="Doe",
            email=self.user_data["email"],
            password=make_password(self.user_data["password"]),
            birth_date="1990-01-01",
            gender="M"
        )

    def test_login_success(self):
        """
        Test para un inicio de sesión exitoso.
        """
        response = self.client.post(self.login_url, data=self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["message"], "Inicio de sesión exitoso")

    def test_login_invalid_credentials(self):
        """
        Test para verificar el mensaje de error con credenciales inválidas.
        """
        invalid_data = {
            "email": "john.doe@example.com",
            "password": "wrong_password"
        }
        response = self.client.post(self.login_url, data=invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["error"], "Credenciales inválidas")

    def test_login_user_not_found(self):
        """
        Test para verificar el mensaje de error si el usuario no existe.
        """
        non_existent_user_data = {
            "email": "notfound@example.com",
            "password": "any_password"
        }
        response = self.client.post(self.login_url, data=non_existent_user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["error"], "Credenciales inválidas")

    def test_login_missing_data(self):
        """
        Test para verificar que el inicio de sesión falla si faltan datos requeridos.
        """
        incomplete_data = {
            "email": "john.doe@example.com"
        }
        response = self.client.post(self.login_url, data=incomplete_data, format='json')
        # Verificar si devuelve el estado 400 en lugar de 401
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
'''
class CreateUserDetailsTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            password=make_password("validpassword123"),  # Contraseña válida de al menos 8 caracteres
            birth_date="1990-01-01",
            gender="M",
            role="cliente"
        )
        self.url = reverse('create_user_details')  # Asegúrate de que el nombre de la URL coincide

        # Asegura datos de prueba válidos en `self.valid_data` para cumplir con `UserDetailsSchema` y `DietPreferencesSchema`
        self.valid_data = {
            "height": 180,  # Cambia 'ciento ochenta' por 180
            "weight": 75.5,
            "weight_goal": "Ganar masa muscular",
            "weekly_training_days": 4,
            "daily_training_time": "1-2 horas",
            "physical_activity_level": "Moderada",
            "available_equipment": "Pesas Libres",
            "diet_type": "Balanceado",
            "meals_per_day": 3,
            "macronutrient_intake": {"carbs": 50, "protein": 30, "fats": 20}
        }


    def authenticate_user(self):
        self.client.force_authenticate(user=self.user)

    def test_create_user_details_success(self):
        self.authenticate_user()
        response = self.client.post(self.url, data=self.valid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Detalles del usuario guardados correctamente.")
        self.assertTrue(UserDetails.objects.filter(user=self.user).exists())
        self.assertTrue(DietPreferences.objects.filter(user=self.user).exists())
        self.assertTrue(WeightRecord.objects.filter(user=self.user).exists())


    def test_create_user_details_missing_fields(self):
        """
        Prueba que falla cuando faltan campos requeridos en los datos de los detalles del usuario.
        """
        self.authenticate_user()  # Autentica al usuario
        incomplete_data = {
            "height": 180,
            "weight": 75.5,
            "weekly_training_days": 4,
            "daily_training_time": "1-2 horas"
        }
        response = self.client.post(self.url, data=incomplete_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_create_user_details_invalid_data(self):
        """
        Prueba que falla cuando se proporcionan datos no válidos.
        """
        self.authenticate_user()  # Autentica al usuario
        invalid_data = self.valid_data.copy()
        invalid_data["height"] = "ciento ochenta"  # Tipo de dato incorrecto
        response = self.client.post(self.url, data=invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_create_user_details_without_authentication(self):
        """
        Prueba que el acceso no autenticado está prohibido.
        """
        self.client.force_authenticate(user=None)  # Remover autenticación
        response = self.client.post(self.url, data=self.valid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("detail", response.data)

    def test_create_user_details_update_existing(self):
        """
        Prueba que permite actualizar los detalles de un usuario existente.
        """
        self.authenticate_user()  # Autentica al usuario

        # Crear detalles previos del usuario
        UserDetails.objects.create(
            user=self.user,
            height=170,
            weight=70,
            weight_goal="Mantenimiento",
            weekly_training_days=3,
            daily_training_time="1 hora",
            physical_activity_level="Ligera",
            available_equipment="Sin Equipamiento"
        )

        response = self.client.post(self.url, data=self.valid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar que los detalles han sido actualizados
        user_details = UserDetails.objects.get(user=self.user)
        self.assertEqual(user_details.height, 180)
        self.assertEqual(user_details.weight_goal, "Ganar masa muscular")

    def test_create_user_details_invalid_macronutrient_intake(self):
        self.authenticate_user()
        invalid_data = self.valid_data.copy()
        invalid_data["macronutrient_intake"] = {"carbs": 150, "protein": 30, "fats": 20}  # Excede 100%
        response = self.client.post(self.url, data=invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
'''

class GetUserByEmailTests(APITestCase):

    def setUp(self):
        # Crear un usuario de prueba
        self.user = User.objects.create(
            first_name="John",
            last_name="Doe",
            email="johndoe@example.com",
            password=make_password("password123"),
            birth_date="1990-01-01",
            gender="M",
            role="cliente"
        )
        self.url = reverse('get-user-by-email', kwargs={'email': self.user.email})

    def authenticate_user(self):
        # Forzar autenticación para las solicitudes de prueba
        self.client.force_authenticate(user=self.user)

    def test_get_user_by_email_success(self):
        """
        Prueba para verificar que se puede obtener un usuario existente por correo electrónico.
        """
        self.authenticate_user()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user.email)
        self.assertEqual(response.data['first_name'], self.user.first_name)
        self.assertEqual(response.data['last_name'], self.user.last_name)

    def test_get_user_by_email_not_found(self):
        """
        Prueba para verificar el comportamiento cuando el usuario no existe.
        """
        self.authenticate_user()
        url = reverse('get-user-by-email', kwargs={'email': 'nonexistent@example.com'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Usuario no encontrado")

    def test_get_user_by_email_unauthenticated(self):
        """
        Prueba para verificar que el acceso no autenticado está prohibido.
        """
        url = reverse('get-user-by-email', kwargs={'email': self.user.email})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class GetAllUsersTests(APITestCase):

    def setUp(self):
        # Crear un usuario administrador y uno sin permisos
        self.admin_user = User.objects.create(
            first_name="Admin",
            last_name="User",
            email="admin@example.com",
            password=make_password("password123"),
            birth_date="1990-01-01",
            gender="M",
            role="administrador"
        )
        self.regular_user = User.objects.create(
            first_name="Regular",
            last_name="User",
            email="regular@example.com",
            password=make_password("password123"),
            birth_date="1990-01-01",
            gender="M",
            role="cliente"
        )
        self.url = reverse('get-all-users')

    def test_get_all_users_as_admin(self):
        """
        Prueba para verificar que un administrador puede obtener la lista de usuarios.
        """
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)  # Se espera que haya usuarios en la respuesta

    def test_get_all_users_as_regular_user(self):
        """
        Prueba para verificar que un usuario sin permisos no puede obtener la lista de usuarios.
        """
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["error"], "No tienes permisos para ver esta información.")

    def test_get_all_users_unauthenticated(self):
        """
        Prueba para verificar que el acceso no autenticado está prohibido.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class UpdateUserAsAdminTests(APITestCase):

    def setUp(self):
        # Crear un usuario administrador y un usuario regular para la prueba
        self.admin_user = User.objects.create(
            first_name="Admin",
            last_name="User",
            email="admin@example.com",
            password=make_password("password123"),
            birth_date="1990-01-01",
            gender="M",
            role="administrador"
        )
        self.regular_user = User.objects.create(
            first_name="Regular",
            last_name="User",
            email="regular@example.com",
            password=make_password("password123"),
            birth_date="1995-01-01",
            gender="M",
            role="cliente"
        )
        self.url = reverse('update-user', kwargs={'user_id': self.regular_user.id})

    def test_update_user_as_admin_success(self):
        """
        Prueba para verificar que un administrador puede actualizar los datos de un usuario.
        """
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "first_name": "Updated",
            "last_name": "User",
            "role": "cliente",
            "weightGoal": "Ganar masa muscular",
            "activityLevel": "Moderada",
            "trainingFrequency": 3,
            "currentWeight": 70.5,
            "height": 180 
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Usuario y detalles actualizados exitosamente.")


    def test_update_user_no_permission(self):
        """
        Prueba para verificar que un usuario sin permisos no puede actualizar otros usuarios.
        """
        self.client.force_authenticate(user=self.regular_user)
        data = {
            "first_name": "Unauthorized",
            "last_name": "Update"
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["error"], "No tienes permisos para modificar usuarios")

    def test_update_nonexistent_user(self):
        """
        Prueba para verificar el comportamiento al intentar actualizar un usuario que no existe.
        """
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('update-user', kwargs={'user_id': 9999})
        data = {
            "first_name": "Nonexistent",
            "last_name": "User"
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Usuario no encontrado")

    def test_update_user_unauthenticated(self):
        """
        Prueba para verificar que el acceso no autenticado está prohibido.
        """
        data = {
            "first_name": "Unauthorized",
            "last_name": "Update"
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class DeleteUserTests(APITestCase):

    def setUp(self):
        # Crear un usuario administrador y un usuario regular para la prueba
        self.admin_user = User.objects.create(
            first_name="Admin",
            last_name="User",
            email="admin@example.com",
            password=make_password("password123"),
            birth_date="1990-01-01",
            gender="M",
            role="administrador"
        )
        self.regular_user = User.objects.create(
            first_name="Regular",
            last_name="User",
            email="regular@example.com",
            password=make_password("password123"),
            birth_date="1995-01-01",
            gender="M",
            role="cliente"
        )
        # URL para eliminar el usuario regular
        self.url = reverse('delete-user', kwargs={'user_id': self.regular_user.id})

    def test_delete_user_success(self):
        """
        Prueba para verificar que un administrador puede eliminar un usuario exitosamente.
        """
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Usuario eliminado exitosamente.")
        # Verificar que el usuario ha sido eliminado
        self.assertFalse(User.objects.filter(id=self.regular_user.id).exists())

    def test_delete_user_no_permission(self):
        """
        Prueba para verificar que un usuario sin permisos no puede eliminar otros usuarios.
        """
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["error"], "No tienes permisos para eliminar usuarios.")
        # Verificar que el usuario aún existe
        self.assertTrue(User.objects.filter(id=self.regular_user.id).exists())

    def test_delete_nonexistent_user(self):
        """
        Prueba para verificar el comportamiento al intentar eliminar un usuario que no existe.
        """
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('delete-user', kwargs={'user_id': 9999})  # ID de usuario inexistente
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Usuario no encontrado.")


    def test_delete_user_unauthenticated(self):
        """
        Prueba para verificar que el acceso no autenticado está prohibido.
        """
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class CreateUserAsAdminTests(APITestCase):

    def setUp(self):
        # Crear un usuario administrador para la prueba
        self.admin_user = User.objects.create(
            first_name="Admin",
            last_name="User",
            email="admin@example.com",
            password=make_password("password123"),
            birth_date="1990-01-01",
            gender="M",
            role="administrador"
        )
        # Crear un usuario regular que no tiene permisos de administrador
        self.regular_user = User.objects.create(
            first_name="Regular",
            last_name="User",
            email="regular@example.com",
            password=make_password("password123"),
            birth_date="1995-01-01",
            gender="M",
            role="cliente"
        )
        # URL para la creación de un usuario
        self.url = reverse('create-user-as-admin')

    def test_create_user_success(self):
        """
        Prueba para verificar que un administrador puede crear un nuevo usuario exitosamente.
        """
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "first_name": "New",
            "last_name": "User",
            "email": "newuser@example.com",
            "password": "securepassword",
            "birth_date": "1995-01-01",
            "gender": "M",
            "role": "cliente"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Usuario creado exitosamente")
        self.assertTrue(User.objects.filter(email="newuser@example.com").exists())


    def test_create_user_no_permission(self):
        """
        Prueba para verificar que un usuario sin permisos no puede crear otros usuarios.
        """
        self.client.force_authenticate(user=self.regular_user)
        data = {
            "first_name": "New",
            "last_name": "User",
            "email": "newuser@example.com",
            "password": "securepassword",
            "birth_date": "1995-01-01",
            "gender": "M",
            "role": "cliente"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["error"], "No tienes permisos para crear usuarios")
        self.assertFalse(User.objects.filter(email="newuser@example.com").exists())

    def test_create_user_validation_error(self):
        """
        Prueba para verificar el comportamiento en caso de error de validación.
        """
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "first_name": "New",
            "last_name": "User",
            "email": "invalidemail",  # Correo electrónico no válido
            "password": "short",
            "birth_date": "1995-01-01",
            "gender": "M",
            "role": "cliente"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Error de validación", response.data["error"])

    def test_create_user_duplicate_email(self):
        """
        Prueba para verificar el comportamiento cuando se intenta crear un usuario con un correo ya registrado.
        """
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "first_name": "Duplicate",
            "last_name": "User",
            "email": "regular@example.com",  # Correo ya registrado por `regular_user`
            "password": "securepassword",
            "birth_date": "1995-01-01",
            "gender": "M",
            "role": "cliente"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "El usuario con este correo electrónico ya existe.")

    def test_create_user_unauthenticated(self):
        """
        Prueba para verificar que el acceso no autenticado está prohibido.
        """
        data = {
            "first_name": "Unauthorized",
            "last_name": "User",
            "email": "unauthorized@example.com",
            "password": "securepassword",
            "birth_date": "1995-01-01",
            "gender": "M",
            "role": "cliente"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("credentials were not provided", response.data["detail"].lower())
        self.assertFalse(User.objects.filter(email="unauthorized@example.com").exists())


class AssignPlansTests(APITestCase):

    def setUp(self):
        # Crear un usuario administrador y un usuario entrenador
        self.admin_user = User.objects.create(
            first_name="Admin",
            last_name="User",
            email="admin@example.com",
            password=make_password("password123"),
            birth_date="1990-01-01",
            gender="M",
            role="administrador"
        )
        
        self.trainer_user = User.objects.create(
            first_name="Trainer",
            last_name="User",
            email="trainer@example.com",
            password=make_password("password123"),
            birth_date="1991-02-02",
            gender="M",
            role="entrenador"
        )
        
        # Crear un usuario regular al cual asignar planes
        self.regular_user = User.objects.create(
            first_name="Regular",
            last_name="User",
            email="regular@example.com",
            password=make_password("password123"),
            birth_date="1995-01-01",
            gender="M",
            role="cliente"
        )

        # Crear un plan de entrenamiento y un plan nutricional
        self.training_plan = TrainingPlan.objects.create(name="Plan de Entrenamiento", difficulty="moderado", duration=30)
        self.nutrition_plan = MealPlan.objects.create(name="Plan Nutricional", diet_type="weightLoss", calories=1500)
        
        # URL para asignar planes
        self.url = reverse('assign-plans', args=[self.regular_user.id])

    def test_assign_training_plan_as_admin(self):
        """
        Prueba para verificar que un administrador puede asignar un plan de entrenamiento a un usuario.
        """
        self.client.force_authenticate(user=self.admin_user)
        data = {"workout_id": self.training_plan.id}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Planes asignados o eliminados exitosamente.")
        self.assertTrue(UserWorkout.objects.filter(user=self.regular_user, training_plan=self.training_plan).exists())


    def test_assign_nutrition_plan_as_admin(self):
        """
        Prueba para verificar que un administrador puede asignar un plan nutricional a un usuario.
        """
        self.client.force_authenticate(user=self.admin_user)
        data = {"nutrition_plan_id": self.nutrition_plan.id}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Planes asignados o eliminados exitosamente.")
        self.assertTrue(UserNutritionPlan.objects.filter(user=self.regular_user, plan=self.nutrition_plan).exists())

    def test_assign_both_plans_as_admin(self):
        """
        Prueba para verificar que un administrador puede asignar tanto un plan de entrenamiento como un plan nutricional.
        """
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "workout_id": self.training_plan.id,
            "nutrition_plan_id": self.nutrition_plan.id
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Planes asignados o eliminados exitosamente.")
        self.assertTrue(UserWorkout.objects.filter(user=self.regular_user, training_plan=self.training_plan).exists())
        self.assertTrue(UserNutritionPlan.objects.filter(user=self.regular_user, plan=self.nutrition_plan).exists())

    def test_assign_plan_as_non_admin(self):
        """
        Prueba para verificar que un usuario sin permisos de administrador no puede asignar un plan.
        """
        self.client.force_authenticate(user=self.regular_user)
        data = {"workout_id": self.training_plan.id}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["error"], "No tienes permisos para realizar esta acción.")
        self.assertFalse(UserWorkout.objects.filter(user=self.regular_user, training_plan=self.training_plan).exists())

    def test_assign_nonexistent_training_plan(self):
        """
        Prueba para verificar el error al intentar asignar un plan de entrenamiento que no existe.
        """
        self.client.force_authenticate(user=self.admin_user)
        data = {"workout_id": 9999}  # ID no existente
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Plan de entrenamiento no encontrado.")

    def test_assign_nonexistent_nutrition_plan(self):
        """
        Prueba para verificar el error al intentar asignar un plan nutricional que no existe.
        """
        self.client.force_authenticate(user=self.admin_user)
        data = {"nutrition_plan_id": 9999}  # ID no existente
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Plan nutricional no encontrado.")

    def test_no_plans_provided(self):
        """
        Prueba para verificar que no se asigna nada si no se proporcionan IDs de plan.
        """
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "No se proporcionó ningún ID de plan para asignar o eliminar.")


class GetUserDetailsTests(APITestCase):

    def setUp(self):
        # Crear usuarios con diferentes roles
        self.admin_user = User.objects.create(
            email="admin@example.com",
            password=make_password("password123"),
            role="administrador",
            first_name="Admin",
            last_name="User",
            birth_date="1990-01-01"
        )
        
        self.regular_user = User.objects.create(
            email="regular@example.com",
            password=make_password("password123"),
            role="cliente",
            first_name="Regular",
            last_name="User",
            birth_date="1995-09-15"
        )
        
        self.trainer_user = User.objects.create(
            email="trainer@example.com",
            password=make_password("password123"),
            role="entrenador",
            first_name="Trainer",
            last_name="User",
            birth_date="1988-05-10"
        )

        # Agregar detalles al usuario regular, incluyendo height
        self.user_details = UserDetails.objects.create(
            user=self.regular_user,
            weight=70.5,
            weight_goal="loss",
            physical_activity_level="Moderada",
            weekly_training_days=3,
            height=180  # Proporciona un valor válido para height
        )

        # URL para obtener los detalles del usuario
        self.url = reverse('get-user-details', args=[self.regular_user.id])


    def test_get_user_details_as_admin(self):
        """
        Prueba para verificar que un administrador puede obtener los detalles de un usuario.
        """
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "Regular")
        self.assertEqual(response.data["current_weight"], 70.5)
        self.assertEqual(response.data["weight_goal"], "loss")
        self.assertEqual(response.data["activity_level"], "Moderada")

    def test_get_user_details_as_trainer(self):
        """
        Prueba para verificar que un entrenador puede obtener los detalles de un usuario.
        """
        self.client.force_authenticate(user=self.trainer_user)
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "Regular")
        self.assertEqual(response.data["current_weight"], 70.5)
        self.assertEqual(response.data["weight_goal"], "loss")
        self.assertEqual(response.data["activity_level"], "Moderada")

    def test_get_user_details_permission_denied(self):
        """
        Prueba para verificar que un usuario sin permisos no puede obtener los detalles de otro usuario.
        """
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["error"], "No tienes permisos para ver esta información.")

    def test_get_user_details_user_not_found(self):
        """
        Prueba para verificar el error cuando el usuario no existe.
        """
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('get-user-details', args=[9999])  # ID inexistente
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Usuario no encontrado")

    def test_get_user_details_unauthenticated(self):
        """
        Prueba para verificar que el acceso sin autenticación está prohibido.
        """
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("credentials were not provided", response.data["detail"].lower())

class GetUserRoleTests(APITestCase):

    def setUp(self):
        # Crear un usuario administrador y un usuario regular
        self.admin_user = User.objects.create(
            email="admin@example.com",
            password=make_password("password123"),
            role="administrador",
            first_name="Admin",
            last_name="User",
            birth_date="1990-01-01"
        )
        
        self.regular_user = User.objects.create(
            email="user@example.com",
            password=make_password("password123"),
            role="cliente",
            first_name="Regular",
            last_name="User",
            birth_date="1995-09-15"
        )

        # URL para obtener el rol del usuario autenticado
        self.url = reverse('get_user_role')

    def test_get_user_role_as_admin(self):
        """
        Prueba para verificar que un administrador puede obtener su propio rol.
        """
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["role"], "administrador")

    def test_get_user_role_as_regular_user(self):
        """
        Prueba para verificar que un usuario regular puede obtener su propio rol.
        """
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["role"], "cliente")

    def test_get_user_role_unauthenticated(self):
        """
        Prueba para verificar que el acceso sin autenticación está prohibido.
        """
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("credentials were not provided", response.data["detail"].lower())

    def test_get_user_role_user_not_found(self):
        """
        Prueba para verificar el comportamiento cuando el usuario no existe.
        """
        # Eliminar el usuario y autenticar usando un ID que no existe
        self.admin_user.delete()
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Usuario no encontrado")

class GetUserStatusTests(APITestCase):

    def setUp(self):
        # Crear un usuario administrador y un usuario regular
        self.admin_user = User.objects.create(
            email="admin@example.com",
            password=make_password("password123"),
            role="administrador",
            first_name="Admin",
            last_name="User",
            birth_date="1990-01-01",
            status="active"
        )
        
        self.regular_user = User.objects.create(
            email="user@example.com",
            password=make_password("password123"),
            role="cliente",
            first_name="Regular",
            last_name="User",
            birth_date="1995-09-15",
            status="pending"
        )

        # URL para obtener el estado del usuario autenticado
        self.url = reverse('get_user_status')

    def test_get_user_status_as_admin(self):
        """
        Prueba para verificar que un administrador puede obtener su propio estado.
        """
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "active")

    def test_get_user_status_as_regular_user(self):
        """
        Prueba para verificar que un usuario regular puede obtener su propio estado.
        """
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "pending")

    def test_get_user_status_unauthenticated(self):
        """
        Prueba para verificar que el acceso sin autenticación está prohibido.
        """
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("credentials were not provided", response.data["detail"].lower())

    def test_get_user_status_user_not_found(self):
        """
        Prueba para verificar el comportamiento cuando el usuario no existe.
        """
        # Eliminar el usuario y autenticar usando un ID que no existe
        self.admin_user.delete()
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "User not found.")

class GetUnassignedUsersForNutritionTests(APITestCase):

    def setUp(self):
        # Crear un usuario con rol de nutricionista y otro con rol de entrenador
        self.nutritionist_user = User.objects.create(
            email="nutritionist@example.com",
            password=make_password("password123"),
            role="nutricionista",
            first_name="Nutritionist",
            last_name="User",
            birth_date="1990-01-01"
        )
        
        self.trainer_user = User.objects.create(
            email="trainer@example.com",
            password=make_password("password123"),
            role="entrenador",
            first_name="Trainer",
            last_name="User",
            birth_date="1991-02-02"
        )

        # Crear usuarios no asignados a un plan de nutrición
        self.unassigned_user_1 = User.objects.create(
            email="user1@example.com",
            password=make_password("password123"),
            role="cliente",
            first_name="User1",
            last_name="Example",
            birth_date="1995-03-15",
            status="awaiting_assignment"
        )
        
        self.unassigned_user_2 = User.objects.create(
            email="user2@example.com",
            password=make_password("password123"),
            role="cliente",
            first_name="User2",
            last_name="Example",
            birth_date="1996-04-16",
            status="training_only"
        )
        
        self.assigned_user = User.objects.create(
            email="user3@example.com",
            password=make_password("password123"),
            role="cliente",
            first_name="User3",
            last_name="Example",
            birth_date="1997-05-17",
            status="assigned"
        )

        # URL para obtener los usuarios no asignados a nutrición
        self.url = reverse('get_unassigned_users_for_nutrition')

    def test_get_unassigned_users_for_nutrition_as_nutritionist(self):
        """
        Prueba para verificar que un nutricionista puede obtener usuarios no asignados a nutrición.
        """
        self.client.force_authenticate(user=self.nutritionist_user)
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verificar que solo los usuarios con estado 'awaiting_assignment' o 'training_only' estén en la respuesta
        self.assertTrue(all(user['status'] in ["awaiting_assignment", "training_only"] for user in response.data))
        self.assertEqual(len(response.data), 4)  # Debe incluir solo los dos usuarios no asignados

    def test_get_unassigned_users_for_nutrition_as_trainer(self):
        """
        Prueba para verificar que un entrenador no tiene permiso para obtener usuarios no asignados a nutrición.
        """
        self.client.force_authenticate(user=self.trainer_user)
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["error"], "No tienes permiso para ver esta información.")


    def test_get_unassigned_users_for_nutrition_unauthenticated(self):
        """
        Prueba para verificar que el acceso sin autenticación está prohibido.
        """
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("credentials were not provided", response.data["detail"].lower())

class GetUnassignedUsersForTrainingTests(APITestCase):

    def setUp(self):
        # Crear un usuario con rol de entrenador y otro con rol de nutricionista
        self.trainer_user = User.objects.create(
            email="trainer@example.com",
            password=make_password("password123"),
            role="entrenador",
            first_name="Trainer",
            last_name="User",
            birth_date="1990-01-01"
        )
        
        self.nutritionist_user = User.objects.create(
            email="nutritionist@example.com",
            password=make_password("password123"),
            role="nutricionista",
            first_name="Nutritionist",
            last_name="User",
            birth_date="1991-02-02"
        )

        # Crear usuarios no asignados a un plan de entrenamiento
        self.unassigned_user_1 = User.objects.create(
            email="user1@example.com",
            password=make_password("password123"),
            role="cliente",
            first_name="User1",
            last_name="Example",
            birth_date="1995-03-15",
            status="awaiting_assignment"
        )
        
        self.unassigned_user_2 = User.objects.create(
            email="user2@example.com",
            password=make_password("password123"),
            role="cliente",
            first_name="User2",
            last_name="Example",
            birth_date="1996-04-16",
            status="nutrition_only"
        )
        
        self.assigned_user = User.objects.create(
            email="user3@example.com",
            password=make_password("password123"),
            role="cliente",
            first_name="User3",
            last_name="Example",
            birth_date="1997-05-17",
            status="assigned"
        )

        # URL para obtener los usuarios no asignados a entrenamiento
        self.url = reverse('get_unassigned_users_for_training')

    def test_get_unassigned_users_for_training_as_trainer(self):
        """
        Prueba para verificar que un entrenador puede obtener usuarios no asignados a entrenamiento.
        """
        self.client.force_authenticate(user=self.trainer_user)
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verificar que solo los usuarios con estado 'awaiting_assignment' o 'nutrition_only' estén en la respuesta
        self.assertTrue(all(user['status'] in ["awaiting_assignment", "nutrition_only"] for user in response.data))
        self.assertEqual(len(response.data), 4)  # Debe incluir solo los dos usuarios no asignados


    def test_get_unassigned_users_for_training_as_nutritionist(self):
        """
        Prueba para verificar que un nutricionista no tiene permiso para obtener usuarios no asignados a entrenamiento.
        """
        self.client.force_authenticate(user=self.nutritionist_user)
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["error"], "No tienes permiso para ver esta información.")


    def test_get_unassigned_users_for_training_unauthenticated(self):
        """
        Prueba para verificar que el acceso sin autenticación está prohibido.
        """
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("credentials were not provided", response.data["detail"].lower())

class GetUserAllDetailsTests(APITestCase):

    def setUp(self):
        # Crear usuario administrador
        self.admin_user = User.objects.create(
            email="admin@example.com",
            password=make_password("password123"),
            role="administrador",
            first_name="Admin",
            last_name="User",
            birth_date="1985-01-01"
        )

        # Crear usuario de cliente con detalles y preferencias de dieta
        self.client_user = User.objects.create(
            email="client@example.com",
            password=make_password("password123"),
            role="cliente",
            first_name="Client",
            last_name="User",
            birth_date="1995-05-10"
        )
        self.user_details = UserDetails.objects.create(
            user=self.client_user,
            height=175,
            weight=70,
            weight_goal="maintain",
            weekly_training_days=3,
            daily_training_time="1 hour",
            physical_activity_level="moderate",
            available_equipment="sin_equipamiento"
        )
        self.diet_preferences = DietPreferences.objects.create(
            user=self.client_user,
            diet_type="vegetarian",
            meals_per_day=3
        )
        WeightRecord.objects.create(user=self.client_user, weight=68.5, date="2023-01-01")
        WeightRecord.objects.create(user=self.client_user, weight=69.0, date="2023-02-01")

        # URL para obtener los detalles completos del usuario
        self.url = reverse('get-all-details', args=[self.client_user.id])

    def test_get_user_all_details_success(self):
        """Prueba para verificar que un administrador puede obtener los detalles completos de un usuario."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.client_user.id)
        self.assertEqual(response.data['first_name'], self.client_user.first_name)
        self.assertEqual(response.data['details']['height'], 175)
        self.assertEqual(response.data['diet_preferences']['diet_type'], "vegetarian")
        self.assertEqual(len(response.data['weight_records']), 2)

    def test_get_user_all_details_user_not_found(self):
        """Prueba para verificar el comportamiento cuando el usuario no existe."""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('get-all-details', args=[999])  # ID inexistente
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], "Usuario no encontrado")

    def test_get_user_all_details_unauthenticated(self):
        """Prueba para verificar que el acceso sin autenticación está prohibido."""
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("credentials were not provided", response.data["detail"].lower())

class AssignSinglePlanTests(APITestCase):

    def setUp(self):
        # Crear usuario administrador, nutricionista y entrenador
        self.admin_user = User.objects.create(
            email="admin@example.com",
            password=make_password("password123"),
            role="administrador",
            first_name="Admin",
            last_name="User",
            birth_date="1980-01-01"  # Agrega una fecha de nacimiento válida

        )
        self.nutritionist_user = User.objects.create(
            email="nutritionist@example.com",
            password=make_password("password123"),
            role="nutricionista",
            first_name="Nutritionist",
            last_name="User",
            birth_date="1980-01-01"  # Agrega una fecha de nacimiento válida

        )
        self.trainer_user = User.objects.create(
            email="trainer@example.com",
            password=make_password("password123"),
            role="entrenador",
            first_name="Trainer",
            last_name="User",
            birth_date="1980-01-01"  # Agrega una fecha de nacimiento válida

        )

        # Crear usuario cliente
        self.client_user = User.objects.create(
            email="client@example.com",
            password=make_password("password123"),
            role="cliente",
            first_name="Client",
            last_name="User",
            birth_date="1980-01-01"  # Agrega una fecha de nacimiento válida
        )

        # Crear plan nutricional y de entrenamiento
        self.nutrition_plan = MealPlan.objects.create(name="Nutrition Plan")
        self.training_plan = TrainingPlan.objects.create(name="Training Plan")

        # URL para asignar un plan
        self.url = reverse('assign-single-plan', args=[self.client_user.id])

    def test_assign_nutrition_plan_as_nutritionist(self):
        """Prueba para verificar que un nutricionista puede asignar un plan nutricional."""
        self.client.force_authenticate(user=self.nutritionist_user)
        data = {"id_plan": self.nutrition_plan.id, "is_nutrition_plan": True}
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Plan nutricional asignado exitosamente al usuario.")
        self.assertTrue(UserNutritionPlan.objects.filter(user=self.client_user, plan=self.nutrition_plan).exists())

    def test_assign_training_plan_as_trainer(self):
        """Prueba para verificar que un entrenador puede asignar un plan de entrenamiento."""
        self.client.force_authenticate(user=self.trainer_user)
        data = {"id_plan": self.training_plan.id, "is_nutrition_plan": False}
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Plan de entrenamiento asignado exitosamente al usuario.")
        self.assertTrue(UserWorkout.objects.filter(user=self.client_user, training_plan=self.training_plan).exists())

    def test_assign_plan_no_permission(self):
        """Prueba para verificar que un usuario sin permisos no puede asignar un plan."""
        self.client.force_authenticate(user=self.client_user)  # Usuario sin permisos de asignación
        data = {"id_plan": self.nutrition_plan.id, "is_nutrition_plan": True}
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["error"], "No tienes permisos para realizar esta acción")

    def test_assign_nutrition_plan_not_found(self):
        """Prueba para verificar que se devuelve un error si el plan nutricional no existe."""
        self.client.force_authenticate(user=self.nutritionist_user)
        data = {"id_plan": 9999, "is_nutrition_plan": True}  # ID inexistente
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Plan nutricional no encontrado.")

    def test_assign_training_plan_not_found(self):
        """Prueba para verificar que se devuelve un error si el plan de entrenamiento no existe."""
        self.client.force_authenticate(user=self.trainer_user)
        data = {"id_plan": 9999, "is_nutrition_plan": False}  # ID inexistente
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Plan de entrenamiento no encontrado.")

    def test_assign_plan_user_not_found(self):
        """Prueba para verificar que se devuelve un error si el usuario no existe."""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('assign-single-plan', args=[9999])  # ID de usuario inexistente
        data = {"id_plan": self.nutrition_plan.id, "is_nutrition_plan": True}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Usuario no encontrado.")

    def test_assign_plan_missing_parameters(self):
        """Prueba para verificar que se devuelve un error si faltan parámetros."""
        self.client.force_authenticate(user=self.admin_user)
        data = {}  # Sin parámetros necesarios
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "ID del plan o tipo de plan (is_nutrition_plan) no proporcionado.")


class GetWeightRecordsTests(APITestCase):

    def setUp(self):
        # Crear un usuario de prueba y un registro de peso
        self.user = User.objects.create(
            first_name="John",
            last_name="Doe",
            email="johndoe@example.com",
            password=make_password("password123"),
            birth_date="1990-01-01",
            gender="M",
            role="cliente"
        )
        self.weight_record = WeightRecord.objects.create(
            user=self.user,
            weight=75.5,
            date="2024-01-01"
        )
        self.url = reverse('weight-records')

    def authenticate_user(self):
        # Forzar autenticación para las solicitudes de prueba
        self.client.force_authenticate(user=self.user)

    def test_get_weight_records_success(self):
        """
        Prueba para verificar que un usuario autenticado pueda obtener sus registros de peso.
        """
        self.authenticate_user()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Se espera un solo registro de peso
        self.assertEqual(str(response.data[0]['date']), str(self.weight_record.date))  # Convertir ambas fechas a cadena para comparar
        self.assertEqual(Decimal(response.data[0]['weight']), self.weight_record.weight)


    def test_get_weight_records_no_data(self):
        """
        Prueba para verificar el comportamiento cuando el usuario no tiene registros de peso.
        """
        self.authenticate_user()
        # El usuario no tiene registros de peso en este caso
        self.user.weight_records.all().delete()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "No se encontraron registros de peso para este usuario.")

    def test_get_weight_records_unauthenticated(self):
        """
        Prueba para verificar que el acceso no autenticado está prohibido.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class CreateWeightRecordTests(APITestCase):

    def setUp(self):
        # Crear un usuario de prueba
        self.user = User.objects.create(
            first_name="John",
            last_name="Doe",
            email="johndoe@example.com",
            password=make_password("password123"),
            birth_date="1990-01-01",
            gender="M",
            role="cliente"
        )
        self.url = reverse('crear_registro_peso')

    def authenticate_user(self):
        # Forzar autenticación para las solicitudes de prueba
        self.client.force_authenticate(user=self.user)

    def test_create_weight_record_success(self):
        """
        Prueba para verificar que un usuario autenticado puede crear un nuevo registro de peso.
        """
        self.authenticate_user()
        data = {'weight': 75.5}  # Peso a registrar
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("Registro de peso creado", response.data["message"])
        self.assertIn("id", response.data)

        # Verificar que el registro de peso fue realmente creado
        self.assertEqual(WeightRecord.objects.count(), 1)
        self.assertEqual(WeightRecord.objects.first().weight, 75.5)

    def test_create_weight_record_no_weight(self):
        """
        Prueba para verificar que si no se proporciona peso, se retorna un error.
        """
        self.authenticate_user()
        data = {}  # No se proporciona peso
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "El peso es requerido.")

    def test_create_weight_record_unauthenticated(self):
        """
        Prueba para verificar que un usuario no autenticado no puede crear un registro de peso.
        """
        data = {'weight': 75.5}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)  # Esperamos 401 si está autenticado

class GetLatestWeightRecordTests(APITestCase):

    def setUp(self):
        # Crear un usuario de prueba
        self.user = User.objects.create(
            first_name="John",
            last_name="Doe",
            email="johndoe@example.com",
            password=make_password("password123"),
            birth_date="1990-01-01",
            gender="M",
            role="cliente"
        )
        # Crear varios registros de peso para el usuario
        self.weight_record_1 = WeightRecord.objects.create(
            user=self.user,
            weight=70.0,
            date="2024-01-01"
        )
        self.weight_record_2 = WeightRecord.objects.create(
            user=self.user,
            weight=75.5,
            date="2024-11-13"
        )
        self.url = reverse('latest-weight-record')

    def authenticate_user(self):
        # Forzar autenticación para las solicitudes de prueba
        self.client.force_authenticate(user=self.user)

    def test_get_latest_weight_record_success(self):
        """
        Prueba para verificar que un usuario autenticado pueda obtener su último registro de peso.
        """
        self.authenticate_user()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verificar que la respuesta contenga los datos del último registro de peso
        self.assertEqual(float(response.data['weight']), float(self.weight_record_2.weight))
        self.assertEqual(str(response.data['date']), str(self.weight_record_2.date))  # Fecha debe ser la misma

    def test_get_latest_weight_record_no_data(self):
        """
        Prueba para verificar el comportamiento cuando el usuario no tiene registros de peso.
        """
        # Eliminar todos los registros de peso del usuario
        self.user.weight_records.all().delete()
        self.authenticate_user()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["message"], "No weight record found.")

    def test_get_latest_weight_record_unauthenticated(self):
        """
        Prueba para verificar que un usuario no autenticado no puede obtener el último registro de peso.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class GetUserProfileTests(APITestCase):

    def setUp(self):
        # Crear un usuario de prueba

        self.user = User.objects.create(
            first_name="John",
            last_name="Doe",
            email="johndoe@example.com",
            password=make_password("password123"),
            birth_date=date(1990, 1, 1),  # Usar un objeto de tipo date
            gender="M",
            role="cliente"
        )

        # Crear detalles de usuario
        self.user_details = UserDetails.objects.create(
            user=self.user,
            height=180,
            weight=75.5,
            weight_goal='gain_muscle',
            weekly_training_days=3,
            daily_training_time='1-2 horas',
            physical_activity_level='moderate',
            available_equipment='gimnasio_completo'
        )
        self.url = reverse('get-user-profile')

    def authenticate_user(self):
        # Forzar autenticación para las solicitudes de prueba
        self.client.force_authenticate(user=self.user)
        
    def test_get_user_profile_success(self):
        """
        Prueba para verificar que un usuario autenticado puede obtener su perfil correctamente.
        """
        self.authenticate_user()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], f"{self.user.first_name} {self.user.last_name}")
        self.assertEqual(response.data["email"], self.user.email)
        self.assertEqual(response.data["age"], UserDetailsRepository.calculate_age(self.user.birth_date))
        self.assertEqual(response.data["height"], self.user_details.height)
        self.assertEqual(response.data["initialWeight"], self.user_details.weight)
        self.assertEqual(response.data["currentWeight"], self.user_details.weight)
        self.assertEqual(response.data["weightGoal"], self.user_details.weight_goal)
        self.assertEqual(response.data["activityLevel"], self.user_details.physical_activity_level)
        self.assertEqual(response.data["trainingFrequency"], self.user_details.weekly_training_days)

    def test_get_user_profile_no_details(self):
        """
        Prueba para verificar el comportamiento cuando el usuario no tiene detalles de perfil.
        """
        # Crear un usuario sin detalles de perfil
        user_without_details = User.objects.create(
            first_name="Jane",
            last_name="Doe",
            email="janedoe@example.com",
            password=make_password("password123"),
            birth_date="1995-05-05",
            gender="F",
            role="cliente"
        )
        self.authenticate_user()
        response = self.client.get(self.url, {'userId': user_without_details.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["weightGoal"], "No goal set")
        self.assertEqual(response.data["activityLevel"], "No info")
        self.assertEqual(response.data["trainingFrequency"], 0)

    def test_get_user_profile_user_not_found(self):
        """
        Prueba para verificar el comportamiento cuando el usuario no existe.
        """
        self.authenticate_user()
        response = self.client.get(self.url, {'userId': 999999})  # Un ID de usuario que no existe
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Usuario no encontrado")

    def test_get_user_profile_unauthenticated(self):
        """
        Prueba para verificar que un usuario no autenticado no puede obtener el perfil.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class UpdateUserProfileTests(APITestCase):
    def setUp(self):
        # Crear un usuario regular y sus detalles
        self.user = User.objects.create(
            first_name="Regular",
            last_name="User",
            email="regular@example.com",
            password=make_password("password123"),
            birth_date="1995-01-01",
            gender="M",
            role="cliente",
            status="assigned"
        )
        self.user_details = UserDetails.objects.create(
            user=self.user,
            height=180,
            weight=75.0,
            weight_goal="maintain",
            weekly_training_days=3,
            physical_activity_level="moderate"
        )
        self.url = reverse('update-user-profile')

    def test_update_profile_success(self):
        """
        Prueba para verificar la actualización exitosa del perfil del usuario.
        """
        self.client.force_authenticate(user=self.user)
        data = {
            "firstName": "Updated",
            "lastName": "User",
            "currentWeight": 70.5,
            "weightGoal": "gain_muscle",
            "activityLevel": "intense",
            "trainingFrequency": 5
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "Updated User")
        self.assertEqual(response.data["currentWeight"], 70.5)
        self.assertEqual(response.data["weightGoal"], "gain_muscle")
        self.assertEqual(response.data["activityLevel"], "intense")
        self.assertEqual(response.data["trainingFrequency"], 5)

    def test_update_profile_no_data_provided(self):
        """
        Prueba para verificar el manejo de la falta de datos.
        """
        self.client.force_authenticate(user=self.user)
        response = self.client.put(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "No se proporcionaron datos para actualizar.")

    def test_update_profile_user_not_found(self):
        """
        Prueba para verificar el comportamiento cuando el usuario no existe.
        """
        # Invalidamos al usuario para simular que no existe
        self.client.force_authenticate(user=self.user)
        User.objects.filter(id=self.user.id).delete()
        data = {
            "firstName": "Nonexistent",
            "lastName": "User"
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Usuario no encontrado.")

    def test_update_profile_requires_authentication(self):
        """
        Prueba para verificar que solo usuarios autenticados pueden actualizar su perfil.
        """
        data = {
            "firstName": "Unauthorized",
            "lastName": "User"
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class ChangePasswordTests(APITestCase):
    def setUp(self):
        # Crear un usuario regular
        self.user = User.objects.create(
            first_name="Regular",
            last_name="User",
            email="regular@example.com",
            password=make_password("old_password123"),
            birth_date="1995-01-01",
            gender="M",
            role="cliente"
        )
        self.url = reverse('change-password')

    def test_change_password_success(self):
        """
        Prueba para verificar el cambio de contraseña exitoso.
        """
        self.client.force_authenticate(user=self.user)
        data = {
            "currentPassword": "old_password123",
            "newPassword": "new_password123",
            "confirmPassword": "new_password123"
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "La contraseña ha sido cambiada exitosamente.")

        # Verificar que la nueva contraseña funciona
        self.user.refresh_from_db()
        self.assertTrue(check_password("new_password123", self.user.password))

    def test_change_password_incorrect_current_password(self):
        """
        Prueba para verificar que el cambio de contraseña falla si la contraseña actual es incorrecta.
        """
        self.client.force_authenticate(user=self.user)
        data = {
            "currentPassword": "wrong_password",
            "newPassword": "new_password123",
            "confirmPassword": "new_password123"
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "La contraseña actual es incorrecta.")

    def test_change_password_mismatch_new_passwords(self):
        """
        Prueba para verificar que el cambio de contraseña falla si las nuevas contraseñas no coinciden.
        """
        self.client.force_authenticate(user=self.user)
        data = {
            "currentPassword": "old_password123",
            "newPassword": "new_password123",
            "confirmPassword": "different_password123"
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Las nuevas contraseñas no coinciden.")

    def test_change_password_same_as_current(self):
        """
        Prueba para verificar que el cambio de contraseña falla si la nueva contraseña es igual a la actual.
        """
        self.client.force_authenticate(user=self.user)
        data = {
            "currentPassword": "old_password123",
            "newPassword": "old_password123",
            "confirmPassword": "old_password123"
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "La nueva contraseña no puede ser igual a la actual.")

    def test_change_password_missing_fields(self):
        """
        Prueba para verificar que el cambio de contraseña falla si faltan campos obligatorios.
        """
        self.client.force_authenticate(user=self.user)
        data = {
            "currentPassword": "old_password123",
            "newPassword": "new_password123"
            # Falta el confirmPassword
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Todos los campos son obligatorios.")

    def test_change_password_requires_authentication(self):
        """
        Prueba para verificar que el cambio de contraseña requiere autenticación.
        """
        data = {
            "currentPassword": "old_password123",
            "newPassword": "new_password123",
            "confirmPassword": "new_password123"
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


