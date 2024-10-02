from django.db import models


class ProgressTracking(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)  # Relación con el usuario
    date = models.DateField(auto_now_add=True)  # Fecha de registro del progreso
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # Peso en kg
    completed_workouts = models.PositiveIntegerField(default=0)  # Número de entrenamientos completados

    def __str__(self):
        return f"Progress for {self.user} on {self.date}"

class ExerciseLog(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    workout = models.ForeignKey('Workout', on_delete=models.CASCADE)
    exercise = models.ForeignKey('Exercise', on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)  # Fecha de registro del ejercicio completado
    sets_completed = models.PositiveIntegerField()  # Sets completados
    reps_completed = models.PositiveIntegerField()  # Repeticiones completadas
    rest_time = models.PositiveIntegerField()  # Tiempo de descanso en segundos

    def __str__(self):
        return f"{self.exercise} completed by {self.user} on {self.date}"
