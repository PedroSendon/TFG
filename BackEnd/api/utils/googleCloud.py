from django.apps import apps
from google.cloud import storage

def get_signed_url(bucket_name: str, blob_name: str, expiration_time: int = 3600) -> str:
    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)

        if not blob.exists():
            print(f"El archivo {blob_name} no existe en el bucket {bucket_name}")
            return None

        signed_url = blob.generate_signed_url(
            version="v4",
            expiration=expiration_time,
            method="GET"
        )
        return signed_url
    except Exception as e:
        print(f"Error al generar la URL firmada: {e}")
        return None



def list_bucket_files():
    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket('fitprox')
        blobs = bucket.list_blobs()

        print("Archivos en el bucket:")
        for blob in blobs:
            print(blob.name)
    except Exception as e:
        print(f"Error al listar archivos: {e}")



