import React from 'react';
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardContent,
} from '@ionic/react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts'; // Gráficas circulares
import Header from '../../Header/Header'; // Encabezado

const MacronutrientPage: React.FC = () => {
  const totalKcal = 2500;
  const macros = {
    carbs: { grams: 300, kcal: 1200, percentage: 50, color: '#ff4d4d' }, // Carbohidratos (Rojo)
    protein: { grams: 150, kcal: 600, percentage: 30, color: '#4d79ff' }, // Proteínas (Azul)
    fat: { grams: 90, kcal: 700, percentage: 20, color: '#ffd11a' } // Grasas (Amarillo)
  };

  // Datos para la gráfica circular
  const pieData = [
    { name: 'Carbs', value: macros.carbs.percentage, color: macros.carbs.color },
    { name: 'Proteins', value: macros.protein.percentage, color: macros.protein.color },
    { name: 'Fats', value: macros.fat.percentage, color: macros.fat.color }
  ];

  return (
    <IonPage>
      <Header title="Macronutrients" /> {/* Título de la página */}
      <IonContent>
        <IonGrid>

          {/* Tipo de dieta como título principal */}
          <IonRow className="ion-text-center">
            <IonCol size="12">
              <IonLabel style={{ fontSize: '24px', fontWeight: 'bold' }}>High protein diet</IonLabel>
            </IonCol>
          </IonRow>

          {/* Calorías Totales */}
          <IonRow className="ion-text-center">
            <IonCol size="12">
              <IonLabel style={{ fontSize: '18px', fontWeight: 'normal', marginTop: '10px' }}>{totalKcal} Kcal totales</IonLabel>
            </IonCol>
          </IonRow>

          {/* Tarjetas para los macronutrientes centradas */}
          <IonRow className="ion-justify-content-center ion-align-items-center">
  <IonCol size="4" className="ion-align-self-center">
    <IonCard style={{ border: '1px solid black', backgroundColor: '#fff', boxShadow: '2px 2px 8px rgba(0,0,0,0.1)' }}>
      <IonCardHeader className="ion-text-center">
        <IonLabel>Carbs</IonLabel>
      </IonCardHeader>
      <IonCardContent className="ion-text-center">
        <h3>{macros.carbs.grams}g</h3>
      </IonCardContent>
    </IonCard>
  </IonCol>

  <IonCol size="4" className="ion-align-self-center">
    <IonCard style={{ border: '1px solid black', backgroundColor: '#fff', boxShadow: '2px 2px 8px rgba(0,0,0,0.1)' }}>
      <IonCardHeader className="ion-text-center">
        <IonLabel>Protein</IonLabel>
      </IonCardHeader>
      <IonCardContent className="ion-text-center">
        <h3>{macros.protein.grams}g</h3>
      </IonCardContent>
    </IonCard>
  </IonCol>

  <IonCol size="4" className="ion-align-self-center">
    <IonCard style={{ border: '1px solid black', backgroundColor: '#fff', boxShadow: '2px 2px 8px rgba(0,0,0,0.1)' }}>
      <IonCardHeader className="ion-text-center">
        <IonLabel>Fat</IonLabel>
      </IonCardHeader>
      <IonCardContent className="ion-text-center">
        <h3>{macros.fat.grams}g</h3>
      </IonCardContent>
    </IonCard>
  </IonCol>
</IonRow>



          {/* Gráfica circular de los macronutrientes */}
          <IonRow className="ion-justify-content-center ion-align-items-center">
            <IonCol size="auto">
              <PieChart width={250} height={250}>
                <Pie
                  data={pieData}
                  dataKey="value"
                  outerRadius={80}
                  innerRadius={60}  
                  label={({ percent, x, y }) => (
                    <text
                      x={x}
                      y={y}
                      fill="black"  // Color del texto
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{ fontSize: '12px', fontWeight: 'bold' }}  // Ajustamos el estilo del texto
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  )}
                  labelLine={false} 
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </IonCol>
          </IonRow>




          {/* Divider debajo de la gráfica */}
          <hr className="divider" />

          {/* Tabla para la distribución de comidas estilizada */}
          <IonRow className="ion-justify-content-center">
            <IonRow className="ion-text-center">
              <IonCol size="12">
                <IonLabel style={{ fontSize: '16px', fontWeight: 'bold' }}>Meal distribution suggestion</IonLabel>
              </IonCol>
            </IonRow>            <IonCol size="10" style={{ marginBottom: '60px' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px', margin: '0 auto', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <thead>
                  <tr style={{ backgroundColor: '#4CAF50', color: '#fff', fontWeight: 'bold', borderRadius: '10px 10px 0 0' }}>
                    <th style={{ padding: '12px', border: '1px solid #ddd', borderTopLeftRadius: '10px' }}>Breakfast</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd' }}>Lunch</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd' }}>Dinner</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', borderTopRightRadius: '10px' }}>Snacks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ backgroundColor: '#f9f9f9', textAlign: 'center' }}>
                    <td >20%</td>
                    <td >40%</td>
                    <td >30%</td>
                    <td >10%</td>
                  </tr>
                </tbody>
              </table>
            </IonCol>
          </IonRow>

        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default MacronutrientPage;
