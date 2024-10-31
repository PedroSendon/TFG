import React, { useEffect, useState, useContext } from 'react';
import { Card, CardContent, Typography, Box, Divider, Avatar, Grid } from '@mui/material';
import { useLocation, useHistory } from 'react-router-dom';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext';

const WorkoutDetails: React.FC = () => {
    const { t } = useContext(LanguageContext);
    const location = useLocation<{ workoutId: number }>();
    const history = useHistory();
    const workoutId = location.state?.workoutId;
    const [workoutData, setWorkoutData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (workoutId) fetchWorkoutDetails();
    }, [workoutId]);

    const fetchWorkoutDetails = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken || !workoutId) return;
            const response = await fetch(`http://127.0.0.1:8000/api/workouts/details/?id=${workoutId}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            if (response.ok) setWorkoutData(await response.json());
        } catch (error) {
            console.error('Error fetching workout data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExerciseClick = (exerciseId: number) => {
        history.push({
            pathname: '/admin/exercises/details',
            state: { exerciseId },
        });
    };

    if (loading) return <p>{t('loading_workout')}</p>;

    return (
        <Box sx={{ marginTop: '16%', paddingBottom: '15%' }}>
            <Header title={t('workout_details')} />
            <Box sx={{ padding: '20px', backgroundColor: '#f5f5f5' }}>

                {/* General Information */}
                <Card sx={{
                    padding: '10px',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e0e0e0',
                    marginBottom: '15px'
                }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
                            {workoutData?.name}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body1">
                            {workoutData?.description || t('no_description')}
                        </Typography>
                    </CardContent>
                </Card>

                {/* Exercises List */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#555', mr: 1 }}>
                        {t('exercises')}
                    </Typography>
                    <Divider sx={{ flex: 1, backgroundColor: '#ddd', height: 1 }} />
                </Box>

                <Grid container spacing={2}>
                    {workoutData?.exercises.map((exercise: any) => (
                        <Grid item xs={12} key={exercise.id}>
                            <Box
                                onClick={() => handleExerciseClick(exercise.id)}
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover .MuiCard-root': {
                                        transform: 'scale(1.02)',
                                        boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.15)',
                                    },
                                }}
                            >
                                <Card sx={{
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '10px',
                                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                    padding: '10px',
                                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                }}>
                                    <CardContent>
                                        <Box display="flex" alignItems="center">
                                            <Avatar
                                                src={exercise.media}
                                                alt={exercise.name}
                                                sx={{ width: 56, height: 56, marginRight: 2 }}
                                            />
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                                                    {exercise.name}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    {exercise.description || t('no_description')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Divider sx={{ my: 1 }} />

                                        {/* Muscle Groups and Set/Rep Info */}
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#555', mt: 1 }}>
                                                {t('muscle_groups')}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                                {exercise.muscleGroups.join(', ')}
                                            </Typography>

                                            <Box display="flex" justifyContent="space-between">
                                                <Box textAlign="center">
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#555' }}>{t('sets')}</Typography>
                                                    <Typography variant="body1" sx={{ color: '#333' }}>{exercise.sets}</Typography>
                                                </Box>
                                                <Box textAlign="center">
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#555' }}>{t('reps')}</Typography>
                                                    <Typography variant="body1" sx={{ color: '#333' }}>{exercise.reps}</Typography>
                                                </Box>
                                                <Box textAlign="center">
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#555' }}>{t('rest')}</Typography>
                                                    <Typography variant="body1" sx={{ color: '#333' }}>{exercise.rest} s</Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

            </Box>
        </Box>
    );
};

export default WorkoutDetails;
