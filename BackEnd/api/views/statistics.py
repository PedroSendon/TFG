from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from api.repositories.exercise_repository import ExerciseRepository
from api.repositories.user_repository import UserRepository
from rest_framework.permissions import IsAuthenticated
from api.repositories.process_repository import ProgressTrackingRepository, ExerciseLogRepository


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