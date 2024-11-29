from datetime import date
from pydantic import BaseModel, EmailStr, Field, condecimal, constr, PositiveInt, conint
from typing import Literal, Optional, List

from api.models.user import WeightRecord



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
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=8)
    birth_date: date
    gender: str = Field(..., pattern=r'^(M|F|Otro)$')  # Cambiado a 'Otro'
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

    class Config:
        from_attributes = True


class UserDetailsSchema(BaseModel):
    height: conint(gt=0)  # Altura en cm
    weight: condecimal(gt=0, max_digits=5, decimal_places=2)  # Peso en kg
    weight_goal: Literal["gain_muscle", "lose_weight", "maintain"]  # Claves internas
    weekly_training_days: conint(ge=1, le=7)  # Días de entrenamiento
    daily_training_time: str  # Tiempo de entrenamiento diario
    physical_activity_level: Literal["sedentary", "light", "moderate", "intense"]  # Claves internas
    meals_per_day: conint(gt=0)  # Número de comidas al día
    available_equipment: Literal["gimnasio_completo", "pesas_libres", "sin_equipamiento"]  # Claves internas

    class Config:
        from_attributes = True




class DietPreferencesSchema(BaseModel):
    diet_type: Literal["balanced", "low_protein", "low_carb", "low_fat"] = "balanced"  # Valor predeterminado
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

class WeightRecordSchema(BaseModel):
    weight: condecimal(gt=0, max_digits=5, decimal_places=2)  # Permite decimales
    date: date

    class Config:
        from_attributes = True