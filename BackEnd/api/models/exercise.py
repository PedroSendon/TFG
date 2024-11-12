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
        # Remueve espacios en blanco alrededor de cada elemento de la lista
        return [muscle.strip() for muscle in self.muscleGroups.split(',')] if self.muscleGroups else []


    def set_muscle_groups(self, muscle_groups):
        self.muscleGroups = ','.join(muscle_groups)

    def get_instructions_list(self):
        # Divide las instrucciones en una lista de strings separadas por el carácter '.'
        return [instr.strip() for instr in self.instructions.split('.') if instr.strip()]
