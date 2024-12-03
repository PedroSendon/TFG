from pydantic import BaseModel, conint, constr, PositiveInt
from typing import List, Optional

class TrainingPlanSchema(BaseModel):
    id: PositiveInt
    name: str
    description: Optional[str] = None
    difficulty: constr(min_length=1, max_length=100)  # Cadena con una longitud mínima y máxima
    equipment: Optional[str] = None  # Equipamiento opcional
    duration: conint(gt=0)  # Duración en días, debe ser mayor a 0
    workouts: List[PositiveInt]  # IDs de entrenamientos relacionados

    class Config:
        from_attributes = True  # Esto permite que puedas convertir instancias de tu ORM a este esquema.


class TrainingPlanCreate(BaseModel):
    name: str = constr(min_length=1, max_length=100)
    description: Optional[str] = None
    difficulty: constr(min_length=1, max_length=100)
    equipment: Optional[str] = None
    duration: conint(gt=0)  # Duración en días, mayor a 0
    workout_ids: List[PositiveInt]  # Lista de IDs de entrenamientos relacionados

    class Config:
        from_attributes = True