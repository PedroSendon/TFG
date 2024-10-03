import React, { useState } from 'react';
import {
    IonPage,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonLabel,
    IonButton,
    IonFab,
    IonFabButton,
    IonAlert,  // Para confirmaciones de eliminación
    useIonAlert,
    IonSegment,
    IonSegmentButton
} from '@ionic/react';
import { Add } from '@mui/icons-material';
import Header from '../../Header/Header'; // Componente de header reutilizable
import Navbar from '../../Navbar/Navbar'; // Componente de la navbar
import { useHistory } from 'react-router';
import { Button } from '@mui/material';

// Datos de ejemplo para entrenamientos y ejercicios
const workoutsData = [
    { id: 1, name: 'Full Body Workout', description: 'A full-body workout to improve overall fitness.' },
    { id: 2, name: 'Leg Day', description: 'A workout focusing on lower body strength.' },
];

const exercisesData = [
    { id: 1, name: 'Squats', description: 'An exercise targeting the lower body.' },
    { id: 2, name: 'Push-ups', description: 'A bodyweight exercise for upper body strength.' },
];

const WorkoutsExercises: React.FC = () => {
    const history = useHistory();  // Hook para manejar la navegación.
    const [selectedSection, setSelectedSection] = useState<string>('workouts');  // Para cambiar entre workouts y exercises
    const [workouts, setWorkouts] = useState(workoutsData);  // Estado local para los entrenamientos
    const [exercises, setExercises] = useState(exercisesData);  // Estado local para los ejercicios
    const [presentAlert] = useIonAlert();  // Alerta para confirmación

    // Función para manejar la eliminación de entrenamientos o ejercicios
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

    // Función para manejar la modificación de entrenamientos o ejercicios
    const handleEdit = (id: number, type: string) => {
        const selectedData = type === 'workout'
            ? workouts.find((workout) => workout.id === id)
            : exercises.find((exercise) => exercise.id === id);

        history.push({
            pathname: `/admin/${type}/modify`,  // Ruta dinámica basada en el tipo (workout/exercise)
            state: { data: selectedData },
        });
    };

    // Función para añadir un nuevo entrenamiento o ejercicio
    const handleAdd = (type: string) => {
        history.push(`/admin/${type}/add`);
    };

    return (
        <IonPage>
            {/* Header */}
            <Header title={selectedSection === 'workouts' ? 'Workouts' : 'Exercises'} />

            <IonContent style={{ backgroundColor: '#000000' }}>
                {/* Segmento para cambiar entre entrenamientos y ejercicios */}
                <IonSegment
                    value={selectedSection}
                    onIonChange={(e: { detail: { value: React.SetStateAction<string>; }; }) => setSelectedSection(e.detail.value!)}
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
                    {/* Mostrar entrenamientos o ejercicios en función de la sección seleccionada */}
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
                                            {/* Información del entrenamiento */}
                                            <div>
                                                <IonLabel style={{ color: '#000000', fontWeight: 'bold', fontSize: '1em', display: 'block', marginBottom: '8px' }}>
                                                    {workout.name}
                                                </IonLabel>
                                                <IonLabel style={{ color: '#6b6b6b', fontSize: '0.9em' }}>
                                                    {workout.description}
                                                </IonLabel>
                                            </div>

                                            {/* Botones Modificar y Eliminar */}
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
                                            {/* Información del ejercicio */}
                                            <div>
                                                <IonLabel style={{ color: '#000000', fontWeight: 'bold', fontSize: '1em' }}>
                                                    {exercise.name}
                                                </IonLabel>
                                            </div>
                                            {/* Botones Modificar y Eliminar */}
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

                {/* Botón flotante para añadir un nuevo entrenamiento o ejercicio */}
                <IonFab vertical="bottom" horizontal="end" style={{ marginBottom: '15%', position: 'fixed' }}>
                    <Button
                        onClick={() => handleAdd(selectedSection === 'workouts' ? 'workout' : 'exercise')}
                        style={{
                            backgroundColor: '#FFFFFF',
                            color: '#32CD32',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%', // Hace que el botón sea redondo
                            border: '2px solid #32CD32', // Borde verde lima
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

            {/* Navbar */}
            <Navbar />
        </IonPage>
    );
};

export default WorkoutsExercises;
