import React, { useContext } from 'react';
import {
  IonButton,
  IonContent,
  IonLabel,
  IonModal,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import Header from '../../Header/Header';  // Importamos el componente Header
import { LanguageContext } from '../../../context/LanguageContext';  // Importamos el contexto de idioma

interface ExerciseInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  description: string;
  steps: string[];
}

const ExerciseInfoModal: React.FC<ExerciseInfoModalProps> = ({ isOpen, onClose, exerciseName, description, steps }) => {
  const { t } = useContext(LanguageContext); // Usamos el contexto de idioma

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      {/* Utilizamos el Header ya creado */}
      <Header title={t('exercise_information')} />  {/* Texto dinámico de título */}

      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              {/* Título del ejercicio */}
              <IonLabel>
                <h2 style={{ fontWeight: 'bold', fontSize: '1.5em', marginBottom: '20px', marginTop: '20px' }}>
                  {exerciseName}
                </h2>
              </IonLabel>

              {/* Descripción del ejercicio */}
              <IonLabel>
                <p style={{ fontSize: '1em', marginBottom: '20px', textAlign: 'justify' }}>
                  {description}
                </p>
              </IonLabel>

              {/* Instrucciones paso a paso */}
              <IonLabel>
                <h2 style={{ color: '#32CD32', marginBottom: '10px' }}>{t('step_by_step_instructions')}</h2>  {/* Texto dinámico */}
                <IonGrid>
                  {Array.isArray(steps) ? (
                    steps.map((step, index) => (
                      <IonRow key={index} className="ion-justify-content-center">
                        <IonCol size="12">
                          <div
                            style={{
                              border: '1px solid #d1d1d6',
                              padding: '10px 15px',
                              borderRadius: '8px',
                              marginBottom: '10px',
                              textAlign: 'left',
                              fontSize: '1em',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <div
                              style={{
                                color: '#32CD32',
                                fontWeight: 'bold',
                                width: '30px',
                                height: '30px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: '10px'
                              }}
                            >
                              {index + 1}
                            </div>
                            <div>{step}</div>
                          </div>
                        </IonCol>
                      </IonRow>
                    ))) : (
                    <p>{t('no_instructions_available')}</p> // Mensaje de error o estado alternativo
                  )}
                </IonGrid>
              </IonLabel>

              {/* Botón de cerrar */}
              <IonButton
                expand="block"
                fill="outline"
                className="cancel-button"
                onClick={onClose}  // Llama a onClose para cerrar el modal
                style={{ marginTop: '20px' }}
              >
                {t('close_button')}  {/* Texto dinámico */}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonModal>
  );
};

export default ExerciseInfoModal;
