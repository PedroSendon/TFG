import React, { useState, useRef, useEffect, useContext } from 'react';

import { useHistory, useLocation } from 'react-router-dom';
import Header from '../../Header/Header';
import { Box, Chip, InputLabel, MenuItem, OutlinedInput, Select, TextField, Button, Card, CardContent, Snackbar, Container, Grid, Avatar, IconButton, Typography } from '@mui/material';
import { LanguageContext } from '../../../context/LanguageContext';
import { CameraAlt, Delete } from '@mui/icons-material';

interface LocationState {
    data: {
        id: number;
        name: string;
        description: string;
        difficulty: string;
        equipment: string;
        duration: number;
        workouts: any[];
    };
}
interface Workout {
    id: number;
    name: string;
    description: string;
}
const ModifyTrainingPlans: React.FC = () => {
    const history = useHistory();
    const location = useLocation<LocationState>();
    const { t, language } = useContext(LanguageContext);
    const trainingPlanId = location.state?.data?.id; // Usamos optional chaining para evitar errores si `state` o `data` no existen

    const [availableWorkouts, setAvailableWorkouts] = useState<Workout[]>([]);
    const [selectedWorkout, setSelectedWorkout] = useState<number | null>(null);

    const [planDetails, setPlanDetails] = useState({
        name: '',
        description: '',
        difficulty: '',
        equipment: '',
        duration: 0,
    });
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [showToast, setShowToast] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [workoutSelections, setWorkoutSelections] = useState<{ id: string, selectedWorkout: number | null }[]>([]);

    const handleAddWorkoutCard = () => {
        setWorkoutSelections([
            ...workoutSelections,
            { id: Math.random().toString(), selectedWorkout: null }
        ]);
    };

    const handleRemoveWorkoutCard = (id: string) => {
        setWorkoutSelections(workoutSelections.filter((item) => item.id !== id));
    };

    const handleWorkoutChange = (id: string, selectedWorkoutId: number) => {
        setWorkoutSelections(workoutSelections.map((item) =>
            item.id === id ? { ...item, selectedWorkout: selectedWorkoutId } : item
        ));
    };

    useEffect(() => {
        const fetchTrainingPlan = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken || !trainingPlanId) {
                history.push('/admin/training-plans');
                return;
            }

            try {
                const response = await fetch(`http://127.0.0.1:8000/api/training-plans/${trainingPlanId}/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setPlanDetails({
                        name: data.name,
                        description: data.description,
                        difficulty: data.difficulty,
                        equipment: data.equipment,
                        duration: data.duration
                    });
                    setWorkouts(data.workouts);
                } else {
                    console.error(t('error_loading_training_plan'));
                }
            } catch (error) {
                console.error(t('connection_error'), error);
            }
        };

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

        fetchTrainingPlan();
        fetchAvailableWorkouts();
    }, [trainingPlanId, history, t]);

    const handleAddWorkout = () => {
        const workoutToAdd = availableWorkouts.find((workout) => workout.id === selectedWorkout);
        if (workoutToAdd) {
            setWorkouts([...workouts, workoutToAdd]);
            setSelectedWorkout(null); // Reiniciar el valor seleccionado
        }
    };

    const handleDeleteWorkout = (workoutId: number) => {
        setWorkouts(workouts.filter((workout: Workout) => workout.id !== workoutId));
    };

    const handleSave = async () => {
        if (!trainingPlanId) {
            console.error(t('no_training_plan_id'));
            history.push('/admin/workout');
            return;
        }
        // Extraer solo los IDs de los entrenamientos en lugar de objetos completos
        const workoutIds = workouts.map(workout => workout.id);

        const updatedTrainingPlan = {
            training_plan_id: trainingPlanId,  // Agregar el ID aquí
            ...planDetails,
            workouts: workoutIds,  // Solo enviar los IDs
        };

        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error(t('no_token'));
                return;
            }
            const response = await fetch(`http://127.0.0.1:8000/api/training-plans/update/`, {  // Cambiar la URL
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(updatedTrainingPlan),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(t('training_plan_saved'), data);
                setShowToast(true);
                history.push('/admin/workout');
            } else {
                const errorData = await response.json();
                console.error(t('error_saving_training_plan'), errorData);
                setShowToast(true);
            }
        } catch (error) {
            console.error(t('connection_error'), error);
            setShowToast(true);
        }
    };


    const handleCancel = () => {
        history.push('/admin/workout');
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setPlanDetails({ ...planDetails, [name as string]: value });
    };


    return (
        <Container maxWidth="sm" sx={{ py: 5, marginTop: '15%' }}>
            <Header title={t('modify_training_plan_title')} />
            <form>
                <Grid container spacing={2}>
                    {/* Input de Nombre del Plan */}
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            name="name"
                            label={t('name')}
                            value={planDetails.name}
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

                    {/* Input de Descripción */}
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            name="description"
                            label={t('description')}
                            value={planDetails.description}
                            onChange={handleChange}
                            multiline
                            rows={3}
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

                    {/* Selección de Dificultad */}
                    <Grid item xs={12}>
                        <Select
                            value={["ligera", "moderada", "intermedia", "intensa"].includes(planDetails.difficulty) ? planDetails.difficulty : ""}
                            onChange={(e) => handleChange(e)}
                            fullWidth
                            displayEmpty
                            label={t('difficulty')}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    '& fieldset': { borderColor: '#CCCCCC' },
                                    '&:hover fieldset': { borderColor: '#AAAAAA' },
                                    '&.Mui-focused fieldset': { borderColor: '#555555' },
                                },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                            }}
                            renderValue={(selected) => {
                                if (selected === "") {
                                    return <em>{t('select_difficulty_placeholder')}</em>;
                                }
                                return selected;
                            }}
                        >
                            <MenuItem value="" disabled>
                                <em>{t('select_difficulty_placeholder')}</em>
                            </MenuItem>
                            <MenuItem value="ligera">{t('difficulty_light')}</MenuItem>
                            <MenuItem value="moderada">{t('difficulty_moderate')}</MenuItem>
                            <MenuItem value="intermedia">{t('difficulty_intermediate')}</MenuItem>
                            <MenuItem value="intensa">{t('difficulty_intense')}</MenuItem>
                        </Select>
                    </Grid>


                    {/* Selección de Equipamiento */}
                    <Grid item xs={12}>
                        <Select
                            value={
                                ["Pesas libres", "gimnasio", "Nada"].includes(planDetails.equipment)
                                    ? planDetails.equipment
                                    : ""
                            }
                            onChange={(e) => handleChange(e)}
                            fullWidth
                            displayEmpty
                            label={t('equipment')}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    '& fieldset': { borderColor: '#CCCCCC' },
                                    '&:hover fieldset': { borderColor: '#AAAAAA' },
                                    '&.Mui-focused fieldset': { borderColor: '#555555' },
                                },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                            }}
                            renderValue={(selected) => {
                                if (selected === "") {
                                    return <em>{t('select_equipment_placeholder')}</em>;
                                }
                                return selected;
                            }}
                        >
                            <MenuItem value="" disabled>
                                <em>{t('select_equipment_placeholder')}</em>
                            </MenuItem>
                            <MenuItem value="Pesas libres">{t('equipment_free_weights')}</MenuItem>
                            <MenuItem value="gimnasio">{t('equipment_gym')}</MenuItem>
                            <MenuItem value="Nada">{t('equipment_none')}</MenuItem>
                        </Select>
                    </Grid>



                    {/* Input de Duración */}
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label={t('duration')}
                            name="duration"
                            type="number"
                            value={planDetails.duration}
                            onChange={handleChange}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    '& fieldset': { borderColor: '#CCCCCC' },
                                    '&:hover fieldset': { borderColor: '#AAAAAA' },
                                    '&.Mui-focused fieldset': { borderColor: '#555555' },
                                }, '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },

                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            variant="outlined"
                            onClick={handleAddWorkoutCard}
                            fullWidth
                            sx={{
                                color: '#777',
                                borderColor: '#777',
                                fontWeight: 'bold',
                                py: 1.5,
                                borderRadius: '8px',
                                '&:hover': { backgroundColor: '#f5f5f5' },
                            }}
                        >
                            {t('add_workout')}
                        </Button>
                    </Grid>

                    {workoutSelections.map((workoutSelection) => (
                        <Grid item xs={12} key={workoutSelection.id}>
                            <Card sx={{ borderRadius: '10px', mb: 2, boxShadow: 2 }}>
                                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Select
                                        value={workoutSelection.selectedWorkout || ''}  // Aseguramos que no sea null
                                        onChange={(e) =>
                                            handleWorkoutChange(workoutSelection.id, e.target.value as number)
                                        }
                                        fullWidth
                                        displayEmpty
                                        renderValue={(value) =>
                                            value
                                                ? availableWorkouts.find((workout) => workout.id === value)?.name
                                                : t('select_workout_placeholder')  // Texto de marcador de posición
                                        }
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                            },
                                        }}
                                    >
                                        {/* Mapea `availableWorkouts` para crear las opciones del Select */}
                                        {availableWorkouts.map((workout) => (
                                            <MenuItem key={workout.id} value={workout.id}>
                                                {workout.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <IconButton onClick={() => handleRemoveWorkoutCard(workoutSelection.id)}>
                                        <Delete style={{ color: '#FF0000' }} />
                                    </IconButton>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}

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

            <Snackbar
                open={showToast}
                autoHideDuration={2000}
                onClose={() => setShowToast(false)}
                message={t('toast_success')}
            />
        </Container>
    );
};

export default ModifyTrainingPlans;
