import React, { useState, useRef, useEffect, useContext } from 'react';

interface Exercise {
    name: string;
    sets: number;
    reps: number;
    rest: number;
}
import {
    TextField,
    Button,
    Grid,
    Container,
    InputLabel,
    Select,
    OutlinedInput,
    MenuItem,
    Box,
    Chip,
    Typography,
    Divider,
    SelectChangeEvent
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import { IonFabButton, IonIcon, IonContent, IonPage, IonCol, IonRow, IonGrid, IonCard, IonLabel, IonActionSheet } from '@ionic/react';
import { cameraOutline, closeOutline, imageOutline, trashOutline } from 'ionicons/icons';
import Header from '../../Header/Header';
import '../../../theme/variables.css';
import { LanguageContext } from '../../../context/LanguageContext';

interface Exercise {
    name: string;
    sets: number;
    reps: number;
    rest: number;
}

const AddWorkouts: React.FC = () => {
    const history = useHistory();
    const [media, setMedia] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useContext(LanguageContext); // Usar el contexto de idioma
    const [showActionSheet, setShowActionSheet] = useState(false);


    const [formData, setFormData] = useState({
        name: '',
        description: '',
        exercises: [] as { name: string; series: number; reps: number; rest: number }[],
        duration: 30, // Nuevo campo
    });

    const [errors, setErrors] = useState<any>({});
    const [exercisesList, setExercisesList] = useState<Exercise[]>([]); // Estado para la lista de ejercicios

    const handleAddExercise = () => {
        setWorkoutDetails({
            ...workoutDetails,
            exercises: [...workoutDetails.exercises, { name: '', sets: 0, reps: 0, rest: 0 }],
        });
    };

    const handleCancel = () => {
        history.push('/admin/workout');
    };

    const handleSave = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');

            if (!accessToken) {
                console.error(t('no_token'));
                return;
            }
            const response = await fetch('http://127.0.0.1:8000/api/workouts/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Si usas JWT
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    exercises: workoutDetails.exercises,
                    media: media,
                    duration: formData.duration, // Añadido
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Entrenamiento creado con éxito:', data);
                history.push('/admin/workouts');
            } else {
                const errorData = await response.json();
                console.error('Error al crear el entrenamiento:', errorData);
            }
        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name as string]: value,
        });
    };

    const [workoutDetails, setWorkoutDetails] = useState<{
        name: string;
        description: string;
        exercises: { name: string; sets: number; reps: number; rest: number }[];
    }>({
        name: '',
        description: '',
        exercises: [],
    });

    const handleExerciseChange = (index: number, field: string, value: string | number) => {
        const updatedExercises = [...workoutDetails.exercises];
        updatedExercises[index] = { ...updatedExercises[index], [field]: value };
        setWorkoutDetails({ ...workoutDetails, exercises: updatedExercises });
    };

    const handleMediaUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMedia(reader.result as string); // Guardar la imagen subida
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoOption = (option: string) => {
        if (option === 'upload') {
            handleMediaUpload();
        } else if (option === 'delete') {
            setMedia(null); // Eliminar imagen
        }
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name as string]: value,
        });
    };

    const handleDeleteExercise = (index: number) => {
        const updatedExercises = workoutDetails.exercises.filter((_, i) => i !== index);
        setWorkoutDetails({ ...workoutDetails, exercises: updatedExercises });
    };

    // Llamada al backend para obtener los ejercicios
    const fetchExercises = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/exercises/all/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Si usas JWT
                },
            });
            const data = await response.json();
            setExercisesList(data.data); // Actualiza el estado con los ejercicios obtenidos
        } catch (error) {
            console.error('Error al obtener ejercicios:', error);
        }
    };

    // Ejecutar la llamada al backend cuando el componente se monta
    useEffect(() => {
        fetchExercises();
    }, []);

    // Opciones para los menús desplegables
    const difficultyOptions = [
        { value: 'Ligero', label: t('light') },
        { value: 'Moderado', label: t('moderate') },
        { value: 'Intermedio', label: t('intermediate') },
        { value: 'Avanzado', label: t('advanced') },
    ];

    const trainingPreferenceOptions = [
        { value: 'Entrenamiento en casa', label: t('home_training') },
        { value: 'Entrenamiento en gimnasio', label: t('gym_training') },
        { value: 'Ejercicios al aire libre', label: t('outdoor_training') },
        { value: 'Clases grupales', label: t('group_classes') },
    ];

    const equipmentOptions = [
        { value: 'Gimnasio completo', label: t('full_gym') },
        { value: 'Pesas libres', label: t('free_weights') },
        { value: 'Sin equipamiento', label: t('no_equipment') },
    ];

    return (
        <IonPage>
            <Header title={t('add_workout_title')} /> {/* Reemplaza el título */}
            <IonContent>
                <Container component="main" maxWidth="xs" style={{ paddingBottom: '80px' }}>
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <form onSubmit={handleSave}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="name"
                                        label={t('workout_name')}
                                        name="name"
                                        onChange={handleChange}
                                        error={!!errors.name}
                                        helperText={errors.name}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        id="description"
                                        label={t('description')}
                                        name="description"
                                        multiline
                                        rows={3}
                                        onChange={handleChange}
                                    />
                                </Grid>


                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        id="duration"
                                        label={t('duration_minutes')}
                                        name="duration"
                                        type="number"
                                        value={formData.duration}
                                        onChange={handleChange}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    {/* Subida de imagen */}
                                    <Button
                                        onClick={() => setShowActionSheet(true)}
                                        style={{
                                            border: '1px solid #32CD32',
                                            backgroundColor: '#FFFFFF',
                                            color: '#32CD32',
                                            padding: '3% 0',
                                            borderRadius: '5px',
                                            fontSize: '1em',
                                            minWidth: '100%',
                                        }}
                                    >
                                        {t('upload_image')}
                                    </Button>

                                    {/* Mostrar vista previa de la imagen subida */}
                                    {media && (
                                        <div>
                                            <img src={media} alt="Vista previa" style={{ width: '100%', marginTop: '10px' }} />
                                        </div>
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
                                </Grid>

                                {workoutDetails.exercises.map((exercise, index) => (
                                    <IonCard key={index} style={{ position: 'relative', borderRadius: '10px', marginBottom: '15px' }}>
                                        <IonGrid style={{ padding: '10px' }}>
                                            <IonRow>
                                                <IonCol size="10">
                                                    <IonLabel style={{ fontWeight: 'bold' }}>{t('exercise')} {index + 1}</IonLabel>
                                                </IonCol>
                                                <IonCol size="2" className="ion-text-end">
                                                    <IonIcon
                                                        icon={trashOutline}
                                                        style={{ color: 'red', cursor: 'pointer', fontSize: '20px' }}
                                                        onClick={() => handleDeleteExercise(index)}
                                                    />
                                                </IonCol>
                                            </IonRow>
                                            <IonRow>
                                                <IonCol size="12">
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        label={t('exercise_name')}
                                                        value={exercise.name}
                                                        onChange={(e) => handleExerciseChange(index, 'name', e.target.value as string)}
                                                    >
                                                        {exercisesList.map((ex) => (
                                                            <MenuItem key={ex.name} value={ex.name}>
                                                                {ex.name}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                </IonCol>
                                            </IonRow>
                                            <IonRow>
                                                <IonCol size="4">
                                                    <TextField
                                                        label={t('sets')}
                                                        type="number"
                                                        value={exercise.sets}
                                                        onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                                                    />
                                                </IonCol>
                                                <IonCol size="4">
                                                    <TextField
                                                        label={t('reps')}
                                                        type="number"
                                                        value={exercise.reps}
                                                        onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                                                    />
                                                </IonCol>
                                                <IonCol size="4">
                                                    <TextField
                                                        label={t('rest')}
                                                        type="number"
                                                        value={exercise.rest}
                                                        onChange={(e) => handleExerciseChange(index, 'rest', e.target.value)}
                                                    />
                                                </IonCol>
                                            </IonRow>
                                        </IonGrid>
                                    </IonCard>
                                ))}

                                <Grid item xs={12} className="ion-text-center">
                                    <Button
                                        onClick={handleAddExercise}
                                        style={{
                                            border: '1px solid #32CD32',
                                            backgroundColor: '#FFFFFF',
                                            color: '#32CD32',
                                            padding: '3% 0',
                                            borderRadius: '5px',
                                            fontSize: '1em',
                                            minWidth: '100%',
                                        }}
                                    >
                                        {t('add_exercise')}
                                    </Button>
                                </Grid>

                                <Grid item xs={12}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
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
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Button
                                                type="submit"
                                                style={{
                                                    border: '1px solid #32CD32',
                                                    backgroundColor: '#FFFFFF',
                                                    color: '#32CD32',
                                                    padding: '3% 0',
                                                    borderRadius: '5px',
                                                    fontSize: '1em',
                                                    width: '100%',
                                                }}
                                            >
                                                {t('save')}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </form>
                    </div>
                </Container>
            </IonContent>
        </IonPage>
    );
};


export default AddWorkouts;