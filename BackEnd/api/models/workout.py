from django.db import models
from .user import User  # Asegúrate de que 'User' esté definido en otro archivo de modelos
from .exercise import Exercise  # Asegúrate de que 'Exercise' esté definido en otro archivo de modelos

class Workout(models.Model):
    
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
    sets = models.IntegerField(null=True, blank=True)  # Permite valores nulos
    reps = models.IntegerField(null=True, blank=True)  # Permite valores nulos
    rest = models.IntegerField(null=True, blank=True)  # Permite valores nulos

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

class WeeklyWorkout(models.Model):
    user_workout = models.ForeignKey(UserWorkout, on_delete=models.CASCADE, related_name='weekly_workouts')
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)  # Indica si el entrenamiento está completado o no
    progress = models.PositiveIntegerField(default=0)  # Progreso en el entrenamiento (0 a 100)

    def __str__(self):
        return f"{self.workout.name} for {self.user_workout.user.first_name}"
     # Nuevo método
    def get_user(self):
        return self.user_workout.user


class Imagen(models.Model):
    nombre = models.CharField(max_length=255)
    imagen = models.ImageField(upload_to='productos/')
    descripcion = models.TextField()

    def __str__(self):
        return self.nombre
