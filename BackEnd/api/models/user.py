from django.db import models
from django.contrib.postgres.fields import ArrayField
from .choices import ROLE_CHOICES, STATUS_CHOICES, WEIGHT_GOAL_CHOICES, ACTIVITY_LEVEL_CHOICES, EQUIPMENT_CHOICES, DIET_TYPE_CHOICES

class User(models.Model):

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    birth_date = models.DateField()
    gender_choices = [('M', 'Male'), ('F', 'Female'), ('O', 'Other')]
    gender = models.CharField(max_length=1, choices=gender_choices)
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='awaiting_assignment')

    # Rol del usuario
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='cliente')

    @property
    def is_authenticated(self):
        return True

    def __str__(self):
        return f'{self.first_name} {self.last_name} - {self.email}'


class UserDetails(models.Model):
        
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='details')
    height = models.PositiveIntegerField()  # En cm
    weight = models.DecimalField(max_digits=5, decimal_places=2)  # En kg
    weight_goal = models.CharField(max_length=20, choices=WEIGHT_GOAL_CHOICES)  # Cambiado a opciones de texto
    weekly_training_days = models.PositiveIntegerField()
    daily_training_time = models.CharField(max_length=50)  # Ejemplo: '1-2 horas'
    physical_activity_level = models.CharField(max_length=20, choices=ACTIVITY_LEVEL_CHOICES)  # Opciones de nivel de actividad
    available_equipment = models.CharField(max_length=20, choices=EQUIPMENT_CHOICES, default="sin_equipamiento")  # Opciones limitadas de equipo

    def __str__(self):
        return f'{self.user.first_name} {self.user.last_name} - Details'



class DietPreferences(models.Model):
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='diet_preferences')
    diet_type = models.CharField(max_length=20, choices=DIET_TYPE_CHOICES, default='balanced')  # Tipo de dieta limitado a opciones
    meals_per_day = models.PositiveIntegerField()

    def __str__(self):
        return f'{self.user.first_name} {self.user.last_name} - Diet Preferences'


class WeightRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='weight_records')
    weight = models.DecimalField(max_digits=5, decimal_places=2)  # Peso en kg
    date = models.DateField(auto_now_add=True)  # Fecha del registro

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.weight} kg on {self.date}"

