# BackEnd/urls.py
from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

schema_view = get_schema_view(
   openapi.Info(
      title="Tu API Documentación",
      default_version='v1',
      description="Documentación de la API para tu proyecto",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="tu-email@example.com"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

# Vista simple para la raíz
def home(request):
    return HttpResponse("<h1>¡Bienvenido a tu API!</h1><p>Consulta la documentación en /swagger o usa /api/ para interactuar con los endpoints.</p>")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('api.urls')),  # Esto asegura que tus rutas de 'api/urls.py' se incluyan correctamente
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('', home, name='home'),  # Ruta raíz
]

