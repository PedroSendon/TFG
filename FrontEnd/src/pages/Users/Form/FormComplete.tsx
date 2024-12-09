import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { useContext } from 'react';
import { LanguageContext } from '../../../context/LanguageContext';

const FormComplete: React.FC = () => {
    const history = useHistory();
    const location = useLocation<{ formData: any }>();
    const { t } = useContext(LanguageContext); // Contexto de idioma
    const [loading, setLoading] = useState(false);

    // Datos obtenidos del flujo anterior
    const formData = location.state?.formData;

    const handleFinish = async () => {
        try {
            setLoading(true);

            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error(t('no_token'));
                setLoading(false);
                return;
            }

            // Preparar los datos para enviarlos al backend
            const processedData = {
                height: parseInt(formData.height, 10),
                weight: parseFloat(formData.weight),
                weight_goal: formData.weightGoal,
                weekly_training_days: parseInt(formData.weeklyTrainingDays, 10),
                daily_training_time: formData.dailyTrainingTime,
                physical_activity_level: formData.physicalActivityLevel,
                meals_per_day: parseInt(formData.mealsPerDay, 10),
                diet_type: formData.diet_type,
                available_equipment: formData.availableEquipment,
            };

            const response = await fetch('http://127.0.0.1:8000/api/form/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(processedData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Data saved:', data);
                history.push('/profile');
            } else {
                console.error('Error saving user details:', response.statusText);
            }
        } catch (error) {
            console.error('Error saving user details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        history.push('/form/dietandnutrition', { formData });
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
                    disabled={loading}
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
                    disabled={loading}
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
                    {loading ? t('loading') : t('finish')}
                </Button>
            </Box>
        </Box>
    );
};

export default FormComplete;
