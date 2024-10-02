import React, { useState } from 'react';
import {
    IonPage,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonItem,
} from '@ionic/react';
import Header from '../../Header/Header';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer
} from 'recharts'; // Librería para gráficos

// Sample data for exercise popularity
const exercisesData = [
    { name: 'Squats', timesRepeated: 120 },
    { name: 'Push-ups', timesRepeated: 95 },
    { name: 'Deadlifts', timesRepeated: 60 },
    { name: 'Lunges', timesRepeated: 50 },
    { name: 'Planks', timesRepeated: 80 },
];

// Sample data for platform growth (new users per month)
const growthData = [
    { month: 'Jan', newUsers: 50 },
    { month: 'Feb', newUsers: 80 },
    { month: 'Mar', newUsers: 120 },
    { month: 'Apr', newUsers: 90 },
    { month: 'May', newUsers: 130 },
    { month: 'Jun', newUsers: 100 },
    { month: 'Jul', newUsers: 150 },
];

const AdminStatistics: React.FC = () => {
    const [selectedYear, setSelectedYear] = useState('2024');  // State to select year

    return (
        <IonPage>
            {/* Reusable Header */}
            <Header title="Statistics" />

            <IonContent style={{ backgroundColor: '#000000' }}>
                <IonGrid>
                    <IonRow>
                        <IonCol size="12">
                            <IonCard
                                style={{
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '10px',
                                    padding: '10px',
                                    margin: '10px auto',
                                    maxWidth: '95%',
                                    boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.1)',
                                }}
                            >
                                <IonCardContent>
                                    {/* Exercise Popularity */}
                                    <IonLabel style={{ fontWeight: 'bold', fontSize: '1.2em', color: '#000000' }}>
                                        Exercise Popularity
                                    </IonLabel>
                                    <IonGrid>
                                        <IonRow>
                                            <IonCol size="12">
                                                {/* Exercise Popularity Table */}
                                                <table style={{ width: '100%', textAlign: 'left', marginTop: '10px' }}>
                                                    <thead>
                                                        <tr style={{ color: '#9C27B0' }}>
                                                            <th>Exercise</th>
                                                            <th>Times Repeated</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {exercisesData.map((exercise) => (
                                                            <tr key={exercise.name}>
                                                                <td>{exercise.name}</td>
                                                                <td>{exercise.timesRepeated}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </IonCol>
                                        </IonRow>
                                    </IonGrid>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <IonCard
                                style={{
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '10px',
                                    padding: '10px',
                                    margin: '10px auto',
                                    maxWidth: '95%',
                                    boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.1)',
                                }}
                            >
                                <IonCardContent>
                                    {/* Platform Growth */}
                                    <IonLabel style={{ fontWeight: 'bold', fontSize: '1.2em', color: '#000000' }}>
                                        Platform Growth
                                    </IonLabel>

                                    {/* Year Selector */}
                                    <IonItem lines="none" style={{ marginBottom: '20px' }}>
                                        <IonLabel position="stacked">Select Year</IonLabel>
                                        <IonSelect
                                            value={selectedYear}
                                            placeholder="Select Year"
                                            onIonChange={(e: { detail: { value: React.SetStateAction<string>; }; }) => setSelectedYear(e.detail.value)}
                                            style={{ border: '1px solid #d1d1d6', borderRadius: '8px', padding: '10px' }}
                                        >
                                            <IonSelectOption value="2024">2024</IonSelectOption>
                                            <IonSelectOption value="2023">2023</IonSelectOption>
                                        </IonSelect>
                                    </IonItem>

                                    {/* Platform Growth Chart */}
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={growthData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="newUsers" fill="#32CD32" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default AdminStatistics;
