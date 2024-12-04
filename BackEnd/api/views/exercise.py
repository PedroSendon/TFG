from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from api.repositories.exercise_repository import ExerciseRepository
from api.schemas.exercise import ExerciseUpdateSchema
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
            'muscleGroups': openapi.Schema(
                type=openapi.TYPE_ARRAY, 
                items=openapi.Items(type=openapi.TYPE_STRING), 
                description='Lista de grupos musculares trabajados (se almacenarán como una cadena separada por comas)'
            ),
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
    result = ExerciseRepository.create_exercise(request.user, request.data)

    if 'error' in result:
        return Response({"error": result['error']}, status=result.get('status', status.HTTP_400_BAD_REQUEST))

    return Response({
        "message": "Ejercicio creado con éxito.",
        "data": result['data']
    }, status=status.HTTP_201_CREATED)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_exercise_by_id(request, exercise_id):
    """
    Obtener los detalles de un ejercicio específico por su ID.
    """
    exercise = ExerciseRepository.get_exercise_by_id(exercise_id)
    
    if exercise:
        return Response(exercise, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Exercise not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])  # Solo usuarios autenticados pueden acceder
def delete_exercise(request, exercise_id):
    """
    Endpoint para eliminar un ejercicio.
    
    :param exercise_id: ID del ejercicio a eliminar.
    :return: Respuesta con mensaje de éxito o error.
    """
    # Llamar al repositorio para eliminar el ejercicio
    success = ExerciseRepository.delete_exercise_by_id(exercise_id)
    
    if success:
        return Response({"message": "Ejercicio eliminado exitosamente."}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Ejercicio no encontrado."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def list_all_exercises(request):
    """
    Listar todos los ejercicios disponibles en el sistema.
    """
    exercises = ExerciseRepository.list_all_exercises()
    return Response({"data": exercises}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_exercise_details(request):
    """
    Obtener los detalles de un ejercicio específico dentro de un workout asociado al usuario autenticado.
    """
    day_id = request.data.get('day_id')
    exercise_id = request.data.get('exerciseId')

    # Verificar si los parámetros están presentes
    if day_id is None or exercise_id is None:
        return Response({"error": "day_id y exercise_id son requeridos"}, status=status.HTTP_400_BAD_REQUEST)

    # Validar si los parámetros son numéricos
    if not str(day_id).isdigit() or not str(exercise_id).isdigit():
        return Response({"error": "Los parámetros 'day_id' y 'exercise_id' deben ser números"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = request.user  # Obtener el usuario autenticado
        exercise = ExerciseRepository.get_exercise_by_user_workout_and_id(user, int(day_id), int(exercise_id))
        if exercise:
            return Response(exercise, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Ejercicio no encontrado en el workout especificado."}, status=status.HTTP_404_NOT_FOUND)
    except ValueError:
        return Response({"error": "Error en el procesamiento de los datos"}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
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


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_exercise(request):
    """
    Modificar un ejercicio existente.
    """
    exercise_id = request.data.get('id')
    if not exercise_id:
        return Response({"error": "El parámetro 'id' es obligatorio."}, status=status.HTTP_400_BAD_REQUEST)

    # Llamar al repositorio para manejar la lógica de negocio
    result = ExerciseRepository.update_exercise(request.user, request.data, request.FILES)
    
    if 'error' in result:
        return Response({"error": result['error'], "details": result.get("details")}, status=result.get('status', status.HTTP_400_BAD_REQUEST))

    return Response({
        "message": "Ejercicio modificado con éxito.",
        "data": result['data']
    }, status=result['status'])


