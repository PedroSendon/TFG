import React, { useEffect, useState, useContext } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './WorkoutOverview.css';
import { LanguageContext } from '../../../context/LanguageContext';
import Header from '../../Header/Header';

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
    workouts: Array<{ id: number; name: string; description: string; imageUrl: string }>;
  } | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      setTrainingPlan({
        id: data.id,
        name: data.name,
        description: data.description,
        difficulty: data.difficulty,
        equipment: data.equipment,
        duration: data.duration,
        workouts: data.workouts.map((workout: any) => ({
          ...workout,
          imageUrl: workout.media || 'default-workout-image.jpg' // Asigna una imagen predeterminada o la de cada workout
        })),
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
      pathname: `/workout/day`, // La ruta sin el parámetro en la URL
      state: { day_id: id }, // Pasamos el `id` en el `state`
    });
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{t('loading_workouts')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <p>{t('loading')}...</p>
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{t('error')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <p>{error}</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      {/* Header usando la variable de título en el archivo de idiomas */}
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
              marginBottom: '20px'
            }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>{t('information')}</h3>
              <p><strong>{t('difficulty')}:</strong> {trainingPlan.difficulty}</p>
              <p><strong>{t('equipment')}:</strong> {trainingPlan.equipment}</p>
              <p><strong>{t('duration')}:</strong> {trainingPlan.duration} {t('minutes')}</p>
            </div>
          </div>
        )}
        
        <IonList lines="none" style={{ padding: '0 20px', marginBottom:'15%'}}>
          {trainingPlan?.workouts.map((workout) => (
            <IonItem
              key={workout.id}
              button
              detail={false}
              className="workout-item"
              lines="none"
              onClick={() => handleDayClick(workout.id)}
              style={{
                backgroundImage: `url(${workout.imageUrl})`, // Fondo de imagen
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '10px',
                marginBottom: '10px',
                padding: '15px',
                color: '#32CD32', // Texto en blanco para contraste
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="workout-container" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: '10px', padding: '10px' }}>
                <IonLabel className="workout-label">
                  <h1>{workout.name}</h1>
                  <p>{workout.description}</p>
                </IonLabel>
              </div>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default WorkoutOverview;
