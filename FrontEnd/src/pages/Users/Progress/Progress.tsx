import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonSegment, IonSegmentButton, IonLabel } from '@ionic/react';
import ControlPanel from './ControlPanel';
import WorkoutHistory from './WorkoutHistory';
import Graphics from './Graphics';
import Header from '../../Header/Header';
import './Progress.css';  // Importamos el archivo CSS

const Progress: React.FC = () => {
    const [selectedSection, setSelectedSection] = useState<string>('control');

    return (
        <IonPage>
            <Header title="Progress" />  {/* Pasamos el título como prop */}
            <IonContent>
                {/* Etiquetas para seleccionar las secciones */}
                <IonSegment
                    value={selectedSection}
                    onIonChange={(e: { detail: { value: React.SetStateAction<string>; }; }) => setSelectedSection(e.detail.value!)}
                    className="custom-segment"  // Usamos una clase CSS personalizada
                    color="success" // Cambiamos el color del segmento
                >
                    <IonSegmentButton value="control">
                        <IonLabel>Panel</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="workout">
                        <IonLabel>Workout</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="graphics">
                        <IonLabel>Graphics</IonLabel>
                    </IonSegmentButton>
                </IonSegment>

                {/* Mostrar la sección seleccionada */}
                {selectedSection === 'control' && <ControlPanel />}
                {selectedSection === 'workout' && <WorkoutHistory />}
                {selectedSection === 'graphics' && <Graphics />}
            </IonContent>
        </IonPage>
    );
};

export default Progress;
