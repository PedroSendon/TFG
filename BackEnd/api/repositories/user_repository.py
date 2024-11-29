from datetime import datetime
from typing import Dict

from pydantic import ValidationError
from api.schemas.user import UserAdminCreate
from api.models.macros import MealPlan, UserNutritionPlan
from api.models.workout import UserWorkout, Imagen, WeeklyWorkout
from api.models.trainingplan import TrainingPlan
from django.contrib.auth.hashers import check_password, make_password
from api.models.user import User, UserDetails, DietPreferences, WeightRecord
from api.models.process import ProgressTracking
from django.db.models.functions import TruncMonth
from django.db.models import Count
from rest_framework import status
from rest_framework.response import Response 


class UserRepository:

    @staticmethod
    def get_unassigned_users_for_admin(user):
        """
        Devuelve usuarios con los estados 'awaiting_assignment', 'training_only', o 'nutrition_only'
        y especifica qué tipo de plan necesitan.
        """
        if not isinstance(user, User):
            user = User.objects.get(id=user.id)
        
        # Verificar que el rol del usuario sea 'administrador'
        if user.role == 'administrador':
            users = User.objects.filter(status__in=['awaiting_assignment', 'training_only', 'nutrition_only'])
            unassigned_users_data = []

            for user in users:
                plan_type_needed = []
                if user.status == 'awaiting_assignment':
                    plan_type_needed = ['nutrition', 'training']
                elif user.status == 'training_only':
                    plan_type_needed = ['nutrition']
                elif user.status == 'nutrition_only':
                    plan_type_needed = ['training']
                
                unassigned_users_data.append({
                    'id': user.id,
                    'name': f"{user.first_name} {user.last_name}",
                    'email': user.email,
                    'status': user.status,
                    'profile_photo': user.profile_photo if user.profile_photo else None,
                    'plans_needed': plan_type_needed
                })
            
            return unassigned_users_data
        else:
            return {"error": "No tienes permiso para ver esta información.", "status": status.HTTP_403_FORBIDDEN}

    @staticmethod
    def get_unassigned_users_for_nutrition(user):
        """
        Devuelve usuarios con los estados 'awaiting_assignment' o 'training_only'
        para asignación de planes de nutrición.
        """
        if not isinstance(user, User):
            user = User.objects.get(id=user.id)
        
        # Verificamos que el rol sea 'nutricionista' en lugar de 'entrenador'
        if user.role == 'nutricionista':
            return User.objects.filter(status__in=['awaiting_assignment', 'training_only'])
        else:
            return {"error": "No tienes permiso para ver esta información.", "status": status.HTTP_403_FORBIDDEN}


    @staticmethod
    def get_unassigned_users_for_training(user):
        """
        Devuelve usuarios con los estados 'awaiting_assignment' o 'nutrition_only'
        para asignación de planes de entrenamiento.
        """
        if not isinstance(user, User):
            user = User.objects.get(id=user.id)

        # Verificamos que el rol sea 'entrenador' en lugar de 'nutricionista'
        if user.role == 'entrenador':
            return User.objects.filter(status__in=['awaiting_assignment', 'nutrition_only'])
        else:
            return {"error": "No tienes permiso para ver esta información.", "status": status.HTTP_403_FORBIDDEN}



    @staticmethod
    def get_user_role(user_id):
        """
        Obtener el rol de un usuario.
        """
        try:
            user = User.objects.get(id=user_id)
            return {"role": user.role}
        except User.DoesNotExist:
            return None
        
    @staticmethod
    def get_user_plans(user_id):
        """
        Obtener el MealPlan y el TrainingPlan asignados a un usuario.
        """
        try:
            
            user = User.objects.get(id=user_id)
            # Obtener el plan de comidas (MealPlan)
            meal_plan = user.user_nutrition_plans.plan if hasattr(user, 'user_nutrition_plans') else None

            # Obtener el último plan de entrenamiento (TrainingPlan)
            user_workout = user.user_workouts.last()  # Obtener el último UserWorkout si hay varios
            training_plan = user_workout.training_plan if user_workout else None

            return {
                "meal_plan": {
                    "id": meal_plan.id,
                    "name": meal_plan.name,
                    "diet_type": meal_plan.diet_type,
                    "calories": meal_plan.calories,
                    "proteins": meal_plan.proteins,
                    "carbs": meal_plan.carbs,
                    "fats": meal_plan.fats,
                    "description": meal_plan.description,
                    "meal_distribution": meal_plan.meal_distribution,
                } if meal_plan else None,
                "training_plan": {
                    "id": training_plan.id,
                    "name": training_plan.name,
                    "description": training_plan.description,
                    "difficulty": training_plan.difficulty,
                    "equipment": training_plan.equipment,
                    "duration": training_plan.duration,
                } if training_plan else None
            }
        except User.DoesNotExist:
            return None

    @staticmethod
    def remove_training_plan_from_user(user_id, current_user):
        try:
            user = User.objects.get(id=user_id)
            if not user.user_workouts.exists():  # Verificar si el usuario tiene un plan asignado
                return False, "El usuario no tiene un plan de entrenamiento asignado.", status.HTTP_404_NOT_FOUND
            user.user_workouts.all().delete()  # Eliminar todas las instancias de UserWorkout asociadas al usuario
            if user.status == 'training_only':
                user.status = 'awaiting_assignment'
                user.save()
            if user.status == 'assigned':
                user.status = 'nutrition_only'
                user.save()
            return True, "Plan de entrenamiento eliminado exitosamente.", status.HTTP_200_OK
        except User.DoesNotExist:
            return False, "Usuario no encontrado.", status.HTTP_404_NOT_FOUND

    @staticmethod
    def remove_nutrition_plan_from_user(user_id, current_user):
        try:
            user = User.objects.get(id=user_id)
            if not hasattr(user, 'user_nutrition_plans'):  # Verificar si el usuario tiene un plan de nutrición
                return False, "El usuario no tiene un plan nutricional asignado.", status.HTTP_404_NOT_FOUND
            user.user_nutrition_plans.delete()  # Eliminar la relación con el plan de nutrición
            if user.status == 'nutrition_only':
                user.status = 'awaiting_assignment'
                user.save()
            if user.status == 'assigned':
                user.status = 'training_only'
                user.save() 
            return True, "Plan nutricional eliminado exitosamente.", status.HTTP_200_OK
        except User.DoesNotExist:
            return False, "Usuario no encontrado.", status.HTTP_404_NOT_FOUND

    @staticmethod
    def get_user_status(user_id):
        try:
            user = User.objects.get(id=user_id)
            return user.status
        except User.DoesNotExist:
            return None

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
                password=make_password(user_data['password']),  # Hash de la contraseña
                birth_date=user_data['birth_date'],
                gender=user_data['gender'],
                role=user_data.get('role', 'cliente'),  # Rol por defecto "cliente"
                is_active=True,  # El usuario está activo por defecto
            )
            return user
        except Exception as e:
            raise ValueError(f"Error creando usuario: {e}")

    @staticmethod
    def update_user_details(user_id, data, request_user):
        try:
            # Verificar si el usuario tiene permisos
            if not isinstance(request_user, User):
                request_user = User.objects.get(id=request_user.id)

            if request_user.role not in ['administrador', 'entrenador', 'nutricionista']:
                return False, "No tienes permisos para modificar usuarios"
            
            # Obtener el usuario a modificar
            user = UserRepository.get_user_by_id(user_id)
            if not user:
                return False, "Usuario no encontrado"

            # Actualizar los datos del usuario
            user.first_name = data.get('first_name', user.first_name)
            user.last_name = data.get('last_name', user.last_name)
            user.role = data.get('role', user.role)
            user.save()

            # Obtener o crear `UserDetails` y asignar valores predeterminados si es necesario
            user_details, created = UserDetails.objects.get_or_create(
                user=user,
                defaults={
                    'height': 170,  # Valor predeterminado
                    'weight_goal': "maintain",
                    'physical_activity_level': "sedentary",
                    'weekly_training_days': 3,
                    'weight': 70.0
                }
            )
            
            weight_goal_map = {
                "Ganar masa muscular": "gain_muscle",
                "Perder peso": "lose_weight",
                "Mantenimiento": "maintain"
            }
            # Asignar valores desde `data` o mantener los actuales
            user_details.height = data.get('height') or user_details.height
            user_details.weight_goal = weight_goal_map.get(data.get('weightGoal'), user_details.weight_goal)
            user_details.physical_activity_level = data.get('activityLevel', user_details.physical_activity_level)
            user_details.weekly_training_days = data.get('trainingFrequency', user_details.weekly_training_days)

            # Guardar el peso actualizado
            new_weight = data.get('currentWeight', user_details.weight)
            user_details.weight = new_weight
            print(f"Detalles del usuario antes de guardar: {user_details.__dict__}")  # Depuración
            user_details.save()

            # Crear un nuevo registro de peso si el peso actual fue modificado
            if new_weight:
                WeightRecord.objects.create(user=user, weight=new_weight)

            return True, "Usuario y detalles actualizados exitosamente."

        except Exception as e:
            print(f"Error al actualizar el usuario: {e}")
            return False, "Error al actualizar el usuario."


    @staticmethod
    def create_user_as_admin(admin_user, user_data):
        """
        Crear un nuevo usuario en la base de datos desde el modo administrador.
        :param admin_user: Usuario que realiza la solicitud (debe ser administrador).
        :param user_data: Diccionario con los datos del nuevo usuario.
        :return: Un diccionario con el mensaje de éxito o error y el código de estado.
        """
        try:
            if not isinstance(admin_user, User):
                admin_user = User.objects.get(id=admin_user.id)
            # Verificar permisos de administrador
            if admin_user.role != 'administrador':
                return {"error": "No tienes permisos para crear usuarios", "status": status.HTTP_403_FORBIDDEN}

            # Validar los datos recibidos
            try:
                user_data_validated = UserAdminCreate(**user_data)
            except ValidationError as e:
                return {"error": f"Error de validación: {e.errors()}", "status": status.HTTP_400_BAD_REQUEST}

            # Verificar si el usuario ya existe por email
            if UserRepository.user_exists_by_email(user_data_validated.email):
                return {"error": "El usuario con este correo electrónico ya existe.", "status": status.HTTP_400_BAD_REQUEST}

            # Hash de la contraseña
            user_data_validated.password = make_password(user_data_validated.password)

            # Asignar el rol (cliente por defecto si no se proporciona)
            role = user_data.get('role', 'cliente')

            # Crear el usuario en la base de datos
            user = User.objects.create(
                first_name=user_data_validated.first_name,
                last_name=user_data_validated.last_name,
                email=user_data_validated.email,
                password=user_data_validated.password,
                birth_date=user_data_validated.birth_date,
                gender=user_data_validated.gender,
                role=role
            )

            return {"data": user, "status": status.HTTP_201_CREATED}
        
        except Exception as e:
            return {"error": f"Error creando usuario: {str(e)}", "status": status.HTTP_400_BAD_REQUEST}

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
        :return: Datos serializados del usuario si existe, None en caso contrario.
        """
        try:
            user = User.objects.get(email=email)
            return user
        except User.DoesNotExist:
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
                # Cambiado para usar el valor de la opción
                "weightGoal": user_details.weight_goal if user_details else "No goal set",
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
            if check_password(password, user.password):  # Validación de contraseña
                return user
            return None
        except User.DoesNotExist:
            return None

    @staticmethod
    def assign_concret_training_plan_to_user(user_id, training_plan_id, request_user):
        try:
            training_plan = TrainingPlan.objects.get(id=training_plan_id)
        except TrainingPlan.DoesNotExist:
            return False, "Plan de entrenamiento no encontrado.", status.HTTP_404_NOT_FOUND

        check_result = UserRepository.check_user_role(request_user, ['administrador', 'entrenador'])
        if "error" in check_result:
            return False, check_result["error"], status.HTTP_403_FORBIDDEN

        try:
            user = User.objects.get(id=user_id)
            UserWorkout.objects.filter(user=user).delete()
            user_workout = UserWorkout.objects.create(user=user, training_plan=training_plan)

            for workout in training_plan.workouts.all():
                WeeklyWorkout.objects.create(user_workout=user_workout, workout=workout, completed=False)

            user.status = 'assigned' if UserNutritionPlan.objects.filter(user=user).exists() else 'training_only'
            user.save()
            return True, "Plan de entrenamiento asignado exitosamente.", status.HTTP_200_OK

        except User.DoesNotExist:
            return False, "Usuario no encontrado.", status.HTTP_404_NOT_FOUND
        except Exception as e:
            return False, str(e), status.HTTP_400_BAD_REQUEST


    @staticmethod
    def assign_concret_nutrition_plan_to_user(user_id, plan_id, request_user):
        check_result = UserRepository.check_user_role(request_user, ['administrador', 'nutricionista'])
        if "error" in check_result:
            return False, "No tienes permisos para realizar esta acción", status.HTTP_403_FORBIDDEN  # Quitar el espacio extra

        try:
            nutrition_plan = MealPlan.objects.get(id=plan_id)
            user = User.objects.get(id=user_id)
            UserNutritionPlan.objects.filter(user=user).delete()
            UserNutritionPlan.objects.create(user=user, plan=nutrition_plan)

            user.status = 'assigned' if UserWorkout.objects.filter(user=user).exists() else 'nutrition_only'
            user.save()
            return True, "Plan nutricional asignado exitosamente.", status.HTTP_200_OK

        except MealPlan.DoesNotExist:
            return False, "Plan nutricional no encontrado.", status.HTTP_404_NOT_FOUND
        except User.DoesNotExist:
            return False, "Usuario no encontrado.", status.HTTP_404_NOT_FOUND
        except Exception as e:
            return False, str(e), status.HTTP_400_BAD_REQUEST




    @staticmethod
    def check_user_role(user, allowed_roles):
        if not isinstance(user, User):
            try:
                user = User.objects.get(id=user if isinstance(user, int) else user.id)
            except User.DoesNotExist:
                return {"error": "Usuario no encontrado.", "status": status.HTTP_404_NOT_FOUND}

        if user.role not in allowed_roles:
            return {"error": "No tienes permisos para realizar esta acción.", "status": status.HTTP_403_FORBIDDEN}

        return {"user": user}


    @staticmethod
    def get_user_by_id2(user_id, request_user):
        """
        Obtener un usuario por su ID.
        :param user_id: ID del usuario.
        :param request_user: Usuario que realiza la solicitud.
        :return: Diccionario con los datos del usuario o None si no existe.
        """
        try:
            if not isinstance(request_user, User):
                request_user = User.objects.get(id=request_user.id)

            if request_user.role not in ['administrador', 'entrenador', 'nutricionista']:
                return {"error": "No tienes permisos para ver esta información.", "status": status.HTTP_403_FORBIDDEN}
            
            user = User.objects.get(id=user_id)
            details = user.details if hasattr(user, 'details') else None

            return {
                "first_name": user.first_name,
                "last_name": user.last_name,
                "current_weight": details.weight if details else None,
                "weight_goal": details.weight_goal if details else None,
                "activity_level": details.physical_activity_level if details else None,
                "training_frequency": details.weekly_training_days if details else None,
                "role": user.role,
                "status": user.status,
                "email": user.email,
                "profile_photo": user.profile_photo.url if user.profile_photo else None,
            }
        except User.DoesNotExist:
            return None

    """
    @staticmethod
    def complete_user_registration(user):
        Completa el proceso de registro del usuario asignando entrenamiento y plan nutricional.
        workout_assigned, workout_message = UserRepository.assign_training_plan_to_user(
            user)
        nutrition_assigned, nutrition_message = UserRepository.assign_nutrition_plan_to_user(
            user)

        if workout_assigned and nutrition_assigned:
            return True, f"Registro completado. {workout_message} {nutrition_message}"
        else:
            return False, f"Error durante la asignación. {workout_message} {nutrition_message}"

    @staticmethod
    def assign_nutrition_plan_to_user(user):
        Asigna un plan nutricional adecuado basado en el peso, objetivo de calorías y preferencias del usuario.
      
        try:
            # Calcular los gramos de proteínas que necesita el usuario (por ejemplo, 2-2.2g por kg de peso)
            proteins_needed = user.details.weight * 2

            # Filtrar los planes nutricionales basados en las calorías y proteínas calculadas
            nutrition_plans = MealPlan.objects.filter(
                Q(kcal__gte=user.details.daily_calories - 200,
                  kcal__lte=user.details.daily_calories + 200),  # Calorías aproximadas
                Q(proteins__gte=proteins_needed - 10,
                  proteins__lte=proteins_needed + 10),  # Proteínas adecuadas
                diet_type=user.details.weight_goal  # Tipo de dieta del usuario 
            )

            # Seleccionar el plan nutricional más adecuado
            if nutrition_plans.exists():
                plan = nutrition_plans.first()
                UserNutritionPlan.objects.create(user=user, plan=plan)
                return True, f"Plan nutricional '{plan.diet_type}' asignado exitosamente al usuario {user.first_name}."
            else:
                return False, "No se encontró un plan nutricional adecuado para el usuario."

        except Exception as e:
            return False, str(e)
    
    @staticmethod
    def assign_training_plan_to_user(user):
       
        Asigna un plan de entrenamiento adecuado a un usuario basándose en su actividad física,
        preferencias de entrenamiento y equipo disponible.
      
        print("Assigning training plan to user...")
        try:
            # Filtrar planes de entrenamiento según los días semanales, la duración diaria, el equipo disponible y la preferencia de entrenamiento
            training_plans = TrainingPlan.objects.filter(
                # Filtrar planes de igual o menor duración diaria
                duration__lte=user.details.daily_training_time,
                # Filtrar planes según el equipo disponible
                equipment__in=user.details.available_equipment,
            )

            # Asignar el plan de entrenamiento basado en el nivel de actividad física del usuario
            if user.details.physical_activity_level == 'sedentaria':
                plan = training_plans.filter(difficulty='sedentaria').first()
            elif user.details.physical_activity_level == 'ligera':
                plan = training_plans.filter(difficulty='ligera').first()
            elif user.details.physical_activity_level == 'moderada':
                plan = training_plans.filter(difficulty='moderada').first()
            else:
                plan = training_plans.filter(difficulty='intensa').first()

            # Asignar el plan de entrenamiento encontrado al usuario
            if plan:
                # Crear una instancia de UserWorkout asignando el TrainingPlan completo
                UserWorkout.objects.create(user=user, training_plan=plan)

                return True, f"Plan de entrenamiento '{plan.name}' asignado exitosamente al usuario {user.first_name}."
            else:
                return False, "No se encontró un plan de entrenamiento adecuado para las preferencias del usuario."

        except Exception as e:
            return False, str(e)
    """

    @staticmethod
    def get_user_all_details(user_id):
        try:
            user = UserRepository.get_user_by_id(user_id)
            if not isinstance(user, User):
                user = User.objects.get(id=user.id)

            # Obtener detalles del usuario y preferencias de dieta
            user_data = User.objects.select_related('details', 'diet_preferences').filter(id=user.id).first()
            if not user_data:
                return None

            # Calcular la edad usando la fecha de nacimiento
            age = UserDetailsRepository.calculate_age(user_data.birth_date)

            # Obtener registros de peso del usuario
            weight_records = user_data.weight_records.all().values('weight', 'date')

            # Estructurar los datos esenciales en un diccionario
            user_details = {
                'id': user_data.id,
                'first_name': user_data.first_name,
                'last_name': user_data.last_name,
                'email': user_data.email,
                'birth_date': user_data.birth_date,
                'age': age,
                'gender': user_data.gender,
                'profile_photo': user_data.profile_photo if user_data.profile_photo else None,
                'status': user_data.status,
                'role': user_data.role,

                # User Details
                'details': {
                    'height': user_data.details.height if user_data.details else None,
                    'weight': user_data.details.weight if user_data.details else None,
                    'weight_goal': user_data.details.weight_goal if user_data.details else None,
                    'weekly_training_days': user_data.details.weekly_training_days if user_data.details else None,
                    'daily_training_time': user_data.details.daily_training_time if user_data.details else None,
                    'physical_activity_level': user_data.details.physical_activity_level if user_data.details else None,
                    'available_equipment': user_data.details.available_equipment if user_data.details else None,
                } if user_data.details else {
                    'height': None,
                    'weight': None,
                    'weight_goal': None,
                    'weekly_training_days': None,
                    'daily_training_time': None,
                    'physical_activity_level': None,
                    'available_equipment': None,
                },

                # Diet Preferences
                'diet_preferences': {
                    'diet_type': user_data.diet_preferences.diet_type if user_data.diet_preferences else None,
                    'meals_per_day': user_data.diet_preferences.meals_per_day if user_data.diet_preferences else None,
                } if user_data.diet_preferences else {
                    'diet_type': None,
                    'meals_per_day': None,
                },

                # Weight Records
                'weight_records': list(weight_records)  # Convertir los registros de peso a una lista de diccionarios
            }

            return user_details

        except Exception as e:
            print(f"Error fetching user details: {e}")
            return None




class UserDetailsRepository:

    # Función para traducir el tipo de dieta a inglés si está en español
    def translate_diet_type(diet_type):
        translations = {
            "Balanceado": "balanced",
            "Bajo en proteínas": "low_protein",
            "Bajo en carbohidratos": "low_carbs",
            "Bajo en grasas": "low_fats"
        }
        return translations.get(diet_type, diet_type)

    @staticmethod
    def translate_fields(details_data, reverse=False):
        translations = {
            'weight_goal': {
                'Ganar masa muscular': 'gain_muscle',
                'Perder peso': 'lose_weight',
                'Mantenimiento': 'maintain'
            },
            'physical_activity_level': {
                'Sedentario': 'sedentary',
                'Ligera': 'light',
                'Moderada': 'moderate',
                'Intensa': 'intense'
            },
            'available_equipment': {
                'Gimnasio Completo': 'gimnasio_completo',
                'Pesas Libres': 'pesas_libres',
                'Sin Equipamiento': 'sin_equipamiento'
            },
            'diet_type': {  # Añadimos diet_type
                'Balanceado': 'balanced',
                'Bajo en proteínas': 'low_protein',
                'Bajo en carbohidratos': 'low_carb',
                'Bajo en grasas': 'low_fat'
            }
        }

        # Iterar por cada campo definido en translations
        for field, mapping in translations.items():
            if field in details_data:
                if reverse:
                    # Traducción inversa (backend -> frontend)
                    reverse_mapping = {v: k for k, v in mapping.items()}
                    details_data[field] = reverse_mapping.get(details_data[field], details_data[field])
                else:
                    # Traducción normal (frontend -> backend)
                    if details_data[field] in mapping:
                        details_data[field] = mapping[details_data[field]]
                    elif not details_data[field]:
                        # Si el campo está vacío o no se envió, asignar un valor predeterminado
                        if field == 'diet_type':
                            details_data[field] = 'balanced'  # Valor predeterminado
        return details_data


    @staticmethod
    def create_user_details(user_id: int, data: Dict):
        """
        Crea o actualiza los detalles del usuario asociados a un usuario existente.
        :param user_id: ID del usuario
        :param data: Diccionario con los datos necesarios para UserDetails
        :return: Instancia de UserDetails creada o actualizada
        """
        user = User.objects.get(id=user_id)

        # Verificar si ya existen detalles del usuario
        user_details, created = UserDetails.objects.update_or_create(
                user=user,
                defaults={
                    'height': data['height'],
                    'weight': data['weight'],
                    'weight_goal': data['weight_goal'],
                    'weekly_training_days': data['weekly_training_days'],
                    'daily_training_time': data['daily_training_time'],
                    'physical_activity_level': data['physical_activity_level'],
                    'available_equipment': data['available_equipment'],
                }
            )
        # Guardar preferencias de dieta
        diet_preferences, created = DietPreferences.objects.update_or_create(
            user=user,
            defaults={
                'diet_type': data['diet_type'],
                'meals_per_day': data['meals_per_day']
            }
        )

        # Crear registro de peso inicial
        WeightRecordRepository.crear_registro_peso(user, data['weight'])

        return user_details, diet_preferences



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
                "age": UserDetailsRepository.calculate_age(user.birth_date),
                "height": user_details.height,
                "initialWeight": user_details.weight,
                # Suponiendo que `weight` es el peso actual, podría ser separado
                "currentWeight": user_details.weight,
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

            # Variables para verificar si `weightGoal` o `trainingFrequency` cambian
            weight_goal_changed = profile_data.get('weightGoal') != user_details.weight_goal
            training_frequency_changed = profile_data.get('trainingFrequency') != user_details.weekly_training_days

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

            # Verificar si hubo cambios en `weightGoal` o `trainingFrequency`
            if weight_goal_changed or training_frequency_changed:
                # Cambiar el status del usuario a 'awaiting_assignment'
                user.status = 'awaiting_assignment'
                user.save()

                # Eliminar asignaciones de planes actuales
                # Asumiendo que UserWorkout y UserNutritionPlan son las tablas que almacenan las asignaciones
                UserWorkout.objects.filter(user=user).delete()
                UserNutritionPlan.objects.filter(user=user).delete()

            return {
                "username": f"{user.first_name} {user.last_name}",
                "currentWeight": user_details.weight,
                "weightGoal": user_details.weight_goal,
                "activityLevel": user_details.physical_activity_level,
                "trainingFrequency": user_details.weekly_training_days
            }

        except User.DoesNotExist:
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
    def get_all_users(request_user):
        """
        Obtener la lista de usuarios con información básica.
        :return: Lista de usuarios con id, nombre y correo o un mensaje de error si el usuario no tiene permisos.
        """
        if not isinstance(request_user, User):
            request_user = User.objects.get(id=request_user.id)
        # Verificar si el usuario tiene el rol adecuado para ver esta información
        if request_user.role not in ['administrador', 'entrenador', 'nutricionista']:
            return {"error": "No tienes permisos para ver esta información."}

        # Obtener todos los usuarios y crear la lista con su información básica
        users = User.objects.all()
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
    def delete_user_by_id(user_id, request_user):
        """
        Eliminar un usuario y sus relaciones.
        """
        try:
            # Verificar si `request_user` tiene permisos de administrador
            if not isinstance(request_user, User):
                request_user = User.objects.get(id=request_user.id)

            if request_user.role != 'administrador':
                return False, "No tienes permisos para eliminar usuarios."
            
            # Intentar eliminar el usuario
            user = User.objects.get(id=user_id)
            user.delete()  # Eliminar el usuario y sus relaciones
            return True, "Usuario eliminado exitosamente."
            
        except User.DoesNotExist:
            return False, "Usuario no encontrado."


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
        month_names = ["Jan", "Feb", "Mar", "Apr", "May",
                       "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        return [{"month": month_names[entry['month'].month - 1], "newUsers": entry['new_users']} for entry in monthly_growth]


class ImagenRepository:
    @staticmethod
    def obtener_logo():
        """
        Obtiene el primer producto que contiene el logo.
        """
        return Imagen.objects.first()

class UserWorkoutRepository:

    @staticmethod
    def mark_workout_as_completed(user_id, workout_id):
        try:
            user_workout = UserWorkout.objects.get(user_id=user_id)
            workout = WeeklyWorkout.objects.get(user_workout=user_workout, workout_id=workout_id)
            workout.completed = True
            workout.save()

            # Verifica si todos los entrenamientos están completados
            UserWorkoutRepository.check_and_reset_all_workouts(user_workout)

            return {"message": "Workout marked as completed"}
        except WeeklyWorkout.DoesNotExist:
            # Devolver un mensaje con el error y el código 404
            return {"error": "Workout not found for the user"}, status.HTTP_404_NOT_FOUND


    @staticmethod
    def check_and_reset_all_workouts(user_workout):
        """
        Verifica si todos los entrenamientos del plan están completos.
        Si es así, los reinicia a incompletos para empezar el ciclo de nuevo.
        """
        weekly_workouts = WeeklyWorkout.objects.filter(user_workout=user_workout)
        if all(workout.completed for workout in weekly_workouts):
            for workout in weekly_workouts:
                workout.completed = False
                workout.save()
            user_workout.progress = 0  # Reiniciar el progreso del plan si es necesario
            user_workout.save()

class WeightRecordRepository:
    @staticmethod
    def obtener_registros_peso_usuario(user):
        """
        Obtiene todos los registros de peso de un usuario específico.
        """
        try:
            # Verificar que `user` es una instancia del modelo User
            if not isinstance(user, User):
                user = User.objects.get(id=user.id)
            # Obtener los registros de peso del usuario
            registros_peso = user.weight_records.all()
            if not registros_peso:
                return None, "No se encontraron registros de peso para este usuario."
            return registros_peso, None
        except Exception as e:
            return None, f"Error al obtener registros de peso: {str(e)}"

    @staticmethod
    def crear_registro_peso(user, peso):
        """
        Crea un nuevo registro de peso para el usuario especificado.
        """
        try:
            # Verificar que `user` es una instancia del modelo User
            if not isinstance(user, User):
                user = User.objects.get(id=user.id)

            registro_peso = WeightRecord.objects.create(user=user, weight=peso)
            return registro_peso, None
        except User.DoesNotExist:
            return None, "Usuario no encontrado."
        

    @staticmethod
    def get_latest_weight_record(user):
        """
        Obtiene el último registro de peso de un usuario específico.
        :param user_id: ID del usuario
        :return: Último registro de peso o None si no existe
        """
        if not isinstance(user, User):
            user = User.objects.get(id=user.id)

        return WeightRecord.objects.filter(user=user).order_by('-date', '-id').first()
        