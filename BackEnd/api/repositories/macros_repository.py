from api.models.macros import MacrosRecommendation, MealPlan, DietCategory


class MacrosRepository:

    @staticmethod
    def get_all_diet_categories():
        """
        Obtener todas las categorías de dieta desde la base de datos.
        :return: Una lista de nombres de categorías.
        """
        return list(DietCategory.objects.values_list('name', flat=True))

    @staticmethod
    def get_all_macronutrients():
        """
        Obtener todos los planes de macronutrientes.
        """
        try:
            # Recuperar todos los planes de macronutrientes
            macros = MacrosRecommendation.objects.all()

            # Serializa los datos
            return [
                {
                    "id": macro.id,
                    "dietType": macro.diet_type,  # Aquí es importante que el campo exista
                    "kcal": macro.kcal,
                    "proteins": macro.proteins,
                    "carbs": macro.carbs,
                    "fats": macro.fats
                } for macro in macros
            ]

        except Exception as e:
            # En caso de error, retorna None o lanza una excepción
            print(f"Error al obtener los macronutrientes: {e}")
            return None
    @staticmethod
    def get_user_macronutrients(user_id):
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
    def get_macronutrient_by_id(recommendation_id):
        """
        Obtener los detalles de una recomendación de macronutrientes específica por ID.
        :param recommendation_id: ID de la recomendación.
        :return: Un diccionario con los detalles de la recomendación o None si no se encontró.
        """
        try:
            recommendation = MacrosRecommendation.objects.get(
                id=recommendation_id)
            return {
                "id": recommendation.id,
                "kcal": recommendation.kcal,
                "proteins": float(recommendation.proteins),
                "carbs": float(recommendation.carbs),
                "fats": float(recommendation.fats),
                "dietType": recommendation.diet_type,
                "description": recommendation.description
            }
        except MacrosRecommendation.DoesNotExist:
            return None

    @staticmethod
    def add_macronutrient_recommendation(kcal, proteins, carbs, fats, diet_type, description=None):
        """
        Añadir una nueva recomendación de macronutrientes.
        """
        try:
            recommendation = MacrosRecommendation.objects.create(
                kcal=kcal,
                proteins=proteins,
                carbs=carbs,
                fats=fats,
                category=diet_type,  # Asegúrate de que `diet_type` sea una instancia de DietCategory
                description=description
            )
            return {
                "id": recommendation.id,
                "kcal": recommendation.kcal,
                "proteins": float(recommendation.proteins),
                "carbs": float(recommendation.carbs),
                "fats": float(recommendation.fats),
                # Asegúrate de obtener el nombre de la categoría
                "dietType": recommendation.category.name,
                "description": recommendation.description
            }
        except Exception as e:
            # Manejo de errores
            print(f"Error al agregar la recomendación de macronutrientes: {e}")
            return None

    @staticmethod
    def update_macronutrient_recommendation(category, recommendation_id, kcal, proteins, carbs, fats):
        """
        Modificar una recomendación de macronutrientes existente en la categoría seleccionada.
        :param category: La categoría de la dieta (weightLoss, muscleGain, maintenance).
        :param recommendation_id: El ID de la recomendación a modificar.
        :param kcal: Calorías recomendadas.
        :param proteins: Gramos de proteínas.
        :param carbs: Gramos de carbohidratos.
        :param fats: Gramos de grasas.
        :return: True si se actualizó correctamente, False si no se encontró la recomendación.
        """
        try:
            recommendation = MacrosRecommendation.objects.get(
                id=recommendation_id, diet_type=category)

            # Actualizar los valores de la recomendación
            recommendation.kcal = kcal
            recommendation.proteins = proteins
            recommendation.carbs = carbs
            recommendation.fats = fats
            recommendation.save()

            return True
        except MacrosRecommendation.DoesNotExist:
            return False

    @staticmethod
    def delete_macronutrient_recommendation(category, recommendation_id):
        """
        Eliminar una recomendación de macronutrientes de la categoría seleccionada.
        :param category: La categoría de la dieta (weightLoss, muscleGain, maintenance).
        :param recommendation_id: El ID de la recomendación a eliminar.
        :return: True si se eliminó correctamente, False si no se encontró la recomendación.
        """
        try:
            recommendation = MacrosRecommendation.objects.get(
                id=recommendation_id, diet_type=category)
            recommendation.delete()
            return True
        except MacrosRecommendation.DoesNotExist:
            return False

    @staticmethod
    def get_macronutrient_recommendation(category, recommendation_id):
        """
        Obtener los detalles de una recomendación de macronutrientes.
        :param category: La categoría de la dieta.
        :param recommendation_id: El ID de la recomendación.
        :return: Un diccionario con los detalles de la recomendación o None si no se encontró.
        """
        try:
            recommendation = MacrosRecommendation.objects.get(
                id=recommendation_id, category__name=category)
            return {
                "id": recommendation.id,
                "kcal": recommendation.kcal,
                "proteins": float(recommendation.proteins),
                "carbs": float(recommendation.carbs),
                "fats": float(recommendation.fats)
            }
        except MacrosRecommendation.DoesNotExist:
            return None

    @staticmethod
    def get_macros_by_category(category):
        """
        Obtener todas las recomendaciones de macronutrientes por categoría.
        :param category: La categoría de la dieta (p.ej., 'weightLoss').
        :return: Lista de diccionarios con los detalles de cada recomendación.
        """
        recommendations = MacrosRecommendation.objects.filter(
            category__name=category)
        return [
            {
                "id": recommendation.id,
                "kcal": recommendation.kcal,
                "proteins": float(recommendation.proteins),
                "carbs": float(recommendation.carbs),
                "fats": float(recommendation.fats)
            }
            for recommendation in recommendations
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
