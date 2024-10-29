import React, { useState, useRef, useEffect, useContext } from 'react';

interface Exercise {
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
    InputLabel,
    Select,
    OutlinedInput,
    MenuItem,
    Box,
    Chip,
    Typography,
    Divider,
    SelectChangeEvent,
    Card,
    IconButton
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext';
import { CameraAlt, Close, Delete } from '@mui/icons-material';

interface Exercise {
    name: string;
    sets: number;
    reps: number;
    rest: number;
}

const AddWorkouts: React.FC = () => {
    const history = useHistory();
    const [media, setMedia] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useContext(LanguageContext); // Usar el contexto de idioma
    const [showActionSheet, setShowActionSheet] = useState(false);


    const [formData, setFormData] = useState({
        name: '',
        description: '',
        exercises: [] as { name: string; series: number; reps: number; rest: number }[],
        duration: 30, // Nuevo campo
    });

    const [errors, setErrors] = useState<any>({});
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
            const response = await fetch('http://127.0.0.1:8000/api/workouts/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Si usas JWT
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    exercises: workoutDetails.exercises,
                    media: media,
                    duration: formData.duration, // Añadido
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Entrenamiento creado con éxito:', data);
                history.push('/admin/workouts');
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

    const handleExerciseChange = (index: number, field: string, value: string | number) => {
        const updatedExercises = [...workoutDetails.exercises];
        updatedExercises[index] = { ...updatedExercises[index], [field]: value };
        setWorkoutDetails({ ...workoutDetails, exercises: updatedExercises });
    };

    const handleMediaUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMedia(reader.result as string); // Guardar la imagen subida
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoOption = (option: string) => {
        if (option === 'upload') {
            handleMediaUpload();
        } else if (option === 'delete') {
            setMedia(null); // Eliminar imagen
        }
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name as string]: value,
        });
    };

    const handleDeleteExercise = (index: number) => {
        const updatedExercises = workoutDetails.exercises.filter((_, i) => i !== index);
        setWorkoutDetails({ ...workoutDetails, exercises: updatedExercises });
    };

    // Llamada al backend para obtener los ejercicios
    const fetchExercises = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/exercises/all/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Si usas JWT
                },
            });
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
        <Container  sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', marginTop: '20%' }}>
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

                        <Grid item xs={12}>
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                variant="outlined"
                                startIcon={<CameraAlt />}
                                fullWidth
                                sx={{
                                    color: '#777', borderColor: '#777', fontWeight: 'bold', width: '100%', borderRadius: '8px', padding: '8px',
                                  }}
                            >
                                {t('upload_image')}
                            </Button>
                            {media && (
                                <Box mt={2} textAlign="center">
                                    <img src={media} alt="Preview" style={{ width: '100%', borderRadius: '8px' }} />
                                    <IconButton onClick={() => setMedia(null)} aria-label="delete" color="error">
                                        <Close />
                                    </IconButton>
                                </Box>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
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
                                                <MenuItem value="Exercise 1">Exercise 1</MenuItem>
                                                <MenuItem value="Exercise 2">Exercise 2</MenuItem>
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