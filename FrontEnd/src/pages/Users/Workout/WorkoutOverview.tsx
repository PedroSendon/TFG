import React, { useEffect, useState, useContext } from 'react';
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
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
  statusIcon: JSX.Element; // Cambiamos el tipo a JSX.Element para incluir el icono con color
}

const WorkoutOverview: React.FC = () => {
  const history = useHistory();
  const { t } = useContext(LanguageContext);

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
  const [nextWorkout, setNextWorkout] = useState<Workout | null>(null);

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

      // Llamada adicional para obtener el siguiente entrenamiento pendiente
      const nextWorkoutResponse = await fetch('http://127.0.0.1:8000/api/next-pending-workout/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const nextWorkoutData = nextWorkoutResponse.ok ? await nextWorkoutResponse.json() : null;
      setNextWorkout(nextWorkoutData);

      // Procesar los entrenamientos y asignar el icono con color correcto
      const workoutsWithIcons = data.workouts.map((workout: any) => ({
        ...workout,
        imageUrl: workout.media || 'default-workout-image.jpg',
        completed: workout.completed,
        statusIcon: <IonIcon icon={lockClosedOutline} color="danger" style={{ fontSize: '1.5em' }} />, // Inicialmente bloqueado (rojo)
      }));

      // Encontrar el índice de `nextWorkout` y actualizar `statusIcon` para los entrenamientos anteriores, el próximo, y los bloqueados
      const nextWorkoutIndex = workoutsWithIcons.findIndex((w: any) => w.id === nextWorkoutData?.id);
      workoutsWithIcons.forEach((workout: Workout, index: number) => {
        if (index < nextWorkoutIndex) {
          workout.statusIcon = <IonIcon icon={checkmarkCircleOutline} color="success" style={{ fontSize: '1.5em' }} />; // Completado (verde)
        } else if (index === nextWorkoutIndex) {
          workout.statusIcon = <IonIcon icon={playCircleOutline} color="primary" style={{ fontSize: '1.5em' }} />; // Disponible (azul)
        } else {
          workout.statusIcon = <IonIcon icon={lockClosedOutline} color="medium" style={{ fontSize: '1.5em' }} />; // Bloqueado (gris)
        }
      });

      setTrainingPlan({
        id: data.id,
        name: data.name,
        description: data.description,
        difficulty: data.difficulty,
        equipment: data.equipment,
        duration: data.duration,
        workouts: workoutsWithIcons,
      });
      setLoading(false);
    } catch (err) {
      setError(t('error_fetching_workouts'));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

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
              button={!!(nextWorkout && workout.id === nextWorkout.id)}
              detail={false}
              className="workout-item"
              lines="none"
              onClick={() => nextWorkout && workout.id === nextWorkout.id && handleDayClick(workout.id)}
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
                  {workout.statusIcon}
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
