from django.contrib import admin

# Register your models here.
from .models.exercise import MuscleGroup
from django.contrib import admin
from .models.User import User, DietPreferences
from .models.workout import Workout, WorkoutExercise
from .models.macros import MealPlan, DietCategory
from .models.exercise import Exercise


@admin.register(MuscleGroup)
class MuscleGroupAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')

# Modelo intermedio WorkoutExercise para gestionar los ejercicios de cada entrenamiento
class WorkoutExerciseInline(admin.TabularInline):
    model = WorkoutExercise
    extra = 1  # Permite añadir ejercicios adicionales al crear/editar un entrenamiento

# Registrar el modelo de Ejercicio (Exercise)
@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'display_muscle_groups')
    search_fields = ('name', 'description')
    list_filter = ('muscle_groups',)

    # Función para convertir los grupos musculares en una cadena de texto
    def display_muscle_groups(self, obj):
        return ", ".join([muscle.name for muscle in obj.muscle_groups.all()])
    display_muscle_groups.short_description = 'Muscle Groups'

# Registrar el modelo de Usuario (User)
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'role')
    search_fields = ('first_name', 'last_name', 'email')
    list_filter = ('role',)

# Registrar el modelo de Entrenamiento (Workout)
@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'media')
    search_fields = ('name', 'description')
    inlines = [WorkoutExerciseInline]

# Registrar el modelo de Plan Nutricional (MealPlan)
@admin.register(MealPlan)
class MealPlanAdmin(admin.ModelAdmin):
    list_display = ('user', 'diet_type', 'calories')
    search_fields = ('diet_type', '')
    list_filter = ('diet_type',)

# Registrar el modelo de Preferencias de Dieta (DietPreferences)
@admin.register(DietPreferences)
class DietPreferencesAdmin(admin.ModelAdmin):
    list_display = ('user', 'diet_type', 'macronutrient_intake')
    search_fields = ('diet_type', 'user__first_name', 'user__last_name')


# Registrar el modelo intermedio de WorkoutExercise para administrar las relaciones
@admin.register(WorkoutExercise)
class WorkoutExerciseAdmin(admin.ModelAdmin):
    list_display = ('workout', 'exercise', 'sets', 'reps', 'rest')
    search_fields = ('workout__name', 'exercise__name')

# Registrar la categoría de dieta (DietCategory)
@admin.register(DietCategory)
class DietCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)