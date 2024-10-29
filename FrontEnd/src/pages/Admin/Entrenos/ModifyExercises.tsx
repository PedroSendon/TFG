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
import { Box, Chip, InputLabel, MenuItem, OutlinedInput, Select, TextField, Button, Container, Snackbar, Card, Grid, Avatar } from '@mui/material';
import { SelectChangeEvent } from '@mui/material';
import { LanguageContext } from '../../../context/LanguageContext';
import musclesCa from '../../../locales/muscles_ca.json';
import musclesEs from '../../../locales/muscles_es.json';
import musclesEn from '../../../locales/muscles_en.json';
import { CameraAlt } from '@mui/icons-material';

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
        <Box  sx={{ pb: 10, pt: 5 , backgroundColor: '#f5f5f5'}}>
            <Header title={t('modify_exercise_title')} />
            <Box sx={{ p: 3, mt: 2, backgroundColor: '#f5f5f5' }}>
                <Box textAlign="center" mb={2}>
                    <Avatar
                        src={media || undefined}
                        alt="Preview"
                        sx={{
                            width: 150, height: 150, mx: 'auto', borderRadius: '8px', border: '2px solid #000',
                        }}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<CameraAlt />}
                        onClick={handleMediaUpload}
                        sx={{ mt: 2, color: '#000', borderColor: '#000' }}
                    >
                        {t('change_image_video')}
                    </Button>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </Box>

                <form>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                label={t('exercise_name')}
                                name="name"
                                value={exerciseDetails.name}
                                onChange={handleChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                label={t('description')}
                                name="description"
                                value={exerciseDetails.description}
                                onChange={handleChange}
                                multiline
                                rows={3}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <InputLabel style={{ color: '#555555', marginBottom: 1 }}>{t('muscle_groups')}</InputLabel>
                            <Select
                                multiple
                                fullWidth
                                value={exerciseDetails.muscleGroups}
                                onChange={handleMuscleGroupChange}
                                input={<OutlinedInput />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {(selected as string[]).map((value) => (
                                            <Chip key={value} label={value} />
                                        ))}
                                    </Box>
                                )}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                }}
                            >
                                {muscleGroupsList.map((muscle) => (
                                    <MenuItem key={muscle} value={muscle}>
                                        {muscle}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                label={t('instructions')}
                                name="instructions"
                                value={exerciseDetails.instructions}
                                onChange={handleChange}
                                multiline
                                rows={3}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                                }}
                            />
                        </Grid>

                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={6}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={handleCancel}
                                    sx={{
                                        color: '#777', borderColor: '#777', fontWeight: 'bold', py: 1, borderRadius: '8px',
                                      }}                                >
                                    {t('cancel')}
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleSave}
                                    sx={{
                                        backgroundColor: '#555', color: '#FFF', fontWeight: 'bold', py: 1, borderRadius: '8px', '&:hover': { backgroundColor: '#333' },
                                      }}                                >
                                    {t('save')}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </form>
            </Box>

            <Snackbar
                open={showToast}
                autoHideDuration={2000}
                onClose={() => setShowToast(false)}
                message={t('toast_success')}
            />
        </Box>
    );

};

export default ModifyExercises;
