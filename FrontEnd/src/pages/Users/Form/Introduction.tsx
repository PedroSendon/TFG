import React, { useContext } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { LanguageContext } from '../../../context/LanguageContext';
import { useHistory } from 'react-router';



const Introduction: React.FC<{ onNext: () => void }> = ({ onNext }) => {
    const { t } = useContext(LanguageContext); // Usamos el contexto de idioma
    const history = useHistory();

    const handleNext = () => {
        history.push('/form/personaldata'); // Redirige a la página PersonalData
      };
  return (
    <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{
                height: '100vh',
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
};

export default Introduction;
