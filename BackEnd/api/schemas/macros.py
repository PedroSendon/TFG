from pydantic import BaseModel, Field
from typing import Optional


class MealPlanSchema(BaseModel):
    name: str  # Añadir el campo 'name'
    user_id: Optional[int]  # Lo hacemos opcional para permitir meal plans sin asignar
    diet_type: str
    calories: int
    proteins: float
    carbs: float
    fats: float

    class Config:
        from_attributes = True
