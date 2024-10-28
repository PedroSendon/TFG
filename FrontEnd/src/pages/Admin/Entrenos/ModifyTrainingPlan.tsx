import React, { useState, useRef, useEffect, useContext } from 'react';
import {
    IonPage,
    IonContent,
    IonAvatar,
    IonLabel,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonToast,
    IonIcon
} from '@ionic/react';
import { cameraOutline, trashOutline, closeOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import Header from '../../Header/Header';
import { Box, Chip, InputLabel, MenuItem, OutlinedInput, Select, TextField, Button, Card, CardContent } from '@mui/material';
import { SelectChangeEvent } from '@mui/material';
import { LanguageContext } from '../../../context/LanguageContext';

interface LocationState {
    data: {
        id: number;
        name: string;
        description: string;
        difficulty: string;
        equipment: string;
        duration: number;
        media: string | null;
        workouts: any[];
    };
}
interface Workout {
    id: number;
    name: string;
    description: string;
    media?: string | null; // Si media es opcional
}
const ModifyTrainingPlans: React.FC = () => {
    const history = useHistory();
    const location = useLocation<LocationState>();
    const { t, language } = useContext(LanguageContext);
    const trainingPlanId = location.state?.data?.id; // Usamos optional chaining para evitar errores si `state` o `data` no existen

    const [availableWorkouts, setAvailableWorkouts] = useState<Workout[]>([]);
    const [selectedWorkout, setSelectedWorkout] = useState<number | null>(null);

    const [planDetails, setPlanDetails] = useState({
        name: '',
        description: '',
        difficulty: '',
        equipment: '',
        duration: 0,
    });
    const [media, setMedia] = useState<string | null>(null);
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [showToast, setShowToast] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [workoutSelections, setWorkoutSelections] = useState<{ id: string, selectedWorkout: number | null }[]>([]);

    const handleAddWorkoutCard = () => {
        setWorkoutSelections([
            ...workoutSelections,
            { id: Math.random().toString(), selectedWorkout: null }
        ]);
    };

    const handleRemoveWorkoutCard = (id: string) => {
        setWorkoutSelections(workoutSelections.filter((item) => item.id !== id));
    };

    const handleWorkoutChange = (id: string, selectedWorkoutId: number) => {
        setWorkoutSelections(workoutSelections.map((item) =>
            item.id === id ? { ...item, selectedWorkout: selectedWorkoutId } : item
        ));
    };

    useEffect(() => {
        const fetchTrainingPlan = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken || !trainingPlanId) {
                history.push('/admin/training-plans');
                return;
            }

            try {
                const response = await fetch(`http://127.0.0.1:8000/api/training-plans/${trainingPlanId}/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(t('training_plan_loaded'), data);
                    setPlanDetails({
                        name: data.name,
                        description: data.description,
                        difficulty: data.difficulty,
                        equipment: data.equipment,
                        duration: data.duration
                    });
                    setMedia(data.media);
                    setWorkouts(data.workouts);
                } else {
                    console.error(t('error_loading_training_plan'));
                }
            } catch (error) {
                console.error(t('connection_error'), error);
            }
        };

        const fetchAvailableWorkouts = async () => {
            const accessToken = localStorage.getItem('access_token');
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/workouts/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setAvailableWorkouts(data.data);
                } else {
                    console.error(t('error_loading_workouts'));
                }
            } catch (error) {
                console.error(t('connection_error'), error);
            }
        };

        fetchTrainingPlan();
        fetchAvailableWorkouts();
    }, [trainingPlanId, history, t]);

    const handleAddWorkout = () => {
        const workoutToAdd = availableWorkouts.find((workout) => workout.id === selectedWorkout);
        if (workoutToAdd) {
            setWorkouts([...workouts, workoutToAdd]);
            setSelectedWorkout(null); // Reiniciar el valor seleccionado
        }
    };

    const handleDeleteWorkout = (workoutId: number) => {
        setWorkouts(workouts.filter((workout: Workout) => workout.id !== workoutId));
    };

    const handleSave = async () => {
        if (!trainingPlanId) {
            console.error(t('no_training_plan_id'));
            history.push('/admin/workout');
            return;
        }

        const updatedTrainingPlan = {
            ...planDetails,
            media,
            workouts,
        };

        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error(t('no_token'));
                return;
            }
            const response = await fetch(`http://127.0.0.1:8000/api/training-plans/${trainingPlanId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(updatedTrainingPlan),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(t('training_plan_saved'), data);
                setShowToast(true);
                history.push('/admin/training-plans');
            } else {
                const errorData = await response.json();
                console.error(t('error_saving_training_plan'), errorData);
                setShowToast(true);
            }
        } catch (error) {
            console.error(t('connection_error'), error);
            setShowToast(true);
        }
    };

    const handleCancel = () => {
        history.push('/admin/workout');
    };

    const handleMediaUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMedia(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setPlanDetails({ ...planDetails, [name as string]: value });
    };

    return (
        <IonPage>
            <Header title={t('modify_training_plan_title')} />

            <IonContent>
                <IonGrid>


                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

                    {/* Input de Nombre del Plan */}
                    <IonRow style={{ marginTop: '20px' }}>
                        <IonCol size="12">
                        <InputLabel>{t('training_plan_name')}</InputLabel>
                            <TextField
                                variant="outlined"
                                fullWidth
                                name="name"
                                value={planDetails.name}
                                onChange={handleChange}
                            />
                        </IonCol>
                    </IonRow>

                    {/* Input de Descripción */}
                    <IonRow style={{ marginTop: '20px' }}>
                        <IonCol size="12">
                        <InputLabel>{t('description')}</InputLabel>
                            <TextField
                                variant="outlined"
                                fullWidth
                                name="description"
                                value={planDetails.description}
                                onChange={handleChange}
                                multiline
                            />
                        </IonCol>
                    </IonRow>

                    {/* Selección de Dificultad */}
                    <IonRow style={{ marginTop: '20px' }}>
                        <IonCol size="12">
                            <InputLabel>{t('difficulty')}</InputLabel>
                            <Select
                                value={planDetails.difficulty}
                                onChange={(e) => setPlanDetails({ ...planDetails, difficulty: e.target.value })}
                                fullWidth
                            >
                                <MenuItem value="ligera">{t('difficulty_light')}</MenuItem>
                                <MenuItem value="moderada">{t('difficulty_moderate')}</MenuItem>
                                <MenuItem value="intermedia">{t('difficulty_intermediate')}</MenuItem>
                                <MenuItem value="intensa">{t('difficulty_intense')}</MenuItem>
                            </Select>
                        </IonCol>
                    </IonRow>

                    {/* Selección de Equipamiento */}
                    <IonRow style={{ marginTop: '20px' }}>
                        <IonCol size="12">
                            <InputLabel>{t('equipment')}</InputLabel>
                            <Select
                                value={planDetails.equipment}
                                onChange={(e) => setPlanDetails({ ...planDetails, equipment: e.target.value })}
                                fullWidth
                            >
                                <MenuItem value="Pesas libres">{t('equipment_free_weights')}</MenuItem>
                                <MenuItem value="gimnasio">{t('equipment_gym')}</MenuItem>
                                <MenuItem value="Nada">{t('equipment_none')}</MenuItem>
                            </Select>
                        </IonCol>
                    </IonRow>

                    {/* Input de Duración */}
                    <IonRow style={{ marginTop: '20px' }}>
                        <IonCol size="12">
                        <InputLabel>{t('duration')}</InputLabel>
                            <TextField
                                variant="outlined"
                                fullWidth
                                name="duration"
                                type="number"
                                value={planDetails.duration}
                                onChange={handleChange}
                            />
                        </IonCol>
                    </IonRow>

                    <IonRow style={{ marginTop: '20px' }}>
                        <IonCol size="12" className="ion-text-center">
                            <Button
                                style={{
                                    border: '1px solid #000',
                                    backgroundColor: '#FFFFFF',
                                    color: '#000',
                                    padding: '3% 0',
                                    borderRadius: '5px',
                                    fontSize: '1em',
                                    width: '100%',
                                }}
                                onClick={handleAddWorkoutCard}
                            >
                                {t('add_workout')}
                            </Button>
                        </IonCol>
                    </IonRow>

                    {workoutSelections.map((workoutSelection) => (
                        <IonRow key={workoutSelection.id} style={{ marginTop: '20px' }}>
                            <IonCol size="12">
                                <Card style={{ position: 'relative', borderRadius: '10px', marginBottom: '15px' }}>
                                    <CardContent style={{ display: 'flex', alignItems: 'center' }}>
                                        <Select
                                            value={workoutSelection.selectedWorkout}
                                            onChange={(e) => handleWorkoutChange(workoutSelection.id, e.target.value as number)}
                                            fullWidth
                                            displayEmpty
                                        >
                                            <MenuItem value="" disabled>{t('choose_workout')}</MenuItem>
                                            {availableWorkouts.map((workout) => (
                                                <MenuItem key={workout.id} value={workout.id}>
                                                    {workout.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <Button onClick={() => handleRemoveWorkoutCard(workoutSelection.id)} style={{ color: '#FF0000', marginLeft: '10px' }}>
                                            <IonIcon icon={trashOutline} />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </IonCol>
                        </IonRow>
                    ))}

                    <IonRow className="ion-text-center">
                        <IonCol size="12">
                            <Button onClick={handleMediaUpload} style={{
                                    border: '1px solid #000',
                                    backgroundColor: '#FFFFFF',
                                    color: '#000',
                                    padding: '3% 0',
                                    borderRadius: '5px',
                                    fontSize: '1em',
                                    width: '100%',
                                }}>
                                <IonIcon icon={cameraOutline} /> {t('change_image_video')}
                            </Button>
                        </IonCol>
                    </IonRow>

                    {/* Botones de Cancelar y Guardar */}
                    <IonRow style={{ marginTop: '20px', marginBottom: '15%' }}>
                        <IonCol size="6" className="ion-text-center">
                            <Button
                                onClick={handleCancel}
                                style={{
                                    border: '1px solid #FF0000',
                                    backgroundColor: '#FFFFFF',
                                    color: '#FF0000',
                                    padding: '3% 0',
                                    borderRadius: '5px',
                                    fontSize: '1em',
                                    width: '100%',
                                }}
                            >
                                {t('cancel')}
                            </Button>
                        </IonCol>
                        <IonCol size="6" className="ion-text-center">
                            <Button
                                onClick={handleSave}
                                style={{
                                    border: '1px solid #000',
                                    backgroundColor: '#FFFFFF',
                                    color: '#000',
                                    padding: '3% 0',
                                    borderRadius: '5px',
                                    fontSize: '1em',
                                    width: '100%',
                                }}
                            >
                                {t('save')}
                            </Button>
                        </IonCol>
                    </IonRow>
                </IonGrid>
                <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={t('toast_success')} duration={2000} />
            </IonContent>
        </IonPage>

    );
};

export default ModifyTrainingPlans;
