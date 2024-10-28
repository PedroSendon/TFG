import React, { useState, useContext } from 'react';
import { IonContent, IonHeader, IonPage, IonSegment, IonSegmentButton, IonLabel } from '@ionic/react';
import ControlPanel from './ControlPanel';
import WorkoutHistory from './WorkoutHistory';
import Graphics from './Graphics';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext'; // Contexto de idioma
import './Progress.css';

const Progress: React.FC = () => {
    const [selectedSection, setSelectedSection] = useState<string>('control');
    const { t } = useContext(LanguageContext); // Hook para obtener la función de traducción

    return (
        <IonPage>
            <Header title={t('progress_title')} />  {/* Usamos la variable para el título */}
            <IonContent>
                {/* Etiquetas para seleccionar las secciones */}
                <IonSegment
                    value={selectedSection}
                    onIonChange={(e: { detail: { value: React.SetStateAction<string>; }; }) => setSelectedSection(e.detail.value!)}
                    className="custom-segment"
                    color="success"
                >
                    <IonSegmentButton value="control">
                        <IonLabel>{t('control_panel_label')}</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="workout">
                        <IonLabel>{t('workout_label')}</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="graphics">
                        <IonLabel>{t('weight_graph_label')}</IonLabel>
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
