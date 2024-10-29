import React, { useEffect, useState, useContext } from 'react';
import Header from '../../Header/Header';
import { Select, MenuItem, Button, Grid, Container, Box, Typography, TextField } from '@mui/material';
import { useHistory, useLocation } from 'react-router-dom';
import { LanguageContext } from '../../../context/LanguageContext'; // Importar el contexto de idioma

const AssignPlans: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { t } = useContext(LanguageContext); // Usamos el contexto de idioma

  // Verificación segura del ID del usuario
  const locationState = location.state as { userId: number } | undefined;
  const userId = locationState?.userId;

  const [selectedTrainingPlan, setSelectedTrainingPlan] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [trainingPlanOptions, setTrainingPlanOptions] = useState<{ id: number; name: string }[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<{ id: number; name: string; dietType: string }[]>([]);
  const [showToast, setShowToast] = useState(false);

  // Redirigir si `userId` no está definido
  useEffect(() => {
    if (!userId) {
      console.error("No se encontró userId, redirigiendo...");
      history.push('/admin/users');
    }
  }, [userId, history]);

  const fetchTrainingPlans = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');

      if (!accessToken) {
        console.error(t('no_token'));
        return;
      }

      const response = await fetch('http://127.0.0.1:8000/api/trainingplans/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setTrainingPlanOptions(result.data); // Acceder al array dentro de `data` si está envuelto
      } else {
        console.error("Error al obtener planes de entrenamiento:", result);
        setTrainingPlanOptions([]); // Fallback en caso de error
      }
    } catch (error) {
      console.error(t('fetch_training_plans_error'), error);
      setTrainingPlanOptions([]); // Fallback en caso de excepción
      setShowToast(true);
    }
  };

  const fetchNutritionPlans = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');

      if (!accessToken) {
        console.error(t('no_token'));
        return;
      }
      const response = await fetch('http://127.0.0.1:8000/api/mealplans/all/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();
      console.log(result);
      if (response.ok) {
        setNutritionPlans(result.data); // Accede a `data` si los datos están envueltos
      } else {
        console.error("Error al obtener planes nutricionales:", result);
        setNutritionPlans([]);
      }
    } catch (error) {
      console.error(t('fetch_nutrition_plans_error'), error);
      setNutritionPlans([]);
      setShowToast(true);
    }
  };

  useEffect(() => {
    fetchTrainingPlans();
    fetchNutritionPlans();
  }, []);

  const handleSave = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');

      if (!accessToken) {
        console.error(t('no_token'));
        return;
      }

      console.log("Enviando datos:", {
        training_plan_id: selectedTrainingPlan,
        nutrition_plan_id: selectedPlan,
      });

      const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/assign-plans/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          workout_id: selectedTrainingPlan,
          nutrition_plan_id: selectedPlan,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(t('assign_success'), data);
        history.push('/admin/users');
      } else {
        const errorData = await response.json();
        console.error(t('assign_error'), errorData);
      }
    } catch (error) {
      console.error(t('request_error'), error);
    }
  };


  const handleCancel = () => {
    history.push('/admin/users');
  };

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '95vh' }}>
      <Header title={t('assign_plans')} />

      <Container maxWidth="sm" sx={{ mt: 4, paddingTop:'3%' }}>
        {/* Selector de planes de entrenamiento */}
        <Typography variant="subtitle1" sx={{ mt: 4, color: '#555555', fontWeight: 'bold' }}>
          {t('select_training_plan')}
        </Typography>
        <TextField
          select
          value={selectedTrainingPlan}
          onChange={(e) => setSelectedTrainingPlan(e.target.value as string)}
          fullWidth
          variant="outlined"
          sx={{
            mt: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              '& fieldset': { borderColor: '#CCCCCC' },
              '&:hover fieldset': { borderColor: '#AAAAAA' },
              '&.Mui-focused fieldset': { borderColor: '#555555' },
            },
            '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
          }}
          label={t('select_training_plan')}
        >
          <MenuItem value="" disabled>
            {t('select_training_plan')}
          </MenuItem>
          {trainingPlanOptions.map((plan) => (
            <MenuItem key={plan.id} value={plan.id}>
              {plan.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Selector de planes nutricionales */}
        <Typography variant="subtitle1" sx={{ mt: 4, color: '#555555', fontWeight: 'bold' }}>
          {t('select_nutrition_plan')}
        </Typography>
        <TextField
          select
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value as string)}
          fullWidth
          variant="outlined"
          sx={{
            mt: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              '& fieldset': { borderColor: '#CCCCCC' },
              '&:hover fieldset': { borderColor: '#AAAAAA' },
              '&.Mui-focused fieldset': { borderColor: '#555555' },
            },
            '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
          }}
          label={t('select_nutrition_plan')}
        >
          <MenuItem value="" disabled>
            {t('select_nutrition_plan')}
          </MenuItem>
          {nutritionPlans.map((plan) => (
            <MenuItem key={plan.id} value={plan.id}>
              {plan.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Botones de Cancelar y Guardar */}
        <Grid container spacing={2} sx={{ mt: 4 }}>
          <Grid item xs={6}>
            <Button
              onClick={handleCancel}
              fullWidth
              variant="outlined"
              sx={{
                borderColor: '#AAAAAA',
                color: '#555555',
                fontWeight: 'bold',
                py: 1,
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                  borderColor: '#888888',
                },
              }}
            >
              {t('cancel')}
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              onClick={handleSave}
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: '#555555',
                color: '#FFFFFF',
                fontWeight: 'bold',
                py: 1,
                '&:hover': {
                  backgroundColor: '#777777',
                },
              }}
            >
              {t('save')}
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AssignPlans;
