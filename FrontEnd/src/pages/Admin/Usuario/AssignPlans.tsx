import React, { useEffect, useState, useContext } from 'react';
import { IonPage, IonContent, IonGrid, IonRow, IonCol } from '@ionic/react';
import Header from '../../Header/Header';
import { Select, MenuItem, Button, Grid } from '@mui/material';
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
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/assign-plans/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // Agrega el token JWT aquí
        },
        body: JSON.stringify({
          training_plan_id: selectedTrainingPlan,
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
          {/* Selector de planes de entrenamiento */}
          <IonRow style={{ marginTop: '20px' }}>
            <IonCol size="12">
              <Select
                value={selectedTrainingPlan}
                onChange={(e) => setSelectedTrainingPlan(e.target.value as string)}
                fullWidth
                displayEmpty
                style={{ border: '1px solid #d1d1d6', borderRadius: '8px', padding: '10px' }}
              >
                <MenuItem value="" disabled>
                  {t('select_training_plan')}
                </MenuItem>
                {trainingPlanOptions.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.name}
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
                    {plan.name}
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
