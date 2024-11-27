# choices.py
ROLE_CHOICES = [
    ('cliente', 'Cliente'),
    ('administrador', 'Administrador'),
    ('entrenador', 'Entrenador'),
    ('nutricionista', 'Nutricionista'),
]

STATUS_CHOICES = [
    ('awaiting_assignment', 'Awaiting Assignment'),
    ('assigned', 'Assigned'),
    ('training_only', 'Training Plan Assigned Only'),
    ('nutrition_only', 'Nutrition Plan Assigned Only'),
]

DIET_TYPE_CHOICES = [
    ('low_protein', 'Bajo en proteínas'),
    ('low_carbs', 'Bajo en carbohidratos'),
    ('low_fats', 'Bajo en grasas'),
    ('balanced', 'Balanceado'),
]

DIFFICULTY_LEVELS = [
    ('ligero', 'Ligero'),
    ('moderado', 'Moderado'),
    ('intermedio', 'Intermedio'),
    ('avanzado', 'Avanzado'),
]

WEIGHT_GOAL_CHOICES = [
    ('gain_muscle', 'Ganar masa muscular'),
    ('lose_weight', 'Perder peso'),
    ('maintain', 'Mantenimiento'),
]

ACTIVITY_LEVEL_CHOICES = [
    ('sedentary', 'Sedentary'),
    ('light', 'Light'),
    ('moderate', 'Moderate'),
    ('intense', 'Intense'),
]

EQUIPMENT_CHOICES = [
    ('gimnasio_completo', 'Gimnasio Completo'),
    ('pesas_libres', 'Pesas Libres'),
    ('sin_equipamiento', 'Sin Equipamiento'),
]
