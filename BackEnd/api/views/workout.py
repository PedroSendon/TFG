from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from api.repositories.workout_repository import WorkoutRepository, TrainingPlanRepository
from api.schemas.workout import WorkoutSchema, TrainingPlanSchema
from api.schemas.exercise import ExerciseSchema
from api.utils.decorators import role_required

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
        "imageUrl": workout.media,
    }
    
    return Response(workout_data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def get_workout_exercises_by_day(request, day_id):
    """
    Obtener los detalles de los ejercicios para un día de entrenamiento específico.
    """
    # Obtener los ejercicios del día de entrenamiento
    exercises = WorkoutRepository.get_workout_exercises_by_day(day_id)

    if exercises is None:
        return Response({"error": "Entrenamiento no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    # Preparar la respuesta con los detalles de cada ejercicio
    exercise_data = []
    for workout_exercise in exercises:
        exercise_data.append({
            "name": workout_exercise.exercise.name,
            "imageUrl": workout_exercise.exercise.media,
            "sets": workout_exercise.sets,
            "reps": workout_exercise.reps,
            "completed": False  # Aquí podrías personalizar este campo si tienes información de progreso
        })
    
    return Response(exercise_data, status=status.HTTP_200_OK)


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
@role_required(['entrenador', 'administrador'])
def create_workout(request):
    """
    Crear un nuevo entrenamiento en el sistema.
    """
    # Obtener los datos del cuerpo de la solicitud
    name = request.data.get('name')
    description = request.data.get('description')
    exercises = request.data.get('exercises')
    media = request.data.get('media', None)
    duration = request.data.get('duration')  # Nuevo campo

    # Validar que todos los campos obligatorios están presentes
    if not all([name, description, exercises, duration]):
        return Response({"error": "Faltan parámetros obligatorios o hay valores no válidos."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Validar que exercises sea una lista de diccionarios
    if not isinstance(exercises, list) or not all(isinstance(ex, dict) for ex in exercises):
        return Response({"error": "El parámetro 'exercises' debe ser una lista de objetos."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Crear el entrenamiento
    workout_data = WorkoutRepository.create_workout(
        name=name,
        description=description,
        exercises=exercises,
        media=media,
        duration=duration
    )

    return Response({
        "message": "Entrenamiento creado con éxito.",
        "data": workout_data
    }, status=status.HTTP_201_CREATED)


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


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_workout(request, workout_id):
    """
    Actualizar un entrenamiento existente en el sistema.
    """
    user = request.user
    if user.role != 'entrenador' and user.role != 'administrador':
        return Response({"error": "No tienes permisos para actualizar entrenamientos"}, status=status.HTTP_403_FORBIDDEN)
    
    # Obtener los datos del cuerpo de la solicitud
    name = request.data.get('name')
    description = request.data.get('description')
    exercises = request.data.get('exercises')
    media = request.data.get('media', None)

    # Validar que todos los campos obligatorios están presentes
    if not all([name, description, exercises]):
        return Response({"error": "Faltan parámetros obligatorios o hay valores no válidos."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Validar que exercises sea una lista de diccionarios
    if not isinstance(exercises, list) or not all(isinstance(ex, dict) for ex in exercises):
        return Response({"error": "El parámetro 'exercises' debe ser una lista de objetos."},
                        status=status.HTTP_400_BAD_REQUEST)

    # Actualizar el entrenamiento
    workout_data = WorkoutRepository.update_workout(
        workout_id=workout_id,
        name=name,
        description=description,
        exercises=exercises,
        media=media
    )

    if workout_data:
        return Response({
            "message": "Entrenamiento actualizado con éxito.",
            "data": workout_data
        }, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Entrenamiento no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_workout(request, workout_id):
    """
    Eliminar un entrenamiento existente en el sistema.
    """
    user = request.user
    if user.role != 'entrenador' and user.role != 'administrador':
        return Response({"error": "No tienes permisos para eliminar entrenamientos"}, status=status.HTTP_403_FORBIDDEN)
    
    # Intentar eliminar el entrenamiento
    success = WorkoutRepository.delete_workout(workout_id)

    if success:
        return Response({"message": "Entrenamiento eliminado con éxito."}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Entrenamiento no encontrado."}, status=status.HTTP_404_NOT_FOUND)

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