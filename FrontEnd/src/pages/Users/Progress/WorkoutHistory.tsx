import React from 'react';
import {
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonLabel,
    IonIcon,
} from '@ionic/react';
import { lockClosedOutline, checkmarkCircleOutline } from 'ionicons/icons';
import './WorkoutHistory.css'; // Archivo de estilos CSS para personalizaciones

const WorkoutHistory: React.FC = () => {
    // Simulación de datos de entrenamientos
    const workoutHistory = [
        { name: 'Pectoral + Biceps', day: 1, completed: false, progress: 0.0 },
        { name: 'Espalda + Triceps', day: 2, completed: false, progress: 0.0 },
        { name: 'Piernas', day: 3, completed: false, progress: 0.0 },
        { name: 'Hombros + Brazos', day: 4, completed: false, progress: 0.0 },
        { name: 'Pectoral + Biceps', day: 5, completed: false, progress: 0.0 },
    ];

    // Calcular la cantidad de entrenamientos completados
    const completedWorkouts = workoutHistory.filter(workout => workout.completed).length;
    const totalWorkouts = workoutHistory.length;

    // Mensaje de ánimo basado en los entrenamientos completados
    const getMotivationMessage = () => {
        if (completedWorkouts === 0) {
            return "Start your first training and make a difference!";
        } else if (completedWorkouts < totalWorkouts / 2) {
            return "Good start! Keep it up.";
        } else if (completedWorkouts < totalWorkouts) {
            return "You almost did it! Keep moving forward.";
        } else {
            return "Congratulations! You have completed all training.";
        }
    };

    return (
        <IonGrid>
            {/* Mensaje de motivación y cantidad de entrenamientos completados */}
            <IonRow>
                <IonCol size="12">
                    <IonCard>
                        <IonCardContent style={{ textAlign: 'center' }}>
                            <IonLabel style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
                                {completedWorkouts} of {totalWorkouts} completed training
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
                        Training History
                    </IonLabel>
                </IonCol>
            </IonRow>

            {/* Historial de entrenamientos */}
            {workoutHistory.map((workout, index) => (
                <IonRow key={index}>
                    <IonCol size="12">
                        <IonCard
                            button // Convertimos la card en un botón
                            routerLink={workout.completed ? `/workout/${workout.name}` : undefined} // Solo si está completado, redirige
                            className={`workout-card ${workout.completed ? 'completed' : ''}`}
                        >
                            <IonCardContent style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {/* Día del entrenamiento y Nombre del ejercicio */}
                                <div>
                                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2em'}}>{workout.name}</p>

                                    <IonLabel style={{ fontWeight: 'bold', fontSize: '1em' }}>
                                        {workout.day} training day
                                    </IonLabel>
                                </div>

                                {/* Estado del entrenamiento (completado o bloqueado) */}
                                {workout.completed ? (
                                    <IonIcon icon={checkmarkCircleOutline} color="success" style={{ fontSize: '1.5em' }} />
                                ) : (
                                    <IonIcon icon={lockClosedOutline} color="danger" style={{ fontSize: '1.5em' }} />
                                )}
                            </IonCardContent>
                        </IonCard>
                    </IonCol>
                </IonRow>
            ))}
        </IonGrid>
    );
};

export default WorkoutHistory;
