import React, { useEffect, useState } from 'react';
import { IonPage, IonButton, IonIcon, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonImg } from '@ionic/react';
import { useHistory } from 'react-router-dom'; // Hook para manejar la navegación en Ionic/React Router
import './WorkoutOverview.css'; // Archivo CSS para los estilos personalizados
import Header from '../../Header/Header';  // Importa el componente Header

// Componente funcional WorkoutOverview
const WorkoutOverview: React.FC = () => {
  const history = useHistory(); // Hook para manejar la navegación entre páginas

  // Estado para almacenar los datos de los entrenamientos (simulados o del backend)
  const [workoutDays, setWorkoutDays] = useState<Array<{ id: number; day: string; imageUrl: string; workoutName: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true); // Estado para controlar si los datos están cargando
  const [error, setError] = useState<string | null>(null); // Estado para manejar posibles errores

  // Función para obtener los entrenamientos del backend
  const fetchWorkouts = async () => {
    try {
      const userId = 1; // Reemplaza esto con el ID del usuario actualmente logueado
      const response = await fetch(`http://127.0.0.1:8000/api/workouts/by-user/?userId=${userId}`); // Reemplaza por tu URL del backend
      if (!response.ok) {
        throw new Error('Error al obtener los entrenamientos');
      }
      const data = await response.json();
      setWorkoutDays(data.data); // Actualiza los entrenamientos con los datos obtenidos
      setLoading(false); // Desactiva el estado de carga
    } catch (err) {
      setError('Hubo un problema al obtener los entrenamientos'); // Maneja el error si falla la solicitud
      setLoading(false); // Desactiva el estado de carga en caso de error
    }
  };

  // useEffect para cargar los datos cuando el componente se monta
  useEffect(() => {
    fetchWorkouts(); // Llama a la función que obtiene los datos
  }, []); // El array vacío asegura que esto solo se ejecute una vez al montar el componente

  // Función que maneja el clic en un día de entrenamiento y navega a la vista de ese día
  const handleDayClick = (id: number) => {
    history.push(`/workout/day/${id}`); // Redirige a la página del entrenamiento, pasando el id en la URL
  };

  // Muestra una pantalla de carga mientras se obtienen los entrenamientos
  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Cargando entrenamientos...</IonTitle> {/* Título mientras carga */}
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <p>Cargando...</p> {/* Texto que indica que está cargando */}
        </IonContent>
      </IonPage>
    );
  }

  // Muestra un mensaje de error si la obtención de entrenamientos falla
  if (error) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Error</IonTitle> {/* Título en caso de error */}
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <p>{error}</p> {/* Muestra el mensaje de error */}
        </IonContent>
      </IonPage>
    );
  }

  // Renderiza la página con la lista de entrenamientos
  return (
    <IonPage>
      <Header title="Select the training" />  {/* Componente Header con título pasado como prop */}

      <IonContent>
        <IonList lines="none"> {/* Lista de entrenamientos sin líneas entre los items */}
          {workoutDays.map((workout, index) => (
            <IonItem
              key={index}  // Se necesita una key única para cada item de la lista
              button
              detail={false} // Oculta la flecha de detalle a la derecha del item
              className="workout-item" // Clase CSS para estilizar los items
              lines="none"  // Sin líneas para los items individuales
              onClick={() => handleDayClick(workout.id)} // Llama a la función cuando se hace clic en el item
            >
              {/* Contenedor del ítem con imagen y texto */}
              <div className="workout-container">
                <IonLabel className="workout-label">
                  <h1>{workout.workoutName}</h1> {/* Muestra el nombre del entrenamiento */}
                </IonLabel>
                <IonImg
                  className="workout-img"
                  src={workout.imageUrl}
                  alt={`Imagen del ${workout.workoutName}`}
                /> {/* Imagen asociada con el entrenamiento */}
              </div>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default WorkoutOverview;
