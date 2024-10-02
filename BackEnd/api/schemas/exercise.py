from pydantic import BaseModel
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
        orm_mode = True  # Esto permite usar objetos ORM con Pydantic
