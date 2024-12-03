import React, { useState, useRef, useEffect, useContext } from 'react';
import Header from '../../Header/Header';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { Button, Select, InputLabel, Grid, SelectChangeEvent, Container, Box, Avatar, Chip } from '@mui/material';
import { LanguageContext } from '../../../context/LanguageContext';
import { useHistory } from 'react-router';
import { CameraAlt } from '@mui/icons-material';

interface Training {
    id: string;
    name: string;
}

interface Workout {
    id: number;
    name: string;
    description: string;
}

const CreateTrainingPlan: React.FC = () => {
    const { t } = useContext(LanguageContext); // Usar el contexto de idioma
    const history = useHistory();
    const [planData, setPlanData] = useState({
        name: '',
        selectedTraining: [],
        description: '',
        equipment: '',
        difficulty: '',
        duration: 0,
    });
    const [availableWorkouts, setAvailableWorkouts] = useState<Workout[]>([]);



    const fetchAvailableWorkouts = async () => {
        const accessToken = localStorage.getItem('access_token');
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/workouts/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAvailableWorkouts(data.data);
            } else {
                console.error(t('error_loading_workouts'));
            }
        } catch (error) {
            console.error(t('connection_error'), error);
        }
    };

    useEffect(() => {
        fetchAvailableWorkouts();
    }, []);

    const handleSave = async () => {

        try {
            const accessToken = localStorage.getItem('access_token');

            if (!accessToken) {
                console.error(t('no_token'));
                return;
            }
            console.log('Plan de entrenamiento creado:', planData);
            const response = await fetch('http://127.0.0.1:8000/api/trainingplans/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,  // Agrega el token JWT aquí
                }, body: JSON.stringify({
                    name: planData.name,
                    selectedTraining: planData.selectedTraining,
                    description: planData.description,
                    equipment: planData.equipment,
                    difficulty: planData.difficulty,
                    duration: planData.duration,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Plan de entrenamiento creado:', data);
                history.push('/admin/workout');  // Redirigir a la lista de entrenamientos tras guardar
            } else {
                const errorData = await response.json();
                console.error('Error al crear el plan de entrenamiento:', errorData);
            }
        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
        }
    };


    const handleCancel = () => {
        history.push('/admin/workout');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setPlanData({
            ...planData,
            [name as string]: value,
        });
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        setPlanData({
            ...planData,
            [name as string]: value,
        });
    };

    const handleSelectChangeWorkout = (event) => {
        setPlanData({
            ...planData,
            selectedTraining: event.target.value, // Maneja múltiples selecciones como array
        });
    };

    const equipmentOptions = [
        { value: 'Gimnasio completo', label: t('full_gym') },
        { value: 'Pesas libres', label: t('free_weights') },
        { value: 'Sin equipamiento', label: t('no_equipment') },
    ];

    const difficultyOptions = [
        { value: 'Sedentario', label: t('sedentary') },
        { value: 'Ligero', label: t('light') },
        { value: 'Moderado', label: t('moderate') },
        { value: 'Avanzado', label: t('advanced') },
    ];

    return (
        <Box sx={{ pb: 10, pt: 5, backgroundColor: '#f5f5f5', height:'85vh' }}>
            <Header title={t('add_training_plan')} />

            <Box sx={{ p: 3, mt: 2, backgroundColor: '#f5f5f5' }}>
                <form>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                label={t('training_name')}
                                name="name"
                                value={planData.name}
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

                        {/* Campo de descripción */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                multiline
                                rows={3}
                                label={t('description')}
                                name="description"
                                value={planData.description}  // Aquí cambiamos "descriptcion" a "description"
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
                            <InputLabel>{t('select_training')}</InputLabel>
                            <Select
                                name="selectedTraining"
                                multiple
                                value={planData.selectedTraining}
                                onChange={handleSelectChange}
                                fullWidth
                                displayEmpty
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                }}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={availableWorkouts.find(workout => workout.id === value)?.name} />
                                        ))}
                                    </Box>
                                )}
                            >
                                {availableWorkouts.length > 0 ? (
                                    availableWorkouts.map((workout) => (
                                        <MenuItem key={workout.id} value={workout.id}>
                                            {workout.name}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem value="" disabled>{t('no_trainings_available')}</MenuItem>
                                )}
                            </Select>
                        </Grid>

                        <Grid item xs={12}>
                            <InputLabel>{t('equipment')}</InputLabel>
                            <Select
                                name="equipment"
                                value={planData.equipment}
                                onChange={handleSelectChange}
                                fullWidth
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                }}
                            >
                                {equipmentOptions.map(option => (
                                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                ))}
                            </Select>
                        </Grid>

                        <Grid item xs={12}>
                            <InputLabel>{t('difficulty')}</InputLabel>
                            <Select
                                name="difficulty"
                                value={planData.difficulty}
                                onChange={handleSelectChange}
                                fullWidth
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                }}
                            >
                                {difficultyOptions.map(option => (
                                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                ))}
                            </Select>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                label={t('duration_minutes')}
                                name="duration"
                                type="number"
                                value={planData.duration}
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



                        {/* Botones de Cancelar y Guardar */}
                        <Grid item xs={12}>
                            <Grid container spacing={2} sx={{ mb: 4 }}>
                                <Grid item xs={6}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={handleCancel}
                                        sx={{
                                            color: '#777',
                                            borderColor: '#777',
                                            fontWeight: 'bold',
                                            py: 1,
                                            borderRadius: '8px',
                                        }}
                                    >
                                        {t('cancel')}
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={handleSave}
                                        sx={{
                                            backgroundColor: '#555',
                                            color: '#FFF',
                                            fontWeight: 'bold',
                                            py: 1,
                                            borderRadius: '8px',
                                            '&:hover': { backgroundColor: '#333' },
                                        }}
                                    >
                                        {t('save')}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Box>
    );
};

export default CreateTrainingPlan;
