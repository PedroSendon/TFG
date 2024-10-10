import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonGrid, IonRow, IonCol } from '@ionic/react';
import Header from '../../Header/Header';
import { Select, MenuItem, Button, Grid } from '@mui/material';
import { useHistory, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { LanguageContext } from '../../../context/LanguageContext'; // Importar el contexto de idioma

const AssignPlans: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { t } = useContext(LanguageContext); // Usamos el contexto de idioma
  const { userId } = location.state as { userId: number }; 

  const [selectedWorkout, setSelectedWorkout] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [workoutOptions, setWorkoutOptions] = useState<{ id: number; name: string }[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<{ id: number; dietType: string }[]>([]);
  const [showToast, setShowToast] = useState(false); 

  const fetchWorkouts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/workouts/');
      const data = await response.json();
      setWorkoutOptions(data.data); 
    } catch (error) {
      console.error(t('fetch_workouts_error'), error);
      setShowToast(true);
    }
  };

  const fetchNutritionPlans = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/macros/all/');
      if (!response.ok) {
        throw new Error(t('fetch_nutrition_plans_error'));
      }
      const data = await response.json();
      setNutritionPlans(data.data); 
    } catch (error) {
      console.error(t('fetch_nutrition_plans_error'), error);
      setShowToast(true);  
    }
  };

  useEffect(() => {
    fetchWorkouts();
    fetchNutritionPlans();
  }, []);

  const handleSave = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/assign-plans/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workout_id: selectedWorkout, 
          nutrition_plan_id: selectedPlan,  
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(t('assign_success'), data);
        history.push('/admin/users');  
      } else {
        console.error(t('assign_error'), await response.json());
      }
    } catch (error) {
      console.error(t('request_error'), error);
    }
  };

  const handleCancel = () => {
    history.push('/admin/users');
  };

  return (
    <IonPage>
      <Header title={t('assign_plans')} /> 

      <IonContent>
        <IonGrid>
          {/* Selector de entrenamientos */}
          <IonRow style={{ marginTop: '20px' }}>
            <IonCol size="12">
              <Select
                value={selectedWorkout}
                onChange={(e) => setSelectedWorkout(e.target.value as string)}
                fullWidth
                displayEmpty
                style={{ border: '1px solid #d1d1d6', borderRadius: '8px', padding: '10px' }}
              >
                <MenuItem value="" disabled>
                  {t('select_workout')}
                </MenuItem>
                {workoutOptions.map((workout) => (
                  <MenuItem key={workout.id} value={workout.id}>
                    {workout.name}
                  </MenuItem>
                ))}
              </Select>
            </IonCol>
          </IonRow>

          {/* Selector de planes nutricionales */}
          <IonRow style={{ marginTop: '20px' }}>
            <IonCol size="12">
              <Select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value as string)}
                fullWidth
                displayEmpty
                style={{ border: '1px solid #d1d1d6', borderRadius: '8px', padding: '10px' }}
              >
                <MenuItem value="" disabled>
                  {t('select_nutrition_plan')}
                </MenuItem>
                {nutritionPlans.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.dietType}
                  </MenuItem>
                ))}
              </Select>
            </IonCol>
          </IonRow>

          {/* Botones de Cancelar y Guardar */}
          <Grid item xs={12} style={{ padding: '1rem 0', marginBottom: '15%' }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  onClick={handleCancel}
                  style={{
                    border: '1px solid #FF0000',
                    backgroundColor: '#FFFFFF',
                    color: '#FF0000',
                    padding: '3% 0',
                    borderRadius: '5px',
                    fontSize: '1em',
                    width: '100%',
                  }}
                >
                  {t('cancel')}
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  onClick={handleSave}
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
                  {t('save')}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default AssignPlans;
