import React, { useState, useRef, useContext } from 'react';
import {
    IonPage,
    IonHeader,
    IonActionSheet,
    IonTitle,
    IonContent,
    IonAvatar,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonModal,
    IonToast,
    IonIcon,
} from '@ionic/react';
import { cameraOutline, imageOutline, trashOutline, closeOutline } from 'ionicons/icons';
import { TextField, Button, MenuItem, Grid } from '@mui/material'; // Importar TextField y otros componentes de MUI
import './EditPerfil.css';
import { useHistory, useLocation } from 'react-router-dom';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext'; // Importa el contexto de idioma

const EditProfilePage: React.FC = () => {
    const { t } = useContext(LanguageContext); // Usamos el contexto de idioma
    const history = useHistory();
    const location = useLocation();
    const { userData } = (location.state || {
        userData: {},
    }) as { userData: any };

    const [profileData, setProfileData] = useState({
        firstName: userData?.username?.split(' ')[0] || '',
        lastName: userData?.username?.split(' ')[1] || '',
        currentWeight: userData.currentWeight || 0,
        weightGoal: userData.weightGoal || '',
        activityLevel: userData.activityLevel || '',
        trainingFrequency: userData.trainingFrequency || 0,
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [profilePicture, setProfilePicture] = useState('https://via.placeholder.com/150');
    const [showToast, setShowToast] = useState(false);
    const [showActionSheet, setShowActionSheet] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);  // Modal para cambiar la contraseña
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');

            if (!accessToken) {
                console.error(t('no_token'));
                return;
            }
            const response = await fetch('http://127.0.0.1:8000/api/profile/update/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,  // Agrega el token JWT aquí
                },
                body: JSON.stringify({
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    currentWeight: profileData.currentWeight,
                    weightGoal: profileData.weightGoal,
                    activityLevel: profileData.activityLevel,
                    trainingFrequency: profileData.trainingFrequency,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(t('profile_updated'), data);
                history.push('/profile'); // Redirige al perfil
            } else {
                console.error(t('profile_update_error'), response.statusText);
            }
        } catch (error) {
            console.error(t('request_error'), error);
        }
    };

    const handleCancel = () => {
        history.push('/profile'); // Redirige al perfil sin guardar cambios
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('profilePhoto', file);

            try {
                const response = await fetch('http://127.0.0.1:8000/api/profile/photo/', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Asegúrate de incluir el token de autenticación
                    },
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    setProfilePicture(data.profilePhotoUrl); // Actualiza la foto en el frontend
                } else {
                    console.error(t('photo_upload_error'), response.statusText);
                }
            } catch (error) {
                console.error(t('request_error'), error);
            }
        }
    };

    const handlePhotoOption = (option: string) => {
        if (option === 'upload') {
            fileInputRef.current?.click();
        } else if (option === 'delete') {
            setProfilePicture('https://via.placeholder.com/150');
        }
    };

    const handleChangePassword = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            console.error(t('password_mismatch'));
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/profile/password/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Asegúrate de incluir el token de autenticación
                },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword,
                    confirmPassword: passwords.confirmPassword,
                }),
            });

            if (response.ok) {
                setShowPasswordModal(false);
                setShowToast(true); // Mostrar un mensaje de éxito
            } else {
                const errorData = await response.json();
                console.error(t('password_change_error'), errorData.error);
            }
        } catch (error) {
            console.error(t('request_error'), error);
        }
    };

    return (
        <IonPage>
            <Header title={t('edit_profile')} onBack={handleCancel} showBackButton={true}  />

            <IonContent>
                <IonGrid>
                    <IonRow className="ion-text-center">
                        <IonCol size="12">
                            <IonAvatar
                                className="custom-avatar"
                                style={{
                                    width: '150px',
                                    height: '150px',
                                    border: '2px solid var(--color-verde-lima)',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    marginBottom: '0px',
                                }}
                            >
                                <img
                                    src={profilePicture}
                                    alt={t('profile_picture')}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: '50%',
                                    }}
                                />
                            </IonAvatar>
                            <IonButton
                                style={{ color: 'var(--color-verde-lima)' }}
                                fill="clear"
                                onClick={() => setShowActionSheet(true)}
                            >
                                <IonIcon icon={cameraOutline} /> {t('change_photo')}
                            </IonButton>
                        </IonCol>
                    </IonRow>

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

                    <hr style={{ height: '1px', backgroundColor: '#d1d1d6' }} />
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />

                    <IonRow>
                        <IonCol size="12">
                            <h3>{t('personal_information')}</h3>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <TextField
                                fullWidth
                                label={t('first_name')}
                                variant="outlined"
                                value={profileData.firstName}
                                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                            />
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <TextField
                                fullWidth
                                label={t('last_name')}
                                variant="outlined"
                                value={profileData.lastName}
                                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                            />
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <TextField
                                fullWidth
                                label={t('current_weight')}
                                variant="outlined"
                                type="number"
                                value={profileData.currentWeight}
                                onChange={(e) => setProfileData({ ...profileData, currentWeight: parseFloat(e.target.value) })}
                            />
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <Button
                                type="submit"
                                style={{
                                    border: '1px solid #000',
                                    backgroundColor: '#FFFFFF',
                                    color: '#000',
                                    padding: '3% 0',
                                    borderRadius: '5px',
                                    fontSize: '1em',
                                    width: '100%',
                                }}
                                onClick={() => setShowPasswordModal(true)}
                            >
                                {t('change_password')}
                            </Button>
                        </IonCol>
                    </IonRow>

                    <hr style={{ height: '1px', backgroundColor: '#d1d1d6' }} />

                    <IonRow>
                        <IonCol size="12">
                            <h3>{t('sports_information')}</h3>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <TextField
                                fullWidth
                                label={t('weight_goal')}
                                select
                                variant="outlined"
                                value={profileData.weightGoal}
                                onChange={(e) => setProfileData({ ...profileData, weightGoal: e.target.value })}
                            >
                                <MenuItem value="Perder peso">{t('lose_weight')}</MenuItem>
                                <MenuItem value="Ganar masa muscular">{t('gain_muscle')}</MenuItem>
                                <MenuItem value="Mantener el peso actual">{t('maintain_weight')}</MenuItem>
                            </TextField>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <TextField
                                fullWidth
                                label={t('activity_level')}
                                select
                                variant="outlined"
                                value={profileData.activityLevel}
                                onChange={(e) => setProfileData({ ...profileData, activityLevel: e.target.value })}
                            >
                                <MenuItem value="Sedentario">{t('sedentary')}</MenuItem>
                                <MenuItem value="Ligera">{t('light')}</MenuItem>
                                <MenuItem value="Moderada">{t('moderate')}</MenuItem>
                                <MenuItem value="Intensa">{t('intense')}</MenuItem>
                            </TextField>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <TextField
                                fullWidth
                                label={t('training_frequency')}
                                select
                                variant="outlined"
                                value={profileData.trainingFrequency}
                                onChange={(e) => setProfileData({ ...profileData, trainingFrequency: parseInt(e.target.value) })}
                            >
                                {[1, 2, 3, 4, 5, 6].map((day) => (
                                    <MenuItem key={day} value={day}>{day}</MenuItem>
                                ))}
                            </TextField>
                        </IonCol>
                    </IonRow>

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
                                        border: '1px solid #000',
                                        backgroundColor: '#FFFFFF',
                                        color: '#000',
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
                </IonGrid>

                <IonModal isOpen={showPasswordModal} onDidDismiss={() => setShowPasswordModal(false)}>
                    <Header title={t('change_password')} />
                    <IonContent>
                        <IonGrid>
                            <IonRow>
                                <IonCol size="12">
                                    <TextField
                                        fullWidth
                                        label={t('current_password')}
                                        variant="outlined"
                                        type="password"
                                        value={passwords.currentPassword}
                                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    />
                                </IonCol>
                            </IonRow>

                            <IonRow>
                                <IonCol size="12">
                                    <TextField
                                        fullWidth
                                        label={t('new_password')}
                                        variant="outlined"
                                        type="password"
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    />
                                </IonCol>
                            </IonRow>

                            <IonRow>
                                <IonCol size="12">
                                    <TextField
                                        fullWidth
                                        label={t('confirm_password')}
                                        variant="outlined"
                                        type="password"
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    />
                                </IonCol>
                            </IonRow>

                            <Grid item xs={12} style={{ padding: '1rem 0', marginBottom: '15%' }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Button
                                            onClick={() => setShowPasswordModal(false)}
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
                                                border: '1px solid #000',
                                                backgroundColor: '#FFFFFF',
                                                color: '#000',
                                                padding: '3% 0',
                                                borderRadius: '5px',
                                                fontSize: '1em',
                                                width: '100%',
                                            }}
                                            onClick={handleChangePassword}
                                        >
                                            {t('save')}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </IonGrid>
                    </IonContent>
                </IonModal>

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={t('changes_saved')}
                    duration={2000}
                />
            </IonContent>
        </IonPage>
    );
};

export default EditProfilePage;
