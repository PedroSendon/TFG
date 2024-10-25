import React, { useState, useRef } from 'react';
import {
    TextField, Button, Grid, Container, MenuItem, Select
} from '@mui/material';
import { IonActionSheet, IonAvatar, IonButton, IonIcon, IonPage } from '@ionic/react';
import { cameraOutline, imageOutline, trashOutline, closeOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import Header from '../../Header/Header';
import { useContext } from 'react';
import { LanguageContext } from '../../../context/LanguageContext';

const ModifyUserPage: React.FC = () => {
    const history = useHistory();
    const location = useLocation();
    const { t } = useContext(LanguageContext); // Usamos el contexto de idioma

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

    const handleSave = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
      
            if (!accessToken) {
              console.error(t('no_token'));
              return;
            }
            const response = await fetch(`http://127.0.0.1:8000/api/users/update/${userData.id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`, // Si necesitas un token de autenticación
                },
                body: JSON.stringify({
                    first_name: profileData.firstName,
                    last_name: profileData.lastName,
                    currentWeight: profileData.currentWeight,
                    weightGoal: profileData.weightGoal,
                    activityLevel: profileData.activityLevel,
                    trainingFrequency: profileData.trainingFrequency,
                    role: profileData.role,
                }),
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log(t('user_updated'), data);
                history.push('/admin/users'); // Redirigir a la página de administración después de guardar
            } else {
                console.error(t('update_error'));
            }
        } catch (error) {
            console.error(t('request_error'), error);
        }
    };
    const handleCancel = () => {
        history.push('/admin/users');  // Cancelar y redirigir a la lista de ejercicios
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
            console.log(t('take_photo'));
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
        <IonPage>
        <Container component="main" maxWidth="xs" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header title={t('modify_user')} />

            <div style={{ marginTop: '2rem', textAlign: 'center', flexGrow: 1 }}>
                {/* Sección de cambiar imagen de perfil */}
                <IonAvatar
                    className="custom-avatar"
                    style={{
                        width: '100px',  
                        height: '100px',  
                        border: '1.5px solid var(--color-verde-lima)',  
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
                        fontSize: '12px',  
                        margin: '0px'
                    }}
                    fill="clear"
                    onClick={() => setShowActionSheet(true)}
                >
                    <IonIcon icon={cameraOutline} style={{ fontSize: '16px' }} /> 
                    {t('change_photo')}
                </IonButton>

                {/* Action Sheet para opciones de foto */}
                <IonActionSheet
                    isOpen={showActionSheet}
                    onDidDismiss={() => setShowActionSheet(false)}
                    buttons={[
                        {
                            text: t('upload_photo'),
                            icon: imageOutline,
                            handler: () => handlePhotoOption('upload'),
                        },
                        {
                            text: t('take_photo'),
                            icon: cameraOutline,
                            handler: () => handlePhotoOption('take'),
                        },
                        {
                            text: t('delete_photo'),
                            role: 'destructive',
                            icon: trashOutline,
                            handler: () => handlePhotoOption('delete'),
                        },
                        {
                            text: t('cancel'),
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
                                label={t('first_name')}
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
                                label={t('last_name')}
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
                                label={t('current_weight')}
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
                                label={t('weight_goal')}
                                name="weightGoal"
                                value={profileData.weightGoal}
                                onChange={handleChange}
                            >
                                <MenuItem value="Perder peso">{t('lose_weight')}</MenuItem>
                                <MenuItem value="Ganar masa muscular">{t('gain_muscle')}</MenuItem>
                                <MenuItem value="Mantener peso">{t('maintain_weight')}</MenuItem>
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
                                label={t('activity_level')}
                                name="activityLevel"
                                value={profileData.activityLevel}
                                onChange={handleChange}
                            >
                                <MenuItem value="Sedentario">{t('sedentary')}</MenuItem>
                                <MenuItem value="Ligera">{t('light')}</MenuItem>
                                <MenuItem value="Moderada">{t('moderate')}</MenuItem>
                                <MenuItem value="Intensa">{t('intense')}</MenuItem>
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
                                label={t('training_frequency')}
                                name="trainingFrequency"
                                value={profileData.trainingFrequency}
                                onChange={handleChange}
                            >
                                {[1, 2, 3, 4, 5, 6].map((day) => (
                                    <MenuItem key={day} value={day}>{day}</MenuItem>
                                ))}
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
                                label={t('role')}
                                name="role"
                                value={profileData.role}
                                onChange={handleSelectChange}
                            >
                                <MenuItem value="cliente">{t('client')}</MenuItem>
                                <MenuItem value="administrador">{t('admin')}</MenuItem>
                                <MenuItem value="entrenador">{t('trainer')}</MenuItem>
                                <MenuItem value="nutricionista">{t('nutritionist')}</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </form>
            </div>

            {/* Botones de Cancelar y Guardar */}
            <Grid item xs={12} style={{ padding: '1rem 0', marginBottom: '15%' }}>
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
                            {t('cancel')}
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
                            onClick={handleSave}
                        >
                            {t('save')}
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Container>
        </IonPage>
    );
};

export default ModifyUserPage;
