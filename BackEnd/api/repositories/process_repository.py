from api.models.process import ProgressTracking, ExerciseLog
from django.core.exceptions import ObjectDoesNotExist

class ProgressTrackingRepository:
    @staticmethod
    def create_progress(user, weight=None, completed_workouts=0):
        progress = ProgressTracking.objects.create(user=user, weight=weight, completed_workouts=completed_workouts)
        return progress

    @staticmethod
    def get_progress_by_user(user_id):
        return ProgressTracking.objects.filter(user_id=user_id).order_by('-date')

    @staticmethod
    def get_progress_by_id(progress_id):
        try:
            return ProgressTracking.objects.get(id=progress_id)
        except ObjectDoesNotExist:
            return None

    @staticmethod
    def update_progress(progress_id, weight=None, completed_workouts=None):
        progress = ProgressTrackingRepository.get_progress_by_id(progress_id)
        if progress:
            if weight is not None:
                progress.weight = weight
            if completed_workouts is not None:
                progress.completed_workouts = completed_workouts
            progress.save()
        return progress

    @staticmethod
    def delete_progress(progress_id):
        progress = ProgressTrackingRepository.get_progress_by_id(progress_id)
        if progress:
            progress.delete()
        return progress is not None

class ExerciseLogRepository:
    @staticmethod
    def create_exercise_log(user, workout, exercise, sets_completed, reps_completed, rest_time):
        exercise_log = ExerciseLog.objects.create(
            user=user,
            workout=workout,
            exercise=exercise,
            sets_completed=sets_completed,
            reps_completed=reps_completed,
            rest_time=rest_time
        )
        return exercise_log

    @staticmethod
    def get_exercise_logs_by_user(user_id):
        return ExerciseLog.objects.filter(user_id=user_id).order_by('-date')

    @staticmethod
    def get_exercise_log_by_id(log_id):
        try:
            return ExerciseLog.objects.get(id=log_id)
        except ObjectDoesNotExist:
            return None

    @staticmethod
    def update_exercise_log(log_id, sets_completed=None, reps_completed=None, rest_time=None):
        log = ExerciseLogRepository.get_exercise_log_by_id(log_id)
        if log:
            if sets_completed is not None:
                log.sets_completed = sets_completed
            if reps_completed is not None:
                log.reps_completed = reps_completed
            if rest_time is not None:
                log.rest_time = rest_time
            log.save()
        return log

    @staticmethod
    def delete_exercise_log(log_id):
        log = ExerciseLogRepository.get_exercise_log_by_id(log_id)
        if log:
            log.delete()
        return log is not None