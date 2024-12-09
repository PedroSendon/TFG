from pydantic import BaseModel, Field, validator
from typing import List, Optional
from rest_framework import serializers

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


class ExerciseSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    description = serializers.CharField()
    muscleGroups = serializers.ListField(
        child=serializers.CharField(),
        required=True,
        error_messages={'invalid': "El campo 'muscleGroups' debe ser una lista de cadenas."}
    )
    instructions = serializers.CharField()
    media = serializers.URLField(required=False, allow_null=True)
