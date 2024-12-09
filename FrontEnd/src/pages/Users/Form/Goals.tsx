import React, { useContext, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { Box, Grid, TextField, Button, MenuItem, Typography } from '@mui/material';
import { LanguageContext } from '../../../context/LanguageContext';

const Goals: React.FC = () => {
    const location = useLocation<{ formData: { height: string; weight: string } }>();
    const history = useHistory();
    const { t } = useContext(LanguageContext); // Usamos el contexto de idioma

    // Estado local que incluye datos previos y los nuevos campos
    const [formData, setFormData] = useState({
        ...location.state?.formData,
        weeklyTrainingDays: '',
        dailyTrainingTime: '',
        weightGoal: '',
    });

    const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData({
            ...formData,
            weightGoal: value,
        });
    };

    // Manejar cambios en los inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Manejar el botón "Next"
    const handleNext = () => {
        history.push('/form/physicalactivity', { formData });
    };

    // Manejar el botón "Back"
    const handleBack = () => {
        history.push('/form/personaldata', { formData });
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

export default Goals;
