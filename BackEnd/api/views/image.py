

from requests import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from api.utils.googleCloud import get_signed_url, list_bucket_files  # Import the get_signed_url function
from rest_framework import status  # Import the status module
from django.conf import settings  # Import the settings module

from django.http import JsonResponse

@api_view(['GET'])
@permission_classes([AllowAny])
def get_image(request, image_name: str):

    signed_url = get_signed_url(settings.GCS_BUCKET_NAME, image_name)
    if not signed_url:
        print(f"Error: No se pudo encontrar el archivo {image_name}")
        return JsonResponse({"error": "No se pudo generar la URL firmada"}, status=404)
    
    return JsonResponse({"image_url": signed_url})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_photo(request):
    """
    Subir una foto de perfil para el usuario autenticado.
    """
    user = request.user

    # Asegurarse de que se envía un archivo en la petición
    if 'profile_photo' not in request.FILES:
        return Response({"error": "No se ha proporcionado ningún archivo."}, status=status.HTTP_400_BAD_REQUEST)

    # Guardar la imagen en el campo `profile_photo`
    profile_photo = request.FILES['profile_photo']
    user.profile_photo = profile_photo
    user.save()

    return Response({"message": "Foto de perfil subida correctamente."}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile_photo_url(request):
    """
    Obtener la URL de la foto de perfil del usuario.
    """
    user = request.user
    if not user.profile_photo:
        return Response({"error": "No hay foto de perfil disponible."}, status=status.HTTP_404_NOT_FOUND)

    # Generar URL firmada
    signed_url = get_signed_url('fitprox', user.profile_photo.name)

    if signed_url:
        return Response({"profile_photo_url": signed_url}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Error al generar la URL firmada."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
