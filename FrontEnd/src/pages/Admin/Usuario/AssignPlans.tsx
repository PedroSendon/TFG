import React, { useState } from 'react';
import { IonPage, IonContent, IonGrid, IonRow, IonCol, IonButton } from '@ionic/react';
import Header from '../../Header/Header';
import { Select, MenuItem, Button, Grid } from '@mui/material';
import { useHistory, useLocation } from 'react-router-dom';

const AssignPlans: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { userId } = location.state as { userId: number }; // Obtener el userId pasado

  // Estados para manejar los seleccionados
  const [selectedWorkout, setSelectedWorkout] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');

  // Datos simulados de entrenamientos y planes nutricionales
  const workoutOptions = ['Entrenamiento A', 'Entrenamiento B', 'Entrenamiento C'];
  const nutritionPlans = ['Plan Nutricional 1', 'Plan Nutricional 2', 'Plan Nutricional 3'];

  const handleSave = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}/assign-plans/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workout_id: selectedWorkout,  // ID del entrenamiento seleccionado
          nutrition_plan_id: selectedPlan,  // ID del plan nutricional seleccionado
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Asignación exitosa:', data);
        history.push('/admin/users');  // Redirigir a la página de usuarios después de guardar
      } else {
        console.error('Error al asignar los planes:', await response.json());
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };


  const handleCancel = () => {
    history.push('/admin/users'); // Redirigir a la lista de usuarios al cancelar
  };

  return (
    <IonPage>
      <Header title="Asignar Planes" /> {/* Header reutilizable */}

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
                  Seleccionar entrenamiento
                </MenuItem>
                {workoutOptions.map((workout) => (
                  <MenuItem key={workout} value={workout}>
                    {workout}
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
                  Seleccionar plan nutricional
                </MenuItem>
                {nutritionPlans.map((plan) => (
                  <MenuItem key={plan} value={plan}>
                    {plan}
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
                  CANCEL
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
                  SAVE
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
