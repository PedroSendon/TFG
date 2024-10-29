import React, { useEffect, useState, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import './WorkoutDay.css';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext'; // Importa el contexto de idioma
import { Box, Button, Card, CardContent, CardMedia, Checkbox, LinearProgress, Typography } from '@mui/material';

const WorkoutDay: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ day_id: number }>(); // Definimos el tipo para acceder al estado
  const { t } = useContext(LanguageContext);

  const day_id = location.state?.day_id; // Accedemos a `day_id` desde el estado pasado
  const [exercises, setExercises] = useState<Array<{ id: number; name: string; imageUrl: string; sets: number; reps: number; rest: number; completed: boolean }>>([]);
  const [totalSets, setTotalSets] = useState<number>(0);
  const [totalReps, setTotalReps] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [totalRest, setTotalRest] = useState<number>(0);


  const fetchWorkoutDetails = async (day_id: number) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error(t('no_token'));
        return;
      }
      const response = await fetch(`http://127.0.0.1:8000/api/workout/day/${day_id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setExercises(data);

        const totalSets = data.reduce((acc: number, exercise: any) => acc + exercise.sets, 0);
        const totalReps = data.reduce((acc: number, exercise: any) => acc + exercise.reps * exercise.sets, 0);
        const totalRest = data.reduce((acc: number, exercise: any) => exercise.rest, 0); // Calcula total de descanso

        setTotalSets(totalSets);
        setTotalReps(totalReps);
        setTotalRest(totalRest); // Establece el valor de totalRest


      } else {
        console.error('Error fetching workout details');
      }
    } catch (err) {
      console.error('Network error fetching workout details');
    }
  };

  useEffect(() => {
    if (day_id) {
      fetchWorkoutDetails(day_id);
    }
  }, [day_id, history]);

  const handleCheckboxChange = (index: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[index].completed = !updatedExercises[index].completed;
    setExercises(updatedExercises);

    const completedCount = updatedExercises.filter(ex => ex.completed).length;
    setCompletedCount(completedCount);
  };

  const handleExerciseClick = (index: number, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'ION-CHECKBOX' && target.tagName !== 'ION-LABEL') {
      const exerciseId = exercises[index].id;
      history.push({
        pathname: `/workout/day/exercise`, // Ruta sin IDs
        state: { day_id, exerciseId }, // Pasa day_id y exerciseId en el estado
      });
    }
  };

  const handleCompleteWorkout = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error(t('no_token'));
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/workout/complete/${day_id}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ progress: progressPercentage }), // Progreso calculado en el FE
      });

      if (response.ok) {
        console.log("Workout marked as complete.");
        // Actualiza el estado del ejercicio a completado y refresca la vista si es necesario
        setExercises((prevExercises) =>
          prevExercises.map((exercise) => ({ ...exercise, completed: true }))
        );
        handleBack();
      } else {
        console.error('Failed to mark workout as complete');
      }
    } catch (error) {
      console.error('Error marking workout as complete:', error);
    }
  };


  const handleBack = () => {
    history.push('/workout', { reload: true }); // Navega de regreso a la ruta '/workout'
  };

  const progress = exercises.length > 0 ? completedCount / exercises.length : 0;
  const progressPercentage = Math.round(progress * 100);

  return (
   <Box sx={{ backgroundColor: '#f5f5f5', height: '100%', marginTop:'16%' }}>
      <Header title={t('training_of_the_day')} onBack={handleBack} showBackButton={true} />

      <Box maxWidth="md" sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
        {exercises.map((exercise, index) => (
          <Card
          key={exercise.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Sombra suave para darle profundidad
            padding: '16px',
            borderRadius: '12px',
            cursor: 'pointer',
            position: 'relative',
            border: '1px solid #e0e0e0', // Borde claro para una apariencia limpia
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.15)',
            },
          }}
          onClick={(e) => handleExerciseClick(index, e)}
        >
          <CardMedia
            component="img"
            sx={{
              width: 80,
              height: 80,
              borderRadius: '8px',
              marginRight: 2,
              objectFit: 'cover',
              border: '1px solid #e0e0e0',
            }}
            image={exercise.imageUrl}
            alt={`${t('image_of')} ${exercise.name}`}
          />
          <CardContent sx={{ flex: '1 1 auto' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>{exercise.name}</Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {`${exercise.sets} ${t('sets')} ${t('of')} ${exercise.reps} ${t('repetitions')}`}
            </Typography>
          </CardContent>
          <Checkbox
            checked={exercise.completed}
            onChange={(e) => {
              e.stopPropagation();
              handleCheckboxChange(index);
            }}
            color="success"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: '#666',
              zIndex: 10, // Aumenta la z-index para asegurar que el clic lo registre solo el checkbox
              '& .MuiSvgIcon-root': {
                borderRadius: '50%',
              },
              '&.Mui-checked': {
                color: '#4CAF50',
              },
            }}
          />
        </Card>
        
        ))}
      </Box>

      <Box my={3} textAlign="center" >
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>{t('training_summary')}</Typography>
        <Typography sx={{ color: '#555' }}>
          <strong>{totalSets}</strong> {t('sets')} | <strong>{totalReps}</strong> {t('repetitions')} | <strong>{totalRest}</strong> {t('minutes')}
        </Typography>
      </Box>

      <Box my={3}>
        <Typography align="center" sx={{ color: '#666', fontWeight: 'bold' }} gutterBottom>
          {progressPercentage}% {t('completed')}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progressPercentage}
          sx={{
            height: 12,
            borderRadius: 6,
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#4CAF50',
            },
          }}
        />
      </Box>

      <Box mt={4} mb={8} display="flex" justifyContent="center" sx={{paddingBottom:'18%'}}>
        <Button
          onClick={handleCompleteWorkout}
          variant="contained"
          sx={{
            backgroundColor: '#555555',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            width: '80%',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              backgroundColor: '#333333',
            },
          }}
        >
          {t('mark_training_completed')}
        </Button>
      </Box>
    </Box>
);


};

export default WorkoutDay;