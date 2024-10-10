import React, { useEffect, useState, useContext } from 'react';
import { IonPage, IonContent, IonList, IonItem, IonLabel, IonImg, IonCheckbox, IonButton, IonProgressBar } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom'; 
import './WorkoutDay.css'; 
import Header from '../../Header/Header'; 
import { LanguageContext } from '../../../context/LanguageContext'; // Importa el contexto de idioma

const WorkoutDay: React.FC = () => {
  const history = useHistory();
  const { day_id } = useParams<{ day_id: string }>();
  const { t } = useContext(LanguageContext); // Usar el contexto de idioma

  const [exercises, setExercises] = useState<Array<{ name: string; imageUrl: string; sets: number; reps: number; completed: boolean }>>([]);
  const [totalSets, setTotalSets] = useState<number>(0);
  const [totalReps, setTotalReps] = useState<number>(0);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);

  const fetchWorkoutDetails = async (day_id: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/workout/day/${day_id}/`);
      if (response.ok) {
        const data = await response.json();
        setExercises(data);

        const totalSets = data.reduce((acc: number, exercise: any) => acc + exercise.sets, 0);
        const totalReps = data.reduce((acc: number, exercise: any) => acc + exercise.reps * exercise.sets, 0);
        const estimatedTime = totalSets * 2; 
        setTotalSets(totalSets);
        setTotalReps(totalReps);
        setEstimatedTime(estimatedTime);
      } else {
        console.error('Error fetching workout details');
      }
    } catch (err) {
      console.error('Network error fetching workout details');
    }
  };

  useEffect(() => {
    if (day_id) {
      fetchWorkoutDetails(day_id);
    }
  }, [day_id]);

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
      history.push(`/workout/day/exercise`);
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

        <IonButton
          expand="block"
          color="success"
          onClick={handleCompleteWorkout}
          className="custom-button"
        >
          {t('mark_training_completed')}
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default WorkoutDay;
