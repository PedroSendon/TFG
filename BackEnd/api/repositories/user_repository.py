from datetime import datetime
from api.models.macros import MealPlan, UserNutritionPlan
from api.models.workout import UserWorkout, Workout
from api.models import User
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import check_password, make_password
from api.models.User import  User, UserDetails, DietPreferences, MedicalConditions, TrainingPreferences
from api.models.process import ProgressTracking
from django.db.models.functions import TruncMonth
from django.db.models import Count


class UserRepository:
    @staticmethod
    def create_user(user_data):
        """
        Crear un nuevo usuario en la base de datos.
        :param user_data: Diccionario con los datos del usuario.
        :return: El objeto usuario creado.
        """
        try:
            user = User.objects.create(
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                email=user_data['email'],
                password=user_data['password'],  # Asegúrate de que la contraseña esté hasheada
                birth_date=user_data['birth_date'],
                gender=user_data['gender'],
                role=user_data.get('role', 'cliente')  # Asignar el rol, por defecto "cliente"
            )
            return user
        except Exception as e:
            raise ValueError(f"Error creando usuario: {e}")

    @staticmethod
    def get_user_by_id(user_id):
        """
        Obtener un usuario por su ID.
        :param user_id: ID del usuario.
        :return: El objeto usuario si existe, None en caso contrario.
        """
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @staticmethod
    def get_user_by_email(email):
        """
        Busca un usuario por email.
        :param email: Correo electrónico del usuario.
        :return: El objeto usuario completo si existe, None en caso contrario.
        """
        try:
            user = User.objects.get(email=email)
            return {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "birth_date": user.birth_date,
                "gender": user.gender,
                "profile_photo": user.profile_photo.url if user.profile_photo else None
            }
        except user.DoesNotExist:
            return None
        
    @staticmethod
    def get_user_profile(user_id):
        """
        Obtener los datos del perfil del usuario.
        :param user_id: ID del usuario.
        :return: Los datos del perfil del usuario.
        """
        try:
            user = User.objects.get(id=user_id)
            
            # Intentar obtener los detalles del usuario
            try:
                user_details = user.details
            except UserDetails.DoesNotExist:
                # Si no existen detalles, devolver valores predeterminados o manejar la ausencia
                user_details = None
            
            profile_data = {
                "username": f"{user.first_name} {user.last_name}",
                "email": user.email,
                "age": UserDetailsRepository.calculate_age(user.birth_date),
                "height": user_details.height if user_details else 0,
                "initialWeight": user_details.weight if user_details else 0.0,
                "currentWeight": user_details.weight if user_details else 0.0,
                "weightGoal": user_details.weight_goal if user_details else 0.0,
                "activityLevel": user_details.physical_activity_level if user_details else "No info",
                "trainingFrequency": user_details.weekly_training_days if user_details else 0
            }
            
            return profile_data
        except User.DoesNotExist:
            return None
        
    @staticmethod
    def user_exists_by_email(email):
        """
        Verifica si un usuario con el email proporcionado ya existe.
        :param email: Correo electrónico del usuario.
        :return: True si existe, False en caso contrario.
        """
        return User.objects.filter(email=email).exists()


    @staticmethod
    def authenticate_user(email, password):
        """
        Autenticar un usuario basado en el correo y contraseña.
        :param email: Correo del usuario.
        :param password: Contraseña del usuario.
        :return: El usuario si las credenciales son correctas, None si no lo son.
        """
        try:
            user = User.objects.get(email=email)
            if check_password(password, user.password):
                return user
            else:
                return None
        except User.DoesNotExist:
            return None

    @staticmethod
    def assign_workout_to_user(user_id, workout_id):
        """
        Asigna un plan de entrenamiento a un usuario.
        """
        try:
            user = User.objects.get(id=user_id)
            workout = Workout.objects.get(id=workout_id)

            # Crear la relación entre el usuario y el entrenamiento
            UserWorkout.objects.create(user=user, workout=workout)
            return True, "Plan de entrenamiento asignado exitosamente."
        
        except User.DoesNotExist:
            return False, "Usuario no encontrado."
        except Workout.DoesNotExist:
            return False, "Plan de entrenamiento no encontrado."
        except Exception as e:
            return False, str(e)

    @staticmethod
    def assign_nutrition_plan_to_user(user_id, plan_id):
        """
        Asigna un plan nutricional a un usuario.
        """
        try:
            user = User.objects.get(id=user_id)
            nutrition_plan = MealPlan.objects.get(id=plan_id)

            # Crear la relación entre el usuario y el plan nutricional
            UserNutritionPlan.objects.create(user=user, plan=nutrition_plan)
            return True, "Plan nutricional asignado exitosamente."
        
        except User.DoesNotExist:
            return False, "Usuario no encontrado."
        except MealPlan.DoesNotExist:
            return False, "Plan nutricional no encontrado."
        except Exception as e:
            return False, str(e)        

class UserDetailsRepository:
    
    @staticmethod
    def create_user_details(user, details_data):
        """
        Crear o actualizar los detalles de un usuario.
        """
        try:
            # Guardar los detalles generales
            user_details, created = UserDetails.objects.update_or_create(
                user=user,
                defaults={
                    'height': details_data['height'],
                    'weight': details_data['weight'],
                    'weight_goal': details_data['weight_goal'],
                    'weight_change_amount': details_data.get('weight_change_amount'),
                    'weekly_training_days': details_data['weekly_training_days'],
                    'daily_training_time': details_data['daily_training_time'],
                    'physical_activity_level': details_data['physical_activity_level'],
                    'current_training_days': details_data['current_training_days']
                }
            )

            # Guardar preferencias de dieta
            diet_preferences, created = DietPreferences.objects.update_or_create(
                user=user,
                defaults={
                    'diet_type': details_data['diet_type'],
                    'meals_per_day': details_data['meals_per_day'],
                    'macronutrient_intake': details_data['macronutrient_intake'],
                    'food_restrictions': details_data.get('food_restrictions'),
                    'custom_food_restrictions': details_data.get('custom_food_restrictions')
                }
            )

            # Guardar condiciones médicas
            medical_conditions, created = MedicalConditions.objects.update_or_create(
                user=user,
                defaults={
                    'medical_condition': details_data['medical_condition'],
                    'custom_medical_condition': details_data.get('custom_medical_condition')
                }
            )

            # Guardar preferencias de entrenamiento
            training_preferences, created = TrainingPreferences.objects.update_or_create(
                user=user,
                defaults={
                    'available_equipment': details_data['available_equipment'],
                    'training_preference': details_data['training_preference']
                }
            )

            return user_details, diet_preferences, medical_conditions, training_preferences

        except Exception as e:
            raise ValueError(f"Error al crear o actualizar los detalles del usuario: {e}")


    @staticmethod
    def get_user_profile(user_id):
        """
        Obtener los datos del perfil del usuario.
        :param user_id: ID del usuario.
        :return: Los datos del perfil del usuario.
        """
        try:
            user = User.objects.get(id=user_id)
            user_details = user.details  # Asegurarse de que exista el perfil de detalles

            profile_data = {
                "username": f"{user.first_name} {user.last_name}",
                "email": user.email,
                "age": UserRepository.calculate_age(user.birth_date),
                "height": user_details.height,
                "initialWeight": user_details.weight,
                "currentWeight": user_details.weight,  # Suponiendo que `weight` es el peso actual, podría ser separado
                "weightGoal": user_details.weight_goal,
                "activityLevel": user_details.physical_activity_level,
                "trainingFrequency": user_details.weekly_training_days
            }
            
            return profile_data
        except user.DoesNotExist:
            return None
    
    @staticmethod
    def calculate_age(birth_date):
        """
        Calcular la edad de un usuario basado en su fecha de nacimiento.
        :param birth_date: Fecha de nacimiento del usuario.
        :return: Edad calculada.
        """
        from datetime import date
        today = date.today()
        return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    
    @staticmethod
    def get_weight_history(user_id):
        """
        Obtener el historial de peso del usuario.
        :param user_id: ID del usuario.
        :return: Lista de registros de peso con fecha.
        """
        try:
            # Filtrar por el usuario y ordenar por fecha ascendente para mostrar el historial cronológicamente
            weight_history = ProgressTracking.objects.filter(user_id=user_id).order_by('date')

            # Convertir el historial a un formato adecuado
            history_data = [
                {
                    "day": record.date.strftime("%d/%m"),
                    "weight": record.weight
                } for record in weight_history if record.weight is not None
            ]

            return history_data
        except ProgressTracking.DoesNotExist:
            return None
        
    @staticmethod
    def update_user_profile(user_id, profile_data):
        """
        Actualizar la información del perfil del usuario.
        :param user_id: ID del usuario.
        :param profile_data: Diccionario con los datos actualizados del perfil.
        :return: Los datos actualizados del perfil del usuario o None si no se encontró el usuario.
        """
        try:
            # Obtener el usuario y sus detalles
            user = User.objects.get(id=user_id)
            user_details = user.details

            # Actualizar los campos básicos
            user.first_name = profile_data.get('firstName', user.first_name)
            user.last_name = profile_data.get('lastName', user.last_name)
            user.save()

            # Actualizar los detalles del usuario
            user_details.weight = profile_data.get('currentWeight', user_details.weight)
            user_details.weight_goal = profile_data.get('weightGoal', user_details.weight_goal)
            user_details.physical_activity_level = profile_data.get('activityLevel', user_details.physical_activity_level)
            user_details.weekly_training_days = profile_data.get('trainingFrequency', user_details.weekly_training_days)
            user_details.save()

            return {
                "username": f"{user.first_name} {user.last_name}",
                "currentWeight": user_details.weight,
                "weightGoal": user_details.weight_goal,
                "activityLevel": user_details.physical_activity_level,
                "trainingFrequency": user_details.weekly_training_days
            }

        except user.DoesNotExist:
            return None

    @staticmethod
    def change_user_password(user_id, current_password, new_password, confirm_password):
        """
        Cambiar la contraseña del usuario.
        :param user_id: ID del usuario.
        :param current_password: Contraseña actual del usuario.
        :param new_password: Nueva contraseña.
        :param confirm_password: Confirmación de la nueva contraseña.
        :return: True si la contraseña fue cambiada, False si no.
        """
        try:
            # Obtener el usuario
            user = User.objects.get(id=user_id)

            # Verificar que la contraseña actual es correcta
            if not check_password(current_password, user.password):
                return {"error": "La contraseña actual es incorrecta."}

            # Verificar que las nuevas contraseñas coinciden
            if new_password != confirm_password:
                return {"error": "Las nuevas contraseñas no coinciden."}

            # Validar que la nueva contraseña no sea igual a la actual
            if check_password(new_password, user.password):
                return {"error": "La nueva contraseña no puede ser igual a la actual."}

            # Cambiar la contraseña
            user.password = make_password(new_password)
            user.save()

            return {"success": "La contraseña ha sido cambiada exitosamente."}

        except user.DoesNotExist:
            return {"error": "Usuario no encontrado."}
        
    @staticmethod
    def update_profile_photo(user_id, photo):
        """
        Subir o actualizar la foto de perfil del usuario.
        :param user_id: ID del usuario.
        :param photo: Archivo de imagen.
        :return: Los datos actualizados del perfil del usuario, incluyendo la URL de la foto.
        """
        try:
            user = User.objects.get(id=user_id)

            # Actualizar la foto de perfil
            user.profile_photo = photo
            user.save()

            return {
                "username": f"{user.first_name} {user.last_name}",
                "profilePhotoUrl": user.profile_photo.url if user.profile_photo else None
            }

        except user.DoesNotExist:
            return None
        
    @staticmethod
    def get_all_users():
        """
        Obtener la lista de usuarios con información básica.
        :return: Lista de usuarios con id, nombre y correo.
        """
        users = User.objects.all()

        # Crear una lista con los usuarios y su información básica
        user_data = [
            {
                "id": user.id,
                "name": f"{user.first_name} {user.last_name}",
                "email": user.email
            }
            for user in users
        ]

        return user_data
    
    @staticmethod
    def delete_user_by_id(user_id):
        """
        Eliminar un usuario y sus relaciones.
        """
        try:
            user = User.objects.get(id=user_id)
            # Si hay alguna relación `on_delete=models.CASCADE`, esto se hará automáticamente.
            # Si tienes relaciones `on_delete=models.PROTECT` o `SET_NULL`, deberás manejarlo manualmente.
            user.delete()
            return True
        except User.DoesNotExist:
            return False

        
    @staticmethod
    def get_monthly_user_growth(year=None):
        """
        Obtener el número de nuevos usuarios registrados por mes durante el año seleccionado.
        :param year: Año para filtrar los datos.
        :return: Una lista de diccionarios con el mes y el número de nuevos usuarios.
        """
        if year is None:
            year = datetime.now().year

        # Filtrar los usuarios registrados en el año y agrupar por mes
        monthly_growth = (
            User.objects
            .filter(date_joined__year=year)
            .annotate(month=TruncMonth('date_joined'))
            .values('month')
            .annotate(new_users=Count('id'))
            .order_by('month')
        )

        # Convertir el resultado a una lista de diccionarios con el formato deseado
        month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        return [{"month": month_names[entry['month'].month - 1], "newUsers": entry['new_users']} for entry in monthly_growth]
    
    