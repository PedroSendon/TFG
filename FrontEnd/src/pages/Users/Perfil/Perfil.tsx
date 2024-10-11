import React, { useEffect, useState, useContext } from 'react';
import { IonPage, IonItemDivider, IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonLabel, IonButton, IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonIcon } from '@ionic/react';
import { logOutOutline, pencilOutline } from 'ionicons/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import './Perfil.css'; // Asegúrate de crear este archivo CSS para aplicar los estilos
import { useHistory } from 'react-router-dom';  // Hook para redirigir
import Header from '../../Header/Header';  // Importamos el componente Header
import { LanguageContext } from '../../../context/LanguageContext';  // Importa el contexto de idioma
import { Button } from '@mui/material';

const ProfilePage: React.FC = () => {
    const history = useHistory();
    const { t } = useContext(LanguageContext); // Usamos el contexto de idioma
    const [userData, setUserData] = useState<any>(null);  // Datos del usuario
    const [weightData, setWeightData] = useState<any[]>([]);  // Historial de peso
    const [loading, setLoading] = useState<boolean>(true);  // Controla el estado de carga

    useEffect(() => {
        const userId = 1; // Replace with the actual user ID
        fetchUserProfile(userId);  // Llamar a la función para obtener el perfil cuando el componente se monta
        fetchWeightHistory();  // Llamar a la función para obtener el historial de peso
    }, []);

    const fetchUserProfile = async (userId: number) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/profile/?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                setUserData(data);
                setLoading(false);
            } else {
                console.error('Error fetching user profile');
                setLoading(false);
            }
        } catch (error) {
            console.error('Network error fetching user profile', error);
            setLoading(false);
        }
    };

    const fetchWeightHistory = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/profile/weight-history/');
            if (response.ok) {
                const data = await response.json();
                setWeightData(data);
            } else {
                console.error('Error fetching weight history');
            }
        } catch (error) {
            console.error('Network error fetching weight history', error);
        }
    };

    if (loading) {
        return <p>{t('loading_profile')}</p>;
    }

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
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
        <IonPage>
            <Header title={t('profile_title')} />  {/* Título dinámico */}
            <IonContent>
                <IonButton
                    fill="clear"
                    size="small"
                    onClick={handleEdit}
                    style={{
                        color: 'var(--color-verde-lima)',
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        zIndex: 10,
                        padding: '10px',
                    }}
                >
                    <IonIcon icon={pencilOutline} /> {t('edit_button')} {/* Botón dinámico */}
                </IonButton>

                {/* Avatar y nombre de usuario */}
                <IonGrid className="ion-text-center">
                    <IonRow>
                        <IonCol size="12" className="avatar-container">
                            <IonAvatar className="custom-avatar" style={{ border: '2px solid var(--color-verde-lima)' }}>
                                <img src="https://via.placeholder.com/150" alt={t('profile_picture_alt')} />
                            </IonAvatar>
                            <h2 className="username">{userData.username}</h2>
                            <p className="user-email">{userData.email}</p>
                        </IonCol>
                    </IonRow>
                </IonGrid>

                <hr className="thin-divider" />

                <IonGrid>
                    <IonRow>
                        <IonCol size="12" className="ion-text-center">
                            <h2>{t('personal_information')}</h2>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="6">
                            <IonCard className="custom-card">
                                <IonCardContent className="ion-text-center">
                                    <IonLabel>
                                        <h3 style={{ color: 'var(--color-verde-lima)' }}>{t('age_label')}</h3>
                                        <p>{userData.age} {t('years')}</p>
                                    </IonLabel>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                        <IonCol size="6">
                            <IonCard className="custom-card">
                                <IonCardContent className="ion-text-center">
                                    <IonLabel>
                                        <h3 style={{ color: 'var(--color-verde-lima)' }}>{t('height_label')}</h3>
                                        <p>{userData.height} cm</p>
                                    </IonLabel>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="6">
                            <IonCard className="custom-card">
                                <IonCardContent className="ion-text-center">
                                    <IonLabel>
                                        <h3 style={{ color: 'var(--color-verde-lima)' }}>{t('starting_weight')}</h3>
                                        <p>{userData.initialWeight} kg</p>
                                    </IonLabel>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                        <IonCol size="6">
                            <IonCard className="custom-card">
                                <IonCardContent className="ion-text-center">
                                    <IonLabel>
                                        <h3 style={{ color: 'var(--color-verde-lima)' }}>{t('current_weight')}</h3>
                                        <p>{userData.currentWeight} kg</p>
                                    </IonLabel>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                </IonGrid>

                <hr className="thin-divider" />

                <IonGrid>
                    <IonRow>
                        <IonCol size="12" className="ion-text-center">
                            <h2>{t('health_goals')}</h2>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol>
                            <IonCard className="custom-card">
                                <IonCardContent className="ion-text-center">
                                    <IonLabel>
                                        <h3 style={{ color: 'var(--color-verde-lima)' }}>{t('weight_goal')}</h3>
                                        <p>{userData.weightGoal}</p>
                                    </IonLabel>
                                    <IonLabel>
                                        <h3 style={{ color: 'var(--color-verde-lima)' }}>{t('activity_level')}</h3>
                                        <p>{userData.activityLevel}</p>
                                    </IonLabel>
                                    <IonLabel>
                                        <h3 style={{ color: 'var(--color-verde-lima)' }}>{t('training_frequency')}</h3>
                                        <p>{userData.trainingFrequency} {t('days_per_week')}</p>
                                    </IonLabel>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                </IonGrid>

                <hr className="thin-divider" />

                <IonGrid>
                    <IonRow>
                        <IonCol>
                            <h3>{t('weight_over_time')}</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={weightData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="weight" stroke="var(--color-verde-lima)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </IonCol>
                    </IonRow>
                </IonGrid>

                {/* Botón de cerrar sesión actualizado */}
                <IonGrid style={{ marginBottom: '15%' }}>
                    <IonRow>
                        <IonCol size="12">
                            <Button
                                style={{
                                    border: '1px solid #32CD32',
                                    backgroundColor: '#FFFFFF',
                                    color: '#32CD32',
                                    padding: '3% 0',
                                    borderRadius: '5px',
                                    fontSize: '1em',
                                    width: '100%',
                                }}
                                onClick={handleLogout}
                            >
                                {t('log_out')}
                            </Button>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default ProfilePage;
