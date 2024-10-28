import React, { useEffect, useState, useContext } from 'react';
import {
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonLabel,
    IonInput,
    IonButton,
    IonLoading,
} from '@ionic/react';
import { Line } from 'react-chartjs-2';
import { LanguageContext } from '../../../context/LanguageContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Button } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const Graphics: React.FC = () => {
    const { t } = useContext(LanguageContext);
    const [weightRecords, setWeightRecords] = useState<{ weight: number; date: string }[]>([]);
    const [newWeight, setNewWeight] = useState<number | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWeightRecords = async () => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await fetch('http://127.0.0.1:8000/api/weight-records/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) throw new Error('Failed to fetch weight records');
            const data = await response.json();
            setWeightRecords(data);
        } catch (err) {
            setError('Error fetching weight records');
        } finally {
            setLoading(false);
        }
    };

    const addWeightRecord = async () => {
        if (!newWeight) return;
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('access_token');
            const response = await fetch('http://127.0.0.1:8000/api/weight-records/create/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ weight: newWeight }),
            });
            if (!response.ok) throw new Error('Failed to add weight record');
            setNewWeight(undefined);
            fetchWeightRecords(); // Update weight records after adding a new one
        } catch (err) {
            setError('Error adding weight record');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeightRecords();
    }, []);

    const chartData = {
        labels: weightRecords.map(record => new Date(record.date).toLocaleDateString()),
        datasets: [
            {
                label: t('Weight Evolution'),
                data: weightRecords.map(record => record.weight),
                borderColor: 'rgba(50, 205, 50, 1)',  // Verde lima para la línea
                backgroundColor: 'rgba(50, 205, 50, 0.2)',  // Verde lima claro para el área de relleno
                fill: true,
            },
        ],
    };

    return (
        <IonGrid>
            <IonLoading isOpen={loading} message={t('Loading...')} />
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            {/* Section for Adding a New Weight Record */}
            <IonRow>
                <IonCol size="12">
                    <IonCard>
                        <IonCardContent>
                            <IonLabel style={{ fontWeight: 'bold', fontSize: '1.2em'}}>
                                {t('Add Weight Record')}
                            </IonLabel>
                            <IonInput
                                type="number"
                                value={newWeight}
                                placeholder={t('Enter your weight')}
                                onIonChange={(e: CustomEvent) => {
                                    const weight = parseFloat(e.detail.value);
                                    setNewWeight(!isNaN(weight) ? weight : undefined);
                                }}
                                style={{ marginBottom: '10px' }}
                            />
                            <Button
                                onClick={addWeightRecord}
                                disabled={newWeight === undefined}
                                style={{
                                    border: '1px solid #32CD32',
                                    backgroundColor: '#FFFFFF',
                                    color: '#32CD32',
                                    padding: '3% 0',
                                    borderRadius: '5px',
                                    fontSize: '1em',
                                    width: '100%',
                                  }}
                            >
                                {t('Add Weight')}
                            </Button>
                        </IonCardContent>
                    </IonCard>
                </IonCol>
            </IonRow>

            {/* Section for Weight Evolution Chart */}
            <IonRow>
                <IonCol size="12">
                    <IonCard>
                        <IonCardContent>
                            <IonLabel style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
                                {t('Weight Evolution')}
                            </IonLabel>
                            <Line
                                data={chartData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            display: false,  // Oculta la leyenda
                                        },
                                    },
                                    scales: {
                                        x: { title: { display: true, text: t('Date') } },
                                        y: { title: { display: true, text: t('Weight (kg)') } },
                                    },
                                }}
                            />
                        </IonCardContent>
                    </IonCard>
                </IonCol>
            </IonRow>
        </IonGrid>
    );
};

export default Graphics;
