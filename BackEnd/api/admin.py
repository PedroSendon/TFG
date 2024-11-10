from django.contrib import admin
from .models.user import User, UserDetails, DietPreferences, WeightRecord  # Asegúrate de importar WeightRecord
from .models.macros import MealPlan, UserNutritionPlan
from .models.exercise import Exercise
from .models.process import ProgressTracking, ExerciseLog
from .models.workout import WeeklyWorkout, Workout, WorkoutExercise, UserWorkout, Imagen
from .models.trainingplan import TrainingPlan

# Registro de todos los modelos en el panel de administración de Django

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'email', 'role', 'status']
    search_fields = ['first_name', 'last_name', 'email']
    list_filter = ['role', 'status']
    list_editable = ['status']

@admin.register(UserDetails)
class UserDetailsAdmin(admin.ModelAdmin):
    list_display = ['user', 'height', 'weight', 'weight_goal', 'weekly_training_days', 'daily_training_time']
    search_fields = ['user__first_name', 'user__last_name']
    list_filter = ['weekly_training_days', 'weight_goal', 'available_equipment']

@admin.register(DietPreferences)
class DietPreferencesAdmin(admin.ModelAdmin):
    list_display = ['user', 'diet_type', 'meals_per_day']
    search_fields = ['user__first_name', 'user__last_name']
    list_filter = ['diet_type']
    
@admin.register(WeightRecord)
class WeightRecordAdmin(admin.ModelAdmin):
    list_display = ['user', 'weight', 'date']
    search_fields = ['user__first_name', 'user__last_name']
    list_filter = ['date']
    ordering = ['user', 'date']  # Ordenar registros por usuario y fecha

@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'media']
    search_fields = ['name']
    list_filter = ['muscleGroups']

@admin.register(MealPlan)
class MealPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'diet_type', 'calories', 'proteins', 'carbs', 'fats', 'description']  # Añadido 'description'
    search_fields = ['name', 'diet_type']
    list_filter = ['diet_type']
    fields = ['name', 'diet_type', 'calories', 'proteins', 'carbs', 'fats', 'meal_distribution', 'description']  # Añadido 'description' en 'fields'

@admin.register(UserNutritionPlan)
class UserNutritionPlanAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'date_assigned']
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
    extra = 1

@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'duration']
    search_fields = ['name']
    list_filter = ['duration']
    inlines = [WorkoutExerciseInline]

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

@admin.register(WeeklyWorkout)
class WeeklyWorkoutAdmin(admin.ModelAdmin):
    list_display = ('get_user', 'workout', 'completed')
    list_filter = ('completed',)
    search_fields = ('user_workout__user__first_name', 'user_workout__user__last_name', 'workout__name')
    ordering = ('user_workout__user', 'workout')
