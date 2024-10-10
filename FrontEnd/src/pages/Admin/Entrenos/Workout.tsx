import React, { useState, useEffect, useContext } from 'react';
import {
    IonPage,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonLabel,
    IonFab,
    useIonAlert,
    IonSegment,
    IonSegmentButton
} from '@ionic/react';
import { Add } from '@mui/icons-material';
import Header from '../../Header/Header'; 
import Navbar from '../../Navbar/Navbar'; 
import { useHistory } from 'react-router';
import { Button } from '@mui/material';
import { LanguageContext } from '../../../context/LanguageContext'; // Importamos el contexto de idioma

interface Workout {
    id: number;
    name: string;
    description: string;
}
  
interface Exercise {
    id: number;
    name: string;
    description: string;
}

const WorkoutsExercises: React.FC = () => {
    const { t } = useContext(LanguageContext); // Usamos el contexto de idioma
    const history = useHistory();
    const [selectedSection, setSelectedSection] = useState<string>('workouts');
    const [workouts, setWorkouts] = useState<Workout[]>([]);  
    const [exercises, setExercises] = useState<Exercise[]>([]);  
    const [presentAlert] = useIonAlert();

    // Obtener entrenamientos desde el BE
    useEffect(() => {
        fetchWorkouts();
        fetchExercises();
    }, []);

    const fetchWorkouts = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/workouts/');
            const data = await response.json();
            setWorkouts(data.data.map((workout: any) => ({
                id: workout.id,
                name: workout.name,
                description: workout.description,
                media: workout.media,
            })));
        } catch (error) {
            console.error(t('error_fetching_workouts'), error);
        }
    };

    const fetchExercises = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/exercises/all/');
            const data = await response.json();
            setExercises(data.data);
        } catch (error) {
            console.error(t('error_fetching_exercises'), error);
        }
    };

    const handleDelete = (id: number, type: string) => {
        presentAlert({
            header: t('confirm_delete'),
            message: t('confirm_delete_message'),
            buttons: [
                t('cancel'),
                {
                    text: t('delete'),
                    handler: () => {
                        if (type === 'workout') {
                            setWorkouts((prev) => prev.filter((workout) => workout.id !== id));
                        } else {
                            setExercises((prev) => prev.filter((exercise) => exercise.id !== id));
                        }
                    },
                },
            ],
        });
    };

    const handleEdit = (id: number, type: string) => {
        const selectedData = type === 'workout'
            ? workouts.find((workout) => workout.id === id)
            : exercises.find((exercise) => exercise.id === id);

        if (!selectedData) {
            console.error(t('not_found'));
            return;
        }
    
        history.push({
            pathname: `/admin/${type}/modify`,
            state: { data: { ...selectedData, id } },
        });
    };

    const handleAdd = (type: string) => {
        history.push(`/admin/${type}/add`);
    };

    return (
        <IonPage>
            <Header title={t(selectedSection === 'workouts' ? 'workouts' : 'exercises')} />
            <IonContent style={{ backgroundColor: '#000000' }}>
                <IonSegment
                    value={selectedSection}
                    onIonChange={(e: CustomEvent) => setSelectedSection(e.detail.value!)}
                    className="custom-segment"
                    color="success"
                >
                    <IonSegmentButton value="workouts">
                        <IonLabel>{t('workouts')}</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="exercises">
                        <IonLabel>{t('exercises')}</IonLabel>
                    </IonSegmentButton>
                </IonSegment>

                <IonGrid>
                    {selectedSection === 'workouts' ? (
                        <IonRow>
                            {workouts.map((workout) => (
                                <IonCol size="12" key={workout.id}>
                                    <IonCard
                                        style={{
                                            backgroundColor: '#FFFFFF',
                                            borderRadius: '10px',
                                            padding: '8px',
                                            margin: '10px auto',
                                            maxWidth: '95%',
                                            boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        <IonCardContent style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <IonLabel style={{ color: '#000000', fontWeight: 'bold', fontSize: '1em', display: 'block', marginBottom: '8px' }}>
                                                    {workout.name}
                                                </IonLabel>
                                                <IonLabel style={{ color: '#6b6b6b', fontSize: '0.9em' }}>
                                                    {workout.description}
                                                </IonLabel>
                                            </div>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <Button
                                                    onClick={() => handleEdit(workout.id, 'workout')}
                                                    style={{
                                                        border: '1px solid #32CD32',
                                                        backgroundColor: '#FFFFFF',
                                                        color: '#32CD32',
                                                        padding: '4px 8px',
                                                        borderRadius: '5px',
                                                        fontSize: '0.7em',
                                                        minWidth: '55px',
                                                    }}
                                                >
                                                    {t('modify')}
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(workout.id, 'workout')}
                                                    style={{
                                                        border: '1px solid #FF0000',
                                                        backgroundColor: '#FFFFFF',
                                                        color: '#FF0000',
                                                        padding: '4px 8px',
                                                        borderRadius: '5px',
                                                        fontSize: '0.7em',
                                                        minWidth: '55px',
                                                    }}
                                                >
                                                    {t('delete')}
                                                </Button>
                                            </div>
                                        </IonCardContent>
                                    </IonCard>
                                </IonCol>
                            ))}
                        </IonRow>
                    ) : (
                        <IonRow>
                            {exercises.map((exercise) => (
                                <IonCol size="12" key={exercise.id}>
                                    <IonCard
                                        style={{
                                            backgroundColor: '#FFFFFF',
                                            borderRadius: '10px',
                                            padding: '8px',
                                            margin: '10px auto',
                                            maxWidth: '95%',
                                            boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        <IonCardContent style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <IonLabel style={{ color: '#000000', fontWeight: 'bold', fontSize: '1em' }}>
                                                    {exercise.name}
                                                </IonLabel>
                                            </div>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <Button
                                                    onClick={() => handleEdit(exercise.id, 'exercise')}
                                                    style={{
                                                        border: '1px solid #32CD32',
                                                        backgroundColor: '#FFFFFF',
                                                        color: '#32CD32',
                                                        padding: '4px 8px',
                                                        borderRadius: '5px',
                                                        fontSize: '0.7em',
                                                        minWidth: '55px',
                                                    }}
                                                >
                                                    {t('modify')}
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(exercise.id, 'exercise')}
                                                    style={{
                                                        border: '1px solid #FF0000',
                                                        backgroundColor: '#FFFFFF',
                                                        color: '#FF0000',
                                                        padding: '4px 8px',
                                                        borderRadius: '5px',
                                                        fontSize: '0.7em',
                                                        minWidth: '55px',
                                                    }}
                                                >
                                                    {t('delete')}
                                                </Button>
                                            </div>
                                        </IonCardContent>
                                    </IonCard>
                                </IonCol>
                            ))}
                        </IonRow>
                    )}
                </IonGrid>

                <IonFab vertical="bottom" horizontal="end" style={{ marginBottom: '15%', position: 'fixed' }}>
                    <Button
                        onClick={() => handleAdd(selectedSection === 'workouts' ? 'workout' : 'exercise')}
                        style={{
                            backgroundColor: '#FFFFFF',
                            color: '#32CD32',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            border: '2px solid #32CD32',
                            zIndex: 1000,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Add style={{ fontSize: '24px', color: '#32CD32' }} />
                    </Button>
                </IonFab>
            </IonContent>
            <Navbar />
        </IonPage>
    );
};

export default WorkoutsExercises;
