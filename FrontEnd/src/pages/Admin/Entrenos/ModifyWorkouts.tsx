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
  IonInput,
  IonItem,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonCard,
} from '@ionic/react';
import { cameraOutline, imageOutline, trashOutline, closeOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import Header from '../../Header/Header';
import '../../../theme/variables.css'; // Estilo personalizado

const ModifyWorkoutPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  // Recibir datos del entrenamiento seleccionado desde la lista de entrenamientos
  const { workoutData } = (location.state || { workoutData: {} }) as { workoutData: any };

  // Estado local para manejar los datos editados del entrenamiento
  const [workoutDetails, setWorkoutDetails] = useState({
    name: workoutData?.name || '',
    description: workoutData?.description || '',
    exercises: workoutData?.exercises || [] as { name: string; sets: number; reps: number; rest: number }[],
  });

  const [media, setMedia] = useState<string | null>(workoutData?.media || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Lista de ejercicios disponibles (simulación)
  const availableExercises = ['Squats', 'Push Ups', 'Deadlifts', 'Bench Press', 'Pull Ups'];

  // Guardar cambios del entrenamiento
  const handleSave = () => {
    console.log('Datos del entrenamiento guardados:', workoutDetails, media);
    history.push('/admin/workouts'); // Redirigir a la lista de entrenamientos
  };

  // Manejo de la selección de archivos
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

  // Manejo del ActionSheet para seleccionar una opción
  const handlePhotoOption = (option: string) => {
    if (option === 'upload') {
      fileInputRef.current?.click();
    } else if (option === 'delete') {
      setMedia(null); // Eliminar media
    }
  };

  // Manejo de los cambios en los campos de texto y selección
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setWorkoutDetails({ ...workoutDetails, [name as string]: value });
  };

  // Manejo de los cambios en los ejercicios (series, repeticiones, descanso)
  const handleExerciseChange = (index: number, field: string, value: string | number) => {
    const updatedExercises = [...workoutDetails.exercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    setWorkoutDetails({ ...workoutDetails, exercises: updatedExercises });
  };

  // Añadir un ejercicio al entrenamiento
  const handleAddExercise = () => {
    setWorkoutDetails({
      ...workoutDetails,
      exercises: [...workoutDetails.exercises, { name: '', sets: 0, reps: 0, rest: 0 }],
    });
  };

  return (
    <IonPage>
      {/* Header reutilizable */}
      <Header title="Modify Workout" />

      <IonContent>
        <IonGrid>
          {/* Sección de Imagen */}
          <IonRow className="ion-text-center">
            <IonCol size="12">
              <IonAvatar style={{ width: '150px', height: '150px', margin: '10px auto', borderRadius: '10px' }}>
                {media ? (
                  <img src={media} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#f2f2f2' }} />
                )}
              </IonAvatar>
              <IonButton fill="clear" onClick={() => setShowActionSheet(true)} style={{ color: 'var(--color-verde-lima)' }}>
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
          <IonRow style={{ marginTop: '20px' }}> {/* Espacio entre el título y el input */}
            <IonCol size="12">
              <IonItem lines="none">
                <IonLabel position="stacked">Workout Name</IonLabel>
                <IonInput
                  value={workoutDetails.name}
                  onIonChange={(e: any) => handleChange(e as any)}
                  name="name"
                  style={{ textIndent: '4%' }}
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow style={{ marginTop: '20px' }}> {/* Espacio entre el título y el input */}
            <IonCol size="12">
              <IonItem lines="none">
                <IonLabel position="stacked">Description</IonLabel>
                <IonInput
                  value={workoutDetails.description}
                  onIonChange={(e: any) => handleChange(e as any)}
                  name="description"
                  style={{ textIndent: '4%' }}
                  multiple
                />
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Lista de ejercicios */}
          {workoutDetails.exercises.map((exercise: { name: any; sets: string | number | null | undefined; reps: string | number | null | undefined; rest: string | number | null | undefined; }, index: number) => (
            <IonCard key={index} style={{ borderRadius: '10px', boxShadow: '2px 2px 8px rgba(0,0,0,0.1)', marginBottom: '15px' }}>
              <IonGrid style={{ padding: '10px' }}>
                <IonRow>
                  <IonCol size="12">
                    <IonLabel style={{ fontWeight: 'bold' }}>Exercise {(index as number) + 1}</IonLabel>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="12">
                    <IonItem lines="none" style={{ backgroundColor: 'transparent' }}>
                      <IonLabel position="stacked">Exercise Name</IonLabel>
                      <IonSelect
                        value={exercise.name}
                        onIonChange={(e: { detail: { value: string | number; }; }) => handleExerciseChange(index, 'name', e.detail.value!)}
                        placeholder="Select exercise"
                        style={{ padding: '10px', height: '45px' }}
                      >
                        {availableExercises.map((ex) => (
                          <IonSelectOption key={ex} value={ex}>
                            {ex}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                  </IonCol>
                </IonRow>

                {/* Series, Reps, Rest */}
                <IonRow>
                  <IonCol size="4">
                    <IonItem lines="none" style={{ backgroundColor: 'transparent' }}>
                      <IonLabel position="stacked">Sets</IonLabel>
                      <IonInput
                        type="number"
                        value={exercise.sets}
                        onIonChange={(e: { detail: { value: string; }; }) => handleExerciseChange(index, 'sets', parseInt(e.detail.value!))}
                        style={{ textIndent: '4%' }}
                      />
                    </IonItem>
                  </IonCol>
                  <IonCol size="4">
                    <IonItem lines="none" style={{ backgroundColor: 'transparent' }}>
                      <IonLabel position="stacked">Reps</IonLabel>
                      <IonInput
                        type="number"
                        value={exercise.reps}
                        onIonChange={(e: { detail: { value: string; }; }) => handleExerciseChange(index, 'reps', parseInt(e.detail.value!))}
                        style={{ textIndent: '4%' }}
                      />
                    </IonItem>
                  </IonCol>
                  <IonCol size="4">
                    <IonItem lines="none" style={{ backgroundColor: 'transparent' }}>
                      <IonLabel position="stacked">Rest (s)</IonLabel>
                      <IonInput
                        type="number"
                        value={exercise.rest}
                        onIonChange={(e: { detail: { value: string; }; }) => handleExerciseChange(index, 'rest', parseInt(e.detail.value!))}
                        style={{ textIndent: '4%' }}
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCard>
          ))}

          {/* Botón para añadir ejercicio */}
          {/* Botón para añadir ejercicio */}
          <IonRow>
            <IonCol size="12" className="ion-text-center">
              <IonButton
                fill="outline"
                style={{
                  color: '#32CD32',
                  borderColor: '#32CD32',
                  '--border-color': '#32CD32',  // Color del borde
                  '--color': '#32CD32',         // Color del texto
                  '--hover-border-color': '#2AA32A', // Color del borde en hover
                  width: '100%',                // Ancho del botón
                  padding: '12px',              // Tamaño del padding para más altura
                  fontSize: '1em',              // Tamaño de la fuente
                  marginBottom: '10px',         // Margen inferior
                }}
                onClick={handleAddExercise}
              >
                Add Exercise
              </IonButton>
            </IonCol>
          </IonRow>


          {/* Botón para guardar */}
          <IonRow>
            <IonCol size="12" className="ion-text-center">
              <IonButton
                fill="outline"
                style={{
                  color: '#32CD32',
                  borderColor: '#32CD32',
                  '--border-color': '#32CD32',  // Color del borde
                  '--color': '#32CD32',         // Color del texto
                  '--hover-border-color': '#2AA32A', // Color del borde en hover
                  width: '100%',                // Ancho del botón
                  padding: '12px',              // Tamaño del padding para más altura
                  fontSize: '1em',              // Tamaño de la fuente
                  marginBottom: '15%',
                }}
                onClick={handleSave}
              >
                Guardar cambios
              </IonButton>
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
