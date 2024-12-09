import React, { useState } from 'react';
import { Box, Grid, TextField, Button, Typography, MenuItem } from '@mui/material';
import { useHistory, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { LanguageContext } from '../../../context/LanguageContext';

const DietAndNutrition: React.FC = () => {
    const history = useHistory();
    const location = useLocation<{ formData: any }>();
    const { t } = useContext(LanguageContext); // Contexto de idioma

    // Estado inicial con datos previos y campos nuevos
    const [formData, setFormData] = useState({
        ...location.state?.formData,
        mealsPerDay: '',
        diet_type: '',
    });

    // Manejar cambios en los inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: typeof formData) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Navegar al siguiente paso
    const handleNext = () => {
        history.push('/form/summary', { formData });
    };

    // Navegar al paso anterior
    const handleBack = () => {
        history.push('/form/physicalactivity', { formData });
    };

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

                {/* Campo de tipo de dieta */}
                <Grid item xs={12}>
                    <TextField
                        variant="outlined"
                        label={t('macronutrient_intake')}
                        name="diet_type"
                        select
                        value={formData.diet_type}
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
                        <MenuItem value="balanced">{t('balanced')}</MenuItem>
                        <MenuItem value="low_protein">{t('low_protein')}</MenuItem>
                        <MenuItem value="low_carb">{t('low_carb')}</MenuItem>
                        <MenuItem value="low_fat">{t('low_fat')}</MenuItem>
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

export default DietAndNutrition;
