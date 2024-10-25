from django.db import models
from .user import User  # Asegúrate de que 'User' esté definido en otro archivo de modelos

class DietCategory(models.Model):
    name = models.CharField(max_length=50, unique=True)  # Nombre de la categoría (p.ej., 'weightLoss', 'muscleGain', 'maintenance')
    description = models.TextField(blank=True, null=True)  # Descripción opcional de la categoría

    def __str__(self):
        return self.name

class MealPlan(models.Model):
    name = models.CharField(max_length=100, default="Default Plan Name")  # Valor predeterminado
    diet_type = models.CharField(max_length=20, choices=[('weightLoss', 'Pérdida de Peso'), ('muscleGain', 'Ganancia Muscular'), ('maintenance', 'Mantenimiento')])
    calories = models.PositiveIntegerField()  # Calorías de la comida
    proteins = models.DecimalField(max_digits=5, decimal_places=2)  # Proteínas en gramos
    carbs = models.DecimalField(max_digits=5, decimal_places=2)  # Carbohidratos en gramos
    fats = models.DecimalField(max_digits=5, decimal_places=2)  # Grasas en gramos

    def __str__(self):
        return f"Meal plan: {self.name} ({self.diet_type})"


class UserNutritionPlan(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='user_nutrition_plans')  # Relación con el usuario
    plan = models.ForeignKey('MealPlan', on_delete=models.CASCADE, related_name='user_nutrition_plans')  # Relación con el meal plan
    date_assigned = models.DateField(auto_now_add=True)  # Fecha en la que el plan fue asignado

    class Meta:
        unique_together = ('user', 'plan')  # Un usuario no puede tener el mismo plan más de una vez asignado

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.plan.diet_type}"


