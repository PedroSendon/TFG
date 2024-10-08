from rest_framework.response import Response # type: ignore
from rest_framework.decorators import api_view, parser_classes, permission_classes # type: ignore
from rest_framework import status # type: ignore
from api.repositories.user_repository import UserRepository
from rest_framework.permissions import IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from api.schemas.user import UserCreate, UserDetailsSchema,LoginSchema
from django.contrib.auth.hashers import make_password
from api.repositories.user_repository import UserDetailsRepository
from django.contrib.auth.decorators import login_required
from pydantic import ValidationError


@api_view(['POST'])
def register(request):
    """
    Registrar un nuevo usuario.
    """
    try:
        print(request.data)  # Esto imprimirá los datos que están llegando
        user_data = UserCreate(**request.data)
        
        # Verificar si el usuario ya existe por su email
        if UserRepository.user_exists_by_email(user_data.email):
            return Response({"error": "El usuario con este correo electrónico ya existe."}, status=status.HTTP_400_BAD_REQUEST)

        # Asegurarse de que los términos fueron aceptados
        if not user_data.terms_accepted:
            return Response({"error": "Debes aceptar los términos y condiciones."}, status=status.HTTP_400_BAD_REQUEST)

        # Hash de la contraseña
        user_data.password = make_password(user_data.password)

        # Crear usuario usando el repositorio, asignando rol "cliente"
        user = UserRepository.create_user({**user_data.dict(), "role": "cliente"})

        return Response({"message": "Usuario registrado exitosamente"}, status=status.HTTP_201_CREATED)

    except ValidationError as e:
        print(f"Error de validación: {e}")  # Esto imprimirá el error exacto en la consola
        return Response({"error": f"Error de validación en los datos proporcionados: {e}"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"Error inesperado: {e}")  # Agrega esto para más detalles en la consola
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_user_as_admin(request):
    """
    Crear un nuevo usuario desde el modo administrador.
    """
    try:
        user = request.user
        if user.role != 'administrador':
            return Response({"error": "No tienes permisos para crear usuarios"}, status=status.HTTP_403_FORBIDDEN)
        
        user_data = UserCreate(**request.data)

        if UserRepository.user_exists_by_email(user_data.email):
            return Response({"error": "El usuario con este correo electrónico ya existe."}, status=status.HTTP_400_BAD_REQUEST)

        # Asegurarse de que los términos fueron aceptados
        if not user_data.terms_accepted:
            return Response({"error": "Debes aceptar los términos y condiciones."}, status=status.HTTP_400_BAD_REQUEST)

        # Hash de la contraseña
        user_data.password = make_password(user_data.password)

        # Asignar el rol si se proporciona, o "cliente" por defecto
        role = request.data.get('role', 'cliente')

        # Crear usuario usando el repositorio
        user = UserRepository.create_user({**user_data.dict(), "role": role})

        return Response({"message": "Usuario creado exitosamente"}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
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
def login(request):
    """
    Autenticar un usuario.
    """
    try:
        # Validar los datos de la solicitud
        login_data = LoginSchema(**request.data)

        # Autenticar al usuario
        user = UserRepository.authenticate_user(
            login_data.email, login_data.password)
        if not user:
            return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

        # En este punto, puedes generar un token o manejar la sesión como prefieras.
        # Por ejemplo, podrías generar un JWT o usar las sesiones de Django.
        # Para este ejemplo, solo devolvemos un mensaje de éxito.

        return Response({"message": "Inicio de sesión exitoso"}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

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
        UserDetailsRepository.create_user_details(user, user_details_data.dict())
        
        return Response({"message": "Detalles del usuario guardados correctamente"}, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
def get_user_profile(request):
    """
    Obtener los datos del perfil del usuario.
    """
    user_id = request.query_params.get('userId') or request.user.id  # Si no se pasa `userId`, tomamos el usuario autenticado
    
    profile_data = UserRepository.get_user_profile(user_id)

    if not profile_data:
        return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    return Response(profile_data, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_weight_history(request):
    """
    Obtener el historial de peso del usuario a lo largo del tiempo.
    """
    user_id = request.query_params.get('userId') or request.user.id  # Si no se pasa `userId`, tomamos el usuario autenticado
    
    # Llamar a `UserDetailsRepository` en lugar de `UserRepository`
    weight_history = UserDetailsRepository.get_weight_history(user_id)

    if weight_history is None:
        return Response({"error": "No se encontró el historial de peso para el usuario."}, status=status.HTTP_404_NOT_FOUND)

    return Response(weight_history, status=status.HTTP_200_OK)

@api_view(['PUT'])
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
    updated_profile = UserRepository.update_user_profile(user_id, profile_data)

    if updated_profile is None:
        return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    return Response(updated_profile, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_user_as_admin(request, user_id):
    """
    Modificar los datos de un usuario existente desde el modo administrador.
    """
    try:
        user = request.user
        if user.role != 'administrador':
            return Response({"error": "No tienes permisos para modificar usuarios"}, status=status.HTTP_403_FORBIDDEN)
        
        user = UserRepository.get_user_by_id(user_id)
        if not user:
            return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        # Actualizar los campos del usuario
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.email = request.data.get('email', user.email)
        user.role = request.data.get('role', user.role)  # Permitir cambiar el rol
        user.save()

        return Response({"message": "Usuario actualizado exitosamente."}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
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
    result = UserRepository.change_user_password(user_id, current_password, new_password, confirm_password)

    if 'error' in result:
        return Response({"error": result['error']}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"message": result['success']}, status=status.HTTP_200_OK)


@api_view(['PUT'])
@parser_classes([MultiPartParser, FormParser])  # Permitir el manejo de archivos
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
    updated_profile = UserRepository.update_profile_photo(user_id, photo)

    if updated_profile is None:
        return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    return Response(updated_profile, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_all_users(request):
    """
    Obtener la lista de usuarios con su información básica.
    """
    user_data = UserRepository.get_all_users()

    return Response(user_data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_user(request, user_id):
    """
    Eliminar un usuario por su ID.
    """
    user = request.user
    if user.role != 'administrador':
        return Response({"error": "No tienes permisos para eliminar usuarios"}, status=status.HTTP_403_FORBIDDEN)
    
    # Intentar eliminar el usuario
    success = UserRepository.delete_user_by_id(user_id)

    if success:
        return Response({"message": "Usuario eliminado exitosamente"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)