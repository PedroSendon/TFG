import React, { useState, useContext } from 'react';
import { TextField, Box, Button, Grid, Typography, Container, MenuItem } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { LanguageContext } from '../../../context/LanguageContext'; // Importar el contexto de idioma

const UserDetailsForm: React.FC = () => {
    const history = useHistory();
    const { t } = useContext(LanguageContext); // Usamos el contexto de idioma

    const [currentStep, setCurrentStep] = useState(0);

    const [formData, setFormData] = useState({
        height: '',
        weight: '',
        weeklyTrainingDays: '',
        dailyTrainingTime: '',
        weightGoal: '',
        physicalActivityLevel: '',
        currentTrainingDays: '',
        mealsPerDay: '',
        macronutrientIntake: '',
        availableEquipment: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleNext = () => {
        setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleFinish = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');

            if (!accessToken) {
                console.error(t('no_token'));
                return;
            }
            const response = await fetch('http://127.0.0.1:8000/api/form/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,  // Agrega el token JWT aquí
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
                    available_equipment: formData.availableEquipment,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(t('user_details_saved'), data);
            } else {
                console.error(t('error_saving_user_details'), response.statusText);
            }
        } catch (error) {
            console.error(t('error_saving_user_details'), error);
        }
    };

    const Introduction = () => (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{
                height: '95vh',
                backgroundColor: '#f5f5f5',
                px: 3,  // Añade un poco de margen horizontal
            }}
        >
            {/* Logo centrado en la parte superior */}
            <Box
                component="img"
                src="/src/components/FitProX.png"
                alt="App Logo"
                sx={{
                    position: 'absolute',
                    top: '20px',
                    height: '80px',
                    objectFit: 'contain',
                }}
            />


            {/* Título */}
            <Typography
                variant="h4"
                sx={{
                    mb: 3,
                    fontWeight: 'bold',
                    color: '#333',
                    textAlign: 'center',
                    fontFamily: 'Arial, sans-serif',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                }}
            >                {t('registration_form')}
            </Typography>

            <Typography
                variant="body1"
                align="center"
                sx={{
                    mb: 5,
                    color: '#666666',
                    fontSize: '1.1rem',         // Tamaño de fuente ligeramente mayor para visibilidad
                    lineHeight: 1.6,            // Espaciado entre líneas para mejor lectura
                    maxWidth: '80%',            // Limitar ancho del texto en pantallas grandes
                    mx: 'auto',                 // Centrar horizontalmente con margen automático
                }}
            >
                {t('welcome_message')}
            </Typography>

            {/* Botón de inicio */}
            <Box
                display="flex"
                justifyContent="center"
                sx={{
                    position: 'fixed',
                    bottom: '10%',
                    width: '90%',
                    padding: '0 16px', // Separación de los bordes de la pantalla
                }}
            >
                <Button
                    onClick={handleNext}
                    variant="contained"
                    fullWidth
                    sx={{
                        backgroundColor: '#4d4d4d',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        '&:hover': { backgroundColor: '#333333' },
                        py: 1.5,
                        px: 3,
                    }}
                >
                    {t('start')}
                </Button>
            </Box>
        </Box>
    );

    const PersonalData = () => (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{
                height: '95vh',
                backgroundColor: '#f5f5f5',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            }}
        >
            {/* Logo centrado en la parte superior */}
            <Box
                component="img"
                src="/src/components/FitProX.png"
                alt="App Logo"
                sx={{
                    position: 'absolute',
                    top: '20px',
                    height: '80px',
                    objectFit: 'contain',
                }}
            />


            {/* Título de la sección */}
            <Typography
                variant="h4"
                sx={{
                    mb: 3,
                    fontWeight: 'bold',
                    color: '#333',
                    textAlign: 'center',
                    fontFamily: 'Arial, sans-serif',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                }}
            >
                {t('personal_data')}
            </Typography>

            {/* Campos de entrada de datos personales */}
            <Grid container spacing={3} sx={{ width: '100%', maxWidth: '400px' }}>
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        label={t('height')}
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        fullWidth
                        InputLabelProps={{ style: { color: '#555' } }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#CCCCCC' },
                                '&:hover fieldset': { borderColor: '#AAAAAA' },
                                '&.Mui-focused fieldset': { borderColor: '#555555' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#555555', // Color gris para la etiqueta al enfocarse
                            },
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        label={t('weight')}
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        fullWidth
                        InputLabelProps={{ style: { color: '#555' } }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#CCCCCC' },
                                '&:hover fieldset': { borderColor: '#AAAAAA' },
                                '&.Mui-focused fieldset': { borderColor: '#555555' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#555555', // Color gris para la etiqueta al enfocarse
                            },
                        }}
                    />
                </Grid>
            </Grid>

            {/* Botones de navegación */}
            <Box
                display="flex"
                justifyContent="center"
                sx={{
                    position: 'fixed',
                    bottom: '10%',
                    width: '100%',
                    padding: '0 16px', // Separación de los bordes de la pantalla
                }}
            >
                <Button
                    onClick={handleBack}
                    variant="outlined"
                    sx={{
                        color: '#555555',
                        borderColor: '#555555',
                        width: '42%',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        padding: '12px 16px',
                        mr: 2,  // Margen derecho para separar del siguiente botón
                        '&:hover': { borderColor: '#333333', color: '#333333' },
                    }}
                >
                    {t('back')}
                </Button>
                <Button
                    onClick={handleNext}
                    variant="contained"
                    sx={{
                        backgroundColor: '#555555',
                        color: '#ffffff',
                        width: '42%',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        padding: '12px 16px',
                        ml: 2,  // Margen izquierdo para separar del botón anterior
                        '&:hover': { backgroundColor: '#333333' },
                    }}
                >
                    {t('next')}
                </Button>
            </Box>

        </Box>
    );

    const Goals = () => {

        const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { value } = e.target;
            setFormData({
                ...formData,
                weightGoal: value,
            });
        };

        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                sx={{
                    height: '95vh',
                    backgroundColor: '#f5f5f5',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                }}
            >
                {/* Logo centrado en la parte superior */}
                <Box
                    component="img"
                    src="/src/components/FitProX.png"
                    alt="App Logo"
                    sx={{
                        position: 'absolute',
                        top: '20px',
                        height: '80px',
                        objectFit: 'contain',
                    }}
                />


                {/* Título de la sección */}
                <Typography
                    variant="h4"
                    sx={{
                        mb: 3,
                        fontWeight: 'bold',
                        color: '#333',
                        textAlign: 'center',
                        fontFamily: 'Arial, sans-serif',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                    }}
                >
                    {t('goals')}
                </Typography>

                {/* Contenedor de formulario */}
                <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label={t('goal')}
                            name="weightGoal"
                            select
                            value={formData.weightGoal}
                            onChange={handleGoalChange}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    '& fieldset': { borderColor: '#CCCCCC' },
                                    '&:hover fieldset': { borderColor: '#AAAAAA' },
                                    '&.Mui-focused fieldset': { borderColor: '#555555' },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#555555', // Color gris para la etiqueta al enfocarse
                                },
                            }}
                        >
                            <MenuItem value="Ganar masa muscular">{t('gain_muscle')}</MenuItem>
                            <MenuItem value="Perder peso">{t('lose_weight')}</MenuItem>
                            <MenuItem value="Mantenimiento">{t('maintenance')}</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label={t('training_days')}
                            name="weeklyTrainingDays"
                            select
                            value={formData.weeklyTrainingDays}
                            onChange={handleChange}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    '& fieldset': { borderColor: '#CCCCCC' },
                                    '&:hover fieldset': { borderColor: '#AAAAAA' },
                                    '&.Mui-focused fieldset': { borderColor: '#555555' },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#555555', // Color gris para la etiqueta al enfocarse
                                },
                            }}
                        >
                            {[1, 2, 3, 4, 5, 6].map(day => (
                                <MenuItem key={day} value={day}>
                                    {day} {t('day_s')}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label={t('daily_training_time')}
                            name="dailyTrainingTime"
                            select
                            value={formData.dailyTrainingTime}
                            onChange={handleChange}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    '& fieldset': { borderColor: '#CCCCCC' },
                                    '&:hover fieldset': { borderColor: '#AAAAAA' },
                                    '&.Mui-focused fieldset': { borderColor: '#555555' },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#555555', // Color gris para la etiqueta al enfocarse
                                },
                            }}
                        >
                            <MenuItem value="Menos de 1 hora">{t('less_than_1_hour')}</MenuItem>
                            <MenuItem value="1-2 horas">{t('1_2_hours')}</MenuItem>
                            <MenuItem value="Más de 2 horas">{t('more_than_2_hours')}</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>

                {/* Botones de navegación */}
                <Box
                    display="flex"
                    justifyContent="center"
                    sx={{
                        position: 'fixed',
                        bottom: '10%',
                        width: '100%',
                        padding: '0 16px', // Separación de los bordes de la pantalla
                    }}
                >
                    <Button
                        onClick={handleBack}
                        variant="outlined"
                        sx={{
                            color: '#555555',
                            borderColor: '#555555',
                            width: '42%',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            padding: '12px 16px',
                            mr: 2, // Margen derecho para separar del siguiente botón
                            '&:hover': { borderColor: '#333333', color: '#333333' },
                        }}
                    >
                        {t('back')}
                    </Button>
                    <Button
                        onClick={handleNext}
                        variant="contained"
                        sx={{
                            backgroundColor: '#555555',
                            color: '#ffffff',
                            width: '42%',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            padding: '12px 16px',
                            ml: 2, // Margen izquierdo para separar del botón anterior
                            '&:hover': { backgroundColor: '#333333' },
                        }}
                    >
                        {t('next')}
                    </Button>
                </Box>
            </Box>
        );
    };

    const PhysicalActivity = () => {

        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                sx={{
                    height: '95vh',
                    padding: '20px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                }}
            >
                {/* Logo centrado en la parte superior */}
                <Box
                    component="img"
                    src="/src/components/FitProX.png"
                    alt="App Logo"
                    sx={{
                        position: 'absolute',
                        top: '20px',
                        height: '80px',
                        objectFit: 'contain',
                    }}
                />

                {/* Título principal con estilo */}
                <Typography
                    variant="h4"
                    sx={{
                        mb: 3,
                        fontWeight: 'bold',
                        color: '#333',
                        textAlign: 'center',
                        fontFamily: 'Arial, sans-serif',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                    }}
                >
                    {t('physical_activity')}
                </Typography>

                {/* Contenedor de formulario */}
                <Grid container spacing={3} justifyContent="center">
                    {/* Nivel de actividad física */}
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label={t('current_physical_activity_level')}
                            name="physicalActivityLevel"
                            select
                            value={formData.physicalActivityLevel}
                            onChange={handleChange}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    '& fieldset': { borderColor: '#CCCCCC' },
                                    '&:hover fieldset': { borderColor: '#AAAAAA' },
                                    '&.Mui-focused fieldset': { borderColor: '#555555' },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#555555', // Color gris para la etiqueta al enfocarse
                                },
                            }}
                        >
                            <MenuItem value="Sedentaria">{t('sedentary')}</MenuItem>
                            <MenuItem value="Ligera">{t('light')}</MenuItem>
                            <MenuItem value="Moderada">{t('moderate')}</MenuItem>
                            <MenuItem value="Intensa">{t('intense')}</MenuItem>
                        </TextField>
                    </Grid>

                    {/* Equipamiento disponible */}
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label={t('available_equipment')}
                            name="availableEquipment"
                            select
                            value={formData.availableEquipment}
                            onChange={handleChange}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    '& fieldset': { borderColor: '#CCCCCC' },
                                    '&:hover fieldset': { borderColor: '#AAAAAA' },
                                    '&.Mui-focused fieldset': { borderColor: '#555555' },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#555555', // Color gris para la etiqueta al enfocarse
                                },
                            }}
                        >
                            <MenuItem value="Gimnasio">{t('full_gym')}</MenuItem>
                            <MenuItem value="Pesas libres">{t('free_weights')}</MenuItem>
                            <MenuItem value="Nada">{t('no_equipment')}</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>

                {/* Botones de navegación */}
                <Box
                    display="flex"
                    justifyContent="center"
                    sx={{
                        position: 'fixed',
                        bottom: '10%',
                        width: '100%',
                        padding: '0 16px',
                    }}
                >
                    <Button
                        onClick={handleBack}
                        variant="outlined"
                        sx={{
                            color: '#555555',
                            borderColor: '#555555',
                            width: '42%',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            padding: '12px 16px',
                            mr: 2,
                            '&:hover': { borderColor: '#333333', color: '#333333' },
                        }}
                    >
                        {t('back')}
                    </Button>
                    <Button
                        onClick={handleNext}
                        variant="contained"
                        sx={{
                            backgroundColor: '#555555',
                            color: '#ffffff',
                            width: '42%',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            padding: '12px 16px',
                            ml: 2,
                            '&:hover': { backgroundColor: '#333333' },
                        }}
                    >
                        {t('next')}
                    </Button>
                </Box>
            </Box>
        );
    };

    const DietAndNutrition = () => {

        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                sx={{
                    height: '95vh',
                    padding: '20px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                }}
            >
                {/* Logo centrado en la parte superior */}
                <Box
                    component="img"
                    src="/src/components/FitProX.png"
                    alt="App Logo"
                    sx={{
                        position: 'absolute',
                        top: '20px',
                        height: '80px',
                        objectFit: 'contain',
                    }}
                />

                {/* Título principal con estilo */}
                <Typography
                    variant="h4"
                    sx={{ 
                        mb: 3,
                        fontWeight: 'bold',
                        color: '#333',
                        textAlign: 'center',
                        fontFamily: 'Arial, sans-serif',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                    }}
                >
                    {t('diet_and_nutrition')}
                </Typography>

                {/* Contenedor de formulario */}
                <Grid container spacing={3} justifyContent="center">
                    {/* Campo de comidas al día */}
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label={t('meals_per_day')}
                            name="mealsPerDay"
                            type="number"
                            value={formData.mealsPerDay}
                            onChange={handleChange}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    '& fieldset': { borderColor: '#CCCCCC' },
                                    '&:hover fieldset': { borderColor: '#AAAAAA' },
                                    '&.Mui-focused fieldset': { borderColor: '#555555' },
                                },

                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#555555', // Color gris para la etiqueta al enfocarse
                                },

                            }}
                        />
                    </Grid>

                    {/* Campo de ingesta de macronutrientes */}
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label={t('macronutrient_intake')}
                            name="macronutrientIntake"
                            select
                            value={formData.macronutrientIntake}
                            onChange={handleChange}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    '& fieldset': { borderColor: '#CCCCCC' },
                                    '&:hover fieldset': { borderColor: '#AAAAAA' },
                                    '&.Mui-focused fieldset': { borderColor: '#555555' },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#555555', // Color gris para la etiqueta al enfocarse
                                },
                            }}
                        >
                            <MenuItem value="Bajo en proteínas">{t('low_protein')}</MenuItem>
                            <MenuItem value="Bajo en carbohidratos">{t('low_carb')}</MenuItem>
                            <MenuItem value="Bajo en grasas">{t('low_fat')}</MenuItem>
                            <MenuItem value="Balanceado">{t('balanced')}</MenuItem>
                            <MenuItem value="No lo sé">{t('dont_know')}</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>

                {/* Botones de navegación */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    sx={{
                        position: 'fixed',
                        bottom: '10%',
                        width: 'calc(100% - 32px)', // Asegura espacio a los lados
                        padding: '0 16px',
                    }}
                >
                    <Button
                        onClick={handleBack}
                        variant="outlined"
                        sx={{
                            color: '#555555',
                            borderColor: '#555555',
                            width: '48%',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            padding: '12px 16px',
                            '&:hover': { borderColor: '#333333', color: '#333333' },
                        }}
                    >
                        {t('back')}
                    </Button>
                    <Button
                        onClick={handleNext}
                        variant="contained"
                        sx={{
                            backgroundColor: '#555555',
                            color: '#ffffff',
                            width: '48%',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            padding: '12px 16px',
                            '&:hover': { backgroundColor: '#333333' },
                        }}
                    >
                        {t('next')}
                    </Button>
                </Box>
            </Box>
        );
    };
    const FormComplete = () => {
        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                sx={{
                    height: '95vh',
                    padding: '20px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    position: 'relative',
                }}
            >
                {/* Logo centrado en la parte superior */}
                <Box
                    component="img"
                    src="/src/components/FitProX.png"
                    alt="App Logo"
                    sx={{
                        position: 'absolute',
                        top: '20px',
                        height: '80px',
                        objectFit: 'contain',
                    }}
                />

                {/* Título principal con estilo */}
                <Typography
                    variant="h4"
                    sx={{
                        mb: 3,
                        fontWeight: 'bold',
                        color: '#333',
                        textAlign: 'center',
                        fontFamily: 'Arial, sans-serif',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                    }}
                >
                    {t('form_completed')}
                </Typography>

                {/* Mensaje de agradecimiento */}
                <Typography
                    variant="body1"
                    align="center"
                    sx={{
                        color: '#666666',
                        marginBottom: '24px',
                        padding: '0 16px',
                        lineHeight: 1.6,
                    }}
                >
                    {t('thank_you_message')}
                </Typography>

                {/* Botones de navegación */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    sx={{
                        position: 'fixed',
                        bottom: '10%',
                        width: 'calc(100% - 32px)', // Asegura espacio a los lados
                        padding: '0 16px',
                    }}
                >
                    <Button
                        onClick={handleBack}
                        variant="outlined"
                        sx={{
                            color: '#555555',
                            borderColor: '#555555',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            padding: '12px 16px',
                            width: '48%',
                            '&:hover': {
                                borderColor: '#333333',
                                color: '#333333',
                            },
                        }}
                    >
                        {t('back')}
                    </Button>
                    <Button
                        onClick={handleFinish}
                        variant="contained"
                        sx={{
                            backgroundColor: '#555555',
                            color: '#ffffff',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            padding: '12px 16px',
                            width: '48%',
                            '&:hover': {
                                backgroundColor: '#333333',
                            },
                        }}
                    >
                        {t('finish')}
                    </Button>
                </Box>
            </Box>
        );
    };
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
                return <FormComplete />;
            default:
                return null;
        }
    };

    return (
        renderStep()
    );
};

export default UserDetailsForm;
