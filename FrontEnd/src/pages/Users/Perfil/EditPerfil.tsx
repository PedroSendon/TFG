import React, { useState, useRef, useContext } from 'react';

import { cameraOutline, imageOutline, trashOutline, closeOutline } from 'ionicons/icons';
import { TextField, Button, MenuItem, Grid, Container, Snackbar, Modal, Box, Typography, IconButton, Avatar } from '@mui/material'; // Importar TextField y otros componentes de MUI
import './EditPerfil.css';
import { useHistory, useLocation } from 'react-router-dom';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext'; // Importa el contexto de idioma
import { usePlansContext } from '../../../context/PlansContext'; // Importa el hook personalizado
import { CameraAlt } from '@mui/icons-material';

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
        profilePicture: userData.profilePicture || 'https://via.placeholder.com/150',
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [profilePicture, setProfilePicture] = useState('https://via.placeholder.com/150');
    const [showToast, setShowToast] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);  // Modal para cambiar la contraseña
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { setPlansAssigned } = usePlansContext(); // Usa el hook para obtener `setPlansAssigned`

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
              'Authorization': `Bearer ${accessToken}`,
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
            setPlansAssigned(false); // Cambia el estado en el contexto
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
        <Container maxWidth="sm" sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', mt: 2, p: 3, borderRadius: '8px' }}>
  
            <Header title={t('edit_profile')} />

            <Box textAlign="center" mb={3}>
                <Avatar
                    src={profileData.profilePicture}
                    alt="Preview"
                    sx={{
                        width: 150, height: 150, mx: 'auto', borderRadius: '8px', border: '2px solid #000', mt:'18%'
                    }}
                />
                <Button
                    variant="outlined"
                    startIcon={<CameraAlt />}
                    onClick={() => fileInputRef.current?.click()}
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

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h6">{t('personal_information')}</Typography>
                </Grid>

                {/* First Name Input */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label={t('first_name')}
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
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

                {/* Last Name Input */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label={t('last_name')}
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
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

                {/* Current Weight Input */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label={t('current_weight')}
                        type="number"
                        value={profileData.currentWeight}
                        onChange={(e) => setProfileData({ ...profileData, currentWeight: e.target.value })}
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

                {/* Weight Goal Input */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        select
                        variant="outlined"
                        label={t('weight_goal')}
                        value={profileData.weightGoal}
                        onChange={(e) => setProfileData({ ...profileData, weightGoal: e.target.value })}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                '& fieldset': { borderColor: '#CCCCCC' },
                                '&:hover fieldset': { borderColor: '#AAAAAA' },
                                '&.Mui-focused fieldset': { borderColor: '#555555' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                        }}
                    >
                        <MenuItem value="Perder peso">{t('lose_weight')}</MenuItem>
                        <MenuItem value="Ganar masa muscular">{t('gain_muscle')}</MenuItem>
                        <MenuItem value="Mantener el peso actual">{t('maintain_weight')}</MenuItem>
                    </TextField>
                </Grid>

                {/* Activity Level Input */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        select
                        variant="outlined"
                        label={t('activity_level')}
                        value={profileData.activityLevel}
                        onChange={(e) => setProfileData({ ...profileData, activityLevel: e.target.value })}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                '& fieldset': { borderColor: '#CCCCCC' },
                                '&:hover fieldset': { borderColor: '#AAAAAA' },
                                '&.Mui-focused fieldset': { borderColor: '#555555' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                        }}
                    >
                        <MenuItem value="Sedentario">{t('sedentary')}</MenuItem>
                        <MenuItem value="Ligera">{t('light')}</MenuItem>
                        <MenuItem value="Moderada">{t('moderate')}</MenuItem>
                        <MenuItem value="Intensa">{t('intense')}</MenuItem>
                    </TextField>
                </Grid>

                {/* Training Frequency Input */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        select
                        variant="outlined"
                        label={t('training_frequency')}
                        value={profileData.trainingFrequency}
                        onChange={(e) => setProfileData({ ...profileData, trainingFrequency: parseInt(e.target.value) })}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                '& fieldset': { borderColor: '#CCCCCC' },
                                '&:hover fieldset': { borderColor: '#AAAAAA' },
                                '&.Mui-focused fieldset': { borderColor: '#555555' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                        }}
                    >
                        {[1, 2, 3, 4, 5, 6].map((day) => (
                            <MenuItem key={day} value={day}>{day}</MenuItem>
                        ))}
                    </TextField>
                </Grid>

                {/* Button to open password change modal */}
                <Grid item xs={12}>
                    <Button
                        fullWidth
                        variant="outlined"
                        sx={{
                            color: '#555',
                            borderColor: '#555',
                            fontWeight: 'bold',
                            py: 1.5,
                            borderRadius: '8px',
                            '&:hover': { backgroundColor: '#f5f5f5' },
                        }}
                        onClick={() => setShowPasswordModal(true)}
                    >
                        {t('change_password')}
                    </Button>
                </Grid>

                {/* Botones de Cancelar y Guardar */}
                <Grid item xs={12}>
                    <Grid container spacing={2} sx={{ mb: 6 }}>
                        <Grid item xs={6}>
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
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleSave}
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
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            {/* Modal for Password Change */}
            <Modal open={showPasswordModal} onClose={() => setShowPasswordModal(false)}>
                <Box sx={{ p: 4, backgroundColor: '#FFF', borderRadius: '8px', mx: 'auto', my: 5, maxWidth: 400 }}>
                    <Typography variant="h6" align="center" gutterBottom>{t('change_password')}</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label={t('current_password')}
                                type="password"
                                value={passwords.currentPassword}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                                }}
                                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label={t('new_password')}
                                type="password"
                                value={passwords.newPassword}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                                }}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label={t('confirm_password')}
                                type="password"
                                value={passwords.confirmPassword}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                                }}
                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            />
                        </Grid>

                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={6}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    sx={{
                                        color: '#777', borderColor: '#777', fontWeight: 'bold', py: 1, borderRadius: '8px',
                                    }}
                                    onClick={() => setShowPasswordModal(false)}
                                >
                                    {t('cancel')}
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    sx={{
                                        backgroundColor: '#555', color: '#FFF', fontWeight: 'bold', py: 1, borderRadius: '8px', '&:hover': { backgroundColor: '#333' },
                                    }}
                                    onClick={handleChangePassword}
                                >
                                    {t('save')}
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>

            <Snackbar
                open={showToast}
                autoHideDuration={2000}
                onClose={() => setShowToast(false)}
                message={t('changes_saved')}
            />
        </Container>
    );
};

export default EditProfilePage;
