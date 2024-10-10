import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonGrid, IonRow, IonCol, IonButton } from '@ionic/react';
import Header from '../../Header/Header';
import { Select, MenuItem, Button, Grid } from '@mui/material';
import { useHistory, useLocation } from 'react-router-dom';

const AssignPlans: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { userId } = location.state as { userId: number }; // Obtener el userId pasado

  // Estados para manejar los datos
  const [selectedWorkout, setSelectedWorkout] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [workoutOptions, setWorkoutOptions] = useState<{ id: number; name: string }[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<{ id: number; dietType: string }[]>([]);
  const [showToast, setShowToast] = useState(false); // Para manejar mensajes de error

  // Obtener los entrenamientos disponibles desde el backend
  const fetchWorkouts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/workouts/');
      const data = await response.json();
      setWorkoutOptions(data.data); // Asignar los datos de entrenamientos
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setShowToast(true);
    }
  };

  // Obtener los planes nutricionales desde el backend utilizando el nuevo endpoint
  const fetchNutritionPlans = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/macros/all/');
      if (!response.ok) {
        throw new Error('Error fetching nutrition plans');
      }
      const data = await response.json();
      setNutritionPlans(data.data); // Verifica que "data.data" tiene el formato correcto
    } catch (error) {
      console.error('Error fetching nutrition plans:', error);
      setShowToast(true);  // Muestra el error en la interfaz
    }
  };

  // Llamar a las funciones de fetch en useEffect para obtener los datos al cargar el componente
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
                  Seleccionar plan nutricional
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
