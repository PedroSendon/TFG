from django.apps import apps
from google.cloud import storage
from datetime import timedelta

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




def upload_to_gcs(file, filename):
    """
    Subir un archivo a Google Cloud Storage y devolver una URL pública.
    """
    bucket_name = 'fitprox'
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(f"{filename}")

    # Subir el archivo desde un archivo de tipo `File`
    blob.upload_from_file(file)

    # Generar una URL firmada (válida por 1 día, por ejemplo)
    signed_url = blob.generate_signed_url(
        version="v4",
        expiration=timedelta(days=1),  # Cambia la duración según tus necesidades
        method="GET"
    )
    return signed_url




def generate_signed_url(bucket_name, blob_name, expiration=3600):
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    signed_url = blob.generate_signed_url(
        version="v4",
        expiration=timedelta(seconds=expiration),
        method="GET",
    )
    return signed_url