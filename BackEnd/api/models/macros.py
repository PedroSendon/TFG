from django.db import models

class MacrosRecommendation(models.Model):
    DIET_TYPES = [
        ('weightLoss', 'Pérdida de Peso'),
        ('muscleGain', 'Ganancia Muscular'),
        ('maintenance', 'Mantenimiento'),
    ]

    kcal = models.PositiveIntegerField()  # Calorías recomendadas
    proteins = models.DecimalField(max_digits=5, decimal_places=2)  # Gramos de proteínas
    carbs = models.DecimalField(max_digits=5, decimal_places=2)  # Gramos de carbohidratos
    fats = models.DecimalField(max_digits=5, decimal_places=2)  # Gramos de grasas
    diet_type = models.CharField(max_length=20, choices=DIET_TYPES)  # Tipo de dieta
    description = models.TextField(blank=True, null=True)  # Descripción opcional

    def __str__(self):
        return f"{self.get_diet_type_display()} - {self.kcal} kcal"

class MealPlan(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)  # Relación con el usuario
    diet_type = models.CharField(max_length=20, choices=[('weightLoss', 'Pérdida de Peso'), ('muscleGain', 'Ganancia Muscular'), ('maintenance', 'Mantenimiento')])
    meal_name = models.CharField(max_length=255)  # Nombre de la comida (desayuno, almuerzo, etc.)
    calories = models.PositiveIntegerField()  # Calorías de la comida
    proteins = models.DecimalField(max_digits=5, decimal_places=2)  # Proteínas en gramos
    carbs = models.DecimalField(max_digits=5, decimal_places=2)  # Carbohidratos en gramos
    fats = models.DecimalField(max_digits=5, decimal_places=2)  # Grasas en gramos

    def __str__(self):
        return f"{self.meal_name} for {self.user} ({self.diet_type})"
