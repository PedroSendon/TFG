import React, { useEffect, useState, useContext } from 'react';
import { Grid, Card, CardContent, Typography, LinearProgress, Box } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { LanguageContext } from '../../../context/LanguageContext';

interface Workout {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    completed: boolean;
    progress: number;
}

const WorkoutHistory: React.FC = () => {
    const [workoutHistory, setWorkoutHistory] = useState<Array<Workout>>([]);
    const [completedWorkouts, setCompletedWorkouts] = useState(0);
    const [totalWorkouts, setTotalWorkouts] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const history = useHistory();
    const { t } = useContext(LanguageContext);

    const fetchWorkouts = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                setError(t('no_token'));
                return;
            }

            const response = await fetch(`http://127.0.0.1:8000/api/assigned-training-plan/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            if (!response.ok) throw new Error(t('error_fetching_workouts'));
            const data = await response.json();

            const workoutsWithProgress = data.workouts.map((workout: any) => ({
                ...workout,
                imageUrl: workout.media || 'default-workout-image.jpg',
                completed: workout.completed,
                progress: workout.progress || 0,
            }));

            const completedCount = workoutsWithProgress.filter((workout: Workout) => workout.completed).length;

            setWorkoutHistory(workoutsWithProgress);
            setCompletedWorkouts(completedCount);
            setTotalWorkouts(workoutsWithProgress.length);
        } catch (err) {
            setError(t('error_fetching_workouts'));
        }
    };

    useEffect(() => {
        fetchWorkouts();
    }, []);

    const getMotivationMessage = () => {
        if (completedWorkouts === 0) return t('motivation_start');
        else if (completedWorkouts < totalWorkouts / 2) return t('motivation_good_start');
        else if (completedWorkouts < totalWorkouts) return t('motivation_almost_done');
        else return t('motivation_all_done');
    };

    const handleStartWorkout = (workoutId: number) => {
        history.push({
            pathname: `/workout/day`,
            state: { day_id: workoutId },
        });
    };

    return (
        <Box sx={{ padding: 1, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <Grid container>
                <Grid item xs={12} sx={{ marginTop: '20px', marginBottom:'20px' }}>
                    <Card sx={{ color: 'gray', borderRadius: '12px', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.2em', color: '#000' }}>
                                {completedWorkouts} {t('of')} {totalWorkouts} {t('completed_training')}
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'gray', fontWeight: 'bold', marginTop: '10px' }}>
                                {getMotivationMessage()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Box sx={{ borderTop: '1px solid #333', width: '100%', margin: '20px 0' }} />

                <Grid item xs={12} >
                    <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.4em', color: '#333' }}>
                        {t('completed_training_history')}
                    </Typography>
                </Grid>

                <Grid item xs={12} sx={{ marginTop: '20px', marginBottom:'20px' }}>
                    {completedWorkouts === 0 ? (
                        <Typography sx={{ textAlign: 'center', color: 'gray' }}>
                            {t('no_completed_workouts')}
                        </Typography>
                    ) : (
                        workoutHistory
                            .filter((workout) => workout.completed)
                            .map((workout) => (
                                <Card
                                    key={workout.id}
                                    sx={{ borderRadius: '10px', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)', marginBottom: '15px' }}
                                >
                                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                                        <Box>
                                            <Typography variant="h6" sx={{ margin: 0, fontWeight: 'bold', fontSize: '1.2em', color: '#000' }}>
                                                {workout.name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1em', color: 'gray' }}>
                                                {t('completed_day').replace('{day}', workout.id.toString())}
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={workout.progress}
                                            sx={{ width: '30%'}}
                                            color="primary"
                                        />
                                    </CardContent>
                                </Card>
                            ))
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default WorkoutHistory;
