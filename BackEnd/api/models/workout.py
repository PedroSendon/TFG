from django.db import models
from .user import User  # Asegúrate de que 'User' esté definido en otro archivo de modelos
from .exercise import Exercise  # Asegúrate de que 'Exercise' esté definido en otro archivo de modelos

class Workout(models.Model):
    DIFFICULTY_LEVELS = [
        ('ligero', 'Ligero'),
        ('moderado', 'Moderado'),
        ('intermedio', 'Intermedio'),
        ('avanzado', 'Avanzado'),
    ]
    name = models.CharField(max_length=100)
    description = models.TextField()
    exercises = models.ManyToManyField(Exercise, through='WorkoutExercise', related_name='workouts')
    media = models.URLField(blank=True, null=True)

    duration = models.PositiveIntegerField(default=60)  # Duración promedio del entrenamiento en minutos


    def __str__(self):
        return self.name


class WorkoutExercise(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE)
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    sets = models.PositiveIntegerField()
    reps = models.PositiveIntegerField()
    rest = models.PositiveIntegerField()  # Descanso en segundos entre series

    def __str__(self):
        return f'{self.workout.name} - {self.exercise.name}'

class UserWorkout(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_workouts')
    training_plan = models.ForeignKey('TrainingPlan', on_delete=models.CASCADE, related_name='user_workouts', default=1 )  # Relación con el plan de entrenamiento
    
    # Campos adicionales
    date_started = models.DateField(auto_now_add=True)  # Fecha en la que el usuario comenzó el plan de entrenamiento
    date_completed = models.DateField(null=True, blank=True)  # Fecha de finalización (si aplica)
    progress = models.PositiveIntegerField(default=0)  # Porcentaje de progreso en el plan de entrenamiento

    class Meta:
        unique_together = ('user', 'training_plan')  # Para evitar duplicados en la relación

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.training_plan.name}"

    
class TrainingPlan(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    workouts = models.ManyToManyField(Workout, related_name='training_plans')  # Relacionamos los entrenamientos incluidos en el plan
    media = models.URLField(blank=True, null=True)
    difficulty = models.CharField(max_length=20, choices=Workout.DIFFICULTY_LEVELS)  # Usamos las mismas dificultades
    equipment = models.CharField(max_length=100)  # Equipamiento requerido para el plan
    duration = models.PositiveIntegerField()  # Duración del plan completo en días o semanas

    def __str__(self):
        return self.name

class Imagen(models.Model):
    nombre = models.CharField(max_length=255)
    imagen = models.ImageField(upload_to='productos/')
    descripcion = models.TextField()

    def __str__(self):
        return self.nombre
