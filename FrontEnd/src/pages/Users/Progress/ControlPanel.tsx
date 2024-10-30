import React, { useEffect, useState, useContext } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
} from '@mui/material';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { FitnessCenter } from '@mui/icons-material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './ControlPanel.css';
import { LanguageContext } from '../../../context/LanguageContext';
import { useHistory } from 'react-router';

interface Workout {
    id: number;
    name: string;
    description: string;
    progress: number;
}

const ControlPanel: React.FC = () => {
    const { t } = useContext(LanguageContext);
    const [date, setDate] = useState(new Date());
    const [trainingDays, setTrainingDays] = useState<Date[]>([]);
    const [nextWorkout, setNextWorkout] = useState<Workout | null>(null);
    const history = useHistory();

    const fetchNextPendingWorkout = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error(t('no_token'));
                return;
            }
            const response = await fetch('http://127.0.0.1:8000/api/next-pending-workout/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setNextWorkout(data);
            } else {
                console.error('Error fetching next pending workout');
            }
        } catch (error) {
            console.error('Network error fetching next pending workout:', error);
        }
    };

    const fetchAssignedTrainingPlan = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error(t('no_token'));
                return;
            }
            const response = await fetch('http://127.0.0.1:8000/api/assigned-training-plan/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const weeklyWorkouts = data.workouts.length;
                const currentAndNextMonthDays = generateTrainingDaysForTwoMonths(new Date(), weeklyWorkouts);
                setTrainingDays(currentAndNextMonthDays);
            } else {
                console.error('Error fetching training plan');
            }
        } catch (error) {
            console.error('Network error fetching training plan:', error);
        }
    };

    useEffect(() => {
        fetchAssignedTrainingPlan();
        fetchNextPendingWorkout();
    }, [t]);

    const generateTrainingDaysForTwoMonths = (startDate: Date, weeklyWorkouts: number) => {
        const trainingDays = [];
        let currentDate = new Date(startDate);

        for (let monthOffset = 0; monthOffset < 2; monthOffset++) {
            const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, 1);

            while (currentMonth.getMonth() === (currentDate.getMonth() + monthOffset) % 12) {
                for (let i = 0; i < weeklyWorkouts; i++) {
                    const workoutDay = new Date(currentMonth);
                    workoutDay.setDate(currentMonth.getDate() + i);
                    trainingDays.push(new Date(workoutDay));
                }
                currentMonth.setDate(currentMonth.getDate() + 7);
            }
        }
        return trainingDays;
    };

    const handleStartWorkout = () => {
        if (nextWorkout) {
            history.push({
                pathname: `/workout/day`,
                state: { day_id: nextWorkout.id },
            });
        }
    };

    const tileContent = ({ date, view }: any) => {
        if (view === 'month' && trainingDays.some(day => day.getDate() === date.getDate() && day.getMonth() === date.getMonth())) {
            return (
                <div className="training-icon">
                    <FitnessCenter style={{ color: '#1976d2', fontSize: '1.2em' }} />
                </div>
            );
        }
        return null;
    };

    return (
        <Box sx={{ padding: 1, backgroundColor: '#f5f5f5', minHeight: '80vh' }}>
            <Grid container>

                {/* Próximo entrenamiento */}
                <Grid item xs={12} sx={{marginBottom:'20px' }}>
                    <Card
                        onClick={handleStartWorkout}
                        sx={{
                            borderRadius: '15px',
                            backgroundColor: '#FFFFFF',
                            padding: 2,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.3s ease-in-out',
                            '&:hover': {
                                transform: 'scale(1.02)',
                                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                            },
                        }}
                    >
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 80, marginRight: 3 }}>
                                <CircularProgressbar
                                    value={nextWorkout ? nextWorkout.progress : 0}
                                    text={`${nextWorkout ? Math.round(nextWorkout.progress) : 0}%`}
                                    styles={buildStyles({
                                        pathColor: '#1976d2',  // Primary color
                                        textColor: '#333',
                                        trailColor: '#D1D1D6',
                                    })}
                                />
                            </Box>
                            <Box>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '1em', color: '#000' }}>
                                    {nextWorkout ? nextWorkout.name : t('no_pending_workouts')}
                                </Typography>
                                <Typography  sx={{ color: 'gray', marginTop: '10px', fontSize: '0.9em', }}>
                                    {nextWorkout ? t('days_for_next_workout') : t('all_workouts_completed')}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Box sx={{ borderTop: '1px solid #333', width: '100%', margin: '20px 0' }} />

               
                <Grid item xs={12} >
                    <Typography sx={{ textAlign: 'center',fontWeight: 'bold', fontSize: '1.1em', color: '#333'  }}>
                        {t('training_schedule')}
                    </Typography>
                </Grid>

                {/* Calendario mensual */}
                <Grid item xs={12} sx={{ marginTop: '20px', marginBottom:'20px' }}>
                    <Card sx={{ borderRadius: '15px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'}}>
                        <CardContent>
                            

                            <Calendar
                                onChange={(date) => setDate(date as Date)}
                                value={date}
                                tileContent={tileContent}
                                locale="es-ES"
                                tileClassName={({ date: tileDate, view }) => {
                                    const today = new Date();
                                    if (
                                        view === 'month' &&
                                        tileDate.getDate() === today.getDate() &&
                                        tileDate.getMonth() === today.getMonth() &&
                                        tileDate.getFullYear() === today.getFullYear()
                                    ) {
                                        return 'current-day';
                                    }
                                    return null;
                                }}
                                className="custom-calendar"
                                prevLabel="←"
                                nextLabel="→"
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ControlPanel;
