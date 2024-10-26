from django.urls import path

from django.conf.urls.static import static  # Import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from BackEnd import settings
from .views import user
from .views import macros
from .views import workout
from .views import statistics
from .views import exercise


urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Usuarios
    path('register/', user.register, name='register'),
    path('login/', user.login, name='login'),
    path('form/', user.create_user_details, name='create_user_details'), 
    
    #Imagenes
    path('logo/', user.obtener_logo, name='obtener_logo'),


    path('user/details/', user.save_user_details, name='user-details'),
    path('users/email/<str:email>/', user.get_user_by_email, name='get-user-by-email'),
    path('users/', user.get_all_users, name='get-all-users'),
    path('users/update/<int:user_id>/', user.update_user_as_admin, name='update-user'),
    path('users/delete/<int:user_id>/', user.delete_user, name='delete-user'),
    path('users/assign-role/<int:user_id>/', user.assign_role, name='assign-role'),
    path('users/create/', user.create_user_as_admin, name='create-user-as-admin'),
    path('users/<int:user_id>/assign-plans/', user.assign_plans, name='assign-plans'),
    path('users/details/<int:user_id>/', user.get_user_details, name='get-user-details'),

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

    # Planes de entrenamiento
    path('trainingplans/create/', workout.create_training_plan, name='create-training-plan'),
    path('trainingplans/', workout.get_training_plans, name='training-plans'),
    path('trainingplans/<int:plan_id>/delete/', workout.delete_training_plan, name='delete-training-plan'),
    path('training-plans/<int:training_plan_id>/', workout.get_training_plan, name='get-training-plan'),
    path('training-plans/<int:training_plan_id>/update/', workout.update_training_plan, name='update-training-plan'),
    path('training-plans/<int:training_plan_id>/delete/', workout.delete_training_plan, name='delete-training-plan'),


    # Exercises
    path('exercises/create/', exercise.create_exercise, name='create-exercise'),
    path('exercises/details/', exercise.get_exercise_details, name='get-exercise-details'),
    path('exercises/all/', exercise.list_all_exercises, name='list-all-exercises'),
    path('exercises/by-train/', exercise.get_exercises_by_training, name='get-exercises-by-training'),
    path('exercises/<int:exercise_id>/', exercise.update_exercise, name='update-exercise'),
    path('exercises/<int:exercise_id>/delete/', exercise.delete_exercise, name='delete-exercise'),


    # Macros
    path('mealplans/all/', macros.get_all_mealplans, name='get-all-mealplans'),  # Primero la ruta más específica
    path('mealplans/<str:category>/<int:id>/', macros.get_mealplan, name='get-mealplan'),
    path('mealplans/<str:category>/<int:id>/update/', macros.update_mealplan, name='update-mealplan'),
    path('mealplans/<str:category>/<int:id>/delete/', macros.delete_mealplan, name='delete-mealplan'),
    path('mealplans/', macros.get_user_mealplan, name='get-mealplans'),
    path('mealplans/<str:category>/', macros.get_mealplans_by_category, name='get-mealplans-by-category'),
    path('mealplans/create/', macros.add_mealplan, name='add-mealplan'),
    path('diet-categories/', macros.list_diet_categories, name='get-diet-categories'),

    # Estadísticas
    path('statistics/exercises/', statistics.get_exercise_popularity, name='get-exercise-popularity'),
    path('statistics/growth/', statistics.get_platform_growth, name='get-platform-growth'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
