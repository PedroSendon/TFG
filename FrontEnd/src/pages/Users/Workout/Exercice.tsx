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
import { useLocation, useParams, useHistory } from 'react-router';
import { LanguageContext } from '../../../context/LanguageContext'; // Importar el contexto de idioma

const ExerciseDetailPage: React.FC = () => {
    const location = useLocation<{ day_id: number, exerciseId: string }>();
    const history = useHistory();
    const day_id = location.state?.day_id;
    const exerciseId = location.state?.exerciseId;


    const [showModal, setShowModal] = useState(false);
    const [exerciseInfo, setExerciseInfo] = useState<{
        id?: number;
        name?: string;
        description?: string;
        muscleGroups: string[];
        instructions?: string[];
        media: string[];
        sets?: number;
        reps?: number;
        rest?: number;
    }>({
        muscleGroups: [],
        media: [],
    });

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const { t } = useContext(LanguageContext); // Usar el contexto de idioma

    const fetchExerciseDetails = async (day_id: number, exerciseId: string) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error('No access token found');
                return;
            }
            const response = await fetch(`http://127.0.0.1:8000/api/exercises/details/`, {
                method: 'POST', // Usa POST para enviar parámetros en el cuerpo si prefieres no usar GET
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ day_id, exerciseId }),
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (typeof data.media === "string") {
                data.media = [data.media];
            }
            if (!data.media || data.media.length === 0) {
                data.media = ["https://via.placeholder.com/300x200"];
            }
            setExerciseInfo(data);

        } catch (error) {
            console.error('Error fetching exercise details:', error);
            setShowToast(true);
        }
    };


    // Asegúrate de que `exerciseId` esté definido antes de realizar la petición
    useEffect(() => {
        if (day_id && exerciseId) {
            fetchExerciseDetails(day_id, exerciseId);
        }
    }, [day_id, exerciseId]);

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
    const handleBack = () => {
        history.push('/workout/day'); // Navega de regreso a la ruta '/workout'
    };
    if (!exerciseInfo) {
        return <p>{t('loading_exercise_details')}</p>;
    }
    return (
        <IonPage>
            {/* Encabezado del ejercicio */}
            <Header title={t('exercise_details')} onBack={handleBack} showBackButton={true} />

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
                            {/* Verifica que exerciseInfo.media y el índice actual existan */}
                            {exerciseInfo.media && exerciseInfo.media.length > 0 ? (
                                <img
                                    src={exerciseInfo.media[currentImageIndex]}
                                    alt={t('exercise_image')}
                                    style={{ width: '100%', height: 'auto', borderRadius: '10px' }}
                                />
                            ) : (
                                <p>{t('no_image_available')}</p>  // Mensaje alternativo si no hay imágenes disponibles
                            )}
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
                                <IonIcon icon={informationCircleOutline} style={{ fontSize: '28px', color: '#000' }} />
                            </IonButton>
                        </IonCol>
                    </IonRow>

                    {/* Etiquetas de los músculos trabajados */}
                    <IonRow>
                        {exerciseInfo.muscleGroups && exerciseInfo.muscleGroups.map((muscle: string, index) => (
                            <IonCol key={index} size="auto">
                                <div style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#000',
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
                                border: '3px solid #000',
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
                                border: '3px solid #000',
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
                                border: '3px solid #000',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                margin: '10px auto',
                            }}>
                                <IonLabel style={{ fontSize: '14px' }}>{t('rest')}</IonLabel>
                                <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold' }}>{exerciseInfo.rest}</p>
                            </div>
                        </IonCol>
                    </IonRow>

                </IonGrid>

                {/* Modal con la información detallada del ejercicio */}
                <ExerciseInfoModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    exerciseName={exerciseInfo.name || ''}
                    description={exerciseInfo.description || ''}
                    steps={exerciseInfo.instructions ? exerciseInfo.instructions.flat() : []}  // Usa flat() para aplanar la estructura
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
