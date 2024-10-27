from datetime import datetime
from api.models.macros import MealPlan, UserNutritionPlan
from api.models.workout import UserWorkout, Imagen, WeeklyWorkout
from api.models.trainingplan import TrainingPlan
from django.contrib.auth.hashers import check_password, make_password
from api.models.user import User, UserDetails, DietPreferences
from api.models.process import ProgressTracking
from django.db.models.functions import TruncMonth
from django.db.models import Count
from django.db.models import Q


class UserRepository:

    @staticmethod
    def ger_user_role(user_id):
        """
        Obtener el rol de un usuario.
        """
        try:
            user = User.objects.get(id=user_id)
            return {"role": user.role}
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
                # Asegúrate de que la contraseña esté hasheada
                password=user_data['password'],
                birth_date=user_data['birth_date'],
                gender=user_data['gender'],
                # Asignar el rol, por defecto "cliente"
                role=user_data.get('role', 'cliente')
            )
            return user
        except Exception as e:
            raise ValueError(f"Error creando usuario: {e}")

    @staticmethod
    def update_user_details(user_id, data):
        try:
            user = UserRepository.get_user_by_id(user_id)
            if not user:
                return False, "Usuario no encontrado."

            user.first_name = data.get('first_name', user.first_name)
            user.last_name = data.get('last_name', user.last_name)
            user.role = data.get('role', user.role)
            user.save()

            user_details, created = UserDetails.objects.get_or_create(user=user)
            
            weight_goal_map = {
                "Ganar masa muscular": "gain_muscle",
                "Perder peso": "lose_weight",
                "Mantenimiento": "maintain"
            }
            user_details.weight_goal = weight_goal_map.get(data.get('weightGoal'), user_details.weight_goal)
            user_details.physical_activity_level = data.get('activityLevel', user_details.physical_activity_level)
            user_details.weekly_training_days = data.get('trainingFrequency', user_details.weekly_training_days)
            user_details.weight = data.get('currentWeight', user_details.weight)
            user_details.save()

            return True, "Usuario y detalles actualizados exitosamente."

        except Exception as e:
            print(f"Error al actualizar el usuario: {e}")
            return False, "Error al actualizar el usuario."

    @staticmethod
    def create_user_admin(user_data):
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
                # Asegúrate de que la contraseña esté hasheada
                password=user_data['password'],
                birth_date=user_data['birth_date'],
                gender=user_data['gender'],
                role=user_data['role']
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
            if check_password(password, user.password):
                return user
            else:
                return None
        except User.DoesNotExist:
            return None

    @staticmethod
    def assign_concret_training_plan_to_user(user_id, training_plan_id):
        """
        Asigna un plan de entrenamiento a un usuario.
        """
        try:
            print(f"Intentando asignar el plan de entrenamiento {training_plan_id} al usuario {user_id}")
            user = User.objects.get(id=user_id)
            training_plan = TrainingPlan.objects.get(id=training_plan_id)

            user_workout = UserWorkout.objects.create(user=user, training_plan=training_plan)

            # Crear WeeklyWorkout para cada entrenamiento en el TrainingPlan y marcar como incompleto
            for workout in training_plan.workouts.all():
                WeeklyWorkout.objects.create(user_workout=user_workout, workout=workout, completed=False)


            return True, "Plan de entrenamiento asignado exitosamente."

        except User.DoesNotExist:
            return False, "Usuario no encontrado."
        except TrainingPlan.DoesNotExist:
            return False, "Plan de entrenamiento no encontrado."
        except Exception as e:
            return False, str(e)
    
    @staticmethod
    def assign_concret_nutrition_plan_to_user(user_id, plan_id):
        """
        Asigna un plan nutricional a un usuario.
        """
        try:
            print(f"Intentando asignar el plan nutricional {plan_id} al usuario {user_id}")
            user = User.objects.get(id=user_id)
            nutrition_plan = MealPlan.objects.get(id=plan_id)

            UserNutritionPlan.objects.create(user=user, plan=nutrition_plan)
            return True, "Plan nutricional asignado exitosamente."

        except User.DoesNotExist:
            return False, "Usuario no encontrado."
        except MealPlan.DoesNotExist:
            return False, "Plan nutricional no encontrado."
        except Exception as e:
            return False, str(e)

    @staticmethod
    def get_user_by_id2(user_id):
        """
        Obtener un usuario por su ID.
        :param user_id: ID del usuario.
        :return: Diccionario con los datos del usuario o None si no existe.
        """
        try:
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
            }
        except User.DoesNotExist:
            return None

    @staticmethod
    def complete_user_registration(user):
        """
        Completa el proceso de registro del usuario asignando entrenamiento y plan nutricional.
        """
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
        """
        Asigna un plan nutricional adecuado basado en el peso, objetivo de calorías y preferencias del usuario.
        """
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
        """
        Asigna un plan de entrenamiento adecuado a un usuario basándose en su actividad física,
        preferencias de entrenamiento y equipo disponible.
        """
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
                    'weekly_training_days': details_data['weekly_training_days'],
                    'daily_training_time': details_data['daily_training_time'],
                    'physical_activity_level': details_data['physical_activity_level'],
                    'available_equipment': details_data['available_equipment'],
                }
            )

            # Guardar preferencias de dieta
            diet_preferences, created = DietPreferences.objects.update_or_create(
                user=user,
                defaults={
                    'diet_type': details_data['diet_type'],
                    'meals_per_day': details_data['meals_per_day'],
                    'macronutrient_intake': details_data['macronutrient_intake']
                }
            )

            return user_details, diet_preferences

        except Exception as e:
            raise ValueError(
                f"Error al crear o actualizar los detalles del usuario: {e}")

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
    def get_weight_history(user_id):
        """
        Obtener el historial de peso del usuario.
        :param user_id: ID del usuario.
        :return: Lista de registros de peso con fecha.
        """
        try:
            # Filtrar por el usuario y ordenar por fecha ascendente para mostrar el historial cronológicamente
            weight_history = ProgressTracking.objects.filter(
                user_id=user_id).order_by('date')

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
            user_details.weight = profile_data.get(
                'currentWeight', user_details.weight)
            user_details.weight_goal = profile_data.get(
                'weightGoal', user_details.weight_goal)
            user_details.physical_activity_level = profile_data.get(
                'activityLevel', user_details.physical_activity_level)
            user_details.weekly_training_days = profile_data.get(
                'trainingFrequency', user_details.weekly_training_days)
            user_details.save()

            return {
                "username": f"{user.first_name} {user.last_name}",
                "currentWeight": user_details.weight,
                "weightGoal": user_details.weight_goal,
                "activityLevel": user_details.physical_activity_level,
                "trainingFrequency": user_details.weekly_training_days
            }

        except User.DoesNotExist:  # Asegúrate de que `User` esté definido correctamente
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
            user.delete()  # Eliminar el usuario
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
        """
        Marca un entrenamiento como completo para un usuario. Si todos los entrenamientos están completos,
        reinicia todos los entrenamientos a incompleto.
        """
        try:
            user_workout = UserWorkout.objects.get(user_id=user_id)
            workout = WeeklyWorkout.objects.get(user_workout=user_workout, workout_id=workout_id)
            workout.completed = True
            workout.save()

            # Verifica si todos los entrenamientos están completados
            UserWorkoutRepository.check_and_reset_all_workouts(user_workout)

            return {"message": "Workout marked as completed"}
        except WeeklyWorkout.DoesNotExist:
            return {"error": "Workout not found for the user"}, 404

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
