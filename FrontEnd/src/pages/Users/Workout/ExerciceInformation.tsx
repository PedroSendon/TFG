import React from 'react';
import {
  IonButton,
  IonContent,
  IonLabel,
  IonModal,
  IonGrid,
  IonRow,
  IonCol,
  IonPage,
} from '@ionic/react';
import Header from '../../Header/Header';  // Importamos el componente Header

interface ExerciseInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  description: string;
  steps: string[];
}

const ExerciseInfoModal: React.FC<ExerciseInfoModalProps> = ({ isOpen, onClose, exerciseName, description, steps }) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      {/* Utilizamos el Header ya creado */}
      <Header title="Exercise information" />

      <IonContent>
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
          <h2 style={{ color: '#32CD32', marginBottom: '10px' }}>Step by step instructions</h2>
          <IonGrid>
            {steps.map((step, index) => (
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
                        justifyContent: 'left',
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
            ))}
          </IonGrid>
        </IonLabel>

        {/* Botón de cerrar */}
        <IonButton
          expand="block"
          fill="outline"
          className="cancel-button"
          onClick={onClose}  // Llama a onClose para cerrar el modal
        >
          Close
        </IonButton>
      </IonContent>
    </IonModal>
  );
};

export default ExerciseInfoModal;
