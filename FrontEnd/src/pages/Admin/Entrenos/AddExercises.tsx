import React, { useState, useRef } from 'react';
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

const AddExercises: React.FC = () => {
    const history = useHistory(); // Inicializa el hook para manejar la navegación.
    const [media, setMedia] = useState<string | null>(null);  // Estado para manejar la imagen o video.
    const fileInputRef = useRef<HTMLInputElement>(null);  // Referencia al input de archivos.

    // Estado para almacenar los datos del formulario.
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        muscleGroups: [] as string[],  // Grupos musculares seleccionados.
        instructions: '',
    });

    // Estado para manejar los errores de validación.
    const [errors, setErrors] = useState<any>({});

    // Lista de grupos musculares.
    const muscleGroupsList = [
        'Biceps', 'Triceps', 'Chest', 'Back', 'Shoulders', 'Legs', 'Abs', 'Calves', 'Forearms', 'Glutes'
    ];

    // Manejar cambios en los campos de texto.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name as string]: value,
        });
    };

    // Manejar cambios en la selección múltiple de grupos musculares.
    const handleMuscleGroupChange = (event: SelectChangeEvent<string[]>) => {
        setFormData({ ...formData, muscleGroups: event.target.value as string[] });
    };

    // Función para manejar la subida de imágenes o videos.
    const handleMediaUpload = () => {
        fileInputRef.current?.click();
    };

    // Función para manejar la carga de archivos.
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMedia(reader.result as string);  // Almacena la imagen o video en base64.
            };
            reader.readAsDataURL(file);
        }
    };

    // Función para manejar el envío del formulario.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Ejercicio agregado:', formData, media);
        history.push('/admin/exercises');  // Redirigir a la página de ejercicios después de agregar.
    };

    const handleCancel = () => {
        history.push('/admin/exercises');  // Cancelar y redirigir a la lista de ejercicios
    };

    return (
        <IonPage>
            {/* Header reutilizable */}
            <Header title="Add Exercise" />

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
                                        label="Exercise Name"
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

                                {/* Selección múltiple de grupos musculares */}
                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        select
                                        label="Muscle Groups"
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
                                        label="Instructions"
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

                            </Grid>
                        </form>
                    </div>
                </Container>

                {/* Botones de Cancelar y Añadir */}
                <Grid container spacing={2} style={{ marginTop: '20px' }}>
                    <Grid item xs={6} className="ion-text-center">
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
                    <Grid item xs={6} className="ion-text-center">
                        <Button
                            onClick={handleSubmit}
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
                            ADD
                        </Button>
                    </Grid>
                </Grid>
            </IonContent>
        </IonPage>
    );
};

export default AddExercises;
