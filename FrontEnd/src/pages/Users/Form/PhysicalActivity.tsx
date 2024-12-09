import React, { useContext, useState } from 'react';
import { Box, Grid, TextField, Button, Typography, MenuItem } from '@mui/material';
import { useHistory, useLocation } from 'react-router-dom';
import { LanguageContext } from '../../../context/LanguageContext';

const PhysicalActivity: React.FC = () => {
    const history = useHistory();
    const location = useLocation<{ formData: any }>();
    const { t } = useContext(LanguageContext); // Usamos el contexto de idioma

    // Estado inicial que incluye datos previos y los nuevos campos
    const [formData, setFormData] = useState({
        ...location.state?.formData,
        physicalActivityLevel: '',
        availableEquipment: '',
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
        history.push('/form/dietandnutrition', { formData });
    };

    // Navegar al paso anterior
    const handleBack = () => {
        history.push('/form/goals', { formData });
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
                            <MenuItem value="Sedentario">{t('sedentary')}</MenuItem>
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
                            <MenuItem value="Gimnasio Completo">{t('full_gym')}</MenuItem>
                            <MenuItem value="Pesas Libres">{t('free_weights')}</MenuItem>
                            <MenuItem value="Sin Equipamiento">{t('no_equipment')}</MenuItem>

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

export default PhysicalActivity;
