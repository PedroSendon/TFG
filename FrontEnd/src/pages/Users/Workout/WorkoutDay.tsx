import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonList, IonItem, IonLabel, IonImg, IonCheckbox, IonButton, IonProgressBar } from '@ionic/react';
import { useHistory } from 'react-router-dom'; // Hook para manejar la navegación entre páginas
import './WorkoutDay.css'; // Importa los estilos personalizados
import Header from '../../Header/Header'; // Importa el componente Header para mostrar el encabezado

// Componente funcional WorkoutDay
const WorkoutDay: React.FC = () => {
  const history = useHistory(); // Hook para redirigir a otras rutas de la app

  // Estado para almacenar los ejercicios obtenidos del backend o simulados
  const [exercises, setExercises] = useState<Array<{ name: string; imageUrl: string; sets: number; reps: number; completed: boolean }>>([]);
  
  // Variables de estado para manejar los totales de series, repeticiones y tiempo estimado
  const [totalSets, setTotalSets] = useState<number>(0);
  const [totalReps, setTotalReps] = useState<number>(0);
  const [estimatedTime, setEstimatedTime] = useState<number>(0); // Tiempo estimado en minutos para completar el entrenamiento
  const [completedCount, setCompletedCount] = useState<number>(0); // Número de ejercicios completados

  // Función para obtener los datos de los ejercicios (simulación)
  const fetchExercises = async () => {
    try {
      // Datos simulados de los ejercicios del día
      const data = [
        { name: 'Sentadillas', imageUrl: 'https://via.placeholder.com/150', sets: 4, reps: 12, completed: false },
        { name: 'Press de banca', imageUrl: 'https://via.placeholder.com/150', sets: 3, reps: 10, completed: false },
        { name: 'Dominadas', imageUrl: 'https://via.placeholder.com/150', sets: 5, reps: 8, completed: false },
        { name: 'Peso muerto', imageUrl: 'https://via.placeholder.com/150', sets: 4, reps: 10, completed: false }
      ];
      setExercises(data); // Almacena los ejercicios en el estado

      // Cálculos para obtener el total de series, repeticiones y tiempo estimado
      const totalSets = data.reduce((acc, exercise) => acc + exercise.sets, 0);
      const totalReps = data.reduce((acc, exercise) => acc + exercise.reps * exercise.sets, 0);
      const estimatedTime = totalSets * 2; // Se estima 2 minutos por serie
      setTotalSets(totalSets); // Actualiza el estado del total de series
      setTotalReps(totalReps); // Actualiza el estado del total de repeticiones
      setEstimatedTime(estimatedTime); // Actualiza el tiempo estimado
    } catch (err) {
      console.error('Error fetching exercises'); // Muestra un error si algo sale mal
    }
  };

  // useEffect para cargar los datos cuando se monta el componente
  useEffect(() => {
    fetchExercises(); // Llama a la función que obtiene los ejercicios
  }, []); // Solo se ejecuta una vez cuando el componente se monta

  // Función para manejar el cambio en el checkbox de completado de un ejercicio
  const handleCheckboxChange = (index: number) => {
    const updatedExercises = [...exercises]; // Copia el array de ejercicios
    updatedExercises[index].completed = !updatedExercises[index].completed; // Cambia el estado de completado del ejercicio
    setExercises(updatedExercises); // Actualiza los ejercicios con el nuevo estado

    const completedCount = updatedExercises.filter(ex => ex.completed).length; // Cuenta cuántos ejercicios han sido completados
    setCompletedCount(completedCount); // Actualiza el número de ejercicios completados
  };

  // Función para manejar el clic en un ejercicio, excepto si es en el checkbox
  const handleExerciseClick = (index: number, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'ION-CHECKBOX' && target.tagName !== 'ION-LABEL') {
      history.push(`/workout/day/exercise`); // Redirige a la página de detalles del ejercicio
    }
  };

  // Función que se llama cuando el usuario marca el entrenamiento como completado
  const handleCompleteWorkout = () => {
    console.log('Entrenamiento completado'); // Aquí podrías hacer algo como guardar los datos en el backend
  };

  // Cálculo del progreso de los ejercicios completados
  const progress = exercises.length > 0 ? completedCount / exercises.length : 0; // Progreso basado en el número de ejercicios completados
  const progressPercentage = Math.round(progress * 100); // Convierte el progreso en un porcentaje redondeado

  return (
    <IonPage>
      <Header title="Training of the day" /> {/* Encabezado con el título del día de entrenamiento */}

      <IonContent>
        {/* Lista de ejercicios */}
        <IonList className="no-lines">
          {exercises.map((exercise, index) => (
            <IonItem key={index} className="workout-item no-lines">
              {/* Contenedor del ejercicio */}
              <div className="workout-container" onClick={(e) => handleExerciseClick(index, e)}>
                <IonLabel className="workout-label">
                  {/* Nombre del ejercicio y descripción de las series y repeticiones */}
                  <h1>{exercise.name}</h1>
                  <p>{`${exercise.sets} sets of ${exercise.reps} repetitions`}</p>
                </IonLabel>
                {/* Imagen del ejercicio */}
                <IonImg className="workout-img" src={exercise.imageUrl} alt={`Imagen del ${exercise.name}`} />
                {/* Checkbox para marcar el ejercicio como completado */}
                <IonCheckbox
                  slot="end"
                  checked={exercise.completed} // Controla si el checkbox está marcado o no
                  onIonChange={(e: { stopPropagation: () => void; }) => {
                    e.stopPropagation(); // Evita que el clic en el checkbox active el evento del contenedor
                    handleCheckboxChange(index); // Cambia el estado del checkbox
                  }}
                  color="success" // Estilo del checkbox (verde para éxito)
                  className="checkbox-right"  // Clase personalizada para posicionar el checkbox
                />
              </div>
            </IonItem>
          ))}
        </IonList>

        {/* Línea divisoria visual */}
        <hr className="divider" />

        {/* Resumen del entrenamiento */}
        <div className="summary-container">
          <h3>Training Summary</h3>
          <p><strong>{totalSets}</strong> sets | <strong>{totalReps}</strong> repetitions | <strong>{estimatedTime}</strong> minutes</p>
        </div>

        {/* Línea divisoria visual */}
        <hr className="divider" />

        {/* Progreso del entrenamiento */}
        <div className="progress-container">
          <p className="progress-percentage">{progressPercentage}% completed</p> {/* Porcentaje completado */}
          <IonProgressBar value={progress} color="success" style={{ height: '10px' }}></IonProgressBar> {/* Barra de progreso */}
        </div>

        {/* Botón para marcar el entrenamiento como completado */}
        <IonButton
          expand="block"
          color="success"
          onClick={handleCompleteWorkout}
          className="custom-button"
        >
          Mark training as completed
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default WorkoutDay;
