import React, { useState } from 'react';
import {
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonLabel,
} from '@ionic/react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { FitnessCenter } from '@mui/icons-material'; // Icono de gimnasio
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';  // Importar estilos de calendario
import './ControlPanel.css'; // Archivo CSS personalizado

const ControlPanel: React.FC = () => {
    const nextWorkout = {
        name: 'Piernas',
        progress: 0.5,
        daysUntilNextWorkout: 2,
    };

    const [date, setDate] = useState(new Date());
    const trainingDays = [2, 5, 12, 19, 26]; // Días de entrenamiento

    const handleStartWorkout = () => {
        console.log('Redirigiendo al entrenamiento de:', nextWorkout.name);
    };

    const tileContent = ({ date, view }: any) => {
        if (view === 'month' && trainingDays.includes(date.getDate())) {
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
                    {/* Hacemos la tarjeta clickable */}
                    <IonCard
                        button
                        onClick={handleStartWorkout}
                        style={{
                            borderRadius: '10px',
                            backgroundColor: '#FFFFFF',
                            padding: '10px',
                            cursor: 'pointer', // Añadimos el cursor para indicar que es clickable
                        }}
                    >
                        <IonCardContent style={{ display: 'flex', alignItems: 'center' }}>
                            {/* Circular Progress */}
                            <div style={{ width: 80, marginRight: '20px' }}>
                                <CircularProgressbar
                                    value={nextWorkout.progress * 100}
                                    text={`${Math.round(nextWorkout.progress * 100)}%`}
                                    styles={buildStyles({
                                        pathColor: '#32CD32', // Verde lima
                                        textColor: '#32CD32',
                                        trailColor: '#D1D1D6', // Color gris claro
                                    })}
                                />
                            </div>

                            {/* Text content */}
                            <div>
                                <IonLabel style={{ display: 'block', fontWeight: 'bold', fontSize: '1.2em', color: '#000000' }}>
                                    {nextWorkout.name}
                                </IonLabel>
                                <IonLabel style={{ display: 'block', fontSize: '1.2em', color: '#000000' }}>
                                    {nextWorkout.daysUntilNextWorkout} days for the next workout
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
                            {/* Centrar el título */}
                            <IonLabel className="calendar-label ion-text-center">Training Schedule</IonLabel>

                            {/* Calendario con bordes redondeados */}
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
