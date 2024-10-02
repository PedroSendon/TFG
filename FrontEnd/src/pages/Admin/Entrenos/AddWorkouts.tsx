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
    Divider,
    SelectChangeEvent
} from '@mui/material'; // Importación de componentes de Material UI.
import { useHistory } from 'react-router-dom'; // Hook para redirección.
import { IonFabButton, IonIcon, IonContent, IonPage } from '@ionic/react';
import { cameraOutline } from 'ionicons/icons';  // Icono de cámara para subir imágenes/videos.
import Header from '../../Header/Header';  // Importación del Header
import '../../../theme/variables.css'; // Archivo de estilos personalizados.

const AddWorkouts: React.FC = () => {
    const history = useHistory(); // Inicializa el hook para manejar la navegación.
    const [media, setMedia] = useState<string | null>(null);  // Estado para manejar la imagen o video.
    const fileInputRef = useRef<HTMLInputElement>(null);  // Referencia al input de archivos.

    // Estado para almacenar los datos del formulario.
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        exercises: [] as { name: string; series: number; reps: number; rest: number }[],  // Ejercicios seleccionados con detalles de series, reps y descanso.
    });

    // Estado para manejar los errores de validación.
    const [errors, setErrors] = useState<any>({});

    // Lista de ejercicios (simulación, deberías obtenerlos desde el backend).
    const exercisesList = [
        'Squat', 'Deadlift', 'Bench Press', 'Pull-up', 'Push-up', 'Bicep Curl', 'Tricep Extension'
    ];

    // Manejar cambios en los campos de texto.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name as string]: value,
        });
    };

    // Manejar cambios en la selección múltiple de ejercicios.
    const handleExerciseChange = (event: SelectChangeEvent<string[]>) => {
        const selectedExercises = event.target.value as string[];
        // Inicializamos el estado para cada ejercicio seleccionado con valores predeterminados.
        const updatedExercises = selectedExercises.map((exercise) => ({
            name: exercise,
            series: 3,  // Valor predeterminado para las series
            reps: 10,   // Valor predeterminado para las repeticiones
            rest: 60,   // Valor predeterminado para el descanso en segundos
        }));
        setFormData({ ...formData, exercises: updatedExercises });
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
        console.log('Entrenamiento agregado:', formData, media);
        history.push('/admin/workouts');  // Redirigir a la página de entrenamientos después de agregar.
    };

    // Función para manejar el cambio de series, repeticiones y descanso por ejercicio.
    const handleDetailChange = (index: number, field: 'series' | 'reps' | 'rest', value: number) => {
        const updatedExercises = [...formData.exercises];
        updatedExercises[index][field] = value;
        setFormData({ ...formData, exercises: updatedExercises });
    };

    return (
        <IonPage>
            {/* Header reutilizable */}
            <Header title="Add Workout" />

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
                                        label="Workout Name"
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

                                {/* Selección múltiple de ejercicios */}
                                <Grid item xs={12}>
                                    <InputLabel
                                        id="exercises-label"
                                        style={{
                                            color: 'var(--color-gris-oscuro)',
                                            marginBottom: '5px',
                                        }}
                                    >
                                        Exercises
                                    </InputLabel>
                                    <Select
                                        labelId="exercises-label"
                                        id="exercises"
                                        multiple
                                        fullWidth
                                        value={formData.exercises.map((exercise) => exercise.name)}
                                        onChange={handleExerciseChange}
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
                                        {exercisesList.map((exercise) => (
                                            <MenuItem key={exercise} value={exercise}>
                                                {exercise}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Grid>

                                {/* Campos de series, repeticiones y descanso por ejercicio */}
                                {formData.exercises.map((exercise, index) => (
                                    <React.Fragment key={index}>
                                        <Grid container spacing={2} style={{ marginTop: '10px', padding: '0 10px' }}>
                                            <Grid item xs={12}>
                                                <Typography variant="h6" gutterBottom>
                                                    {exercise.name}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <TextField
                                                    variant="outlined"
                                                    type="number"
                                                    label="Series"
                                                    value={exercise.series}
                                                    onChange={(e) =>
                                                        handleDetailChange(index, 'series', parseInt(e.target.value))
                                                    }
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
                                            <Grid item xs={4}>
                                                <TextField
                                                    variant="outlined"
                                                    type="number"
                                                    label="Reps"
                                                    value={exercise.reps}
                                                    onChange={(e) =>
                                                        handleDetailChange(index, 'reps', parseInt(e.target.value))
                                                    }
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
                                            <Grid item xs={4}>
                                                <TextField
                                                    variant="outlined"
                                                    type="number"
                                                    label="Rest (sec)"
                                                    value={exercise.rest}
                                                    onChange={(e) =>
                                                        handleDetailChange(index, 'rest', parseInt(e.target.value))
                                                    }
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
                                        </Grid>

                                        {/* Divider para separar los ejercicios */}
                                        <Divider style={{ margin: '20px 0' }} />
                                    </React.Fragment>
                                ))}

                                {/* Botón para subir imagen o video, centrado */}
                                <Grid item xs={12} className="ion-text-center">
                                    <Button
                                        onClick={handleMediaUpload}
                                        variant="contained"
                                        style={{
                                            backgroundColor: '#32CD32',
                                            color: '#fff',
                                            width: '60%',
                                            padding: '15px',
                                            borderRadius: '5px',
                                            textTransform: 'none',
                                            margin: '0 auto',
                                            display: 'block',
                                        }}
                                    >
                                        <IonIcon icon={cameraOutline} style={{ color: '#fff', marginRight: '10px' }} />
                                        Upload Image/Video
                                    </Button>

                                    {/* Input oculto para subir archivo */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />

                                    {/* Previsualización de la imagen/video cargado */}
                                    {media && <img src={media} alt="Preview" style={{ width: '100%', marginTop: '10px' }} />}
                                </Grid>
                            </Grid>
                        </form>
                    </div>
                </Container>

                {/* Botón horizontal para añadir entrenamiento */}
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
                        height: '50px',
                    }}
                >
                    Add Workout
                </Button>
            </IonContent>
        </IonPage>
    );
};

export default AddWorkouts;
