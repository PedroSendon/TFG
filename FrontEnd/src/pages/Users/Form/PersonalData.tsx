import React, { useState } from 'react';
import { Box, Grid, TextField, Button, Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';

const PersonalData: React.FC = () => {
    const history = useHistory();

    // Estado local para los datos del formulario
    const [formData, setFormData] = useState({
        height: '',
        weight: '',
    });

    // Método para manejar cambios en los inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Navegar al siguiente paso
    const handleNext = () => {
        // Navegamos a la siguiente página y pasamos formData como estado
        history.push('/form/goals', { formData });
    };

    // Navegar al paso anterior
    const handleBack = () => {
        history.push('/form/introduction', { formData });
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
                Personal Data
            </Typography>

            {/* Campos de entrada de datos personales */}
            <Grid container spacing={2}>
                {/* Altura */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        type="number"
                        variant="outlined"
                        label="Height (cm)"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#CCCCCC' },
                                '&:hover fieldset': { borderColor: '#AAAAAA' },
                                '&.Mui-focused fieldset': { borderColor: '#555555' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#555555',
                            },
                        }}
                    />
                </Grid>
                {/* Peso */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        type="number"
                        variant="outlined"
                        label="Weight (kg)"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#CCCCCC' },
                                '&:hover fieldset': { borderColor: '#AAAAAA' },
                                '&.Mui-focused fieldset': { borderColor: '#555555' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#555555',
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
                        mr: 2, // Margen derecho para separar del siguiente botón
                        '&:hover': { borderColor: '#333333', color: '#333333' },
                    }}
                >
                    Back
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
                    Next
                </Button>
            </Box>
        </Box>
    );
};

export default PersonalData;
