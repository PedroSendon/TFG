
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from api.repositories.trainingplan_repository import TrainingPlanRepository
from api.schemas.workout import TrainingPlanSchema



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])  # Solo usuarios autenticados pueden acceder
def delete_training_plan(request, plan_id):
    """
    Endpoint para eliminar un plan de entrenamiento.
    
    :param plan_id: ID del plan de entrenamiento a eliminar.
    :return: Respuesta con mensaje de éxito o error.
    """
    # Llamar al repositorio para eliminar el plan de entrenamiento
    success = TrainingPlanRepository.delete_training_plan_by_id(plan_id)
    
    if success:
        return Response({"message": "Plan de entrenamiento eliminado exitosamente."}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Plan de entrenamiento no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_training_plan(request, training_plan_id):
    """
    Obtener los detalles de un plan de entrenamiento específico.
    """
    training_plan, error = TrainingPlanRepository.get_training_plan_by_id2(training_plan_id)
    
    if error:
        return Response({"error": error}, status=status.HTTP_404_NOT_FOUND)
    
    return Response(training_plan, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_training_plan(request, training_plan_id):
    """
    Modificar los detalles de un plan de entrenamiento específico.
    """
    data = request.data

    updated_plan, error = TrainingPlanRepository.update_training_plan(training_plan_id, data)
    
    if error:
        return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(updated_plan, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_training_plan(request, training_plan_id):
    """
    Eliminar un plan de entrenamiento específico.
    """
    success, message = TrainingPlanRepository.delete_training_plan(training_plan_id)

    if not success:
        return Response({"error": message}, status=status.HTTP_404_NOT_FOUND)

    return Response({"message": message}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_assigned_training_plan(request):
    """
    Obtener el plan de entrenamiento asignado al usuario autenticado.
    """
    user_id = request.user.id  # Obtener el ID del usuario autenticado desde el token
    
    # Llamar al repositorio para obtener el plan de entrenamiento del usuario
    training_plan, error = TrainingPlanRepository.get_training_plan_by_user_id(user_id)
    
    if error:
        return Response({"error": error}, status=status.HTTP_404_NOT_FOUND)
    
    return Response(training_plan, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated]) 
def create_training_plan(request):
    """
    Endpoint para crear un nuevo plan de entrenamiento.
    """
    try:
        # Validar los datos de la solicitud usando el schema
        schema = TrainingPlanSchema(**request.data)
        
        # Crear el plan de entrenamiento usando el repositorio
        plan = TrainingPlanRepository.create_training_plan(
            name=schema.name,
            description=schema.description,
            workout_ids=schema.workouts,
            media=schema.media,
            difficulty=schema.difficulty,
            equipment=schema.equipment,
            duration=schema.duration
        )

        return Response({
            "message": "Plan de entrenamiento creado con éxito.",
            "data": plan
        }, status=status.HTTP_201_CREATED)

    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": "Ocurrió un error inesperado."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_training_plans(request):
    """
    Obtener todos los planes de entrenamiento.
    """
    try:
        print("Request received for training plans.")  # Debug 1
        training_plans = TrainingPlanRepository.get_all_training_plans()
        print(f"Fetched training plans: {training_plans}")  # Debug 2

        if not training_plans:
            return Response({"message": "No training plans found."}, status=status.HTTP_404_NOT_FOUND)

        training_plan_data = []
        for plan in training_plans:
            training_plan_data.append({
                "id": plan.id,
                "name": plan.name,
                "description": plan.description,
                "difficulty": plan.difficulty,
                "equipment": plan.equipment,
                "media": plan.media,
                "duration": plan.duration,
                "workouts": [workout.id for workout in plan.workouts.all()]
            })

        return Response({"data": training_plan_data}, status=status.HTTP_200_OK)

    except Exception as e:
        import traceback
        print("Error:", traceback.format_exc())
        return Response({"error": f"Error fetching training plans: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_next_pending_workout(request):
    """
    Obtener el primer entrenamiento no completado del plan de entrenamiento del usuario autenticado.
    """
    user = request.user
    next_workout, error = TrainingPlanRepository.get_next_pending_workout(user)

    if error:
        return Response({"error": error}, status=status.HTTP_404_NOT_FOUND)

    return Response(next_workout, status=status.HTTP_200_OK)