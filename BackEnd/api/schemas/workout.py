from datetime import date
from pydantic import BaseModel, conint, constr, PositiveInt
from typing import List, Optional
from .exercise import ExerciseSchema

class WorkoutExerciseSchema(BaseModel):
    exercise: ExerciseSchema  # Se asocia con el esquema de Exercise
    sets: int
    reps: int
    rest: int

    class Config:
        from_attributes = True

class WorkoutSchema(BaseModel):
    id: int
    name: str
    description: str
    exercises: List[WorkoutExerciseSchema]  # Cambiado para incluir la relación con los ejercicios
    media: Optional[str] = None  # URL para media (opcional)
    
    # Nuevos campos añadidos
    duration: int

    class Config:
        from_attributes = True

class TrainingPlanSchema(BaseModel):
    id: PositiveInt
    name: str
    description: Optional[str] = None
    difficulty: constr(min_length=1, max_length=100)  # Cadena con una longitud mínima y máxima
    equipment: Optional[str] = None  # Equipamiento opcional
    media: Optional[str] = None  # URL opcional para imágenes o videos
    duration: conint(gt=0)  # Duración en días, debe ser mayor a 0
    workouts: List[PositiveInt]  # IDs de entrenamientos relacionados

    class Config:
        from_attributes = True  # Esto permite que puedas convertir instancias de tu ORM a este esquema.


class TrainingPlanCreate(BaseModel):
    name: str = constr(min_length=1, max_length=100)
    description: Optional[str] = None
    difficulty: constr(min_length=1, max_length=100)
    equipment: Optional[str] = None
    media: Optional[str] = None
    duration: conint(gt=0)  # Duración en días, mayor a 0
    workout_ids: List[PositiveInt]  # Lista de IDs de entrenamientos relacionados

    class Config:
        from_attributes = True

class WorkoutExerciseDetailSchema(BaseModel):
    name: constr(max_length=100)
    imageUrl: Optional[str]
    sets: int
    reps: int
    completed: bool

    class Config:
        from_attributes = True

class UserWorkoutSchema(BaseModel):
    user_id: int
    workout: WorkoutSchema  # Relaciona el entrenamiento con el esquema actualizado de Workout
    progress: Optional[int] = 0  # Porcentaje de progreso en el entrenamiento
    date_started: date
    date_completed: Optional[date] = None

    class Config:
        from_attributes = True
