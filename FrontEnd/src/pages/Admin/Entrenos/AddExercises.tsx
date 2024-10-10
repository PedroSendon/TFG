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
    SelectChangeEvent
} from '@mui/material'; // Importación de componentes de Material UI.
import { useHistory } from 'react-router-dom'; // Hook para redirección.
import { IonFabButton, IonIcon, IonContent, IonPage } from '@ionic/react';
import { cameraOutline } from 'ionicons/icons';  // Icono de cámara para subir imágenes/videos.
import Header from '../../Header/Header';  // Importación del Header
import '../../../theme/variables.css'; // Archivo de estilos personalizados.
import { LanguageContext } from '../../../context/LanguageContext';

const AddExercises: React.FC = () => {
    const history = useHistory(); 
    const [media, setMedia] = useState<string | null>(null);  
    const fileInputRef = useRef<HTMLInputElement>(null);  
    const { t } = useContext(LanguageContext); // Usar el contexto de idioma

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        muscleGroups: [] as string[], 
        instructions: '',
    });

    const [errors, setErrors] = useState<any>({});

    const [muscleGroupsList, setMuscleGroupsList] = useState<string[]>([]); // Estado para almacenar los grupos musculares desde la BD

    // Obtener los grupos musculares desde el backend al cargar la página
    useEffect(() => {
        const fetchMuscleGroups = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/exercises/muscle-groups/');
                const data = await response.json();
                setMuscleGroupsList(data.data.map((group: { name: string }) => group.name));
            } catch (error) {
                console.error('Error al obtener los grupos musculares:', error);
            }
        };

        fetchMuscleGroups();
    }, []);

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
            const reader = new FileReader();
            reader.onloadend = () => {
                setMedia(reader.result as string);  
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar los campos antes de enviarlos al backend
        if (!formData.name || !formData.description || !formData.muscleGroups.length || !formData.instructions) {
            setErrors({ ...errors, form: 'Todos los campos son obligatorios' });
            return;
        }

        // Realizar la solicitud al backend
        try {
            const response = await fetch('http://127.0.0.1:8000/api/exercises/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Si usas JWT
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    muscleGroups: formData.muscleGroups,
                    instructions: formData.instructions,
                    media: media,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Ejercicio creado con éxito:', data);
                history.push('/admin/exercises');  
            } else {
                console.error('Error al crear el ejercicio:', data);
                setErrors({ ...errors, form: 'Error al crear el ejercicio. Verifique los datos.' });
            }
        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
            setErrors({ ...errors, form: 'Error de conexión. Inténtelo más tarde.' });
        }
    };

    const handleCancel = () => {
        history.push('/admin/exercises');  
    };


    return (
        <IonPage>
            {/* Header reutilizable */}
            <Header title={t('add_exercise_title')} /> {/* Reemplaza el título con la variable de idioma */}
    
            <IonContent>
                <Container component="main" maxWidth="xs" style={{ paddingBottom: '80px' }}>
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        {/* Formulario */}
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2}>
                                {/* Campo de nombre */}
                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="name"
                                        label={t('exercise_name')} 
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
    
                                {/* Campo de descripción */}
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
    
                                {/* Selección múltiple de grupos musculares */}
                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        select
                                        label={t('muscle_groups')} 
                                        value={formData.muscleGroups}
                                        onChange={(event) => handleMuscleGroupChange(event as SelectChangeEvent<string[]>)}
                                        SelectProps={{
                                            multiple: true,
                                            renderValue: (selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {(selected as string[]).map((value) => (
                                                        <Chip key={value} label={value} />
                                                    ))}
                                                </Box>
                                            ),
                                        }}
                                        sx={{
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
                                    >
                                        {muscleGroupsList.map((muscle) => (
                                            <MenuItem key={muscle} value={muscle}>
                                                {muscle}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
    
                                {/* Campo de instrucciones */}
                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        id="instructions"
                                        label={t('instructions')}
                                        name="instructions"
                                        multiline
                                        rows={4}
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
    
                                {/* Botón para subir imagen o video */}
                                <Grid item xs={12} className="ion-text-center">
                                    <Button
                                        onClick={handleMediaUpload}
                                        variant="contained"
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
                                        <IonIcon icon={cameraOutline} style={{ color: '#32CD32', marginRight: '10px' }} />
                                        {t('upload_image_video')} {/* Texto traducido */}
                                    </Button>
    
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
    
                                    {media && <img src={media} alt="Preview" style={{ width: '100%', marginTop: '10px' }} />}
                                </Grid>
    
                            </Grid>
                        </form>
                    </div>
                </Container>
    
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
                                {t('cancel')} {/* Texto traducido */}
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
                                {t('save')} {/* Texto traducido */}
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </IonContent>
        </IonPage>
    );
};
export default AddExercises;
