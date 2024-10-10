from django.db import models

class MuscleGroup(models.Model):
    """
    Modelo que representa un grupo muscular.
    """
    name = models.CharField(max_length=100, unique=True)  # Nombre del grupo muscular (por ejemplo, 'Biceps', 'Triceps', etc.)

    def __str__(self):
        return self.name

class Exercise(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    muscle_groups = models.ManyToManyField(MuscleGroup, related_name='exercises')
    media = models.URLField(blank=True, null=True)
    instructions = models.TextField(default="No instructions available")

    def __str__(self):
        return self.name

