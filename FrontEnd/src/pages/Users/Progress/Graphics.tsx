import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from '@mui/material';
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
      fetchWeightRecords();
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
    labels: weightRecords.map(record =>
        new Date(record.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })
    ),
    datasets: [
        {
            label: t('Weight Evolution'),
            data: weightRecords.map(record => record.weight),
            borderColor: 'rgba(70, 130, 180, 1)',
            backgroundColor: 'rgba(70, 130, 180, 0.2)',
            fill: true,
        },
    ],
};


  return (
    <Box sx={{ padding: 1, backgroundColor: '#f5f5f5', minHeight: '80vh' }}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '20vh' }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" align="center" sx={{ marginBottom: 2 }}>
          {error}
        </Typography>
      )}

      {/* Section for Adding a New Weight Record */}
      <Grid container justifyContent="center" sx={{ paddingBottom: '20px'}}>
        <Grid item xs={12} sm={8} md={6}>
          <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
            <CardContent>
              <Typography fontSize={'1em'} fontWeight="bold" gutterBottom sx={{ color: '#333' }}>
                {t('Add Weight Record')}
              </Typography>
              <TextField
                
                fullWidth
                type="number"
                label={t('Enter your weight')}
                value={newWeight ?? ''}
                onChange={(e) => {
                  const weight = parseFloat(e.target.value);
                  setNewWeight(!isNaN(weight) ? weight : undefined);
                }}
                sx={{
                  marginBottom: '5%',
                  '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '& fieldset': { borderColor: '#CCCCCC' },
                      '&:hover fieldset': { borderColor: '#AAAAAA' },
                      '&.Mui-focused fieldset': { borderColor: '#555555' },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                      color: '#555555', // Color gris para la etiqueta al enfocarse
                  },
              }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={addWeightRecord}
                disabled={newWeight === undefined || loading}
                sx={{
                  backgroundColor: '#b0b0b0',
                  color: '#fff',
                  borderRadius: '8px',
                  '&:hover': { backgroundColor: '#a0a0a0' },
                  padding: '10px',
                  fontWeight: 'bold',
                }}
              >
                {t('Add Weight')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ borderTop: '1px solid #333', width: '100%', margin: '20px 0' }} />

      <Grid item xs={12} sx={{ marginTop: '20px', marginBottom: '20px' }}>
        <Typography sx={{textAlign: 'center', fontWeight: 'bold', fontSize: '1.1em', color: '#333' }}>
          {t('Evolution')}
        </Typography>
      </Grid>

      {/* Section for Weight Evolution Chart */}
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={10} md={8}>
          <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
            <CardContent>
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    x: { title: { display: true, text: t('Date')} },
                    y: { title: { display: true, text: t('Weight (kg)') } },
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Graphics;
