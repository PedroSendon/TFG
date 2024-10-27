from django.db import models
from .workout import Workout  # Asegúrate de que 'Workout' esté definido en otro archivo de modelos

class TrainingPlan(models.Model):
    DIFFICULTY_LEVELS = [
        ('ligero', 'Ligero'),
        ('moderado', 'Moderado'),
        ('intermedio', 'Intermedio'),
        ('avanzado', 'Avanzado'),
    ]
    name = models.CharField(max_length=100)
    description = models.TextField()
    workouts = models.ManyToManyField(Workout, related_name='training_plans')  # Relacionamos los entrenamientos incluidos en el plan
    media = models.URLField(blank=True, null=True)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_LEVELS)  # Restricción a las opciones definidas
    equipment = models.CharField(max_length=100)  # Equipamiento requerido para el plan
    duration = models.PositiveIntegerField()  # Duración del plan completo en días o semanas

    def __str__(self):
        return self.name