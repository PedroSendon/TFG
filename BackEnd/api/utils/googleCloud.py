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

def delete_file_from_gcs(file_url: str) -> bool:
    """
    Eliminar un archivo de Google Cloud Storage dado su URL completa (puede ser una URL firmada).

    :param file_url: URL completa del archivo en Google Cloud Storage.
    :return: True si el archivo se eliminó correctamente, False en caso contrario.
    """
    try:
        bucket_name = "fitprox"  # Cambiar al nombre de tu bucket
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)

        # Extraer el nombre del archivo completo (incluyendo el prefijo de la carpeta) desde la URL
        blob_path = "/".join(file_url.split('/')[-2:]).split('?')[0]  # Considera "exercises/<filename>"
        blob = bucket.blob(blob_path)

        # Verificar si el archivo existe antes de intentar eliminarlo
        if blob.exists():
            blob.delete()
            print(f"Archivo {blob_path} eliminado correctamente de Google Cloud Storage.")
            return True
        else:
            print(f"El archivo {blob_path} no existe en el bucket {bucket_name}.")
            return False
    except Exception as e:
        print(f"Error al intentar eliminar el archivo de Google Cloud Storage: {e}")
        return False
