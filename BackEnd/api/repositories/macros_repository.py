from api.repositories.user_repository import UserRepository
from api.models.user import User
from api.models.macros import MealPlan, UserNutritionPlan
from rest_framework import status


class MacrosRepository:

    @staticmethod
    def get_all_mealplans():
        """
        Obtener todos los planes de comida (MealPlans).
        """
        try:
            # Recuperar todos los planes de comida
            meal_plans = MealPlan.objects.all()

            if not meal_plans:
                print("No meal plans found.")
                return []

            # Serializa los datos
            return [
                {
                    "id": meal_plan.id,
                    "name": meal_plan.name,
                    "dietType": meal_plan.diet_type,
                } for meal_plan in meal_plans
            ]

        except Exception as e:
            # En caso de error, loguea y lanza una excepción
            print(f"Error al obtener los planes de comida: {e}")
            raise e

    @staticmethod
    def get_user_mealplan(user):
        """
        Obtener los datos de macronutrientes del usuario y la distribución de comidas.
        """
        try:
            if not isinstance(user, User):
                user = User.objects.get(id=user.id)

            # Obtener el plan de nutrición del usuario
            user_nutrition_plan = UserNutritionPlan.objects.get(user=user)
            meal_plan = user_nutrition_plan.plan

            # Calcular macronutrientes y calorías
            macros_data = {
                "totalKcal": meal_plan.calories,
                "name": meal_plan.name,
                "macros": {
                    "carbs": {
                        "grams": meal_plan.carbs,
                        "kcal": meal_plan.carbs * 4,  # 1 gramo de carbohidratos tiene 4 kcal
                        "percentage": round((meal_plan.carbs * 4 / meal_plan.calories) * 100),
                        "color": "#ff4d4d"
                    },
                    "protein": {
                        "grams": meal_plan.proteins,
                        "kcal": meal_plan.proteins * 4,  # 1 gramo de proteína tiene 4 kcal
                        "percentage": round((meal_plan.proteins * 4 / meal_plan.calories) * 100),
                        "color": "#4d79ff"
                    },
                    "fat": {
                        "grams": meal_plan.fats,
                        "kcal": meal_plan.fats * 9,  # 1 gramo de grasa tiene 9 kcal
                        "percentage": round((meal_plan.fats * 9 / meal_plan.calories) * 100),
                        "color": "#ffd11a"
                    }
                },
                # Nueva variable de distribución de comidas
                # Esto debe devolver la lista de porcentajes
                "meal_distribution": meal_plan.meal_distribution,
                "dietType": meal_plan.diet_type,
                "description": meal_plan.description,
            }

            return macros_data

        except UserNutritionPlan.DoesNotExist:
            return None

    @staticmethod
    def get_mealplan_by_id(mealplan_id):
        """
        Obtener los detalles de un plan de comida específico por ID.
        :param mealplan_id: ID del plan de comida.
        :return: Un diccionario con los detalles del plan de comida o None si no se encontró.
        """
        try:
            # Buscar el MealPlan por su ID
            mealplan = MealPlan.objects.get(id=mealplan_id)
            return {
                "id": mealplan.id,
                "kcal": mealplan.calories,
                "proteins": float(mealplan.proteins),
                "carbs": float(mealplan.carbs),
                "fats": float(mealplan.fats),
                "description": mealplan.description,
                "dietType": mealplan.diet_type,  # Tipo de dieta asociado al MealPlan
                "name": mealplan.name,  # Si deseas agregar un campo de descripción más adelante
                "meal_distribution": mealplan.meal_distribution  # Distribución de comidas
            }
        except MealPlan.DoesNotExist:
            return None


    @staticmethod
    def add_mealplan2(user, data):
        """
        Añadir un nuevo plan de comidas (MealPlan).
        :param user: El usuario que realiza la solicitud.
        :param data: Los datos de la solicitud.
        :return: Un diccionario con los detalles del plan de comida o un mensaje de error.
        """
        # Verificar permisos
        check_result = UserRepository.check_user_role(user, ['nutricionista', 'administrador'])
        if "error" in check_result:
            return check_result
        else:
            user = check_result['user']

        # Validar datos requeridos
        required_fields = ['kcal', 'proteins', 'carbs', 'fats', 'dietType']
        missing_fields = [field for field in required_fields if field not in data or data[field] is None]
        if missing_fields:
            return {"error": f"Faltan los campos obligatorios: {', '.join(missing_fields)}", "status": status.HTTP_400_BAD_REQUEST}

        # Validar que el diet_type es válido
        valid_categories = ['weightLoss', 'muscleGain', 'maintenance']
        diet_type = data['dietType']
        if diet_type not in valid_categories:
            return {"error": "Categoría inválida. Debe ser weightLoss, muscleGain o maintenance.", "status": status.HTTP_400_BAD_REQUEST}

        # Validación de meal_distribution
        meal_distribution = data.get('mealDistribution')
        if meal_distribution and (not isinstance(meal_distribution, list) or sum(meal_distribution) != 100):
            return {"error": "meal_distribution debe ser una lista de porcentajes que sumen 100.", "status": status.HTTP_400_BAD_REQUEST}

        # Crear el plan de comidas
        try:
            meal_plan = MealPlan.objects.create(
                name=data.get('name', "Default Plan Name"),
                calories=data['kcal'],
                proteins=data['proteins'],
                carbs=data['carbs'],
                fats=data['fats'],
                diet_type=diet_type,
                meal_distribution=meal_distribution,
                description=data.get('description')
            )
            
            return {
                "data": {
                    "id": meal_plan.id,
                    "kcal": meal_plan.calories,
                    "proteins": float(meal_plan.proteins),
                    "carbs": float(meal_plan.carbs),
                    "fats": float(meal_plan.fats),
                    "dietType": meal_plan.diet_type,
                    "meal_distribution": meal_plan.meal_distribution
                }
            }
        except Exception as e:
            # Manejo de errores
            return {"error": f"Error al agregar el plan de comidas: {str(e)}", "status": status.HTTP_500_INTERNAL_SERVER_ERROR}


    @staticmethod
    def update_mealplan(user, mealplan_id, category, data):
        """
        Modificar un plan de comidas existente.
        :param user: Usuario que realiza la solicitud.
        :param mealplan_id: ID del plan de comidas a modificar.
        :param category: Tipo de dieta (weightLoss, muscleGain, maintenance).
        :param data: Datos de actualización.
        :return: Un diccionario con el mensaje de éxito o error y el código de estado.
        """
        # Validar permisos
        check_result = UserRepository.check_user_role(user, ['nutricionista', 'administrador'])
        if "error" in check_result:
            return check_result

        # Validar datos requeridos
        required_fields = ['kcal', 'proteins', 'carbs', 'fats', 'mealDistribution']
        missing_fields = [field for field in required_fields if field not in data or data[field] is None]
        if missing_fields:
            return {"error": f"Faltan los campos obligatorios: {', '.join(missing_fields)}", "status": status.HTTP_400_BAD_REQUEST}

        try:
            # Obtener el MealPlan por su ID y diet_type
            meal_plan = MealPlan.objects.get(id=mealplan_id, diet_type=category)

            # Actualizar los valores del plan de comidas
            meal_plan.name = data.get('name', meal_plan.name)
            meal_plan.calories = data['kcal']
            meal_plan.proteins = data['proteins']
            meal_plan.carbs = data['carbs']
            meal_plan.fats = data['fats']
            meal_plan.meal_distribution = data['mealDistribution']
            meal_plan.description = data['description']
            meal_plan.save()

            return {"message": "Plan de comidas actualizado correctamente"}
        except MealPlan.DoesNotExist:
            return {"error": "El plan de comidas no existe o el tipo de dieta no coincide.", "status": status.HTTP_404_NOT_FOUND}

    @staticmethod
    def delete_mealplan(user, mealplan_id, diet_type):
        try:
            # Verificar si el usuario tiene permisos
            if user.role not in ['nutricionista', 'administrador']:
                return False, {"error": "No tienes permisos para eliminar planes de nutrición.", "status": status.HTTP_403_FORBIDDEN}

            # Buscar el MealPlan con el ID y tipo de dieta proporcionados
            meal_plan = MealPlan.objects.filter(id=mealplan_id, diet_type=diet_type).first()
            if not meal_plan:
                return False, {"error": "El plan de comidas no existe.", "status": status.HTTP_404_NOT_FOUND}

            # Verificar si el MealPlan está asignado a algún usuario
            user_nutrition_plans = UserNutritionPlan.objects.filter(plan=meal_plan)
            if user_nutrition_plans.exists():
                # Desasignar el plan de los usuarios asociados
                user_nutrition_plans.delete()

            # Eliminar el MealPlan de la base de datos
            meal_plan.delete()
            return True, {"message": "Plan de comidas eliminado correctamente", "status": status.HTTP_200_OK}

        except Exception as e:
            print(f"Error deleting MealPlan: {str(e)}")
            return False, {"error": "Ocurrió un error inesperado al intentar eliminar el plan de comidas.", "status": status.HTTP_500_INTERNAL_SERVER_ERROR}

    @staticmethod
    def get_mealplan(user, mealplan_id, diet_type):
        """
        Obtener los detalles de un plan de comidas.
        :param user: El usuario asociado al plan de comidas.
        :param mealplan_id: El ID del plan de comidas.
        :param diet_type: La categoría de la dieta (weightLoss, muscleGain, maintenance).
        :return: Un diccionario con los detalles del plan de comidas o None si no se encontró.
        """
        try:
            # Buscar el UserNutritionPlan que enlace al usuario con el MealPlan correspondiente
            user_nutrition_plan = UserNutritionPlan.objects.select_related('plan').get(
                user=user, plan__id=mealplan_id, plan__diet_type=diet_type
            )
            meal_plan = user_nutrition_plan.plan

            # Retornar los detalles del plan de comidas
            return {
                "id": meal_plan.id,
                "kcal": meal_plan.calories,
                "proteins": float(meal_plan.proteins),
                "carbs": float(meal_plan.carbs),
                "fats": float(meal_plan.fats),
                "dietType": meal_plan.diet_type,
                "meal_distribution": meal_plan.meal_distribution,
                "name": meal_plan.name,
                "description": meal_plan.description
            }
        except UserNutritionPlan.DoesNotExist:
            return None

    @staticmethod
    def get_mealplans_by_category(diet_type):
        """
        Obtener todos los planes de comidas por categoría (tipo de dieta).
        :param diet_type: La categoría de la dieta (p.ej., 'weightLoss').
        :return: Lista de diccionarios con los detalles de cada plan de comidas.
        """
        meal_plans = MealPlan.objects.filter(diet_type=diet_type)
        return [
            {
                "name": meal_plan.name,
                "id": meal_plan.id,
                "kcal": meal_plan.calories,
                "proteins": float(meal_plan.proteins),
                "carbs": float(meal_plan.carbs),
                "fats": float(meal_plan.fats),
                "meal_distribution": meal_plan.meal_distribution,
                "description": meal_plan.description
            }
            for meal_plan in meal_plans
        ]