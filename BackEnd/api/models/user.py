from django.db import models

class User(models.Model):
    ROLE_CHOICES = [
        ('cliente', 'Cliente'),
        ('administrador', 'Administrador'),
        ('entrenador', 'Entrenador'),
        ('nutricionista', 'Nutricionista'),
    ]
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    birth_date = models.DateField()
    gender_choices = [('M', 'Male'), ('F', 'Female'), ('O', 'Other')]
    gender = models.CharField(max_length=1, choices=gender_choices)
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    
    # Rol del usuario
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='cliente')

    def __str__(self):
        return f'{self.first_name} {self.last_name} - {self.email}'


from django.db import models

class UserDetails(models.Model):
    WEIGHT_GOAL_CHOICES = [
        ('gain_muscle', 'Ganar masa muscular'),
        ('lose_weight', 'Perder peso'),
        ('maintain', 'Mantenimiento'),
    ]
    ACTIVITY_LEVEL_CHOICES = [
        ('sedentary', 'Sedentario'),
        ('light', 'Ligera'),
        ('moderate', 'Moderada'),
        ('intense', 'Intensa'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='details')
    height = models.PositiveIntegerField()  # En cm
    weight = models.DecimalField(max_digits=5, decimal_places=2)  # En kg
    weight_goal = models.CharField(max_length=20, choices=WEIGHT_GOAL_CHOICES)  # Cambiado a opciones de texto
    weekly_training_days = models.PositiveIntegerField()
    daily_training_time = models.CharField(max_length=50)  # Ejemplo: '1-2 horas'
    physical_activity_level = models.CharField(max_length=20, choices=ACTIVITY_LEVEL_CHOICES)  # Opciones de nivel de actividad
    available_equipment = models.CharField(max_length=100, default="None")  # Ejemplo: 'Sin equipamiento'

    def __str__(self):
        return f'{self.user.first_name} {self.user.last_name} - Details'



class DietPreferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='diet_preferences')
    diet_type = models.CharField(max_length=100)  # Tipo de dieta
    meals_per_day = models.PositiveIntegerField()

    def __str__(self):
        return f'{self.user.first_name} {self.user.last_name} - Diet Preferences'
