from pydantic import BaseModel, Field, validator
from typing import List, Optional

class ExerciseSchema(BaseModel):
    # Nombre del ejercicio
    name: str
    
    # Lista de grupos musculares asociados
    muscleGroups: List[str]
    
    # Descripción del ejercicio
    description: str
    
    # Instrucciones para realizar el ejercicio
    instructions: str
    
    # URL de imagen o video opcional
    media: Optional[str] = None

    class Config:
        from_attributes = True  # Esto permite usar objetos ORM con Pydantic

class ExerciseUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str]
    muscleGroups: Optional[List[str]]  # Lista de grupos musculares
    instructions: Optional[str]
    media: Optional[str]  # URL o base64 para la imagen o video

    class Config:
        from_attributes = True
        
class CreateExerciseSchema(BaseModel):
    name: str
    description: str
    muscleGroups: List[str]
    instructions: str
    media: Optional[str]
    @validator('muscleGroups')
    def muscle_groups_must_be_list_of_strings(cls, v):
        if not isinstance(v, list) or not all(isinstance(item, str) for item in v):
            raise ValueError("El parámetro 'muscleGroups' debe ser una lista de cadenas de texto.")
        return v