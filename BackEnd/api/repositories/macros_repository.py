from api.models.macros import MacrosRecommendation, MealPlan

class MacrosRepository:

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
            recommendation = MacrosRecommendation.objects.get(id=recommendation_id)
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
        :param kcal: Calorías recomendadas.
        :param proteins: Gramos de proteínas.
        :param carbs: Gramos de carbohidratos.
        :param fats: Gramos de grasas.
        :param diet_type: Tipo de dieta (weightLoss, muscleGain, maintenance).
        :param description: Descripción opcional de la dieta.
        :return: Un diccionario con los datos de la recomendación creada.
        """
        # Crear una nueva recomendación de macronutrientes
        recommendation = MacrosRecommendation.objects.create(
            kcal=kcal,
            proteins=proteins,
            carbs=carbs,
            fats=fats,
            diet_type=diet_type,
            description=description
        )

        return {
            "id": recommendation.id,
            "kcal": recommendation.kcal,
            "proteins": float(recommendation.proteins),
            "carbs": float(recommendation.carbs),
            "fats": float(recommendation.fats),
            "dietType": recommendation.diet_type,
            "description": recommendation.description
        }
    
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
            recommendation = MacrosRecommendation.objects.get(id=recommendation_id, diet_type=category)

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
            recommendation = MacrosRecommendation.objects.get(id=recommendation_id, diet_type=category)
            recommendation.delete()
            return True
        except MacrosRecommendation.DoesNotExist:
            return False
        
    @staticmethod
    def get_macronutrient_recommendation(category, recommendation_id):
        """
        Obtener los detalles de una recomendación de macronutrientes.
        :param category: La categoría de la dieta (weightLoss, muscleGain, maintenance).
        :param recommendation_id: El ID de la recomendación.
        :return: Un diccionario con los detalles de la recomendación o None si no se encontró.
        """
        try:
            recommendation = MacrosRecommendation.objects.get(id=recommendation_id, diet_type=category)
            return {
                "id": recommendation.id,
                "kcal": recommendation.kcal,
                "proteins": float(recommendation.proteins),
                "carbs": float(recommendation.carbs),
                "fats": float(recommendation.fats)
            }
        except MacrosRecommendation.DoesNotExist:
            return None
