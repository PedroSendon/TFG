

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from api.utils.googleCloud import get_signed_url, list_bucket_files  # Import the get_signed_url function
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
