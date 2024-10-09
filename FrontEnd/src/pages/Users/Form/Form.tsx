import React, { useState } from 'react';
import { TextField, Box, Button, Grid, Typography, Container, MenuItem } from '@mui/material';
import { useHistory } from 'react-router-dom';

const UserDetailsForm: React.FC = () => {
    const history = useHistory();

    // Estado para controlar la pantalla actual
    const [currentStep, setCurrentStep] = useState(0);

    // Estado para almacenar los datos del formulario
    const [formData, setFormData] = useState({
        height: '',
        weight: '',
        weightChangeAmount: '',
        weeklyTrainingDays: '',
        dailyTrainingTime: '',
        weightGoal: '',
        physicalActivityLevel: '',
        currentTrainingDays: '',
        dietType: '',
        mealsPerDay: '',
        macronutrientIntake: '',
        availableEquipment: '',
        trainingPreference: '',
        foodRestrictions: '',
        customMedicalCondition: '',
        medicalCondition: '',
        customFoodRestrictions: '',
    });

    // Función para manejar los cambios en los campos del formulario
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Función para avanzar a la siguiente ventana
    const handleNext = () => {
        setCurrentStep(currentStep + 1);
    };

    // Función para retroceder a la ventana anterior
    const handleBack = () => {
        setCurrentStep(currentStep - 1);
    };

    // Función para finalizar el formulario
    // Función para finalizar el formulario
    const handleFinish = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/form/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    height: parseInt(formData.height),
                    weight: parseFloat(formData.weight),
                    weight_goal: formData.weightGoal,
                    weekly_training_days: parseInt(formData.weeklyTrainingDays),
                    daily_training_time: formData.dailyTrainingTime,
                    physical_activity_level: formData.physicalActivityLevel,
                    meals_per_day: parseInt(formData.mealsPerDay),
                    macronutrient_intake: formData.macronutrientIntake,
                    food_restrictions: formData.foodRestrictions || '',
                    medical_condition: formData.medicalCondition || 'Ninguno',
                    available_equipment: formData.availableEquipment,
                    training_preference: formData.trainingPreference,
                    // Valores opcionales
                    weight_change_amount: formData.weightChangeAmount || null,
                    current_training_days: formData.currentTrainingDays || null
                }), 
            });

            if (response.ok) {
                const data = await response.json();
                console.log('User details saved successfully:', data);
            } else {
                console.error('Error saving user details:', response.statusText);
            }
        } catch (error) {
            console.error('Error saving user details:', error);
        }
    };





    // Ventana 1: Introducción
    const Introduction = () => (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{ height: '80vh' }}
        >
            <Typography variant="h4" align="center" sx={{ mb: 3 }}>
                REGISTRATION FORM
            </Typography>
            <Box sx={{ position: 'fixed', bottom: '20px', width: '80%' }}>
                <Button
                    onClick={handleNext}
                    variant="contained"
                    fullWidth
                    sx={{
                        backgroundColor: '#32CD32',
                        '&:hover': { backgroundColor: '#2AA32A' },
                        mt: 4,
                    }}
                >
                    Start
                </Button>
            </Box>
        </Box>
    );

    // Ventana 2: Datos personales
    const PersonalData = () => (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{ height: '80vh' }}
        >
            <Typography variant="h5" sx={{ mb: 3 }}>
                Personal data
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        label="Height (cm)"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        label="Weight (kg)"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        fullWidth
                    />
                </Grid>
            </Grid>
            <Box
                display="flex"
                justifyContent="space-between"
                sx={{ position: 'fixed', bottom: '20px', width: '80%' }}
            >
                <Button
                    onClick={handleBack}
                    variant="outlined"
                    sx={{
                        color: '#32CD32',
                        borderColor: '#32CD32',
                        '&:hover': { borderColor: '#2AA32A' },
                        width: '48%',
                    }}
                >
                    Back
                </Button>
                <Button
                    onClick={handleNext}
                    variant="contained"
                    sx={{
                        backgroundColor: '#32CD32',
                        '&:hover': { backgroundColor: '#2AA32A' },
                        width: '48%',
                    }}
                >
                    Next
                </Button>
            </Box>
        </Box>
    );

    // Ventana 3: Objetivos
    const Goals = () => {
        // Lógica adicional para mostrar la pregunta de cuánto peso quiere ganar o perder
        const [showWeightChangeInput, setShowWeightChangeInput] = useState(false);

        // Función para manejar el cambio en el objetivo
        const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { value } = e.target;
            setFormData({
                ...formData,
                weightGoal: value,
            });

            // Si el objetivo es "Ganar masa muscular" o "Perder peso", mostramos la pregunta adicional
            if (value === 'Ganar masa muscular' || value === 'Perder peso') {
                setShowWeightChangeInput(true);
            } else {
                setShowWeightChangeInput(false);
            }
        };

        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                sx={{ height: '80vh' }}

            >        <Typography variant="h5" align="center" gutterBottom>
                    Goals
                </Typography>
                <Grid container spacing={3} justifyContent="center">
                    {/* Pregunta: ¿Qué objetivo tienes? */}
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label="What objective do you have?"
                            name="weightGoal"
                            select
                            value={formData.weightGoal}
                            onChange={handleGoalChange} // Usamos la función handleGoalChange
                            fullWidth
                        >
                            {/* Opciones para el objetivo */}
                            <MenuItem value="Ganar masa muscular">Gain muscle mass</MenuItem>
                            <MenuItem value="Perder peso">Lose weight</MenuItem>
                            <MenuItem value="Mantenimiento">Maintenance</MenuItem>
                        </TextField>
                    </Grid>

                    {/* Pregunta adicional si el objetivo es ganar o perder peso */}
                    {showWeightChangeInput && (
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                label={`How much weight do you want ${formData.weightGoal === 'Ganar masa muscular' ? 'win' : 'lose'
                                    }? (kg)`}
                                name="weightChangeAmount"
                                value={formData.weightChangeAmount || ''}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                    )}

                    {/* Pregunta: ¿Cuántos días estás dispuesto a dedicar al entrenamiento semanalmente? */}
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label="How many days can you train weekly?"
                            name="weeklyTrainingDays"
                            select
                            value={formData.weeklyTrainingDays}
                            onChange={handleChange}
                            fullWidth
                        >
                            {[1, 2, 3, 4, 5, 6].map(day => (
                                <MenuItem key={day} value={day}>
                                    {day} day(s)
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Pregunta: ¿Cuánto tiempo estás dispuesto a dedicar al entrenamiento diariamente? */}
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label="How long can you train a day?"
                            name="dailyTrainingTime"
                            select
                            value={formData.dailyTrainingTime}
                            onChange={handleChange}
                            fullWidth
                        >
                            <MenuItem value="Menos de 1 hora">Less than 1 hour</MenuItem>
                            <MenuItem value="1-2 horas">1-2 hours</MenuItem>
                            <MenuItem value="Más de 2 horas">More than 2 hours</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>

                <Box
                    display="flex"
                    justifyContent="space-between"
                    sx={{ position: 'fixed', bottom: '20px', width: '80%' }}
                >
                    <Button
                        onClick={handleBack}
                        variant="outlined"
                        sx={{
                            color: '#32CD32',
                            borderColor: '#32CD32',
                            '&:hover': { borderColor: '#2AA32A' },
                            width: '48%',
                        }}
                    >
                        Back
                    </Button>
                    <Button
                        onClick={handleNext}
                        variant="contained"
                        sx={{
                            backgroundColor: '#32CD32',
                            '&:hover': { backgroundColor: '#2AA32A' },
                            width: '48%',
                        }}
                    >
                        Next
                    </Button>
                </Box>
            </Box>
        );
    };


    // Ventana 4: Actividad física
    const PhysicalActivity = () => (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{ height: '80vh' }}
        >
            {/* Título */}
            <Typography variant="h5" align="center" gutterBottom>
                Physical Activity
            </Typography>

            {/* Contenedor de los campos del formulario */}
            <Grid container spacing={3} justifyContent="center">
                {/* Pregunta: ¿Cuál es tu nivel de actividad física actual? */}
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        label="What is your current physical activity level?"
                        name="physicalActivityLevel"
                        select
                        value={formData.physicalActivityLevel}
                        onChange={handleChange}
                        fullWidth
                    >
                        <MenuItem value="Sedentario">Sedentary</MenuItem>
                        <MenuItem value="Actividad ligera">Light activity</MenuItem>
                        <MenuItem value="Actividad moderada">Moderate activity</MenuItem>
                        <MenuItem value="Actividad intensa">Intense activity</MenuItem>
                    </TextField>
                </Grid>

                {/* Pregunta: ¿Qué equipos o instalaciones tienes disponibles? */}
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        label="What equipment do you have available?"
                        name="availableEquipment"
                        select
                        value={formData.availableEquipment}
                        onChange={handleChange}
                        fullWidth
                    >
                        <MenuItem value="Gimnasio completo">Full gym</MenuItem>
                        <MenuItem value="Pesas libres">Free weights</MenuItem>
                        <MenuItem value="Sin equipamiento">Without equipment</MenuItem>
                    </TextField>
                </Grid>
                {/* Pregunta: ¿Qué tipo de entrenamiento prefieres? */}
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        label="What type of training do you prefer?"
                        name="trainingPreference"
                        select
                        value={formData.trainingPreference}
                        onChange={handleChange}
                        fullWidth
                    >
                        <MenuItem value="Entrenamiento en casa">Home training</MenuItem>
                        <MenuItem value="Entrenamiento en gimnasio">Gym training</MenuItem>
                        <MenuItem value="Ejercicios al aire libre">Outdoor exercises</MenuItem>
                        <MenuItem value="Clases grupales">Group classes</MenuItem>
                    </TextField>
                </Grid>
            </Grid>

            <Box
                display="flex"
                justifyContent="space-between"
                sx={{ position: 'fixed', bottom: '20px', width: '80%' }}
            >
                <Button
                    onClick={handleBack}
                    variant="outlined"
                    sx={{
                        color: '#32CD32',
                        borderColor: '#32CD32',
                        '&:hover': { borderColor: '#2AA32A' },
                        width: '48%',
                    }}
                >
                    Back
                </Button>
                <Button
                    onClick={handleNext}
                    variant="contained"
                    sx={{
                        backgroundColor: '#32CD32',
                        '&:hover': { backgroundColor: '#2AA32A' },
                        width: '48%',
                    }}
                >
                    Next
                </Button>
            </Box>
        </Box>
    );


    // Ventana 5: Dieta y Nutrición
    const DietAndNutrition = () => {
        // Estado para mostrar el campo adicional de restricciones alimentarias
        const [showFoodRestrictions, setShowFoodRestrictions] = useState(false);
        const [showMedicalConditionInput, setShowMedicalConditionInput] = useState(false); // Para mostrar input extra si la opción es "Otros"

        // Maneja el cambio en las restricciones alimentarias
        const handleFoodRestrictionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            setFormData({
                ...formData,
                foodRestrictions: value,
            });

            // Mostrar el input si la opción seleccionada no es "Ninguna"
            setShowFoodRestrictions(value !== 'Ninguna');
        };
        // Maneja el cambio en las condiciones médicas
        const handleMedicalConditionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            setFormData({
                ...formData,
                medicalCondition: value,
            });

            // Mostrar un input adicional si se selecciona "Otros"
            setShowMedicalConditionInput(value === 'Otros');
        };

        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                sx={{ height: '80vh' }}
            >        {/* Título */}
                <Typography variant="h5" align="center" gutterBottom>
                    Diet and Nutrition
                </Typography>

                {/* Contenedor de los campos del formulario */}
                <Grid container spacing={3} justifyContent="center">
                    {/* Pregunta: Número de comidas al día */}
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label="How many meals do you eat a day?"
                            name="mealsPerDay"
                            type="number"
                            value={formData.mealsPerDay}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>

                    {/* Pregunta: Evaluación de la ingesta de macronutrientes */}
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label="How do you evaluate your current macronutrient intake?"
                            name="macronutrientIntake"
                            select
                            value={formData.macronutrientIntake}
                            onChange={handleChange}
                            fullWidth
                        >
                            <MenuItem value="Bajo en proteínas">Low in protein</MenuItem>
                            <MenuItem value="Bajo en carbohidratos">Low carb</MenuItem>
                            <MenuItem value="Bajo en grasas">Low in fat</MenuItem>
                            <MenuItem value="Balanceado">Balanced</MenuItem>
                            <MenuItem value="No lo sé">Don't know</MenuItem>
                        </TextField>
                    </Grid>

                    {/* Pregunta: Restricciones alimentarias */}
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label="Do you have any dietary restrictions?"
                            name="foodRestrictions"
                            select
                            value={formData.foodRestrictions}
                            onChange={handleFoodRestrictionChange}
                            fullWidth
                        >
                            <MenuItem value="Alergias alimentarias">Food allergies</MenuItem>
                            <MenuItem value="Intolerancias">Intolerances</MenuItem>
                            <MenuItem value="Preferencias dietéticas">Dietary preferences</MenuItem>
                            <MenuItem value="Ninguna">None</MenuItem>
                        </TextField>
                    </Grid>

                    {/* Campo adicional si se selecciona una opción diferente de "Ninguna" */}
                    {showFoodRestrictions && (
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                label="Describe your dietary restrictions"
                                name="customFoodRestrictions"
                                value={formData.customFoodRestrictions}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                    )}
                    {/* Pregunta: Condiciones médicas */}
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label="Do you have any relevant medical conditions?"
                            name="medicalCondition"
                            select
                            value={formData.medicalCondition}
                            onChange={handleMedicalConditionChange}
                            fullWidth
                        >
                            <MenuItem value="Diabetes">Diabetes</MenuItem>
                            <MenuItem value="Hipertensión">Hypertension</MenuItem>
                            <MenuItem value="Problemas articulares">Joint problems</MenuItem>
                            <MenuItem value="Otros">Others</MenuItem>
                            <MenuItem value="Ninguno">None</MenuItem>
                        </TextField>
                    </Grid>

                    {/* Campo adicional si se selecciona "Otros" como condición médica */}
                    {showMedicalConditionInput && (
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                label="Describe your medical condition"
                                name="customMedicalCondition"
                                value={formData.customMedicalCondition}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                    )}
                </Grid>

                <Box
                    display="flex"
                    justifyContent="space-between"
                    sx={{ position: 'fixed', bottom: '20px', width: '80%' }}
                >
                    <Button
                        onClick={handleBack}
                        variant="outlined"
                        sx={{
                            color: '#32CD32',
                            borderColor: '#32CD32',
                            '&:hover': { borderColor: '#2AA32A' },
                            width: '48%',
                        }}
                    >
                        Back
                    </Button>
                    <Button
                        onClick={handleNext}
                        variant="contained"
                        sx={{
                            backgroundColor: '#32CD32',
                            '&:hover': { backgroundColor: '#2AA32A' },
                            width: '48%',
                        }}
                    >
                        Next
                    </Button>
                </Box>
            </Box>
        );
    };


    // Nueva Ventana 6: Formulario Completado
    const FormComplete = () => (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{ height: '80vh' }}
        >
            {/* Título */}
            <Typography variant="h5" align="center" gutterBottom>
                Form Completed!

            </Typography>

            {/* Mensaje de agradecimiento */}
            <Typography variant="body1" align="center" sx={{ margin: '20px 0' }}>
                Thank you for completing the form. We have saved your data correctly.
            </Typography>

            {/* Botón Finalizar */}
            <Box
                display="flex"
                justifyContent="space-between"
                sx={{ position: 'fixed', bottom: '20px', width: '80%' }}
            >
                <Button
                    onClick={handleBack}
                    variant="outlined"
                    sx={{
                        color: '#32CD32',
                        borderColor: '#32CD32',
                        '&:hover': { borderColor: '#2AA32A' },
                        width: '48%',
                    }}
                >
                    Back
                </Button>
                <Button
                    onClick={handleFinish}
                    variant="contained"
                    sx={{
                        backgroundColor: '#32CD32',
                        '&:hover': { backgroundColor: '#2AA32A' },
                        width: '48%',
                    }}
                >
                    Finish
                </Button>
            </Box>
        </Box>
    );

    // Renderizamos la ventana correspondiente según el estado `currentStep`
    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return <Introduction />;
            case 1:
                return <PersonalData />;
            case 2:
                return <Goals />;
            case 3:
                return <PhysicalActivity />;
            case 4:
                return <DietAndNutrition />;
            case 5:
                return <FormComplete />;  // Nueva ventana para formulario completado
            default:
                return null;
        }
    };

    return (
        <Container>
            {renderStep()}
        </Container>
    );
};

export default UserDetailsForm;
