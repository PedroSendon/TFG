from pydantic import BaseModel, Field
from typing import Optional


class MealPlanSchema(BaseModel):
    user_id: int
    diet_type: str
    calories: int
    proteins: float
    carbs: float
    fats: float

    class Config:
        from_attributes = True
