import React, { useState, useRef, useEffect } from 'react';
import {
    TextField, Button, Grid, Container, MenuItem, Select,
    Box,
    Avatar,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton
} from '@mui/material';
import { useHistory, useLocation } from 'react-router-dom';
import Header from '../../Header/Header';
import { useContext } from 'react';
import { LanguageContext } from '../../../context/LanguageContext';
import { CameraAlt as CameraAltIcon, Close, Delete, PhotoCamera, Image, CameraAlt } from '@mui/icons-material';


const ModifyUserPage: React.FC = () => {

    const history = useHistory();
    const location = useLocation();
    const { t } = useContext(LanguageContext);

    // Recibir ID del usuario seleccionado desde la lista de usuarios
    const { userId } = (location.state || { userId: null }) as { userId: number };

    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        currentWeight: 0,
        weightGoal: '',
        activityLevel: '',
        trainingFrequency: '', // Cambiar el valor inicial a '' en lugar de 0
        role: '',
    });


    const [profilePicture, setProfilePicture] = useState('https://via.placeholder.com/150');
    const [showActionSheet, setShowActionSheet] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchUserDetails = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error(t('no_token'));
                return;
            }

            console.log("Starting fetch for user details...");

            const response = await fetch(`http://127.0.0.1:8000/api/users/details/${userId}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Fetched user data:", data);

                setProfileData({
                    firstName: data.first_name,
                    lastName: data.last_name,
                    currentWeight: data.current_weight,
                    weightGoal: data.weight_goal,
                    activityLevel: data.activity_level,
                    trainingFrequency: data.training_frequency,
                    role: data.role,
                });
            } else {
                console.error("Fetch error: ", await response.text());
            }
        } catch (error) {
            console.error(t('request_error'), error);
        }
    };


    useEffect(() => {
        if (userId) {
            console.log("Fetching user details for userId:", userId);
            fetchUserDetails();
        } else {
            console.warn("No userId provided in location.state");
        }
    }, [userId]);

    const handleSave = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');

            if (!accessToken) {
                console.error(t('no_token'));
                return;
            }
            console.log("Datos enviados para la actualización:", {
                first_name: profileData.firstName,
                last_name: profileData.lastName,
                currentWeight: profileData.currentWeight,
                weightGoal: profileData.weightGoal,
                activityLevel: profileData.activityLevel,
                trainingFrequency: profileData.trainingFrequency,
                role: profileData.role,
            });
            const response = await fetch(`http://127.0.0.1:8000/api/users/update/${userId}/`, {
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
        <Box sx={{ backgroundColor: '#f5f5f5', height: '100vh', marginTop: '17%', paddingBottom:'5%' }}>
            {/* Header */}
            <Header title={t('modify_user')} />

            <Container component="main" maxWidth="xs" sx={{ mb: 4}}>

                {/* Image Section */}
                <Box textAlign="center" mb={3} sx={{ paddingTop: '2%' }}>
                    <Avatar
                        src={profilePicture}
                        alt="Preview"
                        sx={{
                            width: 150, height: 150, margin: '0 auto', borderRadius: '10px', border: '2px solid #000',
                        }}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<CameraAlt />}
                        onClick={() => setShowActionSheet(true)}
                        sx={{ color: '#000', borderColor: '#000', mt: 1 }}
                    >
                        {t('change_photo')}
                    </Button>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                </Box>

                <Dialog
                    open={showActionSheet}
                    onClose={() => setShowActionSheet(false)}
                    sx={{
                        '& .MuiPaper-root': {
                            borderRadius: '12px', // Bordes suaves
                            backgroundColor: '#f9f9f9', // Fondo claro
                            boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.15)', // Sombra suave
                        },
                    }}
                >
                    <DialogTitle
                        sx={{
                            color: '#333', // Color del texto del título
                            fontWeight: 'bold',
                            textAlign: 'center',
                            borderBottom: '1px solid #e0e0e0',
                            pb: 1.5,
                        }}
                    >
                        {t('photo_options')}
                        <IconButton
                            edge="end"
                            onClick={() => setShowActionSheet(false)}
                            aria-label="close"
                            sx={{
                                color: '#888', // Color gris para el botón de cierre
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                '&:hover': { color: '#555' }, // Cambio de color al hacer hover
                            }}
                        >
                            <Close sx={{ marginRight: '20px' }} />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent dividers sx={{ px: 2, py: 1.5 }}>
                        <Button
                            startIcon={<Image />}
                            fullWidth
                            onClick={() => handlePhotoOption('upload')}
                            sx={{
                                justifyContent: 'flex-start',
                                py: 1,
                                color: '#333',
                                '&:hover': { backgroundColor: '#f0f0f0' }, // Fondo claro al hacer hover
                            }}
                        >
                            {t('upload_photo')}
                        </Button>
                        <Button
                            startIcon={<Delete />}
                            fullWidth
                            onClick={() => handlePhotoOption('delete')}
                            sx={{
                                justifyContent: 'flex-start',
                                py: 1,
                                color: 'red',
                                '&:hover': { backgroundColor: '#fce8e8' }, // Fondo suave al hacer hover
                            }}
                        >
                            {t('delete_photo')}
                        </Button>
                    </DialogContent>


                </Dialog>

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />

                {/* Formulario de edición */}
                <form onSubmit={handleSave}>
                    <Grid container spacing={2}>
                        {/* Campo de texto estilo modificado */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                required
                                id="firstName"
                                label={t('first_name')}
                                name="firstName"
                                value={profileData.firstName}
                                onChange={handleSave}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#555555',
                                    },
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                required
                                id="lastName"
                                label={t('last_name')}
                                name="lastName"
                                value={profileData.lastName}
                                onChange={handleSave}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#555555',
                                    },
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                required
                                type="number"
                                id="currentWeight"
                                label={t('current_weight')}
                                name="currentWeight"
                                value={profileData.currentWeight || ''}
                                onChange={handleSave}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#555555',
                                    },
                                }}
                            />
                        </Grid>

                        {/* Select fields con estilo modificado */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                required
                                select
                                id="weightGoal"
                                label={t('weight_goal')}
                                name="weightGoal"
                                value={profileData.weightGoal}
                                onChange={handleSelectChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#555555',
                                    },
                                }}
                            >
                                <MenuItem value="Perder peso">{t('lose_weight')}</MenuItem>
                                <MenuItem value="Ganar masa muscular">{t('gain_muscle')}</MenuItem>
                                <MenuItem value="Mantener peso">{t('maintain_weight')}</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Nivel de actividad */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                required
                                select
                                id="activityLevel"
                                label={t('activity_level')}
                                name="activityLevel"
                                value={profileData.activityLevel}
                                onChange={handleSelectChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#555555',
                                    },
                                }}
                            >
                                <MenuItem value="Sedentaria">{t('sedentary')}</MenuItem>
                                <MenuItem value="Ligera">{t('light')}</MenuItem>
                                <MenuItem value="Moderada">{t('moderate')}</MenuItem>
                                <MenuItem value="Intensa">{t('intense')}</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Frecuencia de entrenamiento */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                required
                                select
                                id="trainingFrequency"
                                label={t('training_frequency')}
                                name="trainingFrequency"
                                value={profileData.trainingFrequency}
                                onChange={handleSelectChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#555555',
                                    },
                                }}
                            >
                                {[1, 2, 3, 4, 5, 6].map((day) => (
                                    <MenuItem key={day} value={day}>
                                        {day}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Selector de rol */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                required
                                select
                                id="role"
                                label={t('role')}
                                name="role"
                                value={profileData.role}
                                onChange={handleSelectChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#555555',
                                    },
                                }}
                            >
                                <MenuItem value="cliente">{t('client')}</MenuItem>
                                <MenuItem value="administrador">{t('admin')}</MenuItem>
                                <MenuItem value="entrenador">{t('trainer')}</MenuItem>
                                <MenuItem value="nutricionista">{t('nutritionist')}</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </form>

                {/* Botones de Cancelar y Guardar con tonos grises */}
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                        <Button
                            fullWidth
                            variant="outlined"
                            sx={{
                                borderColor: '#AAAAAA',
                                color: '#777777',
                                fontWeight: 'bold',
                                py: 1,
                            }}
                            onClick={handleCancel}
                        >
                            {t('cancel')}
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{
                                backgroundColor: '#555555',
                                color: '#FFFFFF',
                                fontWeight: 'bold',
                                py: 1,
                                '&:hover': {
                                    backgroundColor: '#333333',
                                },
                            }}
                            onClick={handleSave}
                        >
                            {t('save')}
                        </Button>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default ModifyUserPage;
