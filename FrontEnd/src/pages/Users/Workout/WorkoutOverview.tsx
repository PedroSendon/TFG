import React, { useEffect, useState, useContext } from 'react';
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
} from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { lockClosedOutline, playCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';
import './WorkoutOverview.css';
import { LanguageContext } from '../../../context/LanguageContext';
import Header from '../../Header/Header';

interface Workout {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  completed: boolean;
  statusIcon?: JSX.Element;
}

const WorkoutOverview: React.FC = () => {
  const history = useHistory();
  const { t } = useContext(LanguageContext);
  const location = useLocation<{ reload?: boolean }>();


  const [trainingPlan, setTrainingPlan] = useState<{
    id: number;
    name: string;
    description: string;
    difficulty: string;
    equipment: string;
    duration: number;
    workouts: Workout[];
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nextWorkout, setNextWorkout] = useState<number | null>(null); // Store next workout ID directly

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

      if (!response.ok) {
        throw new Error(t('error_fetching_workouts'));
      }

      const data = await response.json();
      setTrainingPlan(data);

      // Fetch the next workout
      const nextWorkoutResponse = await fetch('http://127.0.0.1:8000/api/next-pending-workout/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (nextWorkoutResponse.ok) {
        const nextWorkoutData = await nextWorkoutResponse.json();
        setNextWorkout(nextWorkoutData?.id || null);
      }

      setLoading(false);
    } catch (err) {
      setError(t('error_fetching_workouts'));
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchWorkouts(); // Llama a la función para actualizar los datos
}, []);

  useEffect(() => {
    // Si el estado `reload` está presente en la ubicación, recargar los datos
    if (location.state?.reload) {
        fetchWorkouts(); // Llama a la función para actualizar los datos
        history.replace({ ...location, state: {} }); // Limpia el estado `reload` para evitar recargas infinitas
    }
}, [location.state]);

  const handleDayClick = (id: number) => {
    history.push({
      pathname: `/workout/day`,
      state: { day_id: id },
    });
  };

  if (loading) {
    return (
      <IonPage>
        <Header title={t('loading_workouts')} />
        <IonContent>
          <p>{t('loading')}...</p>
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <Header title={t('error')} />
        <IonContent>
          <p>{error}</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <Header title={t('training_plan_overview')} />

      <IonContent>
        {trainingPlan && (
          <div className="training-plan-details" style={{ padding: '20px' }}>
            <p style={{ marginBottom: '20px' }}>{trainingPlan.description}</p>
            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '15px',
              borderRadius: '10px',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
              marginBottom: '20px',
              border: '1px solid #b0b0b0',
            }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>{t('information')}</h3>
              <p><strong>{t('difficulty')}:</strong> {trainingPlan.difficulty}</p>
              <p><strong>{t('equipment')}:</strong> {trainingPlan.equipment}</p>
              <p><strong>{t('duration')}:</strong> {trainingPlan.duration} {t('minutes')}</p>
            </div>
          </div>
        )}

        <IonList lines="none" style={{ padding: '0 20px', marginBottom: '15%' }}>
          {trainingPlan?.workouts.map((workout) => (
            <IonItem
              key={workout.id}
              button={!workout.completed && workout.id === nextWorkout}
              detail={false}
              className="workout-item"
              lines="none"
              onClick={() => workout.id === nextWorkout && handleDayClick(workout.id)}
              style={{
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '10px',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                border: '1px solid #b0b0b0',
              }}
            >
              <div className="workout-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '10px', padding: '10px' }}>
                <div style={{ flex: 1 }}>
                  <h1 style={{ fontWeight: 'bold', fontSize: '1.2em', marginBottom: '5px' }}>{workout.name}</h1>
                  <p style={{
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                  >
                    {workout.description}
                  </p>
                </div>

                {/* Icono de estado con color correspondiente */}
                <div style={{ marginLeft: '3%', display: 'flex', alignItems: 'center' }}>
                  {workout.completed ? (
                    <IonIcon icon={checkmarkCircleOutline} color="success" style={{ fontSize: '1.5em' }} />
                  ) : workout.id === nextWorkout ? (
                    <IonIcon icon={playCircleOutline} color="primary" style={{ fontSize: '1.5em' }} />
                  ) : (
                    <IonIcon icon={lockClosedOutline} color="medium" style={{ fontSize: '1.5em' }} />
                  )}
                </div>
              </div>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default WorkoutOverview;
