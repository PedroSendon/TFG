from datetime import date
from pydantic import BaseModel, constr
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
    days_per_week: int
    duration: int
    difficulty: str  # Ligero, Moderado, Intermedio, Avanzado
    equipment: str  # Equipo necesario
    training_preference: str  # Preferencias de entrenamiento (casa, gimnasio, etc.)

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
