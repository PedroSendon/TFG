import React, { useState } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonLabel,
    IonIcon,
    IonModal,
} from '@ionic/react';
import { arrowBackOutline, arrowForwardOutline, informationCircleOutline } from 'ionicons/icons';
import Header from '../../Header/Header'; // Encabezado
import ExerciseInfoModal from './ExerciceInformation'; // Modal con la información del ejercicio

const ExerciseDetailPage: React.FC = () => {
    const [showModal, setShowModal] = useState(false);

    const exerciseInfo = {
        name: 'Sentadillas',
        description: 'Un ejercicio fundamental que trabaja las piernas y el core.',
        muscles: ['Cuádriceps', 'Glúteos', 'Abdomen'],
        steps: [
            'Párate derecho con los pies separados a la altura de los hombros.',
            'Baja lentamente flexionando las rodillas.',
            'Mantén la espalda recta y baja hasta que tus muslos estén paralelos al suelo.',
            'Vuelve a la posición inicial empujando con los talones.'
        ]
    };
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // Control de las imágenes del ejercicio
    const images = [
        'https://via.placeholder.com/300x300', // Imagen 1
        'https://via.placeholder.com/300x300', // Imagen 2
        'https://via.placeholder.com/300x300', // Imagen 3
    ];

    const muscleGroups = ['Biceps', 'Dorsal', 'Trapecio']; // Grupos musculares involucrados

    // Funciones para cambiar la imagen actual
    const handleNextImage = () => {
        if (currentImageIndex < images.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        }
    };

    const handlePreviousImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
    };

    return (
        <IonPage>
            {/* Encabezado del ejercicio */}
            <Header title="Training X" />

            <IonContent>
                <IonGrid>

                    {/* Visualizador de imágenes con flechas dentro */}
                    <IonRow className="ion-text-center" style={{ position: 'relative' }}>
                        <IonCol size="12" style={{ position: 'relative' }}>
                            <IonButton
                                onClick={handlePreviousImage}
                                fill="clear"
                                style={{
                                    position: 'absolute',
                                    left: '5%',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 1,
                                    color: '#1C1C1E', // Color gris oscuro para las flechas
                                }}
                            >
                                <IonIcon icon={arrowBackOutline} style={{ fontSize: '2rem' }} />
                            </IonButton>
                            <img
                                src={images[currentImageIndex]}
                                alt="Exercise"
                                style={{ width: '100%', height: 'auto', borderRadius: '10px' }}
                            />
                            <IonButton
                                onClick={handleNextImage}
                                fill="clear"
                                style={{
                                    position: 'absolute',
                                    right: '5%',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 1,
                                    color: '#1C1C1E', // Color gris oscuro para las flechas
                                }}
                            >
                                <IonIcon icon={arrowForwardOutline} style={{ fontSize: '2rem' }} />
                            </IonButton>
                        </IonCol>
                    </IonRow>

                    {/* Nombre del ejercicio y botón de información */}
                    <IonRow>
                        <IonCol size="10">
                            <IonLabel style={{ fontWeight: 'bold', fontSize: '20px', display: 'flex', alignItems: 'center' }}>
                                Exercise name
                            </IonLabel>
                        </IonCol>
                        <IonCol size="2" className="ion-text-right" style={{ display: 'flex', alignItems: 'center' }}>
                            <IonButton fill="clear" onClick={() => setShowModal(true)}>
                                <IonIcon icon={informationCircleOutline} style={{ fontSize: '28px', color: '#32CD32' }} /> {/* Icono más grande */}
                            </IonButton>
                        </IonCol>
                    </IonRow>

                    {/* Etiquetas de los músculos trabajados con estilo personalizado */}
                    <IonRow>
                        {muscleGroups.map((muscle, index) => (
                            <IonCol key={index} size="auto">
                                <div style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#32CD32',
                                    color: '#fff',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    margin: '4px',
                                    textAlign: 'center',
                                    minWidth: '60px',
                                    display: 'inline-block',
                                }}>
                                    {muscle}
                                </div>
                            </IonCol>
                        ))}
                    </IonRow>

                    {/* Parámetros del ejercicio dentro de círculos más grandes */}
                    <IonRow className="ion-text-center">
                        <IonCol>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                border: '3px solid #32CD32',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                margin: '10px auto',
                            }}>
                                <IonLabel style={{ fontSize: '14px' }}>Sets</IonLabel>
                                <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold' }}>4</p>
                            </div>
                        </IonCol>
                        <IonCol>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                border: '3px solid #32CD32',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                margin: '10px auto',
                            }}>
                                <IonLabel style={{ fontSize: '14px' }}>Repetitions</IonLabel>
                                <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold' }}>12</p>
                            </div>
                        </IonCol>
                        <IonCol>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                border: '3px solid #32CD32',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                margin: '10px auto',
                            }}>
                                <IonLabel style={{ fontSize: '14px' }}>Rest</IonLabel>
                                <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold' }}>60s</p>
                            </div>
                        </IonCol>
                    </IonRow>

                </IonGrid>

                {/* Modal con la información detallada del ejercicio */}

                <ExerciseInfoModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    exerciseName={exerciseInfo.name}
                    description={exerciseInfo.description}
                    steps={exerciseInfo.steps}
                />
            </IonContent>
        </IonPage>
    );
};

export default ExerciseDetailPage;
