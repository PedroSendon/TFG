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
            sx={{ height: '80vh' }}
        >
            <Typography variant="h4" align="center" sx={{ mb: 3 }}>
                {t('registration_form')}
            </Typography>
            <Box sx={{ position: 'fixed', bottom: '10%', width: '80%' }}>
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
            sx={{ height: '80vh' }}
        >
            <Typography variant="h5" sx={{ mb: 3 }}>
                {t('personal_data')}
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        label={t('height')}
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        fullWidth
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
                    />
                </Grid>
            </Grid>
            <Box
                display="flex"
                justifyContent="space-between"
                sx={{ position: 'fixed', bottom: '10%', width: '80%' }}
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
                    {t('back')}
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
                sx={{ height: '80vh' }}
            >
                <Typography variant="h5" align="center" gutterBottom>
                    {t('goals')}
                </Typography>
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
                        >
                            <MenuItem value="Menos de 1 hora">{t('less_than_1_hour')}</MenuItem>
                            <MenuItem value="1-2 horas">{t('1_2_hours')}</MenuItem>
                            <MenuItem value="Más de 2 horas">{t('more_than_2_hours')}</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>

                <Box
                    display="flex"
                    justifyContent="space-between"
                    sx={{ position: 'fixed', bottom: '10%', width: '80%' }}
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
                        {t('back')}
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
                sx={{ height: '80vh' }}
            >
                {/* Título */}
                <Typography variant="h5" align="center" gutterBottom>
                    {t('physical_activity')}
                </Typography>

                {/* Contenedor de los campos del formulario */}
                <Grid container spacing={3} justifyContent="center">
                    {/* Pregunta: ¿Cuál es tu nivel de actividad física actual? */}
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label={t('current_physical_activity_level')}
                            name="physicalActivityLevel"
                            select
                            value={formData.physicalActivityLevel}
                            onChange={handleChange}
                            fullWidth
                        >
                            <MenuItem value="Sedentario">{t('sedentary')}</MenuItem>
                            <MenuItem value="Actividad ligera">{t('light_activity')}</MenuItem>
                            <MenuItem value="Actividad moderada">{t('moderate_activity')}</MenuItem>
                            <MenuItem value="Actividad intensa">{t('intense_activity')}</MenuItem>
                        </TextField>
                    </Grid>

                    {/* Pregunta: ¿Qué equipos o instalaciones tienes disponibles? */}
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label={t('available_equipment')}
                            name="availableEquipment"
                            select
                            value={formData.availableEquipment}
                            onChange={handleChange}
                            fullWidth
                        >
                            <MenuItem value="Gimnasio">{t('full_gym')}</MenuItem>
                            <MenuItem value="Pesas libres">{t('free_weights')}</MenuItem>
                            <MenuItem value="Nada">{t('no_equipment')}</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>

                <Box
                    display="flex"
                    justifyContent="space-between"
                    sx={{ position: 'fixed', bottom: '10%', width: '80%' }}
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
                        {t('back')}
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
                sx={{ height: '80vh' }}
            >
                <Typography variant="h5" align="center" gutterBottom>
                    {t('diet_and_nutrition')}
                </Typography>

                <Grid container spacing={3} justifyContent="center">
                    {/* Número de comidas al día */}
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label={t('meals_per_day')}
                            name="mealsPerDay"
                            type="number"
                            value={formData.mealsPerDay}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>

                    {/* Evaluación de la ingesta de macronutrientes */}
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label={t('macronutrient_intake')}
                            name="macronutrientIntake"
                            select
                            value={formData.macronutrientIntake}
                            onChange={handleChange}
                            fullWidth
                        >
                            <MenuItem value="Bajo en proteínas">{t('low_protein')}</MenuItem>
                            <MenuItem value="Bajo en carbohidratos">{t('low_carb')}</MenuItem>
                            <MenuItem value="Bajo en grasas">{t('low_fat')}</MenuItem>
                            <MenuItem value="Balanceado">{t('balanced')}</MenuItem>
                            <MenuItem value="No lo sé">{t('dont_know')}</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>

                <Box
                    display="flex"
                    justifyContent="space-between"
                    sx={{ position: 'fixed', bottom: '10%', width: '80%' }}
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
                        {t('back')}
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
                sx={{ height: '80vh' }}
            >
                <Typography variant="h5" align="center" gutterBottom>
                    {t('form_completed')}
                </Typography>

                <Typography variant="body1" align="center" sx={{ margin: '20px 0' }}>
                    {t('thank_you_message')}
                </Typography>

                <Box
                    display="flex"
                    justifyContent="space-between"
                    sx={{ position: 'fixed', bottom: '10%', width: '80%' }}
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
                        {t('back')}
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
        <Container>
            {renderStep()}
        </Container>
    );
};

export default UserDetailsForm;
