from pydantic import BaseModel, Field
from typing import Optional, Dict


class MealPlanSchema(BaseModel):
    name: str  # Añadir el campo 'name'
    user_id: Optional[int]  # Lo hacemos opcional para permitir meal plans sin asignar
    diet_type: str
    description: str
    calories: int
    proteins: float
    carbs: float
    fats: float
    meal_distribution: Optional[Dict[str, int]] = None  # Añadido para la distribución de comidas

    class Config:
        from_attributes = True
