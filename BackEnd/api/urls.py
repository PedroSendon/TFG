from django.urls import path

from django.conf.urls.static import static  # Import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from BackEnd import settings
from .views import user
from .views import macros
from .views import workout
from .views import statistics
from .views import exercise
from .views import trainingplan


urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Usuarios
    path('register/', user.register, name='register'),
    path('login/', user.login, name='login'),
    path('form/', user.create_user_details, name='create_user_details'), 
    
    #Imagenes
    path('logo/', user.obtener_logo, name='obtener_logo'),

    # Admin users
    path('user/details/', user.save_user_details, name='user-details'),
    path('users/email/<str:email>/', user.get_user_by_email, name='get-user-by-email'),
    path('users/', user.get_all_users, name='get-all-users'),
    path('users/update/<int:user_id>/', user.update_user_as_admin, name='update-user'),
    path('users/delete/<int:user_id>/', user.delete_user, name='delete-user'),
    path('users/create/', user.create_user_as_admin, name='create-user-as-admin'),
    path('users/<int:user_id>/assign-plans/', user.assign_plans, name='assign-plans'),
    path('users/details/<int:user_id>/', user.get_user_details, name='get-user-details'),
    path('user/role/', user.get_user_role, name='get_user_role'),
    path('user/status/', user.get_user_status, name='get_user_status'),
    path('user/unassigned/all/', user.get_unassigned_users_for_admin, name='unassigned-users-admin'),
    path('user/unassigned/nutrition/', user.get_unassigned_users_for_nutrition, name='get_unassigned_users_for_nutrition'),
    path('user/unassigned/training/', user.get_unassigned_users_for_training, name='get_unassigned_users_for_training'),
    path('users/all-details/<int:user_id>/', user.get_user_all_details, name='get-all-details'),
    path('assign-single-plan/<int:user_id>/', user.assign_single_plan, name='assign-single-plan'),

    # Endpoints para WeightRecord
    path('weight-records/', user.obtener_registros_peso_usuario, name='weight-records'),
    path('weight-records/create/', user.crear_registro_peso, name='crear_registro_peso'),
    path('latest-weight-record/', user.get_latest_weight_record, name='latest-weight-record'),

    # Perfil de usuario
    path('profile/', user.get_user_profile, name='get-user-profile'),
    path('profile/update/', user.update_user_profile, name='update-user-profile'),
    path('profile/password/', user.change_password, name='change-password'),
    path('profile/photo/', user.upload_profile_photo, name='upload-profile-photo'),
    

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
    path('weekly-workout/<int:workout_id>/complete/', workout.complete_workout, name='mark-workout-as-completed'),
  
    # Planes de entrenamiento
    path('trainingplans/create/', trainingplan.create_training_plan, name='create-training-plan'),
    path('trainingplans/', trainingplan.get_training_plans, name='training-plans'),
    path('trainingplans/<int:training_plan_id>/delete/', trainingplan.delete_training_plan, name='delete-training-plan'),
    path('training-plans/<int:training_plan_id>/', trainingplan.get_training_plan, name='get-training-plan'),
    path('training-plans/update/', trainingplan.update_training_plan, name='update-training-plan'),
    path('training-plans/<int:training_plan_id>/delete/', trainingplan.delete_training_plan, name='delete-training-plan'),
    path('assigned-training-plan/', trainingplan.get_assigned_training_plan, name='get-assigned-training-plan'),
    path('next-pending-workout/', trainingplan.get_next_pending_workout, name='get-next-pending-workout'),
    path('workout/complete/<int:day_id>/', trainingplan.mark_workout_complete, name='mark-workout-complete'),
    path('images/', trainingplan.get_training_plan_images, name='get_training_plan_images'),

    # Exercises
    path('exercises/create/', exercise.create_exercise, name='create-exercise'),
    path('exercises/details/', exercise.get_exercise_details, name='get-exercise-details'),
    path('exercises/by_training/', exercise.get_exercises_by_training, name='get_exercises_by_training'),
    path('exercises/<int:exercise_id>/', exercise.get_exercise_by_id, name='get-exercise-by-id'),
    path('exercises/all/', exercise.list_all_exercises, name='list-all-exercises'),
    path('exercises/update/', exercise.update_exercise, name='update_exercise'),
    path('exercises/<int:exercise_id>/delete/', exercise.delete_exercise, name='delete-exercise'),

    # Macros
    path('mealplans/all/', macros.get_all_mealplans, name='get-all-mealplans'),  # Primero la ruta más específica
    path('mealplans/<str:category>/<int:id>/', macros.get_mealplan, name='get-mealplan'),
    path('mealplans/<int:id>/', macros.get_mealplan_by_id, name='get-mealplan'),
    path('mealplans/<str:category>/<int:id>/update/', macros.update_mealplan, name='update-mealplan'),
    path('mealplans/<str:category>/<int:id>/delete/', macros.delete_mealplan, name='delete-mealplan'),
    path('mealplans/', macros.get_user_mealplan, name='get-mealplans'),
    path('mealplans/<str:category>/', macros.get_mealplans_by_category, name='get-mealplans-by-category'),
    #path('mealplans/create/', macros.create_meal_plan_view, name='create_meal_plan'),
    path('diet-categories/', macros.list_diet_categories, name='get-diet-categories'),

    # Endpoints para ExerciseLog
    path('exercise-log/', statistics.create_exercise_log, name='create-exercise-log'),
    path('exercise-log/user/<int:user_id>/', statistics.get_exercise_logs_by_user, name='get-exercise-logs-by-user'),
    path('exercise-log/<int:log_id>/', statistics.update_exercise_log, name='update-exercise-log'),
    path('exercise-log/<int:log_id>/delete/', statistics.delete_exercise_log, name='delete-exercise-log'),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
