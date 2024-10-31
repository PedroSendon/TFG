import React, { useEffect, useState, useContext } from 'react';
import { Card, CardContent, Typography, Box, Divider, List, ListItem, ListItemText, Grid, Chip } from '@mui/material';
import { useLocation, useHistory } from 'react-router-dom';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext';

const TrainingPlanDetails: React.FC = () => {
    const { t } = useContext(LanguageContext);
    const location = useLocation<{ trainingPlanId: number }>();
    const history = useHistory();
    const trainingPlanId = location.state?.trainingPlanId;
    const [trainingPlanData, setTrainingPlanData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (trainingPlanId) fetchTrainingPlanDetails();
    }, [trainingPlanId]);

    const fetchTrainingPlanDetails = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken || !trainingPlanId) return;
            const response = await fetch(`http://127.0.0.1:8000/api/training-plans/${trainingPlanId}/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            if (response.ok) {
                const data = await response.json();
                setTrainingPlanData(data);
            } else {
                console.error("Failed to fetch training plan details");
            }
        } catch (error) {
            console.error('Error fetching training plan data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWorkoutClick = (workoutId: number) => {
        history.push({
            pathname: '/admin/workout/details',
            state: { workoutId }
        });
    };

    if (loading) return <p>{t('loading_training_plan')}</p>;

    return (
        <Box sx={{ marginTop: '16%', paddingBottom: '15%' }}>
            <Header title={t('training_plan_details')} />
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
                        {/* Header with title occupying full width */}
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
                            {trainingPlanData?.name}
                        </Typography>

                        {/* Difficulty Chip on a new line */}
                        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                            <Chip
                                label={`${t('difficulty')}: ${trainingPlanData?.difficulty}`}
                                sx={{
                                    backgroundColor: '#333333', // Gris oscuro
                                    color: '#FFFFFF', // Texto en blanco
                                    fontWeight: 'bold'
                                }}
                            />
                        </Box>


                        <Divider sx={{ my: 1 }} />

                        {/* Additional Info */}
                        <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
                            <Typography variant="body2" color="textSecondary">
                                {t('duration')}: {trainingPlanData?.duration} {t('days')}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {t('equipment')}: {trainingPlanData?.equipment || t('no_equipment')}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        {/* Description */}
                        <Typography variant="body2" color="textSecondary">
                            {trainingPlanData?.description || t('no_description')}
                        </Typography>
                    </CardContent>
                </Card>

                {/* Workouts List */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#555', mr: 1 }}>
                        {t('workouts')}
                    </Typography>
                    <Divider sx={{ flex: 1, backgroundColor: '#ddd', height: 1 }} />
                </Box>

                <Grid container spacing={2}>
                    {trainingPlanData?.workouts.map((workout: any, index: number) => (
                        <Grid item xs={12} key={workout.id}>
                            <Box
                                onClick={() => handleWorkoutClick(workout.id)}
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
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography sx={{ fontWeight: 'bold', color: '#333' }}>
                                                {workout.name}
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography variant="body2" color="textSecondary">
                                            {workout.description || t('no_description')}
                                        </Typography>
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

export default TrainingPlanDetails;
