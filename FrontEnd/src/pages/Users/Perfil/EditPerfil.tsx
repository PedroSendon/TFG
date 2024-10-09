import React, { useState, useRef } from 'react';
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

const EditProfilePage: React.FC = () => {
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
            const response = await fetch('http://127.0.0.1:8000/api/profile/update/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
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
                console.log('Perfil actualizado:', data);
                history.push('/profile'); // Redirige al perfil
            } else {
                console.error('Error al actualizar el perfil:', response.statusText);
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
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
                    console.error('Error al subir la foto:', response.statusText);
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
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
            console.error('Las contraseñas no coinciden');
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
                console.error('Error al cambiar la contraseña:', errorData.error);
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    };
    

    return (
        <IonPage>
            <Header title="Edit profile" />

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
                                style={{ color: 'var(--color-verde-lima)' }}
                                fill="clear"
                                onClick={() => setShowActionSheet(true)}
                            >
                                <IonIcon icon={cameraOutline} /> Change photo
                            </IonButton>
                        </IonCol>
                    </IonRow>

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

                    {/* Información Personal */}
                    <IonRow>
                        <IonCol size="12">
                            <h3>Personal Information</h3>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <TextField
                                fullWidth
                                label="Name"
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
                                label="Last name"
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
                                label="Current Weight (kg)"
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
                                border: '1px solid #32CD32',
                                backgroundColor: '#FFFFFF',
                                color: '#32CD32',
                                padding: '3% 0',
                                borderRadius: '5px',
                                fontSize: '1em',
                                width: '100%',
                            }}
                            onClick={() => setShowPasswordModal(true)}
                        >
                            Change password
                        </Button>
                        </IonCol>
                    </IonRow>

                    {/* Divider */}
                    <hr style={{ height: '1px', backgroundColor: '#d1d1d6' }} />

                    {/* Información Deportiva */}
                    <IonRow>
                        <IonCol size="12">
                            <h3>Sports Information</h3>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <TextField
                                fullWidth
                                label="Weight Target"
                                select
                                variant="outlined"
                                value={profileData.weightGoal}
                                onChange={(e) => setProfileData({ ...profileData, weightGoal: e.target.value })}
                            >
                                <MenuItem value="Perder peso">Lose weight</MenuItem>
                                <MenuItem value="Ganar masa muscular">Gain muscle mass</MenuItem>
                                <MenuItem value="Mantener el peso actual">Maintain current weight</MenuItem>
                                <MenuItem value="Mejorar resistencia física">Improve physical resistance</MenuItem>
                                <MenuItem value="Aumentar fuerza">Increase strength</MenuItem>
                            </TextField>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <TextField
                                fullWidth
                                label="Activity Level"
                                select
                                variant="outlined"
                                value={profileData.activityLevel}
                                onChange={(e) => setProfileData({ ...profileData, activityLevel: e.target.value })}
                            >
                                <MenuItem value="Sedentario">Sedentary</MenuItem>
                                <MenuItem value="Ligera">Light</MenuItem>
                                <MenuItem value="Moderada">Moderate</MenuItem>
                                <MenuItem value="Intensa">Intense</MenuItem>
                            </TextField>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <TextField
                                fullWidth
                                label="Training Frequency (days/week)"
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
                                    CANCEL
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
                                    SAVE
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </IonGrid>

                {/* Modal para cambiar la contraseña */}
                <IonModal isOpen={showPasswordModal} onDidDismiss={() => setShowPasswordModal(false)}>
                    <Header title="Change password" />
                    <IonContent>
                        <IonGrid>
                            <IonRow>
                                <IonCol size="12">
                                    <TextField
                                        fullWidth
                                        label="Current Password"
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
                                        label="New Password"
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
                                        label="Confirm New Password"
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
                                            CANCEL
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
                                            onClick={handleChangePassword}
                                        >
                                            SAVE
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
                    message="Changes saved successfully"
                    duration={2000}
                />
            </IonContent>
        </IonPage>
    );
};

export default EditProfilePage;
