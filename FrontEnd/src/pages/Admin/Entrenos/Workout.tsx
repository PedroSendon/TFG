import React, { useState, useEffect } from 'react';
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
    const history = useHistory();
    const [selectedSection, setSelectedSection] = useState<string>('workouts');
    const [workouts, setWorkouts] = useState<Workout[]>([]);  // Usa el tipo Workout
    const [exercises, setExercises] = useState<Exercise[]>([]);  // Usa el tipo Exercise
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
    
            // Asegúrate de que los datos están dentro de la clave 'data'
            setWorkouts(data.data.map((workout: any) => ({
                id: workout.id,
                name: workout.name,
                description: workout.description,
                media: workout.media,
            })));
        } catch (error) {
            console.error('Error fetching workouts:', error);
        }
    };
    
    

    const fetchExercises = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/exercises/all/');
            const data = await response.json();
            setExercises(data.data); // Ajustar los datos obtenidos
        } catch (error) {
            console.error('Error al obtener ejercicios:', error);
        }
    };

    const handleDelete = (id: number, type: string) => {
        presentAlert({
            header: 'Confirmar eliminación',
            message: `¿Estás seguro de que deseas eliminar este ${type}?`,
            buttons: [
                'Cancelar',
                {
                    text: 'Eliminar',
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
            ? workouts.find((workout) => workout.id === id)  // Aquí asegúrate de que el workout tiene el id
            : exercises.find((exercise) => exercise.id === id);
        console.log(selectedData?.id);
        if (!selectedData) {
            console.error(`No ${type} found with id:`, id);
            return;
        }
    
        // Asegúrate de que estás pasando el 'id' correctamente junto con los datos del entrenamiento
        history.push({
            pathname: `/admin/${type}/modify`,
            state: { data: { ...selectedData, id } },  // Aquí estás asignando el 'id'
        });
    };
    
    
    
    

    const handleAdd = (type: string) => {
        history.push(`/admin/${type}/add`);
    };

    return (
        <IonPage>
            <Header title={selectedSection === 'workouts' ? 'Workouts' : 'Exercises'} />
            <IonContent style={{ backgroundColor: '#000000' }}>
                <IonSegment
                    value={selectedSection}
                    onIonChange={(e: CustomEvent) => setSelectedSection(e.detail.value!)}
                    className="custom-segment"
                    color="success"
                >
                    <IonSegmentButton value="workouts">
                        <IonLabel>Workouts</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="exercises">
                        <IonLabel>Exercises</IonLabel>
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
                                                    Modify
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
                                                    Delete
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
                                                    Modify
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
                                                    Delete
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
