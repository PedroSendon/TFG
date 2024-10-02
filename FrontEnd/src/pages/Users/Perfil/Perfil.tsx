import React, { useState } from 'react';
import { IonPage, IonItemDivider, IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonLabel, IonButton, IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonIcon } from '@ionic/react';
import { logOutOutline, pencilOutline } from 'ionicons/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import './Perfil.css'; // Asegúrate de crear este archivo CSS para aplicar los estilos
import { useHistory } from 'react-router-dom';  // Hook para redirigir
import Header from '../../Header/Header';  // Importamos el componente Header


const ProfilePage: React.FC = () => {
    const history = useHistory();  // Hook para la redirección

    /*
        // Estado para almacenar los datos del usuario
        const [userData, setUserData] = useState<any>(null);  // Inicialmente null
        const [loading, setLoading] = useState<boolean>(true);
        const [error, setError] = useState<string | null>(null);
    
        // Estado para almacenar los datos de entrenamiento y peso
        const [trainingData, setTrainingData] = useState<any[]>([]);
        const [weightData, setWeightData] = useState<any[]>([]);
    
        // Función para obtener los datos del backend
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://api.miapp.com/perfil'); // Reemplaza con tu URL del backend
                if (!response.ok) {
                    throw new Error('Error al obtener los datos del usuario');
                }
                const data = await response.json();
                setUserData(data);
                setTrainingData(data.trainingData);
                setWeightData(data.weightData);
            } catch (err) {
                setError('Hubo un problema al obtener los datos del perfil');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
    
        // Hook para cargar los datos cuando se monta el componente
        useEffect(() => {
            fetchUserData();
        }, []);
    */
    // Simulación de los datos del backend
    const userData = {
        username: 'Pedro Sendon',
        email: 'pedro@example.com',
        age: 25,
        height: 175,
        initialWeight: 85,
        currentWeight: 80,
        weightGoal: 'Perder peso',
        activityLevel: 'Moderado',
        trainingFrequency: 5, // días a la semana
    };

    const trainingData = [
        { day: 'Lunes', workouts: 2 },
        { day: 'Martes', workouts: 3 },
        { day: 'Miércoles', workouts: 1 },
        { day: 'Jueves', workouts: 4 },
        { day: 'Viernes', workouts: 3 },
    ];

    const weightData = [
        { day: '01/09', weight: 85 },
        { day: '05/09', weight: 83 },
        { day: '10/09', weight: 81 },
        { day: '15/09', weight: 80 },
    ];

    const handleLogout = () => {
        // Limpiar datos de autenticación
        localStorage.removeItem('token');
        sessionStorage.clear();
    
        // Redirigir a la página de inicio
        history.replace('/');
    };
    

    const handleEdit = () => {
        history.push({
            pathname: '/profile/edit',
            state: {
                userData       // Pasa userData
            },
        });
    };

    // Mostrar un mensaje mientras se cargan los datos
    /*if (loading) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Cargando...</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <p>Cargando datos del perfil...</p>
                </IonContent>
            </IonPage>
        );
    }

    // Si hay un error, mostrarlo
    if (error) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Error</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <p>{error}</p>
                </IonContent>
            </IonPage>
        );
    }

    // Si no hay datos de usuario, mostrar un mensaje por defecto
    if (!userData) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Perfil</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <p>No se encontraron datos del usuario</p>
                </IonContent>
            </IonPage>
        );
    }*/

    return (
        <IonPage>
            <Header title="Profile" />  {/* Pasamos el título como prop */}

            <IonContent>
                {/* Botón de edición en la parte superior derecha */}
                <IonButton
                    fill="clear"
                    size="small"
                    onClick={handleEdit}
                    style={{
                        color: 'var(--color-verde-lima)',
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        zIndex: 10,  /* Asegura que esté por encima de otros elementos */
                        padding: '10px'  /* Mejora la capacidad de clic en pantallas táctiles */
                    }}
                >
                    <IonIcon icon={pencilOutline} /> Edit
                </IonButton>

                {/* Avatar y nombre de usuario */}
                <IonGrid className="ion-text-center">
                    <IonRow>
                        <IonCol size="12" className="avatar-container" >
                            <IonAvatar className="custom-avatar" style={{ border: '2px solid var(--color-verde-lima)' }}>
                                <img src="https://via.placeholder.com/150" alt="Foto de perfil" />
                            </IonAvatar>
                            <h2 className="username">{userData.username}</h2>
                            <p className="user-email">{userData.email}</p>
                        </IonCol>
                    </IonRow>
                </IonGrid>


                {/* Divider (línea horizontal) */}
                <hr className="thin-divider" />

                {/* Información personal */}
                <IonGrid>
                    <IonRow>
                        <IonCol size="12" className="ion-text-center">
                            <h2>Personal Information</h2> {/* Título de la sección */}
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="6">
                            <IonCard className="custom-card">
                                <IonCardContent className="ion-text-center">
                                    <IonLabel>
                                        <h3 style={{
                                            color: 'var(--color-verde-lima)'
                                        }}>Age</h3>
                                        <p>{userData.age} years</p>
                                    </IonLabel>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                        <IonCol size="6">
                            <IonCard className="custom-card">
                                <IonCardContent className="ion-text-center">
                                    <IonLabel>
                                        <h3 style={{
                                            color: 'var(--color-verde-lima)'
                                        }}>Height</h3>
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
                                        <h3 style={{
                                            color: 'var(--color-verde-lima)'
                                        }}>Starting Weight</h3>
                                        <p>{userData.initialWeight} kg</p>
                                    </IonLabel>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                        <IonCol size="6">
                            <IonCard className="custom-card">
                                <IonCardContent className="ion-text-center">
                                    <IonLabel>
                                        <h3 style={{
                                            color: 'var(--color-verde-lima)'
                                        }}>Current Weight</h3>
                                        <p>{userData.currentWeight} kg</p>
                                    </IonLabel>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                </IonGrid>

                {/* Divider (línea horizontal) */}
                <hr className="thin-divider" />

                {/* Objetivos de salud */}
                <IonGrid>
                    <IonRow>
                        <IonCol size="12" className="ion-text-center">
                            <h2>Health Goals</h2> {/* Título de la sección */}
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol>
                            <IonCard className="custom-card">
                                <IonCardContent className="ion-text-center">
                                    <IonLabel>
                                        <h3 style={{
                                            color: 'var(--color-verde-lima)'
                                        }}>Weight goal</h3>
                                        <p>{userData.weightGoal}</p>
                                    </IonLabel>
                                    <IonLabel>
                                        <h3 style={{
                                            color: 'var(--color-verde-lima)'
                                        }}>Activity level</h3>
                                        <p>{userData.activityLevel}</p>
                                    </IonLabel>
                                    <IonLabel>
                                        <h3 style={{
                                            color: 'var(--color-verde-lima)'
                                        }}>Training frequency</h3>
                                        <p>{userData.trainingFrequency} days/week</p>
                                    </IonLabel>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                </IonGrid>

                {/* Divider (línea horizontal) */}
                <hr className="thin-divider" />

                <IonGrid>
                    {/* Gráfica de peso/día */}
                    <IonRow>
                        <IonCol>
                            <h3>Weight over time</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={weightData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    {/* Uso de parámetros predeterminados en lugar de `defaultProps` en los componentes */}
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

                {/* Botón de cerrar sesión */}
                <IonButton
                    className="verde-lima"
                    style={{ marginBottom: '15%', color: '#FFFFFF' }}
                    expand="block"
                    onClick={handleLogout}
                >
                    <IonIcon icon={logOutOutline} slot="start" /> Log out
                </IonButton>

            </IonContent>
        </IonPage>
    );
};

export default ProfilePage;
