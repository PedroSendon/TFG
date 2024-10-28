import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  IonPage,
  IonActionSheet,
  IonContent,
  IonAvatar,
  IonLabel,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonToast,
  IonCard,
} from '@ionic/react';
import { cameraOutline, imageOutline, trashOutline, closeOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import Header from '../../Header/Header';
import TextField from '@mui/material/TextField';  
import MenuItem from '@mui/material/MenuItem';  
import { Button, Grid, InputLabel, Select, SelectChangeEvent } from '@mui/material';
import { LanguageContext } from '../../../context/LanguageContext';

interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  rest: number;
}

const ModifyWorkoutPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { t } = useContext(LanguageContext); 

  const { data } = (location.state || { data: {} }) as { data: any };
  
  const [workoutDetails, setWorkoutDetails] = useState({
    name: data?.name || '',
    description: data?.description || '',
    exercises: data?.exercises || [], 
    duration: data?.duration || 30,
  });

  const [media, setMedia] = useState<string | null>(data?.media || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);

  // Fetch de ejercicios
  const fetchExercises = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        console.error(t('no_token'));
        return;
      }
      const response = await fetch('http://127.0.0.1:8000/api/exercises/all/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,  // Agrega el token JWT aquí
        },
    });
      const data = await response.json();

      if (data && data.data) {
        setAvailableExercises(data.data.map((exercise: any) => ({
          id: exercise.id,
          name: exercise.name,
        })));
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleSave = async () => {
    const workoutId = data?.id; 

    const updatedWorkout = {
      name: workoutDetails.name,
      description: workoutDetails.description,
      exercises: workoutDetails.exercises.map((exercise: Exercise) => ({
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        rest: exercise.rest,
      })),
      media,
      duration: workoutDetails.duration,
    };

    try {
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        console.error(t('no_token'));
        return;
      }
      const response = await fetch(`http://127.0.0.1:8000/api/workouts/${workoutId}/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,  // Agrega el token JWT aquí
        },
        body: JSON.stringify(updatedWorkout),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Entrenamiento actualizado con éxito:', data);
        setShowToast(true);
        history.push('/admin/workout');
      } else {
        const errorData = await response.json();
        console.error('Error al actualizar el entrenamiento:', errorData);
      }
    } catch (error) {
      console.error('Error en la conexión:', error);
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

  const handlePhotoOption = (option: string) => {
    if (option === 'upload') {
      fileInputRef.current?.click();
    } else if (option === 'delete') {
      setMedia(null);
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setWorkoutDetails({
      ...workoutDetails,
      [name as string]: value,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWorkoutDetails({ ...workoutDetails, [name]: value });
  };

  const handleExerciseChange = (index: number, field: string, value: string) => {
    const updatedExercises = [...workoutDetails.exercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    setWorkoutDetails({ ...workoutDetails, exercises: updatedExercises });
  };

  const handleAddExercise = () => {
    setWorkoutDetails({
      ...workoutDetails,
      exercises: [
        ...workoutDetails.exercises,
        {
          id: Date.now(),
          name: '',
          sets: 0,
          reps: 0,
          rest: 0,
        },
      ],
    });
  };

  const handleDeleteExercise = (index: number) => {
    const updatedExercises = workoutDetails.exercises.filter((_: any, i: number) => i !== index);
    setWorkoutDetails({ ...workoutDetails, exercises: updatedExercises });
  };

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
      <Header title={t('modify_workout_title')} />

      <IonContent>
        <IonGrid style={{ padding: '0 20px' }}>
          {/* Imagen */}
          <IonRow className="ion-text-center">
            <IonCol size="12">
              <IonAvatar style={{ width: '150px', height: '150px', margin: '20px auto', borderRadius: '10px', border: '2px solid #000' }}>
                {media ? (
                  <img src={media} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#f2f2f2' }} />
                )}
              </IonAvatar>
              <IonButton fill="clear" onClick={() => setShowActionSheet(true)} style={{ color: '#000', borderColor: '#000' }}>
                <IonIcon icon={cameraOutline} /> {t('change_image_video')}
              </IonButton>
            </IonCol>
          </IonRow>

          <IonActionSheet
            isOpen={showActionSheet}
            onDidDismiss={() => setShowActionSheet(false)}
            buttons={[
              { text: t('upload_image_video'), icon: imageOutline, handler: () => handlePhotoOption('upload') },
              { text: t('delete_image_video'), icon: trashOutline, role: 'destructive', handler: () => handlePhotoOption('delete') },
              { text: t('cancel'), icon: closeOutline, role: 'cancel' },
            ]}
          />

          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

          {/* Formulario */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                fullWidth
                label={t('workout_name')}
                name="name"
                value={workoutDetails.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                variant="outlined"
                fullWidth
                label={t('description')}
                name="description"
                value={workoutDetails.description}
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
                value={workoutDetails.duration}
                onChange={handleChange}
              />
            </Grid>

          </Grid>

          {/* Lista de ejercicios */}
          {Array.isArray(workoutDetails.exercises) && workoutDetails.exercises.map((exercise, index) => (
            <IonCard key={exercise.id || index} style={{ marginTop: '15px' }}>
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
                      {availableExercises.map((ex) => (
                        <MenuItem key={ex.id} value={ex.name}>
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

          {/* Botón para añadir ejercicio */}
          <IonRow style={{ marginTop: '20px' }}>
            <IonCol size="12" className="ion-text-center">
              <Button
                onClick={handleAddExercise}
                style={{
                  border: '1px solid #000',
                  backgroundColor: '#FFFFFF',
                  color: '#000',
                  padding: '3% 0',
                  borderRadius: '5px',
                  fontSize: '1em',
                  minWidth: '100%',
                }}
              >
                {t('add_exercise')}
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

        {/* Toast de confirmación */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={t('toast_success')}
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default ModifyWorkoutPage;
