import React, { useState, useRef } from 'react';
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
    SelectChangeEvent
} from '@mui/material'; // Importación de componentes de Material UI.
import { useHistory } from 'react-router-dom'; // Hook para redirección.
import { IonFabButton, IonIcon, IonContent, IonPage, IonLabel } from '@ionic/react';
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
        // Lógica para validar y enviar el formulario.
        console.log('Ejercicio agregado:', formData, media);
        history.push('/admin/exercises');  // Redirigir a la página de ejercicios después de agregar.
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

                                {/* Selección múltiple de grupos musculares (ahora con el mismo estilo) */}
                                <Grid item xs={12}>
                                    <InputLabel
                                        id="muscleGroups-label"
                                        style={{
                                            color: 'var(--color-gris-oscuro)',
                                            marginBottom: '5px',
                                        }}
                                    >
                                        Muscle Groups
                                    </InputLabel>
                                    <Select
                                        labelId="muscleGroups-label"
                                        id="muscleGroups"
                                        multiple
                                        fullWidth
                                        value={formData.muscleGroups}
                                        onChange={handleMuscleGroupChange}
                                        input={<OutlinedInput id="select-multiple-chip" />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {(selected as string[]).map((value) => (
                                                    <Chip key={value} label={value} />
                                                ))}
                                            </Box>
                                        )}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: 'var(--color-gris-oscuro)', // Borde gris por defecto
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'var(--color-verde-lima)', // Borde verde lima al pasar el mouse
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: 'var(--color-verde-lima)', // Borde verde lima al enfocar el input
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

                                {/* Botón para subir imagen o video, centrado */}
                                <Grid item xs={12} className="ion-text-center">
                                    {/* Botón rectangular para subir imagen o video */}
                                    <Button
                                        onClick={handleMediaUpload}
                                        variant="contained"
                                        style={{
                                            backgroundColor: '#32CD32',
                                            color: '#fff',
                                            width: '60%',    // El botón ocupa el 60% del ancho
                                            padding: '15px', // Espacio dentro del botón
                                            borderRadius: '5px', // Bordes redondeados
                                            textTransform: 'none', // Evitar que el texto esté en mayúsculas
                                            margin: '0 auto',  // Centrar el botón horizontalmente
                                            display: 'block',  // Asegurar que el botón ocupe su propio bloque
                                        }}
                                    >
                                        <IonIcon icon={cameraOutline} style={{ color: '#fff', marginRight: '10px' }} />
                                        Upload Image/Video
                                    </Button>

                                    {/* Input oculto para subir archivo */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }} // Ocultamos el input
                                        onChange={handleFileChange} // Manejo del cambio de archivo
                                    />

                                    {/* Previsualización de la imagen/video cargado */}
                                    {media && <img src={media} alt="Preview" style={{ width: '100%', marginTop: '10px' }} />}
                                </Grid>


                            </Grid>
                        </form>
                    </div>
                </Container>

                {/* Botón horizontal para añadir ejercicio */}
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    fullWidth
                    style={{
                        backgroundColor: 'var(--color-verde-lima)',
                        color: '#FFFFFF',
                        marginTop: '1rem',
                        marginBottom: '15%',
                        position: 'fixed',
                        bottom: '2%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '80%',
                        height: '50px'
                    }}
                >
                    Add Exercise
                </Button>
            </IonContent>
        </IonPage>
    );
};

export default AddExercises;
