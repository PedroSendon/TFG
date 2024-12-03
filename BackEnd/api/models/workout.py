from django.db import models
from .user import User  # Asegúrate de que 'User' esté definido en otro archivo de modelos
# Asegúrate de que 'Exercise' esté definido en otro archivo de modelos
from .exercise import Exercise


class Workout(models.Model):

    name = models.CharField(max_length=100)
    description = models.TextField()
    exercises = models.ManyToManyField(
        Exercise, through='WorkoutExercise', related_name='workouts')
    media = models.URLField(max_length=2000, null=True, blank=True)

    # Duración promedio del entrenamiento en minutos
    duration = models.PositiveIntegerField(default=60)

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
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='user_workouts')
    training_plan = models.ForeignKey(
        'TrainingPlan', on_delete=models.CASCADE, related_name='user_workouts', null=True, blank=True
    )  # Permite valores nulos en training_plan
    # Campos adicionales
    # Fecha en la que el usuario comenzó el plan de entrenamiento
    date_started = models.DateField(auto_now_add=True)
    # Fecha de finalización (si aplica)
    date_completed = models.DateField(null=True, blank=True)
    # Porcentaje de progreso en el plan de entrenamiento
    progress = models.PositiveIntegerField(default=0)

    class Meta:
        # Para evitar duplicados en la relación
        unique_together = ('user', 'training_plan')

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.training_plan.name}"


class WeeklyWorkout(models.Model):
    user_workout = models.ForeignKey(
        UserWorkout, on_delete=models.CASCADE, related_name='weekly_workouts')
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE)
    # Indica si el entrenamiento está completado o no
    completed = models.BooleanField(default=False)
    # Progreso en el entrenamiento (0 a 100)
    progress = models.PositiveIntegerField(default=0)

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
