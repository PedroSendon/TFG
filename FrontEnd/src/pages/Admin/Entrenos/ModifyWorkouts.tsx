import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  Avatar, Box, Button, Card, Container, Grid, IconButton, MenuItem, Snackbar, TextField, Typography,
} from '@mui/material';
import { CameraAlt, Delete } from '@mui/icons-material';
import { useHistory, useLocation } from 'react-router-dom';
import { LanguageContext } from '../../../context/LanguageContext';
import Header from '../../Header/Header'; // Componente de header reutilizable

interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  rest: number;
}

const ModifyWorkoutPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { t } = useContext(LanguageContext);

  const { data } = (location.state || { data: {} }) as { data: any };
  const workoutId = data?.id; // Obtener el ID del entrenamiento desde el estado

  const [workoutDetails, setWorkoutDetails] = useState({
    name: '',
    description: '',
    exercises: [] as Exercise[],
    duration: 30,
  });

  const [media, setMedia] = useState<string | null>(data?.media || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showToast, setShowToast] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      if (!workoutId) return;

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/workouts/details/?id=${workoutId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener los detalles del entrenamiento');
        }

        const data = await response.json();
        setWorkoutDetails({
          name: data.name,
          description: data.description,
          exercises: data.exercises,
          duration: data.duration || 30,
        });
        setMedia(data.media || null);
      } catch (error) {
        console.error('Error fetching workout details:', error);
      }
    };

    fetchWorkoutDetails();
  }, [workoutId]);

  // Llamada a la API para obtener los ejercicios disponibles
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/exercises/all/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        const data = await response.json();
        setAvailableExercises(data?.data || []);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      }
    };

    fetchExercises();
  }, []);

  const handleSave = async () => {
    try {
      // Mostrar el toast mientras se procesa la solicitud
      setShowToast(true);
  
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error('No token found');
        return;
      }
  
      const response = await fetch(`http://127.0.0.1:8000/api/workouts/${data.id}/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: workoutDetails.name,
          description: workoutDetails.description,
          media: media,  // Enviar media si está disponible
          exercises: workoutDetails.exercises.map(exercise => ({
            name: exercise.name,
            series: exercise.sets,
            reps: exercise.reps,
            rest: exercise.rest,
          })),
        }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        // Mostrar mensaje de éxito y redirigir
        console.log('Entrenamiento actualizado con éxito:', result);
        history.push('/admin/workout');
      } else {
        // Manejo de errores
        console.error('Error al actualizar el entrenamiento:', result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error en la solicitud de actualización:', error);
    } finally {
      setShowToast(false);  // Ocultar el toast después de completar la solicitud
    }
  };
  

  const handleCancel = () => {
    history.push('/admin/workout');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMedia(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExerciseChange = (index: number, field: string, value: string) => {
    const updatedExercises = [...workoutDetails.exercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    setWorkoutDetails({ ...workoutDetails, exercises: updatedExercises });
  };

  const handleAddExercise = () => {
    setWorkoutDetails({
      ...workoutDetails,
      exercises: [
        ...workoutDetails.exercises,
        { id: Date.now(), name: '', sets: 0, reps: 0, rest: 0 },
      ],
    });
  };

  const handleDeleteExercise = (index: number) => {
    const updatedExercises = workoutDetails.exercises.filter((_: any, i: number) => i !== index);
    setWorkoutDetails({ ...workoutDetails, exercises: updatedExercises });
  };

  return (
    <Container maxWidth="sm" sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', paddingTop: '16px' }}>

      <Header title={t('modify_workout_title')} />

      {/* Image Section */}
      <Box textAlign="center" mb={3} sx={{ paddingTop: '16%' }}>
        <Avatar
          src={media || undefined}
          alt="Preview"
          sx={{
            width: 150, height: 150, margin: '0 auto', borderRadius: '10px', border: '2px solid #000',
          }}
        />
        <Button
          variant="outlined"
          startIcon={<CameraAlt />}
          onClick={() => fileInputRef.current?.click()}
          sx={{ color: '#000', borderColor: '#000', mt: 1 }}
        >
          {t('change_image_video')}
        </Button>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
      </Box>

      {/* Form Section */}
      <form>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              label={t('workout_name')}
              value={workoutDetails.name}
              onChange={(e) => setWorkoutDetails({ ...workoutDetails, name: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '& fieldset': { borderColor: '#CCCCCC' },
                  '&:hover fieldset': { borderColor: '#AAAAAA' },
                  '&.Mui-focused fieldset': { borderColor: '#555555' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              label={t('description')}
              value={workoutDetails.description}
              onChange={(e) => setWorkoutDetails({ ...workoutDetails, description: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '& fieldset': { borderColor: '#CCCCCC' },
                  '&:hover fieldset': { borderColor: '#AAAAAA' },
                  '&.Mui-focused fieldset': { borderColor: '#555555' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              label={t('duration_minutes')}
              type="number"
              value={workoutDetails.duration}
              onChange={(e) => setWorkoutDetails({ ...workoutDetails, duration: Number(e.target.value) })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '& fieldset': { borderColor: '#CCCCCC' },
                  '&:hover fieldset': { borderColor: '#AAAAAA' },
                  '&.Mui-focused fieldset': { borderColor: '#555555' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
              }}
            />
          </Grid>

          {/* Exercise List */}
          {workoutDetails.exercises.map((exercise: Exercise, index: number) => (
            <Box key={index} sx={{ marginX: 2 }}> {/* Ajusta el padding horizontal aquí */}
              <Card
                sx={{
                  mt: 2,
                  padding: 2,
                  borderRadius: '8px',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e0e0e0',
                  width: '95%',  // Asegura que el card ocupe todo el ancho disponible
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography sx={{ color: '#000000', fontWeight: 'bold', fontSize: '1em' }}>
                    {t('exercise')} {index + 1}
                  </Typography>
                  <IconButton
                    onClick={() => handleDeleteExercise(index)}
                    sx={{
                      border: '1px solid #FF0000',
                      backgroundColor: '#FFFFFF',
                      color: '#FF0000',
                      borderRadius: '5px',
                      padding: '4px',
                      fontSize: '0.8em',
                      '&:hover': { backgroundColor: '#f3f3f3' },
                    }}
                  >
                    <Delete color="error" />
                  </IconButton>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label={t('exercise_name')}
                      value={exercise.name}
                      onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '& fieldset': { borderColor: '#CCCCCC' },
                          '&:hover fieldset': { borderColor: '#AAAAAA' },
                          '&.Mui-focused fieldset': { borderColor: '#555555' },
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                      }}
                    >
                      {availableExercises.map((ex) => (
                        <MenuItem key={ex.id} value={ex.name}>
                          {ex.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label={t('sets')}
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '& fieldset': { borderColor: '#CCCCCC' },
                          '&:hover fieldset': { borderColor: '#AAAAAA' },
                          '&.Mui-focused fieldset': { borderColor: '#555555' },
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                      }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label={t('reps')}
                      type="number"
                      value={exercise.reps}
                      onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '& fieldset': { borderColor: '#CCCCCC' },
                          '&:hover fieldset': { borderColor: '#AAAAAA' },
                          '&.Mui-focused fieldset': { borderColor: '#555555' },
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                      }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label={t('rest')}
                      type="number"
                      value={exercise.rest}
                      onChange={(e) => handleExerciseChange(index, 'rest', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '& fieldset': { borderColor: '#CCCCCC' },
                          '&:hover fieldset': { borderColor: '#AAAAAA' },
                          '&.Mui-focused fieldset': { borderColor: '#555555' },
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                      }}
                    />
                  </Grid>
                </Grid>
              </Card>
            </Box>
          ))}

        </Grid>
      </form>

      {/* Add Exercise Button */}
      <Box textAlign="center" mt={3}>
        <Button
          onClick={handleAddExercise}
          variant="outlined"
          sx={{
            color: '#777', borderColor: '#777', fontWeight: 'bold', width: '100%', borderRadius: '8px', padding: '8px',
          }}
        >
          {t('add_exercise')}
        </Button>
      </Box>

      {/* Cancel and Save Buttons */}
      <Grid container spacing={2} sx={{ mt: 3, mb: 10 }}>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              color: '#777', borderColor: '#777', fontWeight: 'bold', py: 1, borderRadius: '8px',
            }}
            onClick={handleCancel}
          >
            {t('cancel')}
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: '#555', color: '#FFF', fontWeight: 'bold', py: 1, borderRadius: '8px', '&:hover': { backgroundColor: '#333' },
            }}
            onClick={handleSave}
          >
            {t('save')}
          </Button>
        </Grid>
      </Grid>

      {/* Success Toast */}
      <Snackbar
        open={showToast}
        autoHideDuration={2000}
        onClose={() => setShowToast(false)}
        message={t('toast_success')}
      />
    </Container>
  );
};

export default ModifyWorkoutPage;