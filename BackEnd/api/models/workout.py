from django.db import models
from .User import User  # Asegúrate de que 'User' esté definido en otro archivo de modelos
from .exercise import Exercise  # Asegúrate de que 'Exercise' esté definido en otro archivo de modelos

class Workout(models.Model):
    # Nombre de la rutina de ejercicios
    name = models.CharField(max_length=100)
    
    # Descripción de la rutina
    description = models.TextField()

    # Ejercicios asociados con esta rutina
    exercises = models.ManyToManyField(Exercise, through='WorkoutExercise', related_name='workouts')

    # Imagen o video opcional para la rutina
    media = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name


class WorkoutExercise(models.Model):
    # Relación entre Workout y Exercise
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    
    # Detalles específicos de cada ejercicio en la rutina
    sets = models.PositiveIntegerField()
    reps = models.PositiveIntegerField()
    rest = models.PositiveIntegerField()  # Tiempo de descanso en segundos

    class Meta:
        unique_together = ('workout', 'exercise')  # Para evitar duplicados en la relación

    def __str__(self):
        return f"{self.workout.name} - {self.exercise.name}"

class UserWorkout(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_workouts')
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name='user_workouts')
    
    # Campos adicionales
    date_started = models.DateField(auto_now_add=True)  # Fecha en la que el usuario comenzó el entrenamiento
    date_completed = models.DateField(null=True, blank=True)  # Fecha de finalización (si aplica)
    progress = models.PositiveIntegerField(default=0)  # Porcentaje de progreso en el entrenamiento

    class Meta:
        unique_together = ('user', 'workout')  # Para evitar duplicados en la relación

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.workout.name}"