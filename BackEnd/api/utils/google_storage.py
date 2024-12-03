from google.cloud import storage
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

def initialize_storage_client(credentials_path):
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path
    return storage.Client()

# Usa una ruta basada en BASE_DIR
credentials_path = os.path.join(BASE_DIR, '../BackEnd', 'credentials.json')
storage_client = initialize_storage_client(credentials_path)
