from django.db import models
from .User import User  # Asegúrate de que 'User' esté definido en otro archivo de modelos

class DietCategory(models.Model):
    name = models.CharField(max_length=50, unique=True)  # Nombre de la categoría (p.ej., 'weightLoss', 'muscleGain', 'maintenance')
    description = models.TextField(blank=True, null=True)  # Descripción opcional de la categoría

    def __str__(self):
        return self.name

class MealPlan(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)  # Relación con el usuario
    diet_type = models.CharField(max_length=20, choices=[('weightLoss', 'Pérdida de Peso'), ('muscleGain', 'Ganancia Muscular'), ('maintenance', 'Mantenimiento')])
    calories = models.PositiveIntegerField()  # Calorías de la comida
    proteins = models.DecimalField(max_digits=5, decimal_places=2)  # Proteínas en gramos
    carbs = models.DecimalField(max_digits=5, decimal_places=2)  # Carbohidratos en gramos
    fats = models.DecimalField(max_digits=5, decimal_places=2)  # Grasas en gramos

    def __str__(self):
        return f"Meal plan for {self.user} ({self.diet_type})"


class UserNutritionPlan(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='user_nutrition_plans')
    plan = models.ForeignKey('MealPlan', on_delete=models.CASCADE, related_name='user_nutrition_plans')
    date_assigned = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'plan')

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.plan.diet_type}"

