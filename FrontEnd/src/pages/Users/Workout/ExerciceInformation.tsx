import React, { useContext } from 'react';
import {
  Box,
  Typography,
  Modal,
  Grid,
  Button,
  Divider,
  Paper,
} from '@mui/material';
import Header from '../../Header/Header';  // Importamos el componente Header
import { LanguageContext } from '../../../context/LanguageContext';  // Importamos el contexto de idioma

interface ExerciseInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  description: string;
  steps: string[];
}

const ExerciseInfoModal: React.FC<ExerciseInfoModalProps> = ({ isOpen, onClose, exerciseName, description, steps }) => {
  const { t } = useContext(LanguageContext);

  return (
    <Modal open={isOpen} onClose={onClose} >
      <Box
        sx={{
          width: '80%',           // Disminuye un poco el ancho
          maxWidth: 500,           // Ajusta el máximo ancho a 500px
          bgcolor: '#f5f5f5',
          borderRadius: '12px',
          boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.15)',
          p: 3,
          mx: 'auto',
          mt: 10,                 // Aumenta el margen superior para centrarlo mejor
          overflowY: 'auto',
        }}
      >
        {/* Header del Modal */}
        <Header title={t('exercise_information')} />

        {/* Título del Ejercicio */}
        <Typography
          variant="h6"
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
          {exerciseName}
        </Typography>

        {/* Descripción del Ejercicio */}
        <Typography sx={{ mb: 3, color: '#666', textAlign: 'justify', fontSize: '0.8em' }}>
          {description}
        </Typography>

        {/* Instrucciones Paso a Paso */}
        <Typography sx={{ mb: 2, color: '#333', textAlign: 'left', fontWeight: 'bold' }}>
        {t('step_by_step_instructions')}
        </Typography>
        <Divider sx={{ mb: 2, backgroundColor: '#d0d0d0' }} />

        <Grid container spacing={2}>
          {Array.isArray(steps) && steps.length > 0 ? (
            steps.map((step, index) => (
              <Grid item xs={12} key={index}>
                <Paper
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: '8px',
                    bgcolor: '#f9f9f9',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 30,
                      borderRadius: '50%',
                      bgcolor: '#333',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '1.1em', // Un tamaño de fuente consistente para todos los números
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography sx={{ color: '#555', fontSize: '0.8em' }}>
                    {step}
                  </Typography>
                </Paper>
              </Grid>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 2 }}>
              {t('no_instructions_available')}
            </Typography>
          )}
        </Grid>


        {/* Botón de Cerrar */}
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            mt: 4,
            width: '100%',
            backgroundColor: '#555555',
            color: '#ffffff',
            borderRadius: '8px',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#555555',
            },
            py: 1.5,
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
          }}
        >
          {t('close_button')}
        </Button>
      </Box>
    </Modal>
  );
};

export default ExerciseInfoModal;
