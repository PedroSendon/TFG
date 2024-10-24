import React, { useContext, useEffect, useState } from 'react';
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
import { LanguageContext } from '../../../context/LanguageContext'; // Contexto de idioma

const MacronutrientPage: React.FC = () => {
  const { t } = useContext(LanguageContext); // Usamos el contexto de idioma
  const [macros, setMacros] = useState({
    carbs: { grams: 0, kcal: 0, percentage: 0, color: '#ff4d4d' }, // Carbohidratos (Rojo)
    protein: { grams: 0, kcal: 0, percentage: 0, color: '#4d79ff' }, // Proteínas (Azul)
    fat: { grams: 0, kcal: 0, percentage: 0, color: '#ffd11a' } // Grasas (Amarillo)
  });
  const [totalKcal, setTotalKcal] = useState(0);
  const [dietType, setDietType] = useState(''); // Estado para almacenar el tipo de dieta


  useEffect(() => {
    // Función para hacer la llamada al backend y obtener los macronutrientes del usuario
    const fetchUserMacros = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');

        if (!accessToken) {
          console.error(t('no_token'));
          return;
        }
        const response = await fetch('http://127.0.0.1:8000/api/mealplans/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,  // Agrega el token JWT aquí
          }
        });

        if (response.ok) {
          const data = await response.json();

          // Actualizar el estado con los datos obtenidos
          setTotalKcal(data.totalKcal);
          setMacros({
            carbs: { grams: data.macros.carbs.grams, kcal: data.macros.carbs.kcal, percentage: data.macros.carbs.percentage, color: '#ff4d4d' },
            protein: { grams: data.macros.protein.grams, kcal: data.macros.protein.kcal, percentage: data.macros.protein.percentage, color: '#4d79ff' },
            fat: { grams: data.macros.fat.grams, kcal: data.macros.fat.kcal, percentage: data.macros.fat.percentage, color: '#ffd11a' }
          });
          setDietType(data.dietType || t('diet_type_default')); // Usar el tipo de dieta del usuario o un valor por defecto
        } else {
          console.error('Error fetching user macros:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching user macros:', error);
      }
    };

    fetchUserMacros();
  }, [t]);

  // Datos para la gráfica circular
  const pieData = [
    { name: t('macros_carbs'), value: macros.carbs.percentage, color: macros.carbs.color },
    { name: t('macros_protein'), value: macros.protein.percentage, color: macros.protein.color },
    { name: t('macros_fat'), value: macros.fat.percentage, color: macros.fat.color }
  ];

  return (
    <IonPage>
      <Header title={t('macros_title')} /> {/* Título de la página */}
      <IonContent>
        <IonGrid>

          {/* Tipo de dieta como título principal */}
          <IonRow className="ion-text-center">
            <IonCol size="12">
              <IonLabel style={{ fontSize: '24px', fontWeight: 'bold' }}>{dietType}</IonLabel>
            </IonCol>
          </IonRow>

          {/* Calorías Totales */}
          <IonRow className="ion-text-center">
            <IonCol size="12">
              <IonLabel style={{ fontSize: '18px', fontWeight: 'normal', marginTop: '10px' }}>{totalKcal} {t('macros_total_kcal')}</IonLabel>
            </IonCol>
          </IonRow>

          {/* Tarjetas para los macronutrientes centradas */}
          <IonRow className="ion-justify-content-center ion-align-items-center">
            <IonCol size="4" className="ion-align-self-center">
              <IonCard style={{ border: '1px solid black', backgroundColor: '#fff', boxShadow: '2px 2px 8px rgba(0,0,0,0.1)' }}>
                <IonCardHeader className="ion-text-center">
                  <IonLabel>{t('macros_carbs')}</IonLabel>
                </IonCardHeader>
                <IonCardContent className="ion-text-center">
                  <h3>{macros.carbs.grams}g</h3>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="4" className="ion-align-self-center">
              <IonCard style={{ border: '1px solid black', backgroundColor: '#fff', boxShadow: '2px 2px 8px rgba(0,0,0,0.1)' }}>
                <IonCardHeader className="ion-text-center">
                  <IonLabel>{t('macros_protein')}</IonLabel>
                </IonCardHeader>
                <IonCardContent className="ion-text-center">
                  <h3>{macros.protein.grams}g</h3>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="4" className="ion-align-self-center">
              <IonCard style={{ border: '1px solid black', backgroundColor: '#fff', boxShadow: '2px 2px 8px rgba(0,0,0,0.1)' }}>
                <IonCardHeader className="ion-text-center">
                  <IonLabel>{t('macros_fat')}</IonLabel>
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
                <IonLabel style={{ fontSize: '16px', fontWeight: 'bold' }}>{t('meal_distribution')}</IonLabel>
              </IonCol>
            </IonRow>
            <IonCol size="10" style={{ marginBottom: '60px' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px', margin: '0 auto', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                <thead>
                  <tr style={{ backgroundColor: '#4CAF50', color: '#fff', fontWeight: 'bold', borderRadius: '10px 10px 0 0' }}>
                    <th style={{ padding: '12px', border: '1px solid #ddd', borderTopLeftRadius: '10px' }}>{t('breakfast')}</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd' }}>{t('lunch')}</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd' }}>{t('dinner')}</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', borderTopRightRadius: '10px' }}>{t('snacks')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ backgroundColor: '#f9f9f9', textAlign: 'center' }}>
                    <td>{t('percentage_20')}</td>
                    <td>{t('percentage_40')}</td>
                    <td>{t('percentage_30')}</td>
                    <td>{t('percentage_10')}</td>
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
