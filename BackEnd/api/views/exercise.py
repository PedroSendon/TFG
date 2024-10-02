from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from api.repositories.exercise_repository import ExerciseRepository
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

@swagger_auto_schema(
    method='post',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['name', 'description', 'muscleGroups', 'instructions'],
        properties={
            'name': openapi.Schema(type=openapi.TYPE_STRING, description='Nombre del ejercicio'),
            'description': openapi.Schema(type=openapi.TYPE_STRING, description='Descripción del ejercicio'),
            'muscleGroups': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Items(type=openapi.TYPE_STRING), description='Lista de grupos musculares trabajados'),
            'instructions': openapi.Schema(type=openapi.TYPE_STRING, description='Instrucciones para realizar el ejercicio'),
            'media': openapi.Schema(type=openapi.TYPE_STRING, description='URL o base64 de la imagen o video del ejercicio (opcional)', nullable=True),
        },
    ),
    responses={201: 'Ejercicio creado con éxito', 400: 'Faltan parámetros obligatorios o hay valores no válidos'}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_exercise(request):
    """
    Crear un nuevo ejercicio en el sistema.
    """
    user = request.user
    if user.role != 'entrenador' and user.role != 'administrador':
        return Response({"error": "No tienes permisos para crear entrenamientos"}, status=status.HTTP_403_FORBIDDEN)
    
    # Obtener los datos del cuerpo de la solicitud
    name = request.data.get('name')
    description = request.data.get('description')
    muscle_groups = request.data.get('muscleGroups')
    instructions = request.data.get('instructions')
    media = request.data.get('media', None)

    # Validar que todos los campos obligatorios están presentes
    if not all([name, description, muscle_groups, instructions]):
        return Response({"error": "Faltan parámetros obligatorios o hay valores no válidos."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Validar que muscle_groups sea una lista
    if not isinstance(muscle_groups, list) or not all(isinstance(group, str) for group in muscle_groups):
        return Response({"error": "El parámetro 'muscleGroups' debe ser una lista de cadenas de texto."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Crear el ejercicio
    exercise_data = ExerciseRepository.create_exercise(
        name=name,
        description=description,
        muscle_groups=muscle_groups,
        instructions=instructions,
        media=media
    )

    return Response({
        "message": "Ejercicio creado con éxito.",
        "data": exercise_data
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def list_all_exercises(request):
    """
    Listar todos los ejercicios disponibles en el sistema.
    """
    exercises = ExerciseRepository.list_all_exercises()
    return Response({"data": exercises}, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_exercise_details(request):
    """
    Obtener los detalles de un ejercicio específico por su ID.
    """
    exercise_id = request.query_params.get('id')

    if not exercise_id:
        return Response({"error": "El parámetro 'id' es obligatorio."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        exercise_id = int(exercise_id)
    except ValueError:
        return Response({"error": "El parámetro 'id' debe ser un número."}, status=status.HTTP_400_BAD_REQUEST)

    exercise = ExerciseRepository.get_exercise_by_id(exercise_id)

    if exercise:
        return Response(exercise, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Ejercicio no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
def get_exercises_by_training(request):
    """
    Obtener todos los ejercicios de un entrenamiento específico.
    """
    training_id = request.query_params.get('trainingId')

    if not training_id:
        return Response({"error": "El parámetro 'trainingId' es obligatorio."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        training_id = int(training_id)
    except ValueError:
        return Response({"error": "El parámetro 'trainingId' debe ser un número."}, status=status.HTTP_400_BAD_REQUEST)

    exercises = ExerciseRepository.get_exercises_by_training(training_id)

    if exercises:
        return Response({"data": exercises}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "No se encontraron ejercicios para el entrenamiento especificado."}, status=status.HTTP_404_NOT_FOUND)
