import React, { useEffect, useState, useContext } from 'react';
import {
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonLabel,
    IonIcon,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { lockClosedOutline, checkmarkCircleOutline, playCircleOutline } from 'ionicons/icons';
import { LanguageContext } from '../../../context/LanguageContext';
import './WorkoutHistory.css';

const WorkoutHistory: React.FC = () => {
    const { t } = useContext(LanguageContext); // Usamos el contexto de idioma para traducción
    const history = useHistory();
    const [workoutHistory, setWorkoutHistory] = useState<Array<any>>([]);
    const [completedWorkouts, setCompletedWorkouts] = useState(0);
    const [totalWorkouts, setTotalWorkouts] = useState(0);

    // Fetch del plan de entrenamiento del usuario
    const fetchWorkoutPlan = async () => {
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

                // Procesar la respuesta para obtener el historial de entrenamientos
                const workouts = data.workouts.map((workout: any, index: number) => ({
                    id: workout.id,
                    name: workout.name,
                    day: index + 1,
                    completed: workout.completed,
                    progress: workout.completed ? 1.0 : 0.0,
                }));

                setWorkoutHistory(workouts);
                setCompletedWorkouts(workouts.filter((w: any) => w.completed).length);
                setTotalWorkouts(workouts.length);
            } else {
                console.error(t('fetch_workout_plan_error'));
            }
        } catch (error) {
            console.error(t('network_error_fetching_plan'), error);
        }
    };

    useEffect(() => {
        fetchWorkoutPlan();
    }, [t]);

    // Mensaje de ánimo basado en los entrenamientos completados
    const getMotivationMessage = () => {
        if (completedWorkouts === 0) {
            return t('motivation_start');
        } else if (completedWorkouts < totalWorkouts / 2) {
            return t('motivation_good_start');
        } else if (completedWorkouts < totalWorkouts) {
            return t('motivation_almost_done');
        } else {
            return t('motivation_all_done');
        }
    };

    // Determina el estado de cada entrenamiento
    const getWorkoutStatusIcon = (workout: any, index: number) => {
        if (workout.completed) {
            return <IonIcon icon={checkmarkCircleOutline} color="success" style={{ fontSize: '1.5em' }} />;
        } else if (index === completedWorkouts) {
            return <IonIcon icon={playCircleOutline} color="primary" style={{ fontSize: '1.5em' }} />;
        } else {
            return <IonIcon icon={lockClosedOutline} color="medium" style={{ fontSize: '1.5em' }} />;
        }
    };

    // Navegar al entrenamiento disponible
    const handleStartWorkout = (workoutId: number) => {
        history.push({
            pathname: `/workout/day`,
            state: { day_id: workoutId },
        });
    };

    return (
        <IonGrid>
            {/* Mensaje de motivación y cantidad de entrenamientos completados */}
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

            {/* Divider (línea horizontal) */}
            <hr className="thin-divider" />

            {/* Título del historial */}
            <IonRow>
                <IonCol size="12">
                    <IonLabel style={{ fontWeight: 'bold', fontSize: '1.4em' }}>
                        {t('training_history')}
                    </IonLabel>
                </IonCol>
            </IonRow>

            {/* Historial de entrenamientos */}
            <IonGrid style={{marginBottom: '15%'}}>
            {workoutHistory.map((workout, index) => (
                <IonRow key={index} >
                    <IonCol size="12">
                        <IonCard
                            button
                            onClick={() => index === completedWorkouts && handleStartWorkout(workout.id)}
                            className={`workout-card ${workout.completed ? 'completed' : ''}`}
                            
                        >
                            <IonCardContent style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2em'}}>{workout.name}</p>
                                    <IonLabel style={{ fontWeight: 'bold', fontSize: '1em' }}>
                                        {t('training_day').replace('{day}', workout.day)}
                                    </IonLabel>
                                </div>

                                {/* Estado del entrenamiento */}
                                {getWorkoutStatusIcon(workout, index)}
                            </IonCardContent>
                        </IonCard>
                    </IonCol>
                </IonRow>

            ))}
            </IonGrid>
        </IonGrid>
    );
};

export default WorkoutHistory;
