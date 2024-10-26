from django.contrib import admin
from .models.user import User, UserDetails, DietPreferences
from .models.macros import DietCategory, MealPlan, UserNutritionPlan
from .models.exercise import Exercise
from .models.process import ProgressTracking, ExerciseLog
from .models.workout import Workout, WorkoutExercise, UserWorkout, TrainingPlan, Imagen

# Registro de todos los modelos en el panel de administración de Django

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'email', 'role']
    search_fields = ['first_name', 'last_name', 'email']
    list_filter = ['role']


@admin.register(UserDetails)
class UserDetailsAdmin(admin.ModelAdmin):
    list_display = ['user', 'height', 'weight', 'weight_goal', 'weekly_training_days', 'daily_training_time']
    search_fields = ['user__first_name', 'user__last_name']
    list_filter = ['weekly_training_days', 'weight_goal']  # Agregar weight_goal al filtro


@admin.register(DietPreferences)
class DietPreferencesAdmin(admin.ModelAdmin):
    list_display = ['user', 'diet_type', 'meals_per_day']
    search_fields = ['user__first_name', 'user__last_name']
    list_filter = ['diet_type']


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'media']
    search_fields = ['name']
    list_filter = ['muscleGroups']


@admin.register(MealPlan)
class MealPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'diet_type', 'calories', 'proteins', 'carbs', 'fats']  # Mostrar el nombre del plan
    search_fields = ['name', 'diet_type']
    list_filter = ['diet_type']


@admin.register(DietCategory)
class DietCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']
    list_filter = ['name']


@admin.register(UserNutritionPlan)
class UserNutritionPlanAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'date_assigned']  # Aquí sí incluimos 'user' porque es parte de UserNutritionPlan
    search_fields = ['user__first_name', 'user__last_name', 'plan__diet_type']
    list_filter = ['date_assigned']


@admin.register(ProgressTracking)
class ProgressTrackingAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'weight', 'completed_workouts']
    search_fields = ['user__first_name', 'user__last_name']
    list_filter = ['date']


@admin.register(ExerciseLog)
class ExerciseLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'workout', 'exercise', 'date', 'sets_completed', 'reps_completed']
    search_fields = ['user__first_name', 'user__last_name', 'exercise__name']
    list_filter = ['date']

class WorkoutExerciseInline(admin.TabularInline):
    model = WorkoutExercise
    extra = 1  # Muestra un campo extra para agregar un nuevo ejercicio

@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'duration']
    search_fields = ['name']
    list_filter = ['duration']
    inlines = [WorkoutExerciseInline]  # Permite añadir ejercicios en la misma página de Workout


@admin.register(WorkoutExercise)
class WorkoutExerciseAdmin(admin.ModelAdmin):
    list_display = ['workout', 'exercise', 'sets', 'reps', 'rest']
    search_fields = ['workout__name', 'exercise__name']
    list_filter = ['sets', 'reps']


@admin.register(UserWorkout)
class UserWorkoutAdmin(admin.ModelAdmin):
    list_display = ['user', 'training_plan', 'date_started', 'progress']
    search_fields = ['user__first_name', 'user__last_name', 'training_plan__name']
    list_filter = ['date_started', 'progress']


@admin.register(TrainingPlan)
class TrainingPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'difficulty', 'duration', 'equipment']
    search_fields = ['name', 'difficulty']
    list_filter = ['difficulty']
    

@admin.register(Imagen)
class ImagenAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'descripcion']
    search_fields = ['nombre']
