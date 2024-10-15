from BackEnd.api.models.process import ProgressTracking
from rest_framework.test import APITestCase # type: ignore
from rest_framework import status # type: ignore
from django.urls import reverse
from api.models.User import User, UserDetails, DietPreferences, TrainingPreferences
from api.models import User
from django.core.files.uploadedfile import SimpleUploadedFile


class UserRegisterTestCase(APITestCase):
    
    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        self.url = reverse('register')
        self.user_data = {
            "first_name": "Test",
            "last_name": "User",
            "email": "testuser@example.com",
            "password": "TestPassword123!",
            "birth_date": "1990-01-01",
            "gender": "M",
            "terms_accepted": True
        }

    def test_register_user_success(self):
        """
        Verifica que un usuario se registra correctamente.
        """
        response = self.client.post(self.url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)

        # Verificar que el usuario se haya creado en la base de datos
        user_exists = User.objects.filter(email=self.user_data['email']).exists()
        self.assertTrue(user_exists)

    def test_register_user_with_existing_email(self):
        """
        Verifica que no se puede registrar un usuario con un correo ya registrado.
        """
        # Crear un usuario inicial
        self.client.post(self.url, self.user_data, format='json')

        # Intentar registrar nuevamente con el mismo email
        response = self.client.post(self.url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

class UserLoginTestCase(APITestCase):
    
    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.user_data = {
            "first_name": "Test",
            "last_name": "User",
            "email": "testlogin@example.com",
            "password": "TestPassword123!",
            "birth_date": "1990-01-01",
            "gender": "M",
            "terms_accepted": True
        }
        # Registrar un usuario
        self.client.post(self.register_url, self.user_data, format='json')
        
        self.login_data = {
            "email": self.user_data["email"],
            "password": self.user_data["password"],
            "remember_me": True
        }

    def test_login_success(self):
        """
        Verifica que el usuario pueda iniciar sesión correctamente.
        """
        response = self.client.post(self.login_url, self.login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

    def test_login_invalid_credentials(self):
        """
        Verifica que no se puede iniciar sesión con credenciales incorrectas.
        """
        self.login_data['password'] = 'WrongPassword'
        response = self.client.post(self.login_url, self.login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)


class UserDetailsTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear un usuario de prueba
        self.user = User.objects.create_user(
            first_name="Test",
            last_name="User",
            email="testuser@example.com",
            password="TestPassword123!",
            birth_date="1990-01-01",
            gender="M"
        )
        
        # URL del endpoint
        self.url = reverse('user-details')
        
        # Datos para el test
        self.user_details_data = {
            "height": 180,
            "weight": 75,
            "weight_goal": 70,
            "weight_change_amount": 5,
            "weekly_training_days": 4,
            "daily_training_time": "1-2 horas",
            "physical_activity_level": "Moderate activity",
            
            "diet_type": "High protein",
            "meals_per_day": 3,
            "macronutrient_intake": "Balanceado",
            "available_equipment": "Gym equipment",
            "food_restrictions": "No dairy",
            "custom_food_restrictions": None
        }

        # Autenticar al usuario en los tests
        self.client.force_authenticate(user=self.user)

    def test_save_user_details_success(self):
        """
        Verifica que los detalles del usuario se guarden correctamente.
        """
        response = self.client.post(self.url, self.user_details_data, format='json')
        
        # Verificar que la respuesta sea exitosa
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        
        # Verificar que los detalles del usuario se guarden correctamente en la base de datos
        user_details = UserDetails.objects.get(user=self.user)
        self.assertEqual(user_details.height, self.user_details_data['height'])
        self.assertEqual(user_details.weight, self.user_details_data['weight'])
        self.assertEqual(user_details.weight_goal, self.user_details_data['weight_goal'])

        # Verificar que las preferencias de dieta se guarden
        diet_preferences = DietPreferences.objects.get(user=self.user)
        self.assertEqual(diet_preferences.diet_type, self.user_details_data['diet_type'])
        self.assertEqual(diet_preferences.meals_per_day, self.user_details_data['meals_per_day'])

        # Verificar que las condiciones médicas se guarden

        # Verificar que las preferencias de entrenamiento se guarden
        self.assertEqual(training_preferences.available_equipment, self.user_details_data['available_equipment'])

    def test_save_user_details_missing_required_field(self):
        """
        Verifica que falten campos requeridos y retorne un error apropiado.
        """
        # Eliminar un campo requerido de los datos
        incomplete_data = self.user_details_data.copy()
        incomplete_data.pop('height')
        
        response = self.client.post(self.url, incomplete_data, format='json')
        
        # Verificar que la respuesta indique un error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_save_user_details_unauthenticated(self):
        """
        Verifica que no se puedan guardar detalles de usuario sin estar autenticado.
        """
        # Desautenticar al usuario
        self.client.force_authenticate(user=None)

        response = self.client.post(self.url, self.user_details_data, format='json')
        
        # Verificar que la respuesta indique que la autenticación es necesaria
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class GetUserProfileTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear usuario de prueba
        self.user = User.objects.create_user(first_name="Pedro", last_name="Sendon", email="pedro@example.com", password="TestPassword123!", birth_date="1995-01-01")

        # Crear detalles del usuario de prueba
        self.user_details = UserDetails.objects.create(
            user=self.user,
            height=175,
            weight=85,
            weight_goal="Perder peso",
            weekly_training_days=5,
            physical_activity_level="Moderado"
        )

        # URL del endpoint
        self.url = reverse('get-user-profile')

        # Autenticar al usuario
        self.client.force_authenticate(user=self.user)

    def test_get_user_profile_success(self):
        """
        Verifica que se puedan obtener los datos del perfil del usuario.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar que los datos del perfil sean correctos
        self.assertEqual(response.data['username'], "Pedro Sendon")
        self.assertEqual(response.data['email'], "pedro@example.com")
        self.assertEqual(response.data['age'], 28)  # Suponiendo que la fecha es correcta
        self.assertEqual(response.data['height'], 175)
        self.assertEqual(response.data['initialWeight'], 85)
        self.assertEqual(response.data['currentWeight'], 85)
        self.assertEqual(response.data['weightGoal'], "Perder peso")
        self.assertEqual(response.data['activityLevel'], "Moderado")
        self.assertEqual(response.data['trainingFrequency'], 5)

    def test_get_user_profile_not_found(self):
        """
        Verifica que se devuelva un error si el usuario no existe.
        """
        invalid_url = reverse('get-user-profile') + "?userId=999"
        response = self.client.get(invalid_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)

class GetWeightHistoryTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear usuario de prueba
        self.user = User.objects.create_user(first_name="Pedro", last_name="Sendon", email="pedro@example.com", password="TestPassword123!", birth_date="1995-01-01")

        # Crear registros de progreso del usuario de prueba
        ProgressTracking.objects.create(user=self.user, date="2024-09-01", weight=85)
        ProgressTracking.objects.create(user=self.user, date="2024-09-05", weight=83)
        ProgressTracking.objects.create(user=self.user, date="2024-09-10", weight=81)
        ProgressTracking.objects.create(user=self.user, date="2024-09-15", weight=80)

        # URL del endpoint
        self.url = reverse('get-weight-history')

        # Autenticar al usuario
        self.client.force_authenticate(user=self.user)

    def test_get_weight_history_success(self):
        """
        Verifica que se pueda obtener el historial de peso del usuario.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar que el historial de peso sea correcto
        self.assertEqual(len(response.data), 4)
        self.assertEqual(response.data[0]['weight'], 85)
        self.assertEqual(response.data[1]['weight'], 83)
        self.assertEqual(response.data[2]['weight'], 81)
        self.assertEqual(response.data[3]['weight'], 80)

    def test_get_weight_history_not_found(self):
        """
        Verifica que se devuelva un error si el usuario no tiene historial de peso.
        """
        # Crear un usuario sin historial de peso
        new_user = User.objects.create_user(first_name="Maria", last_name="Garcia", email="maria@example.com", password="TestPassword123!")
        self.client.force_authenticate(user=new_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)

class UpdateUserProfileTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear usuario de prueba
        self.user = User.objects.create_user(first_name="Pedro", last_name="Sendon", email="pedro@example.com", password="TestPassword123!", birth_date="1995-01-01")

        # Crear detalles del usuario de prueba
        self.user_details = UserDetails.objects.create(
            user=self.user,
            height=175,
            weight=85,
            weight_goal="Perder peso",
            weekly_training_days=5,
            physical_activity_level="Moderado"
        )

        # URL del endpoint
        self.url = reverse('update-user-profile')

        # Autenticar al usuario
        self.client.force_authenticate(user=self.user)

    def test_update_user_profile_success(self):
        """
        Verifica que el perfil del usuario se actualice correctamente.
        """
        data = {
            "firstName": "Juan",
            "lastName": "Garcia",
            "currentWeight": 78,
            "weightGoal": "Mantener peso",
            "activityLevel": "Alto",
            "trainingFrequency": 6
        }

        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar que los datos del perfil se actualizaron correctamente
        self.assertEqual(response.data['username'], "Juan Garcia")
        self.assertEqual(response.data['currentWeight'], 78)
        self.assertEqual(response.data['weightGoal'], "Mantener peso")
        self.assertEqual(response.data['activityLevel'], "Alto")
        self.assertEqual(response.data['trainingFrequency'], 6)

    def test_update_user_profile_no_data(self):
        """
        Verifica que se devuelva un error si no se proporciona ningún dato.
        """
        response = self.client.put(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

class ChangePasswordTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear usuario de prueba
        self.user = User.objects.create_user(first_name="Pedro", last_name="Sendon", email="pedro@example.com", password="TestPassword123!")

        # URL del endpoint
        self.url = reverse('change-password')

        # Autenticar al usuario
        self.client.force_authenticate(user=self.user)

    def test_change_password_success(self):
        """
        Verifica que la contraseña se cambie correctamente.
        """
        data = {
            "currentPassword": "TestPassword123!",
            "newPassword": "NewPassword123!",
            "confirmPassword": "NewPassword123!"
        }

        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

    def test_change_password_incorrect_current(self):
        """
        Verifica que no se pueda cambiar la contraseña si la actual es incorrecta.
        """
        data = {
            "currentPassword": "WrongPassword123!",
            "newPassword": "NewPassword123!",
            "confirmPassword": "NewPassword123!"
        }

        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_change_password_mismatch(self):
        """
        Verifica que no se pueda cambiar la contraseña si las nuevas contraseñas no coinciden.
        """
        data = {
            "currentPassword": "TestPassword123!",
            "newPassword": "NewPassword123!",
            "confirmPassword": "MismatchPassword123!"
        }

        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_change_password_same_as_current(self):
        """
        Verifica que no se pueda cambiar la contraseña si la nueva es igual a la actual.
        """
        data = {
            "currentPassword": "TestPassword123!",
            "newPassword": "TestPassword123!",
            "confirmPassword": "TestPassword123!"
        }

        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

class UploadProfilePhotoTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear usuario de prueba
        self.user = User.objects.create_user(first_name="Pedro", last_name="Sendon", email="pedro@example.com", password="TestPassword123!")

        # URL del endpoint
        self.url = reverse('upload-profile-photo')

        # Autenticar al usuario
        self.client.force_authenticate(user=self.user)

    def test_upload_profile_photo_success(self):
        """
        Verifica que la foto de perfil se suba correctamente.
        """
        # Simular un archivo de imagen
        photo = SimpleUploadedFile("test_image.jpg", b"file_content", content_type="image/jpeg")

        response = self.client.put(self.url, {'photo': photo}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('profilePhotoUrl', response.data)

    def test_upload_profile_photo_no_file(self):
        """
        Verifica que se devuelva un error si no se proporciona una foto.
        """
        response = self.client.put(self.url, {}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)


class GetAllUsersTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear usuarios de prueba
        User.objects.create_user(first_name="John", last_name="Doe", email="john@example.com", password="TestPassword123!")
        User.objects.create_user(first_name="Jane", last_name="Smith", email="jane@example.com", password="TestPassword123!")
        User.objects.create_user(first_name="Alice", last_name="Johnson", email="alice@example.com", password="TestPassword123!")

        # URL del endpoint
        self.url = reverse('get-all-users')

    def test_get_all_users_success(self):
        """
        Verifica que se obtenga correctamente la lista de usuarios.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar que la lista tenga 3 usuarios
        self.assertEqual(len(response.data), 3)

        # Verificar que los datos del primer usuario sean correctos
        self.assertEqual(response.data[0]['name'], "John Doe")
        self.assertEqual(response.data[0]['email'], "john@example.com")

    def test_get_all_users_empty(self):
        """
        Verifica que el comportamiento sea correcto cuando no hay usuarios.
        """
        User.objects.all().delete()  # Eliminar todos los usuarios
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar que la lista esté vacía
        self.assertEqual(len(response.data), 0)


class DeleteUserTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear usuarios de prueba
        self.user = User.objects.create_user(first_name="John", last_name="Doe", email="john@example.com", password="TestPassword123!")
        self.other_user = User.objects.create_user(first_name="Jane", last_name="Smith", email="jane@example.com", password="TestPassword123!")

        # URL del endpoint
        self.url = reverse('delete-user', args=[self.user.id])

    def test_delete_user_success(self):
        """
        Verifica que el usuario se elimine correctamente.
        """
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

        # Verificar que el usuario ha sido eliminado
        self.assertFalse(User.objects.filter(id=self.user.id).exists())

    def test_delete_user_not_found(self):
        """
        Verifica que se devuelva un error si el usuario no existe.
        """
        invalid_url = reverse('delete-user', args=[9999])  # Un ID que no existe
        response = self.client.delete(invalid_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)


class UpdateUserTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear usuario y detalles de prueba
        self.user = User.objects.create_user(first_name="John", last_name="Doe", email="john@example.com", password="TestPassword123!")
        self.user_details = UserDetails.objects.create(
            user=self.user,
            height=175,
            weight=85,
            weight_goal="Mantener peso",
            weekly_training_days=3,
            physical_activity_level="Sedentario"
        )

        # URL del endpoint
        self.url = reverse('update-user')

    def test_update_user_success(self):
        """
        Verifica que el usuario se actualice correctamente.
        """
        data = {
            "id": self.user.id,
            "firstName": "John Updated",
            "lastName": "Doe Updated",
            "currentWeight": 75,
            "weightGoal": "Perder peso",
            "activityLevel": "Moderada",
            "trainingFrequency": 5
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

        # Verificar que los datos del usuario se actualizaron
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "John Updated")
        self.assertEqual(self.user.last_name, "Doe Updated")
        self.assertEqual(self.user.details.weight, 75)
        self.assertEqual(self.user.details.weight_goal, "Perder peso")
        self.assertEqual(self.user.details.physical_activity_level, "Moderada")
        self.assertEqual(self.user.details.weekly_training_days, 5)

    def test_update_user_not_found(self):
        """
        Verifica que se devuelva un error si el usuario no existe.
        """
        data = {
            "id": 9999,
            "firstName": "Non Existing User",
            "lastName": "Last Name",
            "currentWeight": 70,
            "weightGoal": "Perder peso",
            "activityLevel": "Moderada",
            "trainingFrequency": 5
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)

    def test_update_user_missing_fields(self):
        """
        Verifica que se devuelva un error si faltan campos obligatorios.
        """
        data = {
            "id": self.user.id,
            "firstName": "John Updated"
        }
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

class GetUserByEmailTestCase(APITestCase):

    def setUp(self):
        """
        Configuración inicial antes de cada test.
        """
        # Crear un usuario de prueba
        self.user = User.objects.create_user(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            password="TestPassword123!"
        )

        # URL del endpoint
        self.url = reverse('get-user-by-email', args=[self.user.email])

    def test_get_user_by_email_success(self):
        """
        Verifica que se obtenga el usuario correctamente por correo electrónico.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.user.id)
        self.assertEqual(response.data['first_name'], "John")
        self.assertEqual(response.data['last_name'], "Doe")
        self.assertEqual(response.data['email'], "john.doe@example.com")

    def test_get_user_by_email_not_found(self):
        """
        Verifica que se devuelva un error si el usuario no existe.
        """
        url = reverse('get-user-by-email', args=['nonexistent@example.com'])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)