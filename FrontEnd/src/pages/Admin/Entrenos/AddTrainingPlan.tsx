import React, { useState, useRef, useEffect, useContext } from 'react';
import {
    IonPage,
    IonContent,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    IonAvatar,
    IonActionSheet,
    IonButton,
    IonIcon,
} from '@ionic/react';
import { cameraOutline, imageOutline, trashOutline, closeOutline } from 'ionicons/icons';
import Header from '../../Header/Header';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { Button, Select, InputLabel, Grid, SelectChangeEvent } from '@mui/material';
import { LanguageContext } from '../../../context/LanguageContext';
import { useHistory } from 'react-router';

interface Training {
    id: string;
    name: string;
}

const CreateTrainingPlan: React.FC = () => {
    const { t } = useContext(LanguageContext); // Usar el contexto de idioma
    const history = useHistory();
    const [trainings, setTrainings] = useState<Training[]>([]);  // Lista de entrenamientos
    const [planData, setPlanData] = useState({
        name: '',
        selectedTraining: '',
        equipment: '',
        difficulty: '',
        duration: 0,
    });
    const [media, setMedia] = useState<string | null>(null);
    const [showActionSheet, setShowActionSheet] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Llamada al backend para obtener la lista de entrenamientos
    const fetchTrainings = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        console.error(t('no_token'));
        return;
      }
            const response = await fetch('http://127.0.0.1:8000/api/workouts/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,  // Agrega el token JWT aquí
                },
            });
            const data = await response.json();
            console.log('Entrenamientos:', data);
            setTrainings(data.data);
        } catch (error) {
            console.error('Error fetching trainings:', error);
        }
    };

    useEffect(() => {
        fetchTrainings();
    }, []);

    const handleSave = async () => {
        const trainingPlanData = {
            name: planData.name,
            workout_ids: [planData.selectedTraining],  // Debes enviar los IDs de los entrenamientos seleccionados
            equipment: planData.equipment,
            difficulty: planData.difficulty,
            duration: planData.duration,
            media: media || null,  // Puedes enviar media como null si no se seleccionó
        };
    
        try {
            const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        console.error(t('no_token'));
        return;
      }
            const response = await fetch('http://127.0.0.1:8000/api/trainingplans/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,  // Agrega el token JWT aquí
                },
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log('Plan de entrenamiento creado:', data);
                history.push('/admin/workout');  // Redirigir a la lista de entrenamientos tras guardar
            } else {
                const errorData = await response.json();
                console.error('Error al crear el plan de entrenamiento:', errorData);
            }
        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
        }
    };
    

    const handleCancel = () => {
        history.push('/admin/workout');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setPlanData({
            ...planData,
            [name as string]: value,
        });
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        setPlanData({
            ...planData,
            [name as string]: value,
        });
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

    const handlePhotoOption = (option: string) => {
        if (option === 'upload') {
            handleMediaUpload();
        } else if (option === 'delete') {
            setMedia(null);
        }
    };

    // Opciones para los menús desplegables
    const equipmentOptions = [
        { value: 'Gimnasio completo', label: t('full_gym') },
        { value: 'Pesas libres', label: t('free_weights') },
        { value: 'Sin equipamiento', label: t('no_equipment') },
    ];

    const difficultyOptions = [
        { value: 'Sedentario', label: t('sedentary') },
        { value: 'Ligero', label: t('light') },
        { value: 'Moderado', label: t('moderate') },
        { value: 'Avanzado', label: t('advanced') },

    ];

    return (
        <IonPage>
            <Header title={t('add_training_plan')} /> {/* Título del header */}
            <IonContent>
                <IonGrid>
                    <IonRow>
                        <IonCol size="12">
                            <TextField
                                variant="outlined"
                                fullWidth
                                label={t('training_name')}
                                name="name"
                                value={planData.name}
                                onChange={handleChange}
                            />
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <InputLabel id="training-label">{t('select_training')}</InputLabel>
                            <Select
                                labelId="training-label"
                                id="selectedTraining"
                                name="selectedTraining"
                                value={planData.selectedTraining}
                                onChange={handleSelectChange}
                                fullWidth
                            >
                                {trainings && trainings.length > 0 ? (
                                    trainings.map((training) => (
                                        <MenuItem key={training.id} value={training.id}>
                                            {training.name}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled>{t('no_trainings_available')}</MenuItem> // Texto para cuando no haya entrenamientos
                                )}
                            </Select>

                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <InputLabel id="equipment-label">{t('equipment')}</InputLabel>
                            <Select
                                labelId="equipment-label"
                                id="equipment"
                                name="equipment"
                                value={planData.equipment}
                                onChange={handleSelectChange}
                                fullWidth
                            >
                                {equipmentOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <InputLabel id="difficulty-label">{t('difficulty')}</InputLabel>
                            <Select
                                labelId="difficulty-label"
                                id="difficulty"
                                name="difficulty"
                                value={planData.difficulty}
                                onChange={handleSelectChange}
                                fullWidth
                            >
                                {difficultyOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </IonCol>
                    </IonRow>
                    
                    <IonRow>
                        <IonCol size="12">
                            <TextField
                                variant="outlined"
                                fullWidth
                                style={{ marginTop: '3%' }}
                                label={t('duration_minutes')}
                                name="duration"
                                type="number"
                                value={planData.duration}
                                onChange={handleChange}
                            />
                        </IonCol>
                    </IonRow>

                    {/* Subida de imagen */}
                    <IonRow>
                        <IonCol size="12" className="ion-text-center">
                            <IonButton
                                onClick={() => setShowActionSheet(true)}
                                fill="clear"
                                style={{ color: '#000', borderColor: '#000' }}
                            >
                                <IonIcon icon={cameraOutline} /> {t('upload_image')}
                            </IonButton>
                            {media && (
                                <IonAvatar style={{ width: '100px', height: '100px', margin: '10px auto' }}>
                                    <img src={media} alt="Vista previa" />
                                </IonAvatar>
                            )}

                            <IonActionSheet
                                isOpen={showActionSheet}
                                onDidDismiss={() => setShowActionSheet(false)}
                                buttons={[
                                    {
                                        text: t('upload_photo'),
                                        icon: imageOutline,
                                        handler: () => handlePhotoOption('upload'),
                                    },
                                    {
                                        text: t('delete_photo'),
                                        icon: trashOutline,
                                        handler: () => handlePhotoOption('delete'),
                                    },
                                    {
                                        text: t('cancel'),
                                        icon: closeOutline,
                                        role: 'cancel',
                                    },
                                ]}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                        </IonCol>
                    </IonRow>

                    <IonRow>
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
            </IonContent>
        </IonPage>
    );
};

export default CreateTrainingPlan;
