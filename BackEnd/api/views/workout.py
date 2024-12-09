import json
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from api.repositories.user_repository import UserWorkoutRepository
from api.repositories.workout_repository import WorkoutRepository

@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def get_workouts(request):
    """
    Obtener la lista de entrenamientos disponibles.
    """
    user_id = request.query_params.get('userId')  # Obtener userId de los parámetros de la URL
    
    # Obtener los entrenamientos desde el repositorio
    workouts = WorkoutRepository.get_workouts(user_id)

    return Response({"data": workouts}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def get_workout_by_day(request, day):
    """
    Obtener los detalles de un entrenamiento basado en el día.
    """
    # Obtener el entrenamiento por el día
    workout = WorkoutRepository.get_workout_by_day(day)

    if not workout:
        return Response({"error": "Entrenamiento no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    # Preparar la lista de ejercicios
    exercises = []
    for workout_exercise in workout.workoutexercise_set.all():
        exercises.append({
            "name": workout_exercise.exercise.name,
            "reps": f"{workout_exercise.sets}x{workout_exercise.reps}",
        })
    
    # Formatear la respuesta
    workout_data = {
        "day": day,
        "workoutName": workout.name,
        "description": workout.description,
        "exercises": exercises,
    }
    
    return Response(workout_data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_workout_exercises_by_day(request, day_id):
    """
    Obtener los detalles de los ejercicios para un día de entrenamiento específico del plan de entrenamiento del usuario autenticado.
    """
    user = request.user  # Obtener el usuario autenticado

    # Llamamos al repositorio para obtener los detalles de los ejercicios
    exercises = WorkoutRepository.get_workout_exercises_by_user_and_day(user, day_id)

    if exercises is None:
        return Response({"error": "Entrenamiento no encontrado para el usuario especificado"}, status=status.HTTP_404_NOT_FOUND)

    # Retornamos la respuesta directamente con los datos preparados
    return Response(exercises, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_workout(request, workout_id):
    user_id = request.user.id
    result = UserWorkoutRepository.mark_workout_as_completed(user_id, workout_id)

    if isinstance(result, tuple) and "error" in result[0]:
        # Devolver el código de estado que viene en `result[1]` si hay un error
        return Response(result[0], status=result[1])
    
    return Response(result, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsAuthenticated]) 
def mark_workout_day_complete(request, day_id):
    """
    Marcar un día de entrenamiento como completado y registrar los ejercicios completados.
    """
    user = request.user  # Asumimos que el usuario está autenticado
    
    completed_exercises = request.data.get('completedExercises', [])
    
    if not completed_exercises:
        return Response({"error": "No se proporcionaron ejercicios completados."}, status=status.HTTP_400_BAD_REQUEST)

    # Registrar el día de entrenamiento como completado
    progress = WorkoutRepository.mark_workout_day_complete(user, day_id, completed_exercises)
    
    if progress is None:
        return Response({"error": "Entrenamiento no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    return Response({"message": "Día de entrenamiento marcado como completado.", "completed_workouts": progress.completed_workouts}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def get_workout_details(request):
    """
    Obtener los detalles de un entrenamiento específico.
    """
    workout_id = request.query_params.get('id')

    if not workout_id:
        return Response({"error": "El parámetro 'id' es obligatorio."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        workout_id = int(workout_id)
    except ValueError:
        return Response({"error": "El parámetro 'id' debe ser un número."}, status=status.HTTP_400_BAD_REQUEST)

    workout = WorkoutRepository.get_workout_by_id(workout_id)

    if workout:
        return Response(workout, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Entrenamiento no encontrado."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def get_workouts_by_user(request):
    """
    Obtener todos los planes de entrenamiento disponibles de un usuario.
    """
    user_id = request.query_params.get('userId')

    if not user_id:
        return Response({"error": "El parámetro 'userId' es obligatorio."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user_id = int(user_id)
    except ValueError:
        return Response({"error": "El parámetro 'userId' debe ser un número."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Obtener los planes de entrenamiento asignados al usuario
        training_plans = WorkoutRepository.get_training_plans_by_user(user_id)

        if training_plans:
            return Response({"data": training_plans}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "No se encontraron planes de entrenamiento para el usuario especificado."}, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_workout(request):
    """
    Crear un nuevo entrenamiento en el sistema.
    """
    result = WorkoutRepository.create_workout(request.user, request.data)

    if 'error' in result:
        return Response({"error": result['error']}, status=result.get('status', status.HTTP_400_BAD_REQUEST))
    
    return Response({
        "message": "Entrenamiento creado con éxito.",
        "data": result['data']
    }, status=status.HTTP_201_CREATED)



@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_workout(request, workout_id):
    """
    Actualizar un entrenamiento existente en el sistema.
    """
    # Directamente usa los datos deserializados
    exercises = request.data.get('exercises', [])
    if not isinstance(exercises, list):
        return Response({"error": "El campo 'exercises' debe ser una lista de objetos."}, status=status.HTTP_400_BAD_REQUEST)

    result = WorkoutRepository.update_workout(
        user=request.user,
        workout_id=workout_id,
        name=request.data.get('name'),
        description=request.data.get('description'),
        exercises=exercises,  # Pasamos directamente la lista
    )

    # Comprobar si el resultado contiene un error y devolver el código de estado adecuado
    if 'error' in result:
        return Response({"error": result["error"]}, status=result.get("status", status.HTTP_400_BAD_REQUEST))
    
    return Response({
        "message": "Entrenamiento actualizado con éxito.",
        "data": result
    }, status=status.HTTP_200_OK)



    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_workout(request, workout_id):
    """
    Eliminar un entrenamiento existente en el sistema.
    """
    result = WorkoutRepository.delete_workout(request.user, workout_id)

    if result is True:
        return Response({"message": "Entrenamiento eliminado con éxito."}, status=status.HTTP_200_OK)
    elif isinstance(result, dict) and "error" in result:
        return Response({"error": result["error"]}, status=result.get("status", status.HTTP_500_INTERNAL_SERVER_ERROR))
    else:
        return Response({"error": "Entrenamiento no encontrado."}, status=status.HTTP_404_NOT_FOUND)
