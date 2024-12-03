import React, { useEffect, useState, useContext } from 'react';
import Header from '../../Header/Header';
import { MenuItem, Button, Grid, Container, Box, Typography, TextField, IconButton } from '@mui/material';
import { useHistory, useLocation } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';  // Importa el icono de basura
import { LanguageContext } from '../../../context/LanguageContext';

const AssignPlans: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { t } = useContext(LanguageContext);

  const locationState = location.state as { userId: number } | undefined;
  const userId = locationState?.userId;

  const [selectedTrainingPlan, setSelectedTrainingPlan] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [trainingPlanOptions, setTrainingPlanOptions] = useState<{ id: number; name: string }[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<{ id: number; name: string; dietType: string }[]>([]);

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
        setTrainingPlanOptions(result.data);
      } else {
        console.error("Error al obtener planes de entrenamiento:", result);
        setTrainingPlanOptions([]);
      }
    } catch (error) {
      console.error(t('fetch_training_plans_error'), error);
      setTrainingPlanOptions([]);
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
      if (response.ok) {
        setNutritionPlans(result.data);
      } else {
        console.error("Error al obtener planes nutricionales:", result);
        setNutritionPlans([]);
      }
    } catch (error) {
      console.error(t('fetch_nutrition_plans_error'), error);
      setNutritionPlans([]);
    }
  };

  const fetchUserPlans = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error(t('no_token'));
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/plans/`, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        if (result.meal_plan && result.meal_plan.id) {
          setSelectedPlan(result.meal_plan.id.toString());
        }
        if (result.training_plan && result.training_plan.id) {
          setSelectedTrainingPlan(result.training_plan.id.toString());
        }
      } else {
        console.error("Error al obtener planes asignados:", result);
      }
    } catch (error) {
      console.error(t('fetch_assigned_plans_error'), error);
    }
  };

  useEffect(() => {
    fetchTrainingPlans();
    fetchNutritionPlans();
    fetchUserPlans();
  }, []);

  const handleSave = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        console.error(t('no_token'));
        return;
      }
  
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/assign-plans/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          workout_id: selectedTrainingPlan !== '' ? selectedTrainingPlan : -1,  // Enviar -1 si se desasigna
          nutrition_plan_id: selectedPlan !== '' ? selectedPlan : -1,  // Enviar -1 si se desasigna
        }),
      });
  
      if (response.ok) {
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

  // Funciones para eliminar el plan seleccionado
  const handleRemoveTrainingPlan = () => setSelectedTrainingPlan('');
  const handleRemoveNutritionPlan = () => setSelectedPlan('');

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '95vh' }}>
      <Header title={t('assign_plans')} />
      <Container maxWidth="sm" sx={{ mt: 4, paddingTop: '3%' }}>

        {/* Training Plan Selection */}
        <Box display="flex" alignItems="center" sx={{ mt: 5 }}>
          <TextField
            select
            value={selectedTrainingPlan}
            onChange={(e) => setSelectedTrainingPlan(e.target.value as string)}
            fullWidth
            variant="outlined"
            label={t('select_training_plan')}
          >
            <MenuItem value="" disabled>{t('select_training_plan')}</MenuItem>
            {trainingPlanOptions.map((plan) => (
              <MenuItem key={plan.id} value={plan.id.toString()}>{plan.name}</MenuItem>
            ))}
          </TextField>
          <IconButton onClick={handleRemoveTrainingPlan} aria-label="remove training plan" sx={{ ml: 1 }}>
            <DeleteIcon />
          </IconButton>
        </Box>

        {/* Nutrition Plan Selection */}
        <Box display="flex" alignItems="center" sx={{ mt: 4 }}>
          <TextField
            select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value as string)}
            fullWidth
            variant="outlined"
            label={t('select_nutrition_plan')}
          >
            <MenuItem value="" disabled>{t('select_nutrition_plan')}</MenuItem>
            {nutritionPlans.map((plan) => (
              <MenuItem key={plan.id} value={plan.id.toString()}>{plan.name}</MenuItem>
            ))}
          </TextField>
          <IconButton onClick={handleRemoveNutritionPlan} aria-label="remove nutrition plan" sx={{ ml: 1 }}>
            <DeleteIcon />
          </IconButton>
        </Box>

        {/* Cancel and Save Buttons */}
        <Grid container spacing={2} sx={{ mt: 3, mb: 10 }}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              sx={{
                color: '#777', borderColor: '#777', fontWeight: 'bold', py: 1, borderRadius: '8px',
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
                backgroundColor: '#555', color: '#FFF', fontWeight: 'bold', py: 1, borderRadius: '8px', '&:hover': { backgroundColor: '#333' },
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

export default AssignPlans;
