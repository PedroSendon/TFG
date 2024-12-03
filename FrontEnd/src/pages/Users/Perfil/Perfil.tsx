import React, { useEffect, useState, useContext } from 'react';
import { Button, Card, CardContent, Divider, IconButton, Typography, Box, List, ListItem, ListItemText, Avatar } from '@mui/material';
import { Edit as EditIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext';

const ProfilePage: React.FC = () => {
    const history = useHistory();
    const { t } = useContext(LanguageContext);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) return;
            const profileResponse = await fetch(`http://127.0.0.1:8000/api/profile/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            if (profileResponse.ok) setUserData(await profileResponse.json());

        } catch (error) {
            console.error('Error fetching profile data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>{t('loading_profile')}</p>;
    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        history.push('/');
    };

    const handleEdit = () => {
        history.push({
            pathname: '/profile/edit',
            state: { userData },
        });
    };

    return (
        <Box sx={{ marginTop: '16%' }}>
            <Header title={t('profile_title')} />
            <Box style={{ padding: '20px', backgroundColor: '#f5f5f5', paddingBottom: '15%' }}> {/* Margen inferior del 15% */}

                {/* Encabezado con Avatar, Nombre, Email y Botón de edición */}
                <Card
                    sx={{
                        padding: '10px',
                        marginTop: '10px',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e0e0e0', // Color de borde gris claro
                    }}
                >
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center">
                            <Avatar
                                sx={{ width: '60px', height: '60px', marginRight: '15px' }}
                                src={userData?.profilePhoto} // Usa la URL firmada
                                alt={t('profile_picture_alt')}
                            />
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{userData?.username}</Typography>
                                <Typography variant="body2" color="textSecondary">{userData?.email}</Typography>
                            </Box>
                        </Box>
                        <IconButton onClick={handleEdit} sx={{ color: '#000' }}>
                            <EditIcon />
                        </IconButton>
                    </Box>
                </Card>
                {/* Información personal en tarjeta en formato de lista */}
                <Card variant="outlined" sx={{ marginTop: '15px', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                    <CardContent>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                            {t('personal_information')}
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemText primary={t('age_label')} secondary={`${userData?.age} ${t('years')}`} />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemText primary={t('height_label')} secondary={`${userData?.height} cm`} />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemText primary={t('starting_weight')} secondary={`${userData?.initialWeight} kg`} />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemText primary={t('current_weight')} secondary={`${userData?.currentWeight} kg`} />
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>

                {/* Objetivos de salud en tarjeta en formato de lista */}
                <Card variant="outlined" sx={{ marginTop: '15px', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                    <CardContent>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                            {t('health_goals')}
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemText primary={t('weight_goal')} secondary={t(userData?.weightGoal)} />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemText
                                    primary={t('activity_level')}
                                    secondary={t(userData?.activityLevel || 'No info')}
                                />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemText primary={t('training_frequency')} secondary={`${userData?.trainingFrequency} ${t('days_per_week')}`} />
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>

                {/* Botón de cerrar sesión */}
                <Box display="flex" justifyContent="center" mt={2} sx={{ marginBottom: '5%' }}>
                    <Button
                        onClick={handleLogout}
                        variant="outlined"
                        sx={{
                            backgroundColor: '#ffffff',
                            color: '#000',
                            border: '1px solid #000',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            width: '80%',
                            maxWidth: '200px',
                        }}
                        startIcon={<LogoutIcon />}
                    >
                        {t('log_out')}
                    </Button>
                </Box>

            </Box>
        </Box>
    );
};

export default ProfilePage;
