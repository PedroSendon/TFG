import React, { useEffect, useState, useContext } from 'react';
import {
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonLabel,
} from '@ionic/react';
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
    const [trainingDays, setTrainingDays] = useState<Date[]>([]); // Fechas de entrenamiento en los próximos dos meses
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

                // Obtener la cantidad de entrenamientos por semana
                const weeklyWorkouts = data.workouts.length;

                // Generar fechas de entrenamiento para el mes actual y el siguiente
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

    // Función para generar días de entrenamiento en el mes actual y el siguiente
    const generateTrainingDaysForTwoMonths = (startDate: Date, weeklyWorkouts: number) => {
        const trainingDays = [];
        let currentDate = new Date(startDate);

        // Calcular los días de entrenamiento para el mes actual y el siguiente
        for (let monthOffset = 0; monthOffset < 2; monthOffset++) {
            const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, 1);

            while (currentMonth.getMonth() === (currentDate.getMonth() + monthOffset) % 12) {
                for (let i = 0; i < weeklyWorkouts; i++) {
                    const workoutDay = new Date(currentMonth);
                    workoutDay.setDate(currentMonth.getDate() + i);
                    trainingDays.push(new Date(workoutDay));
                }
                currentMonth.setDate(currentMonth.getDate() + 7); // Pasar a la siguiente semana
            }
        }
        return trainingDays;
    };

    const handleStartWorkout = () => {
        if (nextWorkout) {
            history.push({
                pathname: `/workout/day`, // La ruta sin el parámetro en la URL
                state: { day_id: nextWorkout.id }, // Pasamos el `id` en el `state`
              });
        }
    };


    const tileContent = ({ date, view }: any) => {
        if (view === 'month' && trainingDays.some(day => day.getDate() === date.getDate() && day.getMonth() === date.getMonth())) {
            return (
                <div className="training-icon">
                    <FitnessCenter style={{ color: '#32CD32', fontSize: '1.2em' }} />
                </div>
            );
        }
        return null;
    };

    return (
        <IonGrid>
            {/* Próximo entrenamiento */}
            <IonRow>
                <IonCol size="12">
                    <IonCard
                        button
                        onClick={handleStartWorkout}
                        style={{
                            borderRadius: '10px',
                            backgroundColor: '#FFFFFF',
                            padding: '10px',
                            cursor: 'pointer',
                        }}
                    >
                        <IonCardContent style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: 80, marginRight: '20px' }}>
                                <CircularProgressbar
                                    value={nextWorkout ? nextWorkout.progress : 0}
                                    text={`${nextWorkout ? Math.round(nextWorkout.progress * 100) : 0}%`}
                                    styles={buildStyles({
                                        pathColor: '#32CD32',
                                        textColor: '#32CD32',
                                        trailColor: '#D1D1D6',
                                    })}
                                />
                            </div>

                            <div>
                                <IonLabel style={{ display: 'block', fontWeight: 'bold', fontSize: '1.2em', color: '#000000' }}>
                                    {nextWorkout ? nextWorkout.name : t('no_pending_workouts')}
                                </IonLabel>
                                <IonLabel style={{ display: 'block', fontSize: '1.2em', color: '#000000' }}>
                                    {nextWorkout ? t('days_for_next_workout') : t('all_workouts_completed')}
                                </IonLabel>
                            </div>
                        </IonCardContent>
                    </IonCard>
                </IonCol>
            </IonRow>

            {/* Calendario mensual */}
            <IonRow>
                <IonCol size="12">
                    <IonCard>
                        <IonCardContent>
                            <IonLabel className="calendar-label ion-text-center">{t('training_schedule')}</IonLabel>

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
                        </IonCardContent>
                    </IonCard>
                </IonCol>
            </IonRow>
        </IonGrid>
    );
};

export default ControlPanel;
