import React, { useEffect, useState, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Box, Button, Card, CardContent, CardMedia, Checkbox, LinearProgress, Typography } from '@mui/material';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext';

const WorkoutDay: React.FC = () => {
    const history = useHistory();
    const location = useLocation<{ day_id: number }>();
    const { t } = useContext(LanguageContext);

    const day_id = location.state?.day_id;
    const [exercises, setExercises] = useState<Array<{ id: number; name: string; imageUrl: string; sets: number; reps: number; rest: number; completed: boolean }>>([]);
    const [completedCount, setCompletedCount] = useState<number>(0);

    // Estado para almacenar ejercicios completados y recuperarlos desde Local Storage si existen
    const [completedExercises, setCompletedExercises] = useState<{ [key: number]: boolean }>(() => {
        const storedCompletedExercises = localStorage.getItem(`completedExercises_${day_id}`);
        return storedCompletedExercises ? JSON.parse(storedCompletedExercises) : {};
    });

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

                // Aplica el estado de completedExercises guardado a los datos obtenidos
                const updatedData = data.map((exercise: any) => ({
                    ...exercise,
                    completed: !!completedExercises[exercise.id],
                }));

                setExercises(updatedData);
                setCompletedCount(updatedData.filter((ex: { completed: boolean }) => ex.completed).length);
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
    }, [day_id]);

    // Guarda el estado en Local Storage cuando completedExercises cambia
    useEffect(() => {
        localStorage.setItem(`completedExercises_${day_id}`, JSON.stringify(completedExercises));
    }, [completedExercises, day_id]);

    const handleCheckboxChange = (index: number) => {
        const updatedExercises = [...exercises];
        updatedExercises[index] = {
            ...updatedExercises[index],
            completed: !updatedExercises[index].completed,
        };

        setExercises(updatedExercises);

        const newCompletedExercises = { ...completedExercises };
        newCompletedExercises[updatedExercises[index].id] = updatedExercises[index].completed;
        setCompletedExercises(newCompletedExercises);

        setCompletedCount(updatedExercises.filter((ex) => ex.completed).length);
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
                body: JSON.stringify({ progress: progressPercentage }),
            });

            if (response.ok) {
                console.log("Workout marked as complete.");
                // Limpia el estado de ejercicios completados de Local Storage
                localStorage.removeItem(`completedExercises_${day_id}`);
                setCompletedExercises({});
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
        history.push('/workout', { reload: true });
    };

    const handleExerciseClick = (index: number, e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'ION-CHECKBOX' && target.tagName !== 'ION-LABEL') {
            const exerciseId = exercises[index].id;
            history.push({
                pathname: `/workout/day/exercise`,
                state: { day_id, exerciseId, completedExercises }, // Pasa el estado de completedExercises
            });
        }
    };


    const progress = exercises.length > 0 ? completedCount / exercises.length : 0;
    const progressPercentage = Math.round(progress * 100);

    return (
        <Box sx={{ backgroundColor: '#f5f5f5', height: '100%', marginTop: '16%' }}>
            <Header title={t('training_of_the_day')} onBack={handleBack} showBackButton={true} />
            <Box sx={{ backgroundColor: '#f5f5f5', paddingTop: '16px', paddingX: '20px', marginBottom: '16px' }}>
                <Box>
                    <Typography align="center" sx={{ color: '#666', fontWeight: 'bold', marginBottom: 1 }}>
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
                                backgroundColor: '#007bff',
                            },
                        }}
                    />
                </Box>
            </Box>
            <Box maxWidth="md" sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '20px' }}>
                {exercises.map((exercise, index) => (
                    <Card
                        key={exercise.id}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 3,
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                            padding: '16px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            position: 'relative',
                            border: '1px solid #e0e0e0',
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
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                color: '#6b6b6b',
                                zIndex: 10,
                                '& .MuiSvgIcon-root': {
                                    borderRadius: '50%',
                                    borderColor: '#6b6b6b',
                                },
                                '&.Mui-checked': {
                                    color: '#007bff',
                                },
                            }}
                        />
                    </Card>
                ))}
                <Box mt={4} mb={8} display="flex" justifyContent="center" sx={{ backgroundColor: 'f5f5f5' }}>
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
                            width: '100%',
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

        </Box>
    );
};

export default WorkoutDay;
