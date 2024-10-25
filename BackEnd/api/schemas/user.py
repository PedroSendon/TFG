from datetime import date
from pydantic import BaseModel, EmailStr, Field, constr, PositiveInt, conint
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

class UserAdminCreate(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=8)
    birth_date: date
    gender: str = Field(..., pattern=r'^(M|F|Otro)$')
    role: str = Field(..., description="Role of the user")  # Agregar validación si es necesario



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
    height: PositiveInt
    weight: PositiveInt
    weight_goal: str 
    weekly_training_days: conint(ge=1, le=7)
    daily_training_time: str
    physical_activity_level: str
    available_equipment: str  # Equipamiento disponible

    class Config:
        from_attributes = True




class DietPreferencesSchema(BaseModel):
    diet_type: str  # Tipo de dieta
    meals_per_day: conint(gt=0)  # Comidas al día, mayor a 0

    class Config:
        from_attributes = True

# Esquema que combina todos los detalles del usuario
class CompleteUserDetailsSchema(BaseModel):
    user_details: UserDetailsSchema
    diet_preferences: DietPreferencesSchema

    class Config:
        from_attributes = True

class ImagenSchema(BaseModel):
    nombre: str
    logo_url: str
    descripcion: str