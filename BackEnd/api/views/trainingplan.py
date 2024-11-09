
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from api.repositories.trainingplan_repository import TrainingPlanRepository
from api.schemas.workout import TrainingPlanSchema

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_training_plan(request, training_plan_id):
    """
    Obtener los detalles de un plan de entrenamiento específico.
    """
    training_plan, error = TrainingPlanRepository.get_training_plan_by_id2(
        training_plan_id)

    if error:
        return Response({"error": error}, status=status.HTTP_404_NOT_FOUND)

    return Response(training_plan, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_training_plan(request):
    """
    Modificar los detalles de un plan de entrenamiento específico.
    """
    training_plan_id = request.data.get('training_plan_id')
    if not training_plan_id:
        return Response({"error": "El ID del plan de entrenamiento es obligatorio."}, status=status.HTTP_400_BAD_REQUEST)

    updated_plan, error = TrainingPlanRepository.update_training_plan(request.user, training_plan_id, request.data)

    if error:
        return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

    return Response(updated_plan, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_training_plan(request, training_plan_id):
    """
    Eliminar un plan de entrenamiento específico.
    """
    success, message = TrainingPlanRepository.delete_training_plan(
        training_plan_id)

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
    training_plan, error = TrainingPlanRepository.get_training_plan_by_user_id(
        user_id)

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
        print("Request data:")
        print(request.data)  # Esto mostrará la estructura de request.data

        # Convertir duration a entero si es posible
        duration = int(request.data['duration'])

        # Crear el plan de entrenamiento usando el repositorio
        plan = TrainingPlanRepository.create_training_plan(
            name=request.data['name'],
            description=request.data['description'],
            workout_ids=request.data['selectedTraining'],
            media=request.data.get('media', None),
            difficulty=request.data['difficulty'],
            equipment=request.data['equipment'],
            duration=duration
        )

        return Response({
            "message": "Plan de entrenamiento creado con éxito.",
            "data": plan
        }, status=status.HTTP_201_CREATED)

    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        import traceback
        # Mostrar detalles del error en la consola
        print("Error:", traceback.format_exc())
        return Response({"error": "Ocurrió un error inesperado."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_training_plans(request):
    """
    Obtener todos los planes de entrenamiento.
    """
    try:
        training_plans = TrainingPlanRepository.get_all_training_plans()

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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_workout_complete(request, day_id):
    user = request.user
    # Obtener el progreso del request
    progress = request.data.get('progress', 0)
    success, message = TrainingPlanRepository.mark_workout_as_complete(
        user, day_id, progress)

    if success:
        return Response({"message": message}, status=status.HTTP_200_OK)
    return Response({"error": message}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_training_plan_images(request):
    images = TrainingPlanRepository.get_training_plan_images()
    return Response(images)
