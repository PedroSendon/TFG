# api/apps.py
from django.apps import AppConfig
from google.cloud import storage
import os

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        # Inicializa el cliente de Google Cloud Storage
        credentials_path = os.path.join(self.path, '../BackEnd/credentials.json')
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path
        self.storage_client = storage.Client()
