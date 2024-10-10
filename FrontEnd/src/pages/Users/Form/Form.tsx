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
                    medical_condition: formData.medicalCondition || t('none'),
                    available_equipment: formData.availableEquipment,
                    training_preference: formData.trainingPreference,
                    weight_change_amount: formData.weightChangeAmount || null,
                    current_training_days: formData.currentTrainingDays || null
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
        const [showWeightChangeInput, setShowWeightChangeInput] = useState(false);

        const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { value } = e.target;
            setFormData({
                ...formData,
                weightGoal: value,
            });

            if (value === t('gain_muscle') || value === t('lose_weight')) {
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

                    {showWeightChangeInput && (
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                label={formData.weightGoal === t('gain_muscle') ? t('gain_weight_change') : t('lose_weight_change')}
                                name="weightChangeAmount"
                                value={formData.weightChangeAmount || ''}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                    )}

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
                            <MenuItem value="Gimnasio completo">{t('full_gym')}</MenuItem>
                            <MenuItem value="Pesas libres">{t('free_weights')}</MenuItem>
                            <MenuItem value="Sin equipamiento">{t('no_equipment')}</MenuItem>
                        </TextField>
                    </Grid>

                    {/* Pregunta: ¿Qué tipo de entrenamiento prefieres? */}
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label={t('training_preference')}
                            name="trainingPreference"
                            select
                            value={formData.trainingPreference}
                            onChange={handleChange}
                            fullWidth
                        >
                            <MenuItem value="Entrenamiento en casa">{t('home_training')}</MenuItem>
                            <MenuItem value="Entrenamiento en gimnasio">{t('gym_training')}</MenuItem>
                            <MenuItem value="Ejercicios al aire libre">{t('outdoor_training')}</MenuItem>
                            <MenuItem value="Clases grupales">{t('group_classes')}</MenuItem>
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
        const [showFoodRestrictions, setShowFoodRestrictions] = useState(false);
        const [showMedicalConditionInput, setShowMedicalConditionInput] = useState(false);
      
        const handleFoodRestrictionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          const value = event.target.value;
          setFormData({
            ...formData,
            foodRestrictions: value,
          });
          setShowFoodRestrictions(value !== t('none'));
        };
      
        const handleMedicalConditionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          const value = event.target.value;
          setFormData({
            ...formData,
            medicalCondition: value,
          });
          setShowMedicalConditionInput(value === t('others'));
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
      
              {/* Restricciones alimentarias */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  label={t('food_restrictions')}
                  name="foodRestrictions"
                  select
                  value={formData.foodRestrictions}
                  onChange={handleFoodRestrictionChange}
                  fullWidth
                >
                  <MenuItem value="Alergias alimentarias">{t('food_allergies')}</MenuItem>
                  <MenuItem value="Intolerancias">{t('intolerances')}</MenuItem>
                  <MenuItem value="Preferencias dietéticas">{t('dietary_preferences')}</MenuItem>
                  <MenuItem value={t('none')}>{t('none')}</MenuItem>
                </TextField>
              </Grid>
      
              {showFoodRestrictions && (
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    label={t('describe_food_restrictions')}
                    name="customFoodRestrictions"
                    value={formData.customFoodRestrictions}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
              )}
      
              {/* Condiciones médicas */}
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  label={t('medical_conditions')}
                  name="medicalCondition"
                  select
                  value={formData.medicalCondition}
                  onChange={handleMedicalConditionChange}
                  fullWidth
                >
                  <MenuItem value="Diabetes">{t('diabetes')}</MenuItem>
                  <MenuItem value="Hipertensión">{t('hypertension')}</MenuItem>
                  <MenuItem value="Problemas articulares">{t('joint_problems')}</MenuItem>
                  <MenuItem value={t('others')}>{t('others')}</MenuItem>
                  <MenuItem value={t('none')}>{t('none')}</MenuItem>
                </TextField>
              </Grid>
      
              {showMedicalConditionInput && (
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    label={t('describe_medical_conditions')}
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
