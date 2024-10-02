import React, { useState, useRef } from 'react';
import {
    TextField, Button, Grid, Container, MenuItem, Select
} from '@mui/material';
import { IonActionSheet, IonAvatar, IonButton, IonIcon } from '@ionic/react';
import { cameraOutline, imageOutline, trashOutline, closeOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import Header from '../../Header/Header';

const ModifyUserPage: React.FC = () => {
    const history = useHistory();
    const location = useLocation();

    // Recibir datos del usuario seleccionado desde la lista de usuarios
    const { userData } = (location.state || {
        userData: {},
    }) as { userData: any };

    // Estado local para manejar los datos editados (inicializado con los datos del usuario)
    const [profileData, setProfileData] = useState({
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
        currentWeight: userData?.currentWeight || 0,
        weightGoal: userData?.weightGoal || '',
        activityLevel: userData?.activityLevel || '',
        trainingFrequency: userData?.trainingFrequency || 0,
        role: userData?.role || '', // Añadir el rol al estado.
    });

    const [profilePicture, setProfilePicture] = useState('https://via.placeholder.com/150');
    const [showActionSheet, setShowActionSheet] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        console.log('Datos guardados:', profileData);
        history.push('/users'); // Redirigir a la página de administración después de guardar
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoOption = (option: string) => {
        if (option === 'upload') {
            fileInputRef.current?.click();
        } else if (option === 'take') {
            console.log('Tomar una foto');
        } else if (option === 'delete') {
            setProfilePicture('https://via.placeholder.com/150');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
    };

    const handleSelectChange = (e: any) => {
        setProfileData({ ...profileData, role: e.target.value });
    };

    return (
        <Container component="main" maxWidth="xs" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header title="Modificar Usuario" />

            <div style={{ marginTop: '2rem', textAlign: 'center', flexGrow: 1 }}>
                {/* Sección de cambiar imagen de perfil */}
                <IonAvatar
                    className="custom-avatar"
                    style={{
                        width: '100px',  // Reducido el tamaño del avatar
                        height: '100px',  // Reducido el tamaño del avatar
                        border: '1.5px solid var(--color-verde-lima)',  // Reducido el grosor del borde
                        borderRadius: '50%',
                        overflow: 'hidden',
                        marginBottom: '0px',
                    }}
                >
                    <img
                        src={profilePicture}
                        alt="Foto de perfil"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '50%',
                        }}
                    />
                </IonAvatar>
                <IonButton
                    style={{
                        color: 'var(--color-verde-lima)',
                        fontSize: '12px',  // Reducido el tamaño del texto del botón
                        margin: '0px'
                    }}
                    fill="clear"
                    onClick={() => setShowActionSheet(true)}
                >
                    <IonIcon icon={cameraOutline} style={{ fontSize: '16px' }} /> {/* Reducido el tamaño del ícono */}
                    Cambiar foto
                </IonButton>

                {/* Action Sheet para opciones de foto */}
                <IonActionSheet
                    isOpen={showActionSheet}
                    onDidDismiss={() => setShowActionSheet(false)}
                    buttons={[
                        {
                            text: 'Subir una foto',
                            icon: imageOutline,
                            handler: () => handlePhotoOption('upload'),
                        },
                        {
                            text: 'Tomar una foto',
                            icon: cameraOutline,
                            handler: () => handlePhotoOption('take'),
                        },
                        {
                            text: 'Eliminar foto',
                            role: 'destructive',
                            icon: trashOutline,
                            handler: () => handlePhotoOption('delete'),
                        },
                        {
                            text: 'Cancelar',
                            icon: closeOutline,
                            role: 'cancel',
                        },
                    ]}
                />

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />

                <form onSubmit={handleSave}>
                    <Grid container spacing={2}>
                        {/* Campo de nombre */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="firstName"
                                label="Nombre"
                                name="firstName"
                                value={profileData.firstName}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* Campo de apellidos */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="lastName"
                                label="Apellidos"
                                name="lastName"
                                value={profileData.lastName}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* Campo de peso actual */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                type="number"
                                id="currentWeight"
                                label="Peso Actual (kg)"
                                name="currentWeight"
                                value={profileData.currentWeight}
                                onChange={handleChange}
                            />
                        </Grid>

                        {/* Selector de meta de peso */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                select
                                fullWidth
                                id="weightGoal"
                                label="Meta de Peso"
                                name="weightGoal"
                                value={profileData.weightGoal}
                                onChange={handleChange}
                            >
                                <MenuItem value="Perder peso">Perder peso</MenuItem>
                                <MenuItem value="Ganar masa muscular">Ganar masa muscular</MenuItem>
                                <MenuItem value="Mantener peso">Mantener peso</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Selector de nivel de actividad */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                select
                                fullWidth
                                id="activityLevel"
                                label="Nivel de Actividad"
                                name="activityLevel"
                                value={profileData.activityLevel}
                                onChange={handleChange}
                            >
                                <MenuItem value="Sedentario">Sedentario</MenuItem>
                                <MenuItem value="Ligera">Ligera</MenuItem>
                                <MenuItem value="Moderada">Moderada</MenuItem>
                                <MenuItem value="Intensa">Intensa</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Selector de frecuencia de entrenamiento */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                select
                                fullWidth
                                id="trainingFrequency"
                                label="Frecuencia de Entrenamiento (días/semana)"
                                name="trainingFrequency"
                                value={profileData.trainingFrequency}
                                onChange={handleChange}
                            >
                                <MenuItem value="1">1</MenuItem>
                                <MenuItem value="2">2</MenuItem>
                                <MenuItem value="3">3</MenuItem>
                                <MenuItem value="4">4</MenuItem>
                                <MenuItem value="5">5</MenuItem>
                                <MenuItem value="6">6</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Selector de rol */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                select
                                fullWidth
                                id="role"
                                label="Rol"
                                name="role"
                                value={profileData.role}
                                onChange={handleSelectChange}
                            >
                                <MenuItem value="cliente">Cliente</MenuItem>
                                <MenuItem value="administrador">Administrador</MenuItem>
                                <MenuItem value="entrenador">Entrenador</MenuItem>
                                <MenuItem value="nutricionista">Nutricionista</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </form>
            </div>

            {/* Botón de guardar cambios */}
            <div style={{ padding: '1rem 0', marginTop: 'auto', marginBottom: '15%' }}>
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    style={{
                        backgroundColor: 'var(--color-verde-lima)',
                        color: 'var(--color-blanco)',
                    }}
                    onClick={handleSave}
                >
                    Guardar cambios
                </Button>
            </div>
        </Container>
    );
};

export default ModifyUserPage;
