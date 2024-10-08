from pydantic import BaseModel, Field
from typing import List, Optional

class ExerciseSchema(BaseModel):
    # Nombre del ejercicio
    name: str
    
    # Lista de grupos musculares asociados
    muscle_groups: List[str]
    
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
    muscle_groups: Optional[List[str]]  # Lista de grupos musculares
    instructions: Optional[str]
    media: Optional[str]  # URL o base64 para la imagen o video

    class Config:
        from_attributes = True