from django.db import models
from django.contrib.postgres.fields import ArrayField
from .choices import ROLE_CHOICES, STATUS_CHOICES, WEIGHT_GOAL_CHOICES, ACTIVITY_LEVEL_CHOICES, EQUIPMENT_CHOICES, DIET_TYPE_CHOICES
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """
        Crea y guarda un usuario regular con el email, contraseña y demás datos.
        """
        if not email:
            raise ValueError('El usuario debe tener un correo electrónico')
        if not extra_fields.get('first_name'):
            raise ValueError('El usuario debe tener un nombre')
        if not extra_fields.get('last_name'):
            raise ValueError('El usuario debe tener un apellido')
        if not extra_fields.get('birth_date'):
            raise ValueError('El usuario debe tener una fecha de nacimiento')
        if not extra_fields.get('gender'):
            raise ValueError('El usuario debe especificar un género')
        if not extra_fields.get('role'):
            raise ValueError('El usuario debe tener un rol asignado')

        # Normaliza el email y establece valores predeterminados
        email = self.normalize_email(email)
        extra_fields.setdefault('is_active', True)

        # Crear el usuario
        user = self.model(
            email=email,
            first_name=extra_fields.pop('first_name'),
            last_name=extra_fields.pop('last_name'),
            birth_date=extra_fields.pop('birth_date'),
            gender=extra_fields.pop('gender'),
            profile_photo=extra_fields.pop('profile_photo', None),  # Campo opcional
            status=extra_fields.pop('status', 'awaiting_assignment'),  # Valor predeterminado
            role=extra_fields.pop('role', 'cliente'),  # Valor predeterminado
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Crea y guarda un superusuario con el email, contraseña y demás datos.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')

        return self.create_user(email, password, **extra_fields)



class User(AbstractUser):
    username = None  # Eliminamos username
    email = models.EmailField(unique=True)  # Usamos email como identificador único
    birth_date = models.DateField(null=True, blank=True)
    gender_choices = [('M', 'Male'), ('F', 'Female'), ('O', 'Other')]
    gender = models.CharField(max_length=1, choices=gender_choices, null=True, blank=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='awaiting_assignment')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='cliente')

    USERNAME_FIELD = 'email'  # Email es el identificador único para la autenticación
    REQUIRED_FIELDS = ['first_name', 'last_name']  # Campos obligatorios además de email

    objects = UserManager()  # Usamos el UserManager personalizado

    def __str__(self):
        return f"User: {self.email}, ID: {self.id}"

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

