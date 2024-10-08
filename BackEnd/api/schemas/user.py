from datetime import date
from pydantic import BaseModel, EmailStr, Field, constr, conint
from typing import Optional, List



class UserSchema(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    birth_date: str
    gender: str

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    first_name: str = Field(..., min_length=1)  # type: ignore
    last_name: str = Field(..., min_length=1)  # type: ignore
    email: EmailStr
    password: str = Field(..., min_length=8)  # type: ignore
    birth_date: date
    gender: str = Field(..., pattern=r'^(M|F|Otro)$')
    terms_accepted: bool

    class Config:
        from_attributes = True


class UserProfileUpdateSchema(BaseModel):
    firstName: Optional[constr(min_length=1)]# type: ignore
    lastName: Optional[constr(min_length=1)]# type: ignore
    currentWeight: Optional[float]
    weightGoal: Optional[str]
    activityLevel: Optional[str] 
    trainingFrequency: Optional[int]

    class Config:
        from_attributes = True


class LoginSchema(BaseModel):
    email: EmailStr
    password: constr(min_length=8)# type: ignore
    remember_me: bool

    class Config:
        from_attributes = True



class UserDetailsSchema(BaseModel):
    height: conint(gt=0) # type: ignore # Validación: debe ser mayor que 0
    weight: conint(gt=0)# type: ignore
    weight_goal: conint(gt=0)# type: ignore
    weight_change_amount: Optional[conint(gt=0)] = None# type: ignore
    weekly_training_days: conint(ge=1, le=7)# type: ignore
    daily_training_time: str
    physical_activity_level: str
    current_training_days: Optional[conint(ge=1, le=7)] = None# type: ignore
    diet_type: str
    meals_per_day: conint(gt=0)# type: ignore
    macronutrient_intake: str
    available_equipment: str
    training_preference: str
    food_restrictions: Optional[str] = None
    custom_food_restrictions: Optional[str] = None
    medical_condition: str
    custom_medical_condition: Optional[str] = None

    class Config:
        from_attributes = True



class UserDetailsSchema(BaseModel):
    height: int
    weight: float
    weight_goal: float
    weekly_training_days: int
    daily_training_time: str
    physical_activity_level: str

    class Config:
        from_attributes = True

class DietPreferencesSchema(BaseModel):
    diet_type: str
    meals_per_day: int
    macronutrient_intake: str
    food_restrictions: Optional[str] = None
    custom_food_restrictions: Optional[str] = None

    class Config:
        from_attributes = True

class MedicalConditionsSchema(BaseModel):
    medical_condition: str
    custom_medical_condition: Optional[str] = None

    class Config:
        from_attributes = True

class TrainingPreferencesSchema(BaseModel):
    available_equipment: str
    training_preference: str

    class Config:
        from_attributes = True
