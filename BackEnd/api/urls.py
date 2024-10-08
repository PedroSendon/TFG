from django.urls import path

from django.conf.urls.static import static  # Import static

from BackEnd import settings
from .views import user
from .views import macros
from .views import workout
from .views import statistics
from .views import exercise


urlpatterns = [
    # Usuarios
    path('register/', user.register, name='register'),
    path('login/', user.login, name='login'),

    path('user/details/', user.save_user_details, name='user-details'),
    path('users/email/<str:email>/', user.get_user_by_email, name='get-user-by-email'),
    path('users/', user.get_all_users, name='get-all-users'),
    path('users/update/<int:user_id>/', user.update_user_as_admin, name='update-user'),
    path('users/delete/<int:user_id>/', user.delete_user, name='delete-user'),
    path('users/assign-role/<int:user_id>/', user.assign_role, name='assign-role'),
    path('users/create/', user.create_user_as_admin, name='create-user-as-admin'),
    path('users/<int:user_id>/assign-plans/', user.assign_plans, name='assign-plans'),

    # Perfil de usuario
    path('profile/', user.get_user_profile, name='get-user-profile'),
    path('profile/update/', user.update_user_profile, name='update-user-profile'),
    path('profile/password/', user.change_password, name='change-password'),
    path('profile/photo/', user.upload_profile_photo, name='upload-profile-photo'),
    path('profile/weight-history/', user.get_weight_history, name='get-weight-history'),

    # Workouts
    path('workouts/', workout.get_workouts, name='get-workouts'),
    path('workouts/create/', workout.create_workout, name='create-workout'),
    path('workouts/<int:workout_id>/update/', workout.update_workout, name='update-workout'),
    path('workouts/<int:workout_id>/delete/', workout.delete_workout, name='delete-workout'),
    path('workouts/by-user/', workout.get_workouts_by_user, name='get-workouts-by-user'),
    path('workouts/details/', workout.get_workout_details, name='get-workout-details'),
    path('workout/<int:day>/', workout.get_workout_by_day, name='get-workout-by-day'),
    path('workout/day/<int:day_id>/', workout.get_workout_exercises_by_day, name='get-workout-exercises-by-day'),
    path('workout/day/<int:day_id>/complete/', workout.mark_workout_day_complete, name='mark-workout-day-complete'),

    # Exercises
    path('exercises/create/', exercise.create_exercise, name='create-exercise'),
    path('exercises/details/', exercise.get_exercise_details, name='get-exercise-details'),
    path('exercises/all/', exercise.list_all_exercises, name='list-all-exercises'),
    path('exercises/by-train/', exercise.get_exercises_by_training, name='get-exercises-by-training'),
    path('exercises/muscle-groups/', exercise.get_muscle_groups, name='get-muscle-groups'),
    path('exercises/<int:exercise_id>/', exercise.update_exercise, name='update-exercise'),

    # Macros
    path('macros/<str:category>/<int:id>/', macros.get_macronutrient_recommendation, name='get-macronutrient-recommendation'),
    path('macros/<str:category>/<int:id>/update/', macros.update_macronutrient_recommendation, name='update-macronutrient-recommendation'),
    path('macros/<str:category>/<int:id>/delete/', macros.delete_macronutrient_recommendation, name='delete-macronutrient-recommendation'),
    path('macros/create/', macros.add_macronutrient_recommendation, name='add-macronutrient-recommendation'),
    path('macros/', macros.get_user_macronutrients, name='get-macronutrients'),
    path('macros/<str:category>/', macros.get_macros_by_category, name='get-macros-by-category'),
    path('diet-categories/', macros.list_diet_categories, name='get-diet-categories'),

    # Estadísticas
    path('statistics/exercises/', statistics.get_exercise_popularity, name='get-exercise-popularity'),
    path('statistics/growth/', statistics.get_platform_growth, name='get-platform-growth'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
