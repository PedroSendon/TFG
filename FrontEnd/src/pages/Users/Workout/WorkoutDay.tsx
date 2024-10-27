import React, { useEffect, useState, useContext } from 'react';
import { IonPage, IonContent, IonList, IonItem, IonLabel, IonImg, IonCheckbox, IonButton, IonProgressBar, IonRow, IonCol, IonGrid } from '@ionic/react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import './WorkoutDay.css';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext'; // Importa el contexto de idioma
import { Button } from '@mui/material';

const WorkoutDay: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ day_id: number }>(); // Definimos el tipo para acceder al estado
  const { t } = useContext(LanguageContext);

  const day_id = location.state?.day_id; // Accedemos a `day_id` desde el estado pasado
  const [exercises, setExercises] = useState<Array<{ id: number; name: string; imageUrl: string; sets: number; reps: number; completed: boolean }>>([]);
  const [totalSets, setTotalSets] = useState<number>(0);
  const [totalReps, setTotalReps] = useState<number>(0);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);

  const fetchWorkoutDetails = async (day_id: number) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error(t('no_token'));
        return;
      }
      const response = await fetch(`http://127.0.0.1:8000/api/workout/day/${day_id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setExercises(data);

        const totalSets = data.reduce((acc: number, exercise: any) => acc + exercise.sets, 0);
        const totalReps = data.reduce((acc: number, exercise: any) => acc + exercise.reps * exercise.sets, 0);
        const estimatedTime = totalSets * 2;
        setTotalSets(totalSets);
        setTotalReps(totalReps);
        setEstimatedTime(estimatedTime);
        console.log(data);
      } else {
        console.error('Error fetching workout details');
      }
    } catch (err) {
      console.error('Network error fetching workout details');
    }
  };

  useEffect(() => {
    console.log('day_id:', day_id);
    if (day_id) {
        fetchWorkoutDetails(day_id);
    } else {
        console.error('No day_id found in state');
        history.push('/workout/overview'); // Redirige si no hay `day_id`
    }
}, [day_id, history]);

  const handleCheckboxChange = (index: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[index].completed = !updatedExercises[index].completed;
    setExercises(updatedExercises);

    const completedCount = updatedExercises.filter(ex => ex.completed).length;
    setCompletedCount(completedCount);
  };

  const handleExerciseClick = (index: number, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'ION-CHECKBOX' && target.tagName !== 'ION-LABEL') {
        const exerciseId = exercises[index].id;
        history.push({
            pathname: `/workout/day/${day_id}/exercise/${exerciseId}`,
            state: { day_id, exerciseId },
        });
    }
};


  const handleCompleteWorkout = () => {
    console.log('Entrenamiento completado');
  };

  const progress = exercises.length > 0 ? completedCount / exercises.length : 0;
  const progressPercentage = Math.round(progress * 100);

  return (
    <IonPage>
      <Header title={t('training_of_the_day')} />

      <IonContent>
        <IonList className="no-lines">
          {exercises.map((exercise, index) => (
            <IonItem key={index} className="workout-item no-lines">
              <div className="workout-container" onClick={(e) => handleExerciseClick(index, e)}>
                <IonLabel className="workout-label">
                  <h1>{exercise.name}</h1>
                  <p>{`${exercise.sets} ${t('sets')} ${t('of')} ${exercise.reps} ${t('repetitions')}`}</p>
                </IonLabel>
                <IonImg className="workout-img" src={exercise.imageUrl} alt={`${t('image_of')} ${exercise.name}`} />
                <IonCheckbox
                  slot="end"
                  checked={exercise.completed}
                  onIonChange={(e: { stopPropagation: () => void; }) => {
                    e.stopPropagation();
                    handleCheckboxChange(index);
                  }}
                  color="success"
                  className="checkbox-right"
                />
              </div>
            </IonItem>
          ))}
        </IonList>

        <hr className="divider" />

        <div className="summary-container">
          <h3>{t('training_summary')}</h3>
          <p><strong>{totalSets}</strong> {t('sets')} | <strong>{totalReps}</strong> {t('repetitions')} | <strong>{estimatedTime}</strong> {t('minutes')}</p>
        </div>

        <hr className="divider" />

        <div className="progress-container">
          <p className="progress-percentage">{progressPercentage}% {t('completed')}</p>
          <IonProgressBar value={progress} color="success" style={{ height: '10px' }}></IonProgressBar>
        </div>

        {/* Botón de cerrar sesión actualizado */}
        <IonGrid style={{ marginBottom: '15%' }}>
          <IonRow>
            <IonCol size="12">
              <Button
                style={{
                  border: '1px solid #32CD32',
                  backgroundColor: '#FFFFFF',
                  color: '#32CD32',
                  padding: '3% 0',
                  borderRadius: '5px',
                  fontSize: '1em',
                  width: '100%',
                }}
                onClick={handleCompleteWorkout}
              >
                {t('mark_training_completed')}
              </Button>
            </IonCol>
          </IonRow>
        </IonGrid>

      </IonContent>
    </IonPage>
  );
};

export default WorkoutDay;
