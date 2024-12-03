import React, { useState, useRef, useEffect, useContext } from 'react';
import {
    TextField,
    Button,
    Grid,
    Container,
    Select,
    OutlinedInput,
    MenuItem,
    Box,
    Chip,
    Typography,
    SelectChangeEvent,
    InputLabel,
    IconButton
} from '@mui/material'; // Importación de componentes de Material UI.
import { useHistory } from 'react-router-dom'; // Hook para redirección.
import { IonFabButton, IonIcon, IonContent, IonPage } from '@ionic/react';
import { cameraOutline } from 'ionicons/icons';  // Icono de cámara para subir imágenes/videos.
import Header from '../../Header/Header';  // Importación del Header
import { LanguageContext } from '../../../context/LanguageContext';
import musclesCa from '../../../locales/muscles_ca.json';
import musclesEs from '../../../locales/muscles_es.json';
import musclesEn from '../../../locales/muscles_en.json';
import { CameraAlt, Close } from '@mui/icons-material';

interface MuscleGroupsData {
    muscleGroups: string[];
}

const AddExercises: React.FC = () => {
    const history = useHistory();
    const [media, setMedia] = useState<File | string | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t, language } = useContext(LanguageContext); // Usar el contexto de idioma
    const muscleGroupsCa: MuscleGroupsData = musclesCa;
    const muscleGroupsEs: MuscleGroupsData = musclesEs;
    const muscleGroupsEn: MuscleGroupsData = musclesEn;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        muscleGroups: [] as string[],
        instructions: '',
    });

    const [errors, setErrors] = useState<any>({});

    const [muscleGroupsList, setMuscleGroupsList] = useState<string[]>([]);
    // Cambiar el useEffect para que se base en la variable "language" y no en "t"
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name as string]: value,
        });
    };

    const handleMuscleGroupChange = (event: SelectChangeEvent<string[]>) => {
        setFormData({ ...formData, muscleGroups: event.target.value as string[] });
    };

    const handleMediaUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setMedia(file); // Guarda el archivo directamente
            setMediaPreview(URL.createObjectURL(file)); // Genera una URL temporal para la vista previa
        }
    };
    
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        const accessToken = localStorage.getItem('access_token');
    
        if (!formData.name || !formData.description || !formData.muscleGroups.length || !formData.instructions) {
            setErrors({ form: 'Todos los campos son obligatorios' });
            return;
        }
    
        if (!accessToken) {
            console.error(t('no_token'));
            return;
        }
    
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('muscleGroups', JSON.stringify(formData.muscleGroups)); // Convertimos muscleGroups a JSON
        formDataToSend.append('instructions', formData.instructions);
    
        if (media) {
            formDataToSend.append('media', media); // Adjuntar el archivo de media
        }
    
        try {
            const response = await fetch('http://127.0.0.1:8000/api/exercises/create/', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: formDataToSend, // Asegúrate de enviar FormData
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log('Ejercicio creado con éxito:', data);
                history.push('/admin/workout');
            } else {
                const data = await response.json();
                console.error('Error al crear el ejercicio:', data);
                setErrors({ form: 'Error al crear el ejercicio. Verifique los datos.' });
            }
        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
            setErrors({ form: 'Error de conexión. Inténtelo más tarde.' });
        }
    };
    
    
    

    const handleCancel = () => {
        history.push('/admin/workout');
    };


    return (
        <Box sx={{ pb: 10, pt: 5, backgroundColor: '#f5f5f5' }}>
            <Header title={t('add_exercise_title')} />

            <Box sx={{ p: 3, mt: 2, backgroundColor: '#f5f5f5' }}>
                <form>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                label={t('exercise_name')}
                                name="name"
                                value={formData.name}
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
                                multiline
                                rows={3}
                                value={formData.description}
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
                            <InputLabel sx={{ color: '#555555', marginBottom: 1 }}>{t('muscle_groups')}</InputLabel>
                            <Select
                                fullWidth
                                multiple
                                value={formData.muscleGroups}
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
                                multiline
                                rows={4}
                                value={formData.instructions}
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
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                fullWidth
                                variant="outlined"
                                startIcon={<CameraAlt />}
                                sx={{
                                    color: '#000',
                                    borderColor: '#000',
                                    fontWeight: 'bold',
                                    py: 1.5,
                                    '&:hover': { backgroundColor: '#f5f5f5' },
                                }}
                            >
                                {t('upload_image_video')}
                            </Button>
                            {media && (
                                <Box mt={2} textAlign="center">
                                    {mediaPreview && <img src={mediaPreview} alt="Preview" style={{ width: '100%', borderRadius: '8px' }} />}
                                    <IconButton onClick={() => setMedia(null)} aria-label="delete" color="error">
                                        <Close />
                                    </IconButton>
                                </Box>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box display="flex" gap={2} sx={{ mt: 2 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={handleCancel}
                                    sx={{
                                        color: '#777',
                                        borderColor: '#777',
                                        fontWeight: 'bold',
                                        py: 1,
                                        borderRadius: '8px',
                                    }}
                                >
                                    {t('cancel')}
                                </Button>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleSubmit}
                                    sx={{
                                        backgroundColor: '#555',
                                        color: '#FFF',
                                        fontWeight: 'bold',
                                        py: 1,
                                        borderRadius: '8px',
                                        '&:hover': { backgroundColor: '#333' },
                                    }}
                                >
                                    {t('save')}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Box>
    );
};
export default AddExercises;
