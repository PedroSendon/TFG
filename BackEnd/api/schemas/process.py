from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class ProgressTrackingSchema(BaseModel):
    user_id: int
    date: Optional[date]
    weight: Optional[float]
    body_fat_percentage: Optional[float]
    completed_workouts: Optional[int]

    class Config:
        from_attributes = True

class ExerciseLogSchema(BaseModel):
    user_id: int
    workout_id: int
    exercise_id: int
    date: Optional[date]
    sets_completed: int
    reps_completed: int
    rest_time: int

    class Config:
        from_attributes = True
