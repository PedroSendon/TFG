import React, { useEffect, useState, useContext } from 'react';
import {
    IonPage,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonLabel,
    IonIcon,
    IonToast,
} from '@ionic/react';
import { arrowBackOutline, arrowForwardOutline, informationCircleOutline } from 'ionicons/icons';
import Header from '../../Header/Header';
import ExerciseInfoModal from './ExerciceInformation';
import { useParams } from 'react-router';
import { LanguageContext } from '../../../context/LanguageContext'; // Importar el contexto de idioma

const ExerciseDetailPage: React.FC = () => {
    const { exerciseId } = useParams<{ exerciseId: string }>();
    const [showModal, setShowModal] = useState(false);
    const [exerciseInfo, setExerciseInfo] = useState<any>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const { t } = useContext(LanguageContext); // Usar el contexto de idioma

    const fetchExerciseDetails = async (id: string) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/exercises/details/?id=${id}`);
            const data = await response.json();

            if (response.ok) {
                setExerciseInfo(data);
                if (data.media && data.media.length > 0) {
                    setCurrentImageIndex(0);
                }
            } else {
                setShowToast(true);
                console.error('Error fetching exercise details:', data.error);
            }
        } catch (error) {
            setShowToast(true);
            console.error('Error fetching exercise details:', error);
        }
    };

    useEffect(() => {
        if (exerciseId) {
            fetchExerciseDetails(exerciseId);
        }
    }, [exerciseId]);

    const handleNextImage = () => {
        if (exerciseInfo?.media && currentImageIndex < exerciseInfo.media.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        }
    };

    const handlePreviousImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
    };

    if (!exerciseInfo) {
        return <p>{t('loading_exercise_details')}</p>;
    }
    return (
        <IonPage>
            {/* Encabezado del ejercicio */}
            <Header title={t('exercise_details')} />

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
                                    color: '#1C1C1E',
                                }}
                            >
                                <IonIcon icon={arrowBackOutline} style={{ fontSize: '2rem' }} />
                            </IonButton>
                            <img
                                src={exerciseInfo.media[currentImageIndex]}
                                alt={t('exercise_image')}
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
                                    color: '#1C1C1E',
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
                                {exerciseInfo.name}
                            </IonLabel>
                        </IonCol>
                        <IonCol size="2" className="ion-text-right" style={{ display: 'flex', alignItems: 'center' }}>
                            <IonButton fill="clear" onClick={() => setShowModal(true)}>
                                <IonIcon icon={informationCircleOutline} style={{ fontSize: '28px', color: '#32CD32' }} />
                            </IonButton>
                        </IonCol>
                    </IonRow>

                    {/* Etiquetas de los músculos trabajados */}
                    <IonRow>
                        {exerciseInfo.muscleGroups.map((muscle: string, index: number) => (
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

                    {/* Parámetros del ejercicio */}
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
                                <IonLabel style={{ fontSize: '14px' }}>{t('sets')}</IonLabel>
                                <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold' }}>{exerciseInfo.sets}</p>
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
                                <IonLabel style={{ fontSize: '14px' }}>{t('repetitions')}</IonLabel>
                                <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold' }}>{exerciseInfo.reps}</p>
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
                                <IonLabel style={{ fontSize: '14px' }}>{t('rest')}</IonLabel>
                                <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold' }}>{exerciseInfo.restTime}</p>
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
                    steps={exerciseInfo.instructions}
                />

                {/* Toast para mostrar errores */}
                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={t('error_fetching_exercise_details')}
                    duration={2000}
                />
            </IonContent>
        </IonPage>
    );
};

export default ExerciseDetailPage;
