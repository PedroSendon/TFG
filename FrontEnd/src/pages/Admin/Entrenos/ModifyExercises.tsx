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
  IonText,
} from '@ionic/react';
import { cameraOutline, imageOutline, trashOutline, closeOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import Header from '../../Header/Header';
import '../../../theme/variables.css'; // Estilo personalizado
import { Box, Chip, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';
import { SelectChangeEvent } from '@mui/material';

const ModifyExercises: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  // Recibir datos del ejercicio seleccionado desde la lista de ejercicios
  const { exerciseData } = (location.state || { exerciseData: {} }) as { exerciseData: any };

  // Estado local para manejar los datos editados del ejercicio
  const [exerciseDetails, setExerciseDetails] = useState({
    name: exerciseData?.name || '',
    description: exerciseData?.description || '',
    muscleGroups: exerciseData?.muscleGroups || [] as string[],
    instructions: exerciseData?.instructions || '',
  });

  const [media, setMedia] = useState<string | null>(exerciseData?.media || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Lista de grupos musculares
  const muscleGroupsList = [
    'Biceps', 'Triceps', 'Chest', 'Back', 'Shoulders', 'Legs', 'Abs', 'Calves', 'Forearms', 'Glutes'
  ];

  // Guardar cambios del ejercicio
  const handleSave = () => {
    console.log('Datos del ejercicio guardados:', exerciseDetails, media);
    history.push('/admin/exercises'); // Redirigir a la lista de ejercicios
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
    setExerciseDetails({ ...exerciseDetails, [name as string]: value });
  };

  // Manejo de los cambios en la selección múltiple de grupos musculares
  
  const handleMuscleGroupChange = (event: SelectChangeEvent<string[]>) => {
    setExerciseDetails({ ...exerciseDetails, muscleGroups: event.target.value as string[] });
  };

  return (
    <IonPage>
      {/* Header reutilizable */}
      <Header title="Modify Exercise" />

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
          <IonRow>
            <IonCol size="12">
              <IonItem lines="none">
                <IonLabel position="stacked">Exercise Name</IonLabel>
                <IonInput
                  value={exerciseDetails.name}
                  onIonChange={(e: any) => handleChange(e as any)}
                  name="name"
                  style={{ textIndent: '4%' }}
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonItem lines="none">
                <IonLabel position="stacked">Description</IonLabel>
                <IonInput
                  value={exerciseDetails.description}
                  onIonChange={(e: any) => handleChange(e as any)}
                  name="description"
                  style={{ textIndent: '4%' }}
                  multiple
                />
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Grupos musculares */}
          <IonRow>
  <IonCol size="12">
    <IonItem lines="none">
      <IonLabel position="stacked" style={{ color: 'var(--color-gris-oscuro)' }}>
        Muscle Groups
      </IonLabel>
      <Select
        labelId="muscleGroups-label"
        id="muscleGroups"
        multiple
        fullWidth
        onChange={(event) => handleMuscleGroupChange(event as SelectChangeEvent<string[]>)}
        value={exerciseDetails.muscleGroups}
        input={<OutlinedInput id="select-multiple-chip" />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(selected as string[]).map((value) => (
              <Chip key={value} label={value} />
            ))}
          </Box>
        )}
        sx={{
          width: '100%',  // Se asegura de que sea igual de ancho que los otros inputs
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'var(--color-gris-oscuro)', // Borde gris oscuro como los otros inputs
            },
            '&:hover fieldset': {
              borderColor: 'var(--color-verde-lima)', // Borde verde lima al pasar el mouse
            },
            '&.Mui-focused fieldset': {
              borderColor: 'var(--color-verde-lima)', // Borde verde lima al enfocar
            },
            '& input': {
              padding: '10px',  // Igual padding que los otros inputs
            },
          },
        }}
      >
        {muscleGroupsList.map((muscle) => (
          <MenuItem key={muscle} value={muscle}>
            {muscle}
          </MenuItem>
        ))}
      </Select>
    </IonItem>
  </IonCol>
</IonRow>


          {/* Instrucciones */}
          <IonRow>
            <IonCol size="12">
              <IonItem lines="none">
                <IonLabel position="stacked">Instructions</IonLabel>
                <IonInput
                  value={exerciseDetails.instructions}
                  onIonChange={(e: any) => handleChange(e as any)}
                  name="instructions"
                  style={{ textIndent: '4%' }}
                  multiple
                />
              </IonItem>
            </IonCol>
          </IonRow>

          {/* Botón para guardar */}
          <IonRow>
            <IonCol size="12">
              <IonButton expand="block" style={{ backgroundColor: 'var(--color-verde-lima)', marginBottom: '10%' }} onClick={handleSave}>
                Guardar cambios
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Toast de confirmación */}
        <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message="Cambios guardados exitosamente" duration={2000} />
      </IonContent>
    </IonPage>
  );
};

export default ModifyExercises;
