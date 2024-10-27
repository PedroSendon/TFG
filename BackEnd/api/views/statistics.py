from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from api.repositories.exercise_repository import ExerciseRepository
from api.repositories.user_repository import UserRepository
from rest_framework.permissions import IsAuthenticated
from api.repositories.process_repository import ProgressTrackingRepository, ExerciseLogRepository

@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def get_exercise_popularity(request):
    """
    Obtener la popularidad de los ejercicios más realizados en la plataforma.
    """
    year = request.query_params.get('year')

    try:
        if year:
            year = int(year)  # Convertir el año a entero para la consulta
    except ValueError:
        return Response({"error": "El parámetro 'year' debe ser un número."}, status=status.HTTP_400_BAD_REQUEST)

    exercise_popularity = ExerciseRepository.get_exercise_popularity(year)

    return Response({"data": exercise_popularity}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def get_platform_growth(request):
    """
    Obtener el crecimiento de la plataforma en términos de nuevos usuarios registrados por mes.
    """
    year = request.query_params.get('year')

    try:
        if year:
            year = int(year)  # Convertir el año a entero para la consulta
    except ValueError:
        return Response({"error": "El parámetro 'year' debe ser un número."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        monthly_growth = UserRepository.get_monthly_user_growth(year)
        return Response({"data": monthly_growth}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": "Error al obtener los datos de crecimiento de la plataforma."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_progress(request):
    user = request.user
    weight = request.data.get('weight')
    completed_workouts = request.data.get('completed_workouts', 0)
    progress = ProgressTrackingRepository.create_progress(user, weight, completed_workouts)
    return Response({'id': progress.id, 'weight': progress.weight, 'completed_workouts': progress.completed_workouts}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_progress_by_user(request, user_id):
    progress_list = ProgressTrackingRepository.get_progress_by_user(user_id)
    data = [{'id': progress.id, 'weight': progress.weight, 'completed_workouts': progress.completed_workouts, 'date': progress.date} for progress in progress_list]
    return Response(data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_progress(request, progress_id):
    weight = request.data.get('weight')
    completed_workouts = request.data.get('completed_workouts')
    progress = ProgressTrackingRepository.update_progress(progress_id, weight, completed_workouts)
    if progress:
        return Response({'id': progress.id, 'weight': progress.weight, 'completed_workouts': progress.completed_workouts}, status=status.HTTP_200_OK)
    return Response({'error': 'Progress not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_progress(request, progress_id):
    success = ProgressTrackingRepository.delete_progress(progress_id)
    if success:
        return Response({'message': 'Progress deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    return Response({'error': 'Progress not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_exercise_log(request):
    user = request.user
    workout_id = request.data.get('workout_id')
    exercise_id = request.data.get('exercise_id')
    sets_completed = request.data.get('sets_completed')
    reps_completed = request.data.get('reps_completed')
    rest_time = request.data.get('rest_time')
    exercise_log = ExerciseLogRepository.create_exercise_log(user, workout_id, exercise_id, sets_completed, reps_completed, rest_time)
    return Response({'id': exercise_log.id}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_exercise_logs_by_user(request, user_id):
    logs = ExerciseLogRepository.get_exercise_logs_by_user(user_id)
    data = [{'id': log.id, 'exercise': log.exercise.name, 'date': log.date, 'sets_completed': log.sets_completed, 'reps_completed': log.reps_completed, 'rest_time': log.rest_time} for log in logs]
    return Response(data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_exercise_log(request, log_id):
    sets_completed = request.data.get('sets_completed')
    reps_completed = request.data.get('reps_completed')
    rest_time = request.data.get('rest_time')
    log = ExerciseLogRepository.update_exercise_log(log_id, sets_completed, reps_completed, rest_time)
    if log:
        return Response({'id': log.id}, status=status.HTTP_200_OK)
    return Response({'error': 'Exercise log not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_exercise_log(request, log_id):
    success = ExerciseLogRepository.delete_exercise_log(log_id)
    if success:
        return Response({'message': 'Exercise log deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    return Response({'error': 'Exercise log not found'}, status=status.HTTP_404_NOT_FOUND)