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
    IonToast,
    IonIcon,
} from '@ionic/react';
import { cameraOutline, imageOutline, trashOutline, closeOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import Header from '../../Header/Header';
import { Box, Chip, InputLabel, MenuItem, OutlinedInput, Select, TextField, Button } from '@mui/material';
import { SelectChangeEvent } from '@mui/material';
import { LanguageContext } from '../../../context/LanguageContext';
import musclesCa from '../../../locales/muscles_ca.json';
import musclesEs from '../../../locales/muscles_es.json';
import musclesEn from '../../../locales/muscles_en.json';

interface MuscleGroupsData {
    muscleGroups: string[];
}

const ModifyExercises: React.FC = () => {
    const history = useHistory();
    const location = useLocation();
    const { t, language } = useContext(LanguageContext); // Usar el contexto de idioma
    const muscleGroupsCa: MuscleGroupsData = musclesCa;
    const muscleGroupsEs: MuscleGroupsData = musclesEs;
    const muscleGroupsEn: MuscleGroupsData = musclesEn;
    const data = (location.state as { data: any })?.data || null;

    const [exerciseDetails, setExerciseDetails] = useState({
        name: data?.name || '',
        description: data?.description || '',
        muscleGroups: data?.muscleGroups || [] as string[],
        instructions: data?.instructions || '',
    });

    const [media, setMedia] = useState<string | null>(data?.media || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showActionSheet, setShowActionSheet] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [muscleGroupsList, setMuscleGroupsList] = useState<string[]>([]); // Lista de grupos musculares

    useEffect(() => {
        let muscleData: MuscleGroupsData;

        // Determinar el archivo JSON correcto en función del idioma seleccionado
        switch (language) {
            case 'ca':
                muscleData = musclesCa;
                break;
            case 'es':
                muscleData = musclesEs;
                break;
            case 'en':
            default:
                muscleData = musclesEn;
                break;
        }

        // Establecer la lista de grupos musculares
        setMuscleGroupsList(muscleData.muscleGroups);
    }, [language]); // Escuchar los cambios en el idioma


    const handleSave = async () => {
        const exerciseId = data?.id; // Obtener el ID del ejercicio
        if (!exerciseId) {
            console.error('No se encontró el ID del ejercicio');
            history.push('/admin/exercises');
            return;
        }


        const updatedExercise = {
            ...exerciseDetails,
            muscle_groups: exerciseDetails.muscleGroups,
            media,
        };

        try {
            const accessToken = localStorage.getItem('access_token');

            if (!accessToken) {
                console.error(t('no_token'));
                return;
            }
            const response = await fetch(`http://127.0.0.1:8000/api/exercises/${exerciseId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,  // Agrega el token JWT aquí
                },
                body: JSON.stringify(updatedExercise),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Datos del ejercicio guardados:', data);
                setShowToast(true);
                history.push('/admin/workout');
            } else {
                const errorData = await response.json();
                console.error('Error al modificar el ejercicio:', errorData);
                setShowToast(true);
            }
        } catch (error) {
            console.error('Error en la conexión:', error);
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
        setExerciseDetails({ ...exerciseDetails, [name as string]: value });
    };

    const handleMuscleGroupChange = (event: SelectChangeEvent<string[]>) => {
        setExerciseDetails({ ...exerciseDetails, muscleGroups: event.target.value as string[] });
    };

    return (
        <IonPage>
            <Header title={t('modify_exercise_title')} /> {/* Reemplazamos el título */}

            <IonContent>
                <IonGrid>
                    {/* Sección de Imagen */}
                    <IonRow className="ion-text-center">
                        <IonCol size="12">
                            <IonAvatar style={{ width: '150px', height: '150px', margin: '10px auto', borderRadius: '10px', border: '2px solid #000' }}>
                                {media ? (
                                    <img src={media} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', backgroundColor: '#f2f2f2' }} />
                                )}
                            </IonAvatar>
                            <IonButton fill="clear" onClick={() => setShowActionSheet(true)} style={{ color: '#000', borderColor: '#000' }}>
                                <IonIcon icon={cameraOutline} /> {t('change_image_video')} {/* Texto traducido */}
                            </IonButton>
                        </IonCol>
                    </IonRow>

                    <IonActionSheet
                        isOpen={showActionSheet}
                        onDidDismiss={() => setShowActionSheet(false)}
                        buttons={[
                            { text: t('upload_image_video'), icon: imageOutline, handler: () => handleMediaUpload() },
                            { text: t('delete_image_video'), icon: trashOutline, role: 'destructive', handler: () => setMedia(null) },
                            { text: t('cancel'), icon: closeOutline, role: 'cancel' },
                        ]}
                    />

                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

                    {/* Campos de modificación */}
                    <IonRow style={{ marginTop: '20px' }}>
                        <IonCol size="12">
                            <TextField
                                variant="outlined"
                                fullWidth
                                label={t('exercise_name')}
                                name="name"
                                value={exerciseDetails.name}
                                onChange={handleChange}
                            />
                        </IonCol>
                    </IonRow>

                    <IonRow style={{ marginTop: '20px' }}>
                        <IonCol size="12">
                            <TextField
                                variant="outlined"
                                fullWidth
                                label={t('description')}
                                name="description"
                                value={exerciseDetails.description}
                                onChange={handleChange}
                                multiline
                            />
                        </IonCol>
                    </IonRow>

                    {/* Grupos musculares */}
                    <IonRow style={{ marginTop: '20px' }}>
                        <IonCol size="12">
                            <InputLabel style={{ color: 'var(--color-gris-oscuro)' }}>{t('muscle_groups')}</InputLabel> {/* Texto traducido */}
                            <Select
                                labelId="muscleGroups-label"
                                id="muscleGroups"
                                multiple
                                fullWidth
                                value={exerciseDetails.muscleGroups}
                                onChange={(event) => handleMuscleGroupChange(event as SelectChangeEvent<string[]>)}
                                input={<OutlinedInput id="select-multiple-chip" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {(selected as string[]).map((value) => (
                                            <Chip key={value} label={value} />
                                        ))}
                                    </Box>
                                )}
                                sx={{
                                    width: '100%',
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
                                        '& input': {
                                            padding: '10px',
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
                        </IonCol>
                    </IonRow>

                    {/* Instrucciones */}
                    <IonRow style={{ marginTop: '20px' }}>
                        <IonCol size="12">
                            <TextField
                                variant="outlined"
                                fullWidth
                                label={t('instructions')}
                                name="instructions"
                                value={exerciseDetails.instructions}
                                onChange={handleChange}
                                multiline
                            />
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
                                {t('cancel')} {/* Texto traducido */}
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
                                {t('save')} {/* Texto traducido */}
                            </Button>
                        </IonCol>
                    </IonRow>
                </IonGrid>

                <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={t('toast_success')} duration={2000} /> {/* Texto traducido */}
            </IonContent>
        </IonPage>
    );

};

export default ModifyExercises;
