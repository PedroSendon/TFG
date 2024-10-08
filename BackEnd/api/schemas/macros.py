from pydantic import BaseModel, Field
from typing import Optional

class MacrosRecommendationSchema(BaseModel):
    kcal: int = Field(..., gt=0, description="Calorías recomendadas")
    proteins: float = Field(..., gt=0, description="Gramos de proteínas")
    carbs: float = Field(..., gt=0, description="Gramos de carbohidratos")
    fats: float = Field(..., gt=0, description="Gramos de grasas")
    diet_type: str = Field(..., description="Tipo de dieta")
    description: Optional[str] = Field(None, description="Descripción opcional de la dieta")

    class Config:
        from_attributes = True

class MealPlanSchema(BaseModel):
    user_id: int
    diet_type: str
    meal_name: str
    calories: int
    proteins: float
    carbs: float
    fats: float

    class Config:
        from_attributes = True
