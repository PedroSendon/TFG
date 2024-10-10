from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from api.repositories.macros_repository import MacrosRepository, DietCategoryRepository

@api_view(['GET'])
def get_user_macronutrients(request):
    """
    Obtener los datos de macronutrientes del usuario.
    """
    user_id = request.query_params.get('userId') or request.user.id  # Obtener el ID del usuario autenticado o proporcionado

    macros_data = MacrosRepository.get_user_macronutrients(user_id)

    if not macros_data:
        return Response({"error": "No se encontraron datos de macronutrientes para el usuario."}, status=status.HTTP_404_NOT_FOUND)

    return Response(macros_data, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_all_macronutrients(request):
    """
    Obtener todos los planes de macronutrientes disponibles en la base de datos.
    """
    try:
        # Obtener todos los planes de macronutrientes desde el repositorio
        macros = MacrosRepository.get_all_macronutrients()

        # Verifica que haya datos
        if not macros:
            return Response({"error": "No se encontraron planes de macronutrientes."}, status=status.HTTP_404_NOT_FOUND)

        return Response({"data": macros}, status=status.HTTP_200_OK)

    except Exception as e:
        # Retorna un error genérico si algo falla
        return Response({"error": f"Error al obtener los planes de macronutrientes: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
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

    recommendation = MacrosRepository.get_macronutrient_by_id(recommendation_id)

    if recommendation:
        return Response(recommendation, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Recomendación no encontrada"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_macronutrient_recommendation(request):
    """
    Añadir una nueva recomendación de macronutrientes.
    """
    user = request.user
    if user.role != 'nutricionista' and user.role != 'administrador':
        return Response({"error": "No tienes permisos para crear planes de nutricion"}, status=status.HTTP_403_FORBIDDEN)
    
    # Obtener los datos del cuerpo de la solicitud
    kcal = request.data.get('kcal')
    proteins = request.data.get('proteins')
    carbs = request.data.get('carbs')
    fats = request.data.get('fats')
    diet_type = request.data.get('dietType')
    description = request.data.get('description', None)

    # Validar que todos los campos requeridos están presentes
    if not all([kcal, proteins, carbs, fats, diet_type]):
        return Response({"error": "Todos los campos (kcal, proteins, carbs, fats, dietType) son obligatorios."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Validar que el diet_type es válido
    valid_categories = ['weightLoss', 'muscleGain', 'maintenance']
    if diet_type not in valid_categories:
        return Response({"error": "Categoría inválida. Debe ser weightLoss, muscleGain o maintenance."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Añadir la recomendación de macronutrientes
    recommendation_data = MacrosRepository.add_macronutrient_recommendation(
        kcal=kcal,
        proteins=proteins,
        carbs=carbs,
        fats=fats,
        diet_type=diet_type,
        description=description
    )

    return Response({
        "message": "Recomendación de macronutrientes añadida exitosamente",
        "data": recommendation_data
    }, status=status.HTTP_201_CREATED)



@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_macronutrient_recommendation(request, category, id):
    """
    Modificar una recomendación de macronutrientes existente en la categoría seleccionada.
    """
    user = request.user
    if user.role != 'nutricionista' and user.role != 'administrador':
        return Response({"error": "No tienes permisos para actualizar planes de nutricion"}, status=status.HTTP_403_FORBIDDEN)
    
    # Validar que la categoría es válida
    valid_categories = ['weightLoss', 'muscleGain', 'maintenance']
    if category not in valid_categories:
        return Response({"error": "Categoría inválida. Debe ser weightLoss, muscleGain o maintenance."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Obtener los datos del cuerpo de la solicitud
    kcal = request.data.get('kcal')
    proteins = request.data.get('proteins')
    carbs = request.data.get('carbs')
    fats = request.data.get('fats')

    # Validar que todos los campos requeridos están presentes
    if not all([kcal, proteins, carbs, fats]):
        return Response({"error": "Todos los campos (kcal, proteins, carbs, fats) son obligatorios."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Modificar la recomendación de macronutrientes
    success = MacrosRepository.update_macronutrient_recommendation(category, id, kcal, proteins, carbs, fats)

    if success:
        return Response({"message": "Recommendation updated successfully"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Recommendation not found"}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_macronutrient_recommendation(request, category, id):
    """
    Eliminar una recomendación de macronutrientes de la categoría seleccionada.
    """
    user = request.user
    if user.role != 'nutricionista' and user.role != 'administrador':
        return Response({"error": "No tienes permisos para eliminar planes de nutricion"}, status=status.HTTP_403_FORBIDDEN)
    
    # Validar que la categoría es válida
    valid_categories = ['weightLoss', 'muscleGain', 'maintenance']
    if category not in valid_categories:
        return Response({"error": "Categoría inválida. Debe ser weightLoss, muscleGain o maintenance."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Eliminar la recomendación de macronutrientes
    success = MacrosRepository.delete_macronutrient_recommendation(category, id)

    if success:
        return Response({"message": "Recommendation deleted successfully"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Recommendation not found"}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
def get_macronutrient_recommendation(request, category, id):
    """
    Obtener los detalles de una recomendación de macronutrientes de la categoría seleccionada.
    """
    valid_categories = MacrosRepository.get_all_diet_categories()
    if category not in valid_categories:
        return Response({"error": "Categoría inválida. Debe ser weightLoss, muscleGain o maintenance."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Obtener los detalles de la recomendación desde el repositorio
    recommendation = MacrosRepository.get_macronutrient_recommendation(category, id)

    if recommendation:
        return Response(recommendation, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Recommendation not found"}, status=status.HTTP_404_NOT_FOUND)

    

@api_view(['GET'])
def get_macros_by_category(request, category):
    """
    Obtener todas las recomendaciones de macronutrientes por categoría.
    """
    valid_categories = ['weightLoss', 'muscleGain', 'maintenance']
    if category not in valid_categories:
        return Response({"error": "Categoría inválida. Debe ser weightLoss, muscleGain o maintenance."}, status=status.HTTP_400_BAD_REQUEST)

    # Obtener las recomendaciones de macronutrientes de la categoría seleccionada
    recommendations = MacrosRepository.get_macros_by_category(category)

    if recommendations:
        return Response(recommendations, status=status.HTTP_200_OK)
    else:
        return Response({"error": "No se encontraron recomendaciones"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def list_diet_categories(request):
    """
    Endpoint para listar las categorías de dieta.
    """
    categories = DietCategoryRepository.list_all_categories()
    return Response({"categories": list(categories)})

