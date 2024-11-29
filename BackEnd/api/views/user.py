from rest_framework.response import Response 
from rest_framework.decorators import api_view, permission_classes  
from rest_framework import status 
from api.repositories.user_repository import UserRepository, ImagenRepository, WeightRecordRepository
from rest_framework.permissions import IsAuthenticated
from api.schemas.user import UserCreate, UserDetailsSchema, LoginSchema, WeightRecordSchema
from django.contrib.auth.hashers import make_password
from api.repositories.user_repository import UserDetailsRepository
from django.contrib.auth.decorators import login_required
from pydantic import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework.permissions import AllowAny
from api.schemas.user import ImagenSchema
from rest_framework_simplejwt.authentication import JWTAuthentication


@api_view(['POST'])
@permission_classes([IsAuthenticated]) 
def create_user_as_admin(request):
    """
    Crear un nuevo usuario desde el modo administrador.
    """
    # Llamar al repositorio para crear el usuario
    result = UserRepository.create_user_as_admin(request.user, request.data)

    # Comprobar si hubo un error
    if 'error' in result:
        return Response({"error": result['error']}, status=result.get('status', status.HTTP_400_BAD_REQUEST))

    return Response({"message": "Usuario creado exitosamente"}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])  # Permitir a cualquier usuario registrar
def register(request):
    """
    Registrar un nuevo usuario y devolver tokens JWT automáticamente.
    """
    try:
        user_data = request.data

        # Verificar si el usuario ya existe por su email
        if UserRepository.user_exists_by_email(user_data['email']):
            return Response({"error": "El usuario con este correo electrónico ya existe."}, status=status.HTTP_400_BAD_REQUEST)

        # Asegurarse de que los términos fueron aceptados
        if not user_data.get('terms_accepted', False):
            return Response({"error": "Debes aceptar los términos y condiciones."}, status=status.HTTP_400_BAD_REQUEST)

        # Crear usuario usando el repositorio
        user = UserRepository.create_user({**user_data, "role": "cliente"})

        # Generar tokens JWT para el usuario
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Responder con los tokens
        return Response({
            "message": "Usuario registrado exitosamente",
            "refresh": str(refresh),
            "access": access_token
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": f"Error en el registro: {e}"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def get_user_by_email(request, email):
    """
    Obtener un usuario por su correo electrónico.
    """
    user_data = UserRepository.get_user_by_email(email)

    if user_data:
        return Response(user_data, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])  # Permitir a cualquier usuario iniciar sesión
def login(request):
    """
    Autenticar un usuario.
    """
    try:
        # Obtener datos de la solicitud
        email = request.data.get('email')
        password = request.data.get('password')

        # Validar datos requeridos
        if not email or not password:
            return Response({"error": "Email y contraseña son obligatorios."}, status=status.HTTP_400_BAD_REQUEST)

        # Autenticar al usuario
        user = UserRepository.authenticate_user(email, password)
        if not user:
            return Response({"error": "Credenciales inválidas. Verifica tu email y contraseña."}, status=status.HTTP_401_UNAUTHORIZED)

        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Responder con los tokens
        return Response({
            "message": "Inicio de sesión exitoso",
            "refresh": str(refresh),
            "access": access_token
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": f"Error inesperado: {e}"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@login_required  # Asegúrate de que el usuario esté autenticado
def save_user_details(request):
    """
    Guardar los detalles del usuario.
    """
    try:
        # Obtener el usuario autenticado
        user = request.user

        # Validar los datos de la solicitud
        user_details_data = UserDetailsSchema(**request.data)

        # Guardar los detalles del usuario usando el repositorio
        UserDetailsRepository.create_user_details(
            user, user_details_data.dict())

        return Response({"message": "Detalles del usuario guardados correctamente"}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def get_user_profile(request):
    """
    Obtener los datos del perfil del usuario.
    """
    user_id = request.query_params.get(
        'userId') or request.user.id  # Si no se pasa `userId`, tomamos el usuario autenticado

    profile_data = UserRepository.get_user_profile(user_id)

    if not profile_data:
        return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    return Response(profile_data, status=status.HTTP_200_OK)




@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """
    Actualizar la información del perfil del usuario.
    """
    user_id = request.user.id  # Usamos el usuario autenticado

    # Validar que se hayan proporcionado algunos datos para actualizar
    profile_data = request.data
    if not profile_data:
        return Response({"error": "No se proporcionaron datos para actualizar."}, status=status.HTTP_400_BAD_REQUEST)

    # Actualizar el perfil del usuario
    updated_profile = UserDetailsRepository.update_user_profile(user_id, profile_data)

    if updated_profile is None:
        return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    return Response(updated_profile, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_plans(request, user_id):
    """
    Asignar o eliminar un plan de entrenamiento y/o un plan nutricional a un usuario.
    """
    workout_id = request.data.get('workout_id')
    nutrition_plan_id = request.data.get('nutrition_plan_id')

    # Variable de control para verificar si alguna operación fue realizada
    any_change_made = False

    # Manejo del plan de entrenamiento
    if workout_id is not None:  # Asignar o eliminar plan de entrenamiento
        if workout_id == -1:  # Eliminar el plan de entrenamiento actual
            success_workout, message_workout, status_code = UserRepository.remove_training_plan_from_user(user_id, request.user)
            if not success_workout:
                return Response({"error": message_workout}, status=status_code)
            any_change_made = True
        elif workout_id:  # Asignar un nuevo plan
            success_workout, message_workout, status_code = UserRepository.assign_concret_training_plan_to_user(user_id, workout_id, request.user)
            if not success_workout:
                return Response({"error": message_workout}, status=status_code)
            any_change_made = True

    # Manejo del plan nutricional
    if nutrition_plan_id is not None:  # Asignar o eliminar plan de nutrición
        if nutrition_plan_id == -1:  # Eliminar el plan de nutrición actual
            success_plan, message_plan, status_code = UserRepository.remove_nutrition_plan_from_user(user_id, request.user)
            if not success_plan:
                return Response({"error": message_plan}, status=status_code)
            any_change_made = True
        elif nutrition_plan_id:  # Asignar un nuevo plan
            success_plan, message_plan, status_code = UserRepository.assign_concret_nutrition_plan_to_user(user_id, nutrition_plan_id, request.user)
            if not success_plan:
                return Response({"error": message_plan}, status=status_code)
            any_change_made = True

    if any_change_made:
        return Response({"message": "Planes asignados o eliminados exitosamente."}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "No se proporcionó ningún ID de plan para asignar o eliminar."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_single_plan(request, user_id): 
    """
    Asignar un único plan (entrenamiento o nutricional) a un usuario.
    """
    plan_id = request.data.get('id_plan')
    is_nutrition_plan = request.data.get('is_nutrition_plan')

    # Verificar si se recibieron los parámetros correctamente
    if plan_id is None or is_nutrition_plan is None:
        return Response({"error": "ID del plan o tipo de plan (is_nutrition_plan) no proporcionado."}, status=status.HTTP_400_BAD_REQUEST)

    if is_nutrition_plan:
        # Asignar el plan nutricional, pasando `request.user` como `request_user`
        success, message, status_code = UserRepository.assign_concret_nutrition_plan_to_user(user_id, plan_id, request.user)
    else:
        # Asignar el plan de entrenamiento, pasando `request.user` como `request_user`
        success, message, status_code = UserRepository.assign_concret_training_plan_to_user(user_id, plan_id, request.user)

    if not success:
        return Response({"error": message}, status=status_code)

    plan_type = "nutricional" if is_nutrition_plan else "de entrenamiento"
    return Response({
        "message": f"Plan {plan_type} asignado exitosamente al usuario."
    }, status=status_code)

from rest_framework.decorators import authentication_classes
from api.models.user import User
from django.conf import settings

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_role(request):
    user_id = request.query_params.get(
        'userId') or request.user.id 
    role_data = UserRepository.get_user_role(user_id)
    if not role_data:
        return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
    
    return Response(role_data, status=status.HTTP_200_OK)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_plans(request, user_id):
    """
    Devuelve el MealPlan y el TrainingPlan asignados al usuario autenticado.
    """
    plans_data = UserRepository.get_user_plans(user_id)
    
    if plans_data is None:
        return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
    
    return Response(plans_data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_details(request, user_id):
    """
    Endpoint para obtener los detalles de un usuario por su ID, delegando la lógica al repositorio.
    """
    user_data = UserRepository.get_user_by_id2(user_id, request.user)
    
    if user_data is None:
        return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    if "error" in user_data:
        return Response({"error": user_data["error"]}, status=user_data["status"])
    
    return Response(user_data, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_as_admin(request, user_id):
    """
    Modificar los datos de un usuario existente desde el modo administrador.
    """
    try:
        # Llamar a la función del repositorio para actualizar el usuario
        success, message = UserRepository.update_user_details(user_id, request.data, request.user)

        if success:
            return Response({"message": message}, status=status.HTTP_200_OK)
        elif message == "No tienes permisos para modificar usuarios":
            return Response({"error": message}, status=status.HTTP_403_FORBIDDEN)
        elif message == "Usuario no encontrado":
            return Response({"error": message}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({"error": message}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)





@api_view(['PUT'])
@permission_classes([IsAuthenticated]) 
def change_password(request):
    """
    Cambiar la contraseña del usuario.
    """
    user_id = request.user.id  # Usamos el usuario autenticado
    current_password = request.data.get('currentPassword')
    new_password = request.data.get('newPassword')
    confirm_password = request.data.get('confirmPassword')

    # Validar que se hayan proporcionado todas las contraseñas
    if not current_password or not new_password or not confirm_password:
        return Response({"error": "Todos los campos son obligatorios."}, status=status.HTTP_400_BAD_REQUEST)

    # Cambiar la contraseña
    result = UserDetailsRepository.change_user_password(
        user_id, current_password, new_password, confirm_password)

    if 'error' in result:
        return Response({"error": result['error']}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"message": result['success']}, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated]) 
def upload_profile_photo(request):
    """
    Subir o actualizar la foto de perfil del usuario.
    """
    user_id = request.user.id  # Usamos el usuario autenticado

    # Validar si se ha proporcionado un archivo
    photo = request.FILES.get('photo')
    if not photo:
        return Response({"error": "No se proporcionó una foto."}, status=status.HTTP_400_BAD_REQUEST)

    # Actualizar la foto de perfil
    updated_profile = UserDetailsRepository.update_profile_photo(
        user_id, photo)

    if updated_profile is None:
        return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    return Response(updated_profile, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Solo usuarios autenticados
def get_all_users(request):
    """
    Obtener la lista de usuarios con su información básica.
    """
    user_data = UserDetailsRepository.get_all_users(request.user)

    # Verificar si el usuario tiene permisos
    if "error" in user_data:
        return Response(user_data, status=status.HTTP_403_FORBIDDEN)

    return Response(user_data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    """
    Eliminar un usuario por su ID.
    """
    success, message = UserDetailsRepository.delete_user_by_id(user_id, request.user)

    if success:
        return Response({"message": message}, status=status.HTTP_200_OK)
    elif message == "No tienes permisos para eliminar usuarios.":
        return Response({"error": message}, status=status.HTTP_403_FORBIDDEN)
    else:
        return Response({"error": message}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_user_details(request):
    user_id = request.user.id
    data = request.data

    try:
        # Llama al repositorio para crear los detalles
        UserDetailsRepository.create_user_details(user_id, data)

        return Response(
            {"message": "User details created successfully"},
            status=status.HTTP_201_CREATED,
        )

    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    except ValidationError as e:
        print(f"Error de validación: {e}")
        return Response({"error": e.errors()}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Error inesperado: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@permission_classes([AllowAny]) 
def obtener_logo(request):
    try:
        # Usar el repositorio para obtener el logo
        producto = ImagenRepository.obtener_logo()
        
        if not producto or not producto.imagen:
            return Response({"error": "Logo no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        
        # Crear el esquema de salida
        logo_data = ImagenSchema(
            nombre=producto.nombre,
            logo_url=producto.imagen.url,
            descripcion=producto.descripcion
        )

        return Response(logo_data.dict(), status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_registros_peso_usuario(request):
        
    registros_peso, error = WeightRecordRepository.obtener_registros_peso_usuario(request.user)

    if error:
        return Response({"error": error}, status=status.HTTP_404_NOT_FOUND)

    if not registros_peso:
        return Response({"error": "No se encontraron registros de peso para este usuario."}, status=status.HTTP_404_NOT_FOUND)

    registros_peso_data = [
        {"weight": registro.weight, "date": registro.date} for registro in registros_peso
    ]
    return Response(registros_peso_data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated]) 
def crear_registro_peso(request):
    """
    Endpoint para crear un nuevo registro de peso para un usuario.
    """
    peso = request.data.get("weight")
    user = request.user  # Obtener el usuario autenticado
    if peso is None:
        return Response({"error": "El peso es requerido."}, status=status.HTTP_400_BAD_REQUEST)

    registro_peso, error = WeightRecordRepository.crear_registro_peso(user, peso)
    
    if error:
        return Response({"error": error}, status=status.HTTP_404_NOT_FOUND)

    return Response({"message": "Registro de peso creado", "id": registro_peso.id}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_latest_weight_record(request):
    """
    Obtiene el último registro de peso del usuario autenticado.
    """
    try:
        user = request.user  # Obtener el usuario autenticado
        latest_weight_record = WeightRecordRepository.get_latest_weight_record(user)

        if latest_weight_record:
            # Formatear la respuesta con los datos del último registro de peso
            data = {
                'weight': latest_weight_record.weight,
                'date': latest_weight_record.date
            }
            return Response(data, status=status.HTTP_200_OK)
        else:
            return Response({"message": "No weight record found."}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unassigned_users_for_nutrition(request):
    # Llama al repositorio para obtener los usuarios no asignados para nutrición
    result = UserRepository.get_unassigned_users_for_nutrition(request.user)
    
    if isinstance(result, dict) and "error" in result:
        return Response({"error": result["error"]}, status=result["status"])
    
    unassigned_users_data = [
        {
            'id': user.id,
            'name': f"{user.first_name} {user.last_name}",
            'email': user.email,
            'status': user.status,
            'profile_photo': user.profile_photo if user.profile_photo else None
        }
        for user in result
    ]

    return Response(unassigned_users_data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unassigned_users_for_admin(request):
    # Llama al repositorio para obtener los usuarios no asignados para el administrador
    result = UserRepository.get_unassigned_users_for_admin(request.user)
    
    if isinstance(result, dict) and "error" in result:
        return Response({"error": result["error"]}, status=result["status"])
    
    return Response(result, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unassigned_users_for_training(request):
    result = UserRepository.get_unassigned_users_for_training(request.user)
    
    if isinstance(result, dict) and "error" in result:
        return Response({"error": result["error"]}, status=result["status"])
    
    unassigned_users_data = [
        {
            'id': user.id,
            'name': f"{user.first_name} {user.last_name}",
            'email': user.email,
            'status': user.status,
            'profile_photo': user.profile_photo if user.profile_photo else None
        }
        for user in result
    ]

    return Response(unassigned_users_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_status(request):
    user_status = UserRepository.get_user_status(request.user.id)
    if user_status is None:
        return Response({"error": "User not found."}, status=404)
    return Response({"status": user_status}, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_all_details(request, user_id):
    try:
        # Obtener datos del usuario desde el repositorio
        data = UserRepository.get_user_all_details(user_id)
        
        if data is None:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
