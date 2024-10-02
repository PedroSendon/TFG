import React from 'react';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonLabel,
  IonProgressBar,
} from '@ionic/react';

const Graphics: React.FC = () => {
  // Datos simulados para el progreso del peso
  const weightProgress = 0.8; // Simulación de porcentaje (80%)
  const weightCurrent = 68; // Peso actual
  const weightGoal = 65; // Meta de peso

  // Datos simulados para calorías quemadas
  const caloriesProgress = 0.75; // Simulación de porcentaje (75%)
  const caloriesBurned = 450; // Calorías quemadas

  return (
    <IonGrid>
      {/* Gráfica simulada de Peso */}
      <IonRow>
        <IonCol size="12">
          <IonCard>
            <IonCardContent>
              <IonLabel style={{ fontWeight: 'bold', fontSize: '1.2em', color: '#32CD32' }}>
                Weight Progress
              </IonLabel>
              <p>Current Weight: {weightCurrent} kg</p>
              <p>Goal: {weightGoal} kg</p>
              <IonProgressBar value={weightProgress} color="success"></IonProgressBar>
              <p style={{ marginTop: '10px' }}>
                {Math.round(weightProgress * 100)}% towards goal
              </p>
            </IonCardContent>
          </IonCard>
        </IonCol>
      </IonRow>

      {/* Gráfica simulada de Calorías quemadas */}
      <IonRow>
        <IonCol size="12">
          <IonCard>
            <IonCardContent>
              <IonLabel style={{ fontWeight: 'bold', fontSize: '1.2em', color: '#9C27B0' }}>
                Calories Burned
              </IonLabel>
              <p>Total Burned: {caloriesBurned} kcal</p>
              <IonProgressBar value={caloriesProgress} color="secondary"></IonProgressBar>
              <p style={{ marginTop: '10px' }}>
                {Math.round(caloriesProgress * 100)}% of daily goal
              </p>
            </IonCardContent>
          </IonCard>
        </IonCol>
      </IonRow>

      {/* Se puede agregar más métricas en la misma lógica */}
    </IonGrid>
  );
};

export default Graphics;
