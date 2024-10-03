import React, { useState, useRef } from 'react';
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
import TextField from '@mui/material/TextField';  // Importar TextField de Material UI
import MenuItem from '@mui/material/MenuItem';  // Importar MenuItem de Material UI
import { Button } from '@mui/material';

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  rest: number;
}

const ModifyWorkoutPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const { workoutData } = (location.state || { workoutData: {} }) as { workoutData: any };

  const [workoutDetails, setWorkoutDetails] = useState<{
    name: string;
    description: string;
    exercises: Exercise[];
  }>({
    name: workoutData?.name || '',
    description: workoutData?.description || '',
    exercises: workoutData?.exercises || [],
  });

  const [media, setMedia] = useState<string | null>(workoutData?.media || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const availableExercises = ['Squats', 'Push Ups', 'Deadlifts', 'Bench Press', 'Pull Ups'];

  const handleSave = () => {
    console.log('Datos del entrenamiento guardados:', workoutDetails, media);
    history.push('/admin/workout');
  };

  const handleCancel = () => {
    history.push('/admin/workout');  // Volver a la lista de entrenamientos
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWorkoutDetails({ ...workoutDetails, [name]: value });
  };

  const handleExerciseChange = (index: number, field: string, value: string | number) => {
    const updatedExercises = [...workoutDetails.exercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    setWorkoutDetails({ ...workoutDetails, exercises: updatedExercises });
  };

  const handleAddExercise = () => {
    setWorkoutDetails({
      ...workoutDetails,
      exercises: [...workoutDetails.exercises, { name: '', sets: 0, reps: 0, rest: 0 }],
    });
  };

  const handleDeleteExercise = (index: number) => {
    const updatedExercises = workoutDetails.exercises.filter((_, i) => i !== index);
    setWorkoutDetails({ ...workoutDetails, exercises: updatedExercises });
  };

  return (
    <IonPage>
      <Header title="Modify Workout" />
      <IonContent>
        <IonGrid>
          {/* Sección de Imagen */}
          <IonRow className="ion-text-center">
            <IonCol size="12">
              <IonAvatar style={{ width: '150px', height: '150px', margin: '10px auto', borderRadius: '10px', border: '2px solid #32CD32' }}>
                {media ? (
                  <img src={media} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#f2f2f2' }} />
                )}
              </IonAvatar>
              <IonButton fill="clear" onClick={() => setShowActionSheet(true)} style={{ color: '#32CD32', borderColor: '#32CD32' }}>
                <IonIcon icon={cameraOutline} /> Cambiar imagen/video
              </IonButton>
            </IonCol>
          </IonRow>

          <IonActionSheet
            isOpen={showActionSheet}
            onDidDismiss={() => setShowActionSheet(false)}
            buttons={[
              { text: 'Subir imagen/video', icon: imageOutline, handler: () => handlePhotoOption('upload') },
              { text: 'Eliminar imagen/video', icon: trashOutline, role: 'destructive', handler: () => handlePhotoOption('delete') },
              { text: 'Cancelar', icon: closeOutline, role: 'cancel' },
            ]}
          />

          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

          {/* Campos de modificación */}
          <IonRow style={{ marginTop: '20px' }}>
            <IonCol size="12">
              <TextField
                variant="outlined"
                fullWidth
                label="Workout Name"
                name="name"
                value={workoutDetails.name}
                onChange={handleChange}
              />
            </IonCol>
          </IonRow>

          <IonRow style={{ marginTop: '20px' }}>
            <IonCol size="12">
              <TextField
                variant="outlined"
                fullWidth
                label="Description"
                name="description"
                value={workoutDetails.description}
                onChange={handleChange}
              />
            </IonCol>
          </IonRow>

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
                      {availableExercises.map((ex) => (
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
          <IonRow>
            <IonCol size="12" className="ion-text-center">
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
            </IonCol>
          </IonRow>

          {/* Botones de Cancelar y Guardar */}
          <IonRow style={{ marginTop: '20px' }}>
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
                CANCEL
              </Button>
            </IonCol>
            <IonCol size="6" className="ion-text-center">
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
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Toast de confirmación */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Cambios guardados exitosamente"
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default ModifyWorkoutPage;
