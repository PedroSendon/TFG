import React, { useState, useRef, useEffect, useContext } from 'react';

interface Exercise {
    id: number;
    name: string;
    sets: number;
    reps: number;
    rest: number;
}
import {
    TextField,
    Button,
    Grid,
    Container,
    MenuItem,
    Box,
    Typography,
    SelectChangeEvent,
    Card,
    IconButton
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext';
import { CameraAlt, Close, Delete } from '@mui/icons-material';

const AddWorkouts: React.FC = () => {
    const history = useHistory();
    const { t } = useContext(LanguageContext); // Usar el contexto de idioma


    const [formData, setFormData] = useState({
        name: '',
        description: '',
        exercises: [] as { name: string; series: number; reps: number; rest: number }[],
        duration: 30, // Nuevo campo
    });

    const [exercisesList, setExercisesList] = useState<Exercise[]>([]); // Estado para la lista de ejercicios

    const handleAddExercise = () => {
        setWorkoutDetails({
            ...workoutDetails,
            exercises: [...workoutDetails.exercises, { name: '', sets: 0, reps: 0, rest: 0 }],
        });
    };

    const handleCancel = () => {
        history.push('/admin/workout');
    };
 
    const handleSave = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
    
            if (!accessToken) {
                console.error(t('no_token'));
                return;
            }
    
            const formData2 = new FormData();
            formData2.append('name', formData.name);
            formData2.append('description', formData.description);
            formData2.append('duration', String(formData.duration));
    
            // Añade cada ejercicio como parte del FormData
            workoutDetails.exercises.forEach((exercise, index) => {
                formData2.append(`exercises[${index}][name]`, exercise.name);
                formData2.append(`exercises[${index}][sets]`, String(exercise.sets));
                formData2.append(`exercises[${index}][reps]`, String(exercise.reps));
                formData2.append(`exercises[${index}][rest]`, String(exercise.rest));
            });
    
      
            console.log('FormData:', formData2);
    
            const response = await fetch('http://127.0.0.1:8000/api/workouts/create/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: formData2, // Enviar FormData en lugar de JSON
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log('Entrenamiento creado con éxito:', data);
                history.push('/admin/workout');
            } else {
                const errorData = await response.json();
                console.error('Error al crear el entrenamiento:', errorData);
            }
        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
        }
    };
    
    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name as string]: value,
        });
    };

    const [workoutDetails, setWorkoutDetails] = useState<{
        name: string;
        description: string;
        exercises: { name: string; sets: number; reps: number; rest: number }[];
    }>({
        name: '',
        description: '',
        exercises: [],
    });


    const handleDeleteExercise = (index: number) => {
        const updatedExercises = workoutDetails.exercises.filter((_, i) => i !== index);
        setWorkoutDetails({ ...workoutDetails, exercises: updatedExercises });
    };

    // Llamada al backend para obtener los ejercicios
    const fetchExercises = async () => {
        try {
            const accessToken = localStorage.getItem('access_token'); // Asegúrate de que 'access_token' sea el nombre correcto
            if (!accessToken) {
                console.error('No access token found');
                return;
            }

            const response = await fetch('http://127.0.0.1:8000/api/exercises/all/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`, // Usa el nombre correcto del token
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setExercisesList(data.data); // Actualiza el estado con los ejercicios obtenidos
        } catch (error) {
            console.error('Error al obtener ejercicios:', error);
        }
    };

    // Ejecutar la llamada al backend cuando el componente se monta
    useEffect(() => {
        fetchExercises();
    }, []);


    

    return (
        <Container sx={{ backgroundColor: '#f5f5f5', minHeight: '89vh', marginTop: '20%' }}>
            <Header title={t('add_workout_title')} />
            <Box mt={4}>
                <form>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                label={t('workout_name')}
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
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
                                variant="outlined"
                                fullWidth
                                label={t('description')}
                                name="description"
                                multiline
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
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
                                variant="outlined"
                                fullWidth
                                label={t('duration_minutes')}
                                name="duration"
                                type="number"
                                value={formData.duration}
                                onChange={handleChange}
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

                        {workoutDetails.exercises.map((exercise, index) => (
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
                                >                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
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
                                                onChange={(e) => {
                                                    const exercises = [...workoutDetails.exercises];
                                                    exercises[index].name = e.target.value;
                                                    setWorkoutDetails({ ...workoutDetails, exercises });
                                                }}
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
                                                {exercisesList.map((ex) => (
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
                                                onChange={(e) => {
                                                    const exercises = [...workoutDetails.exercises];
                                                    exercises[index].sets = Number(e.target.value);
                                                    setWorkoutDetails({ ...workoutDetails, exercises });
                                                }}
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
                                                onChange={(e) => {
                                                    const exercises = [...workoutDetails.exercises];
                                                    exercises[index].reps = Number(e.target.value);
                                                    setWorkoutDetails({ ...workoutDetails, exercises });
                                                }}
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
                                                onChange={(e) => {
                                                    const exercises = [...workoutDetails.exercises];
                                                    exercises[index].rest = Number(e.target.value);
                                                    setWorkoutDetails({ ...workoutDetails, exercises });
                                                }}
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

                        <Grid item xs={12}>
                            <Button
                                onClick={handleAddExercise}
                                variant="outlined"
                                sx={{
                                    color: '#777', borderColor: '#777', fontWeight: 'bold', width: '100%', borderRadius: '8px', padding: '8px',
                                }}
                            >

                                {t('add_exercise')}
                            </Button>
                        </Grid>

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
                </form>
            </Box>
        </Container>
    );
};


export default AddWorkouts;