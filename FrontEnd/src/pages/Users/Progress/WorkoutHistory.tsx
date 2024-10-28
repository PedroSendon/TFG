import React, { useEffect, useState, useContext } from 'react';
import {
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonLabel,
    IonProgressBar
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { LanguageContext } from '../../../context/LanguageContext';
import './WorkoutHistory.css';

interface Workout {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    completed: boolean;
    progress: number;  // Progreso individual del entrenamiento
}

const WorkoutHistory: React.FC = () => {
    const [workoutHistory, setWorkoutHistory] = useState<Array<Workout>>([]);
    const [completedWorkouts, setCompletedWorkouts] = useState(0);
    const [totalWorkouts, setTotalWorkouts] = useState(0);
    const [nextWorkout, setNextWorkout] = useState<Workout | null>(null);
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

            // Fetch training plan
            const response = await fetch(`http://127.0.0.1:8000/api/assigned-training-plan/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            if (!response.ok) throw new Error(t('error_fetching_workouts'));
            const data = await response.json();

            // Process workouts to include progress
            const workoutsWithProgress = data.workouts.map((workout: any) => ({
                ...workout,
                imageUrl: workout.media || 'default-workout-image.jpg',
                completed: workout.completed,
                progress: workout.progress || 0,  // Asegura que el progreso se reciba del backend o usa 0
            }));

            // Count completed workouts
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

    // Motivation message based on completed workouts
    const getMotivationMessage = () => {
        if (completedWorkouts === 0) return t('motivation_start');
        else if (completedWorkouts < totalWorkouts / 2) return t('motivation_good_start');
        else if (completedWorkouts < totalWorkouts) return t('motivation_almost_done');
        else return t('motivation_all_done');
    };

    // Navigate to available workout
    const handleStartWorkout = (workoutId: number) => {
        history.push({
            pathname: `/workout/day`,
            state: { day_id: workoutId },
        });
    };

    return (
        <IonGrid>
            {/* Motivation message and completed workouts count */}
            <IonRow>
                <IonCol size="12">
                    <IonCard>
                        <IonCardContent style={{ textAlign: 'center' }}>
                            <IonLabel style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
                                {completedWorkouts} {t('of')} {totalWorkouts} {t('completed_training')}
                            </IonLabel>
                            <p style={{ color: '#32CD32', fontWeight: 'bold', marginTop: '10px' }}>
                                {getMotivationMessage()}
                            </p>
                        </IonCardContent>
                    </IonCard>
                </IonCol>
            </IonRow>

            <hr className="thin-divider" />

            <IonRow>
                <IonCol size="12">
                    <IonLabel style={{ fontWeight: 'bold', fontSize: '1.4em' }}>
                        {t('completed_training_history')}
                    </IonLabel>
                </IonCol>
            </IonRow>

            {/* Training history - Only completed workouts */}
            <IonGrid style={{ marginBottom: '15%' }}>
                {completedWorkouts === 0 ? (
                    <IonRow>
                        <IonCol size="12">
                            <p style={{ textAlign: 'center', color: 'gray' }}>
                                {t('no_completed_workouts')}
                            </p>
                        </IonCol>
                    </IonRow>
                ) : (
                    workoutHistory
                        .filter((workout) => workout.completed) // Only show completed workouts
                        .map((workout) => (
                            <IonRow key={workout.id}>
                                <IonCol size="12">
                                    <IonCard className="workout-card completed">
                                        <IonCardContent style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2em' }}>{workout.name}</p>
                                                <IonLabel style={{ fontWeight: 'bold', fontSize: '1em' }}>
                                                    {t('completed_day').replace('{day}', workout.id.toString())}
                                                </IonLabel>
                                            </div>
                                            {/* Progress bar to show workout progress */}
                                            <IonProgressBar value={workout.progress / 100} color="success" style={{ width: '30%' }} />
                                        </IonCardContent>
                                    </IonCard>
                                </IonCol>
                            </IonRow>
                        ))
                )}
            </IonGrid>
        </IonGrid>
    );
};

export default WorkoutHistory;
