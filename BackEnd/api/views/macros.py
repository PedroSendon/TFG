from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from api.repositories.macros_repository import MacrosRepository

@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def get_user_mealplan(request):
    """
    Obtener los datos de macronutrientes del usuario.
    """
    user = request.user  # Obtener el ID del usuario autenticado o proporcionado
    macros_data = MacrosRepository.get_user_mealplan(user)

    if not macros_data:
        return Response({"error": "No se encontraron datos de macronutrientes para el usuario."}, status=status.HTTP_404_NOT_FOUND)

    return Response(macros_data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def get_all_mealplans(request):
    try:
        meal_plans = MacrosRepository.get_all_mealplans()

        if not meal_plans:
            return Response({"error": "No se encontraron planes de comida."}, status=status.HTTP_404_NOT_FOUND)

        return Response({"data": meal_plans}, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error en get_all_mealplans: {str(e)}")  # Debug 3
        return Response({"error": f"Error al obtener los planes de comida: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def get_macronutrient_by_id(request):
    """
    Obtener los detalles de una recomendación de macronutrientes por ID.
    """
    recommendation_id = request.query_params.get('id')

    if not recommendation_id:
        return Response({"error": "El parámetro 'id' es obligatorio."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        recommendation_id = int(recommendation_id)
    except ValueError:
        return Response({"error": "El parámetro 'id' debe ser un número."}, status=status.HTTP_400_BAD_REQUEST)

    recommendation = MacrosRepository.get_mealplan_by_id(recommendation_id)

    if recommendation:
        return Response(recommendation, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Recomendación no encontrada"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def prueba(request):
    return Response({"message": "Hola mundo"}, status=status.HTTP_200_OK)



@api_view(['POST'])
def add_mealplan(request):
    # Llamar al repositorio para crear el MealPlan
    result = MacrosRepository.add_mealplan2(request.user, request.data)

    # Comprobar si hubo un error
    if 'error' in result:
        return Response({"error": result['error']}, status=result.get('status', status.HTTP_400_BAD_REQUEST))

    return Response({
        "message": "Plan de comidas añadido exitosamente",
        "data": result['data']
    }, status=status.HTTP_201_CREATED)
    
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_mealplan_by_id(request, id):
    """
    Obtener los detalles de un plan de comidas específico por ID y categoría.
    """
    mealplan = MacrosRepository.get_mealplan_by_id(id)
    
    if mealplan:
        return Response(mealplan, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Plan de comidas no encontrado."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_mealplan(request, category, id):
    """
    Modificar un plan de comidas existente.
    """
    result = MacrosRepository.update_mealplan(request.user, id, category, request.data)

    if 'error' in result:
        return Response({"error": result['error']}, status=result.get('status', status.HTTP_400_BAD_REQUEST))

    return Response({"message": "Plan de comidas actualizado correctamente"}, status=status.HTTP_200_OK)

    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_mealplan(request, category, id):
    """
    Eliminar un plan de comidas de la categoría seleccionada.
    """

    # Validar que la categoría es válida
    valid_categories = ['weightLoss', 'muscleGain', 'maintenance']
    if category not in valid_categories:
        return Response({"error": "Categoría inválida. Debe ser weightLoss, muscleGain o maintenance."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Eliminar el plan de comidas
    success = MacrosRepository.delete_mealplan(request.user, id, category)

    if success:
        return Response({"message": "Plan de comidas eliminado correctamente"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Plan de comidas no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    
@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def get_mealplan(request, category, id):
    """
    Obtener los detalles de un plan de comidas de la categoría seleccionada.
    """
    # Validar que la categoría es válida
    valid_categories = ['weightLoss', 'muscleGain', 'maintenance']
    if category not in valid_categories:
        return Response({"error": "Categoría inválida. Debe ser weightLoss, muscleGain o maintenance."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Obtener los detalles del plan de comidas desde el repositorio
    mealplan = MacrosRepository.get_mealplan(request.user, id, category)

    if mealplan:
        return Response(mealplan, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Plan de comidas no encontrado"}, status=status.HTTP_404_NOT_FOUND)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def get_mealplans_by_category(request, category):
    """
    Obtener todos los planes de comidas por categoría.
    """
    valid_categories = ['weightLoss', 'muscleGain', 'maintenance']
    if category not in valid_categories:
        return Response({"error": "Categoría inválida. Debe ser weightLoss, muscleGain o maintenance."}, status=status.HTTP_400_BAD_REQUEST)

    # Obtener los planes de comidas de la categoría seleccionada
    meal_plans = MacrosRepository.get_mealplans_by_category(category)

    if meal_plans:
        return Response(meal_plans, status=status.HTTP_200_OK)
    else:
        return Response({"error": "No se encontraron planes de comidas"}, status=status.HTTP_404_NOT_FOUND)

# Vista sin requerir autenticación
@api_view(['GET'])
def list_diet_categories(request):
    """
    Endpoint para listar las categorías de dieta hardcodeadas.
    """
    categories = [
        {"name": "weightLoss", "description": "Pérdida de Peso"},
        {"name": "muscleGain", "description": "Ganancia Muscular"},
        {"name": "maintenance", "description": "Mantenimiento"}
    ]
    return Response({"categories": categories}, status=status.HTTP_200_OK)


