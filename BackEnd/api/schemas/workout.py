from datetime import date
from pydantic import BaseModel, constr
from typing import List, Optional
from .exercise import ExerciseSchema

class WorkoutExerciseSchema(BaseModel):
    exercise: ExerciseSchema  # Se asocia con el esquema de Exercise
    sets: int
    reps: int
    rest: int

class WorkoutSchema(BaseModel):
    name: str
    description: str
    exercises: List[WorkoutExerciseSchema]  # Lista de ejercicios con sus detalles (sets, reps, rest)
    media: Optional[str] = None  # URL para media (opcional)

    class Config:
        orm_mode = True

class WorkoutSchema(BaseModel):
    name: str
    description: str
    media: Optional[str] = None  # URL para media (opcional)

    class Config:
        orm_mode = True

class WorkoutExerciseDetailSchema(BaseModel):
    name: constr(max_length=100)
    imageUrl: Optional[str]
    sets: int
    reps: int
    completed: bool

    class Config:
        orm_mode = True

class UserWorkoutSchema(BaseModel):
    user_id: int
    workout: WorkoutSchema  # Relaciona el entrenamiento con el esquema simplificado
    progress: Optional[int] = 0  # Porcentaje de progreso en el entrenamiento
    date_started: date
    date_completed: Optional[date] = None

    class Config:
        orm_mode = True
