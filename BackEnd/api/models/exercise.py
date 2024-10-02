from django.db import models

class Exercise(models.Model):
    # Nombre del ejercicio
    name = models.CharField(max_length=100)
    
    # Grupos musculares asociados
    muscle_groups = models.CharField(max_length=255)  # Podrías almacenar los grupos musculares como una lista separada por comas
    
    # Descripción del ejercicio
    description = models.TextField()
    
    # Instrucciones para realizar el ejercicio
    instructions = models.TextField()
    
    # Enlace a una imagen o video opcional que demuestre el ejercicio
    media = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name
