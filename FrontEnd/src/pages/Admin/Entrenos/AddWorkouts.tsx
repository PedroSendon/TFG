import React, { useState, useRef } from 'react';

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
import { IonFabButton, IonIcon, IonContent, IonPage, IonCol, IonRow, IonGrid, IonCard, IonLabel } from '@ionic/react';
import { cameraOutline, trashOutline } from 'ionicons/icons';
import Header from '../../Header/Header';
import '../../../theme/variables.css';

const AddWorkouts: React.FC = () => {
    const history = useHistory();
    const [media, setMedia] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        exercises: [] as { name: string; series: number; reps: number; rest: number }[],
    });

    const [errors, setErrors] = useState<any>({});

    const exercisesList = [
        'Squat', 'Deadlift', 'Bench Press', 'Pull-up', 'Push-up', 'Bicep Curl', 'Tricep Extension'
    ];

    const handleAddExercise = () => {
        setWorkoutDetails({
            ...workoutDetails,
            exercises: [...workoutDetails.exercises, { name: '', sets: 0, reps: 0, rest: 0 }],
        });
    };

    const handleCancel = () => {
        history.push('/admin/workout');
    };

    const handleSave = () => {
        console.log('Datos del entrenamiento guardados:', workoutDetails, media);
        history.push('/admin/workout');
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
                setMedia(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Entrenamiento agregado:', formData, media);
        history.push('/admin/workouts');
    };

    const handleDeleteExercise = (index: number) => {
        const updatedExercises = workoutDetails.exercises.filter((_, i) => i !== index);
        setWorkoutDetails({ ...workoutDetails, exercises: updatedExercises });
      };

    return (
        <IonPage>
            <Header title="Add Workout" />
            <IonContent>
                <Container component="main" maxWidth="xs" style={{ paddingBottom: '80px' }}>
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="name"
                                        label="Workout Name"
                                        name="name"
                                        onChange={handleChange}
                                        error={!!errors.name}
                                        helperText={errors.name}
                                        InputLabelProps={{
                                            style: { color: 'var(--color-gris-oscuro)' },
                                        }}
                                        sx={{
                                            '& label.Mui-focused': {
                                                color: 'var(--color-verde-lima)',
                                            },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: 'var(--color-gris-oscuro)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'var(--color-verde-lima)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: 'var(--color-verde-lima)',
                                                },
                                            },
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        id="description"
                                        label="Description"
                                        name="description"
                                        multiline
                                        rows={3}
                                        onChange={handleChange}
                                        InputLabelProps={{
                                            style: { color: 'var(--color-gris-oscuro)' },
                                        }}
                                        sx={{
                                            '& label.Mui-focused': {
                                                color: 'var(--color-verde-lima)',
                                            },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: 'var(--color-gris-oscuro)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'var(--color-verde-lima)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: 'var(--color-verde-lima)',
                                                },
                                            },
                                        }}
                                    />
                                </Grid>

                                {/* Lista de ejercicios */}
                                {workoutDetails.exercises.map((exercise: Exercise, index: number) => (
                                    <IonCard key={index} style={{ position: 'relative', borderRadius: '10px', marginBottom: '15px' }}>
                                        <IonGrid style={{ padding: '10px' }}>
                                            <IonRow>
                                                <IonCol size="10">
                                                    <IonLabel style={{ fontWeight: 'bold' }}>Exercise {index + 1}</IonLabel>
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
                                                        label="Exercise Name"
                                                        value={exercise.name}
                                                        onChange={(e) => handleExerciseChange(index, 'name', e.target.value as string)}
                                                    >
                                                        {exercisesList.map((ex) => (
                                                            <MenuItem key={ex} value={ex}>
                                                                {ex}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                </IonCol>
                                            </IonRow>
                                            <IonRow>
                                                <IonCol size="4">
                                                    <TextField
                                                        label="Sets"
                                                        type="number"
                                                        value={exercise.sets}
                                                        onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                                                    />
                                                </IonCol>
                                                <IonCol size="4">
                                                    <TextField
                                                        label="Reps"
                                                        type="number"
                                                        value={exercise.reps}
                                                        onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                                                    />
                                                </IonCol>
                                                <IonCol size="4">
                                                    <TextField
                                                        label="Rest (s)"
                                                        type="number"
                                                        value={exercise.rest}
                                                        onChange={(e) => handleExerciseChange(index, 'rest', e.target.value)}
                                                    />
                                                </IonCol>
                                            </IonRow>
                                        </IonGrid>
                                    </IonCard>
                                ))}

                                {/* Botón para añadir ejercicio */}
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
                                        Add Exercise
                                    </Button>
                                </Grid>

                                {/* Botón para subir imagen o video */}
                                <Grid item xs={12} className="ion-text-center">
                                    <Button
                                        onClick={handleMediaUpload}
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
                                        <IonIcon icon={cameraOutline} style={{ color: '#fff', marginRight: '10px' }} />
                                        Upload Image/Video
                                    </Button>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />

                                    {media && <img src={media} alt="Preview" style={{ width: '100%', marginTop: '10px' }} />}
                                </Grid>

                                {/* Botones de Cancelar y Guardar */}
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
                                                CANCEL
                                            </Button>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Button
                                                onClick={handleSave}
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
                                                SAVE
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
