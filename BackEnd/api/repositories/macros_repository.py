from api.models.user import User
from api.models.macros import MealPlan, DietCategory, UserNutritionPlan


class MacrosRepository:

    @staticmethod
    def get_all_diet_categories():
        """
        Obtener todas las categorías de dieta desde la base de datos.
        :return: Una lista de nombres de categorías.
        """
        return list(DietCategory.objects.values_list('name', flat=True))
    
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
                "meal_distribution": meal_plan.meal_distribution,  # Esto debe devolver la lista de porcentajes
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
    def add_mealplan(user, kcal, proteins, carbs, fats, diet_type, meal_distribution, name, description):
        """
        Añadir un nuevo plan de comidas (MealPlan).
        :param user: El usuario asociado al plan de comida.
        :param kcal: Calorías de la comida.
        :param proteins: Gramos de proteínas.
        :param carbs: Gramos de carbohidratos.
        :param fats: Gramos de grasas.
        :param diet_type: Tipo de dieta (weightLoss, muscleGain, maintenance).
        :return: Un diccionario con los detalles del plan de comida o None si ocurrió un error.
        """
        try:
            # Validación de meal_distribution
            if meal_distribution and (not isinstance(meal_distribution, list) or sum(meal_distribution) != 100):
                raise ValueError("meal_distribution debe ser una lista de porcentajes que sumen 100.")

            meal_plan = MealPlan.objects.create(
                user=user,  # Relación con el usuario
                name=name,
                calories=kcal,
                proteins=proteins,
                carbs=carbs,
                fats=fats,
                description=description,
                diet_type=diet_type,  # Asegúrate de que diet_type sea uno de los valores permitidos en MealPlan
                meal_distribution=meal_distribution  # Distribución de comidas
            )
            return {
                "id": meal_plan.id,
                "kcal": meal_plan.calories,
                "proteins": float(meal_plan.proteins),
                "carbs": float(meal_plan.carbs),
                "fats": float(meal_plan.fats),
                "dietType": meal_plan.diet_type,
                "meal_distribution": meal_plan.meal_distribution
            }
        except Exception as e:
            # Manejo de errores
            print(f"Error al agregar el plan de comidas: {e}")
            return None


    @staticmethod
    def update_mealplan(user, mealplan_id, kcal, proteins, carbs, fats, diet_type, meal_distribution, name, description):
        """
        Modificar un plan de comidas existente.
        :param user: El usuario que posee el plan.
        :param mealplan_id: El ID del plan de comidas a modificar.
        :param kcal: Calorías recomendadas.
        :param proteins: Gramos de proteínas.
        :param carbs: Gramos de carbohidratos.
        :param fats: Gramos de grasas.
        :param diet_type: Tipo de dieta (weightLoss, muscleGain, maintenance).
        :return: True si se actualizó correctamente, False si no se encontró el plan de comidas.
        """
        try:
            # Buscar el MealPlan por ID y el usuario
            meal_plan = MealPlan.objects.get(id=mealplan_id, user=user, diet_type=diet_type)

            # Actualizar los valores del plan de comidas
            meal_plan.name = name
            meal_plan.calories = kcal
            description = description
            meal_plan.proteins = proteins
            meal_plan.carbs = carbs
            meal_plan.fats = fats
            meal_plan.meal_distribution = meal_distribution
            meal_plan.save()

            return True
        except MealPlan.DoesNotExist:
            return False


    @staticmethod
    def delete_mealplan(user, mealplan_id, diet_type):
        """
        Eliminar un plan de comidas de la categoría seleccionada.
        :param user: El usuario que posee el plan de comidas.
        :param mealplan_id: El ID del plan de comidas a eliminar.
        :param diet_type: La categoría de la dieta (weightLoss, muscleGain, maintenance).
        :return: True si se eliminó correctamente, False si no se encontró el plan de comidas.
        """
        try:
            # Buscar el MealPlan por ID, usuario y tipo de dieta
            meal_plan = MealPlan.objects.get(id=mealplan_id, user=user, diet_type=diet_type)
            meal_plan.delete()
            return True
        except MealPlan.DoesNotExist:
            return False


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
            # Buscar el MealPlan por ID, usuario y tipo de dieta
            meal_plan = MealPlan.objects.get(id=mealplan_id, user=user, diet_type=diet_type)
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
        except MealPlan.DoesNotExist:
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



class DietCategoryRepository:
    @staticmethod
    def list_all_categories():
        """
        Obtener todas las categorías de dietas.
        :return: Lista de categorías de dietas con sus detalles.
        """
        return DietCategory.objects.all().values('id', 'name', 'description')

    @staticmethod
    def create_category(name, description):
        """
        Crear una nueva categoría de dieta.
        :param name: Nombre de la categoría.
        :param description: Descripción de la categoría.
        :return: La categoría creada.
        """
        return DietCategory.objects.create(name=name, description=description)
