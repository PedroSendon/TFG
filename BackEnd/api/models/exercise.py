from django.contrib.postgres.fields import ArrayField
from django.db import models

class Exercise(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    muscleGroups = models.TextField(blank=True, default="")  # Almacena los grupos musculares como una cadena
    media = models.URLField(blank=True, null=True)
    instructions = models.TextField(default="No instructions available")

    def __str__(self):
        return self.name

    def get_muscle_groups(self):
        return self.muscleGroups.split(',') if self.muscleGroups else []

    def set_muscle_groups(self, muscle_groups):
        self.muscleGroups = ','.join(muscle_groups)
