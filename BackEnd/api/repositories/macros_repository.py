from api.models.macros import MealPlan, DietCategory


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

            # Serializa los datos
            return [
                {
                    "id": meal_plan.id,
                    "dietType": meal_plan.diet_type,  # Tipo de dieta asociado al MealPlan
                    "kcal": meal_plan.calories,
                    "proteins": meal_plan.proteins,
                    "carbs": meal_plan.carbs,
                    "fats": meal_plan.fats
                } for meal_plan in meal_plans
            ]

        except Exception as e:
            # En caso de error, retorna None o lanza una excepción
            print(f"Error al obtener los planes de comida: {e}")
            return None

    
    @staticmethod
    def get_user_mealplan(user_id):
        """
        Obtener los datos de macronutrientes del usuario.
        :param user_id: ID del usuario.
        :return: Un diccionario con las calorías totales y los macronutrientes del usuario.
        """
        try:
            # Obtener el plan de comidas del usuario
            meal_plan = MealPlan.objects.filter(user_id=user_id)

            if not meal_plan.exists():
                return None

            # Sumar los macronutrientes y calorías
            total_kcal = 0
            total_proteins = 0
            total_carbs = 0
            total_fats = 0

            for meal in meal_plan:
                total_kcal += meal.calories
                total_proteins += meal.proteins
                total_carbs += meal.carbs
                total_fats += meal.fats

            macros_data = {
                "totalKcal": total_kcal,
                "macros": {
                    "carbs": {
                        "grams": total_carbs,
                        "kcal": total_carbs * 4,  # 1 gramo de carbohidratos tiene 4 kcal
                        "percentage": round((total_carbs * 4 / total_kcal) * 100),
                        "color": "#ff4d4d"
                    },
                    "protein": {
                        "grams": total_proteins,
                        "kcal": total_proteins * 4,  # 1 gramo de proteína tiene 4 kcal
                        "percentage": round((total_proteins * 4 / total_kcal) * 100),
                        "color": "#4d79ff"
                    },
                    "fat": {
                        "grams": total_fats,
                        "kcal": total_fats * 9,  # 1 gramo de grasa tiene 9 kcal
                        "percentage": round((total_fats * 9 / total_kcal) * 100),
                        "color": "#ffd11a"
                    }
                }
            }

            return macros_data

        except Exception as e:
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
                "dietType": mealplan.diet_type,  # Tipo de dieta asociado al MealPlan
                "description": None  # Si deseas agregar un campo de descripción más adelante
            }
        except MealPlan.DoesNotExist:
            return None


    @staticmethod
    def add_mealplan(user, kcal, proteins, carbs, fats, diet_type):
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
            meal_plan = MealPlan.objects.create(
                user=user,  # Relación con el usuario
                calories=kcal,
                proteins=proteins,
                carbs=carbs,
                fats=fats,
                diet_type=diet_type  # Asegúrate de que diet_type sea uno de los valores permitidos en MealPlan
            )
            return {
                "id": meal_plan.id,
                "kcal": meal_plan.calories,
                "proteins": float(meal_plan.proteins),
                "carbs": float(meal_plan.carbs),
                "fats": float(meal_plan.fats),
                "dietType": meal_plan.diet_type,
            }
        except Exception as e:
            # Manejo de errores
            print(f"Error al agregar el plan de comidas: {e}")
            return None


    @staticmethod
    def update_mealplan(user, mealplan_id, kcal, proteins, carbs, fats, diet_type):
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
            meal_plan.calories = kcal
            meal_plan.proteins = proteins
            meal_plan.carbs = carbs
            meal_plan.fats = fats
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
                "fats": float(meal_plan.fats)
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
                "fats": float(meal_plan.fats)
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
