from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from api.repositories.exercise_repository import ExerciseRepository
from api.repositories.user_repository import UserRepository
from rest_framework.permissions import IsAuthenticated

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