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
  const { t } = useContext(LanguageContext);
  const [macros, setMacros] = useState({
    carbs: { grams: 0, kcal: 0, percentage: 0, color: '#ff4d4d' },
    protein: { grams: 0, kcal: 0, percentage: 0, color: '#4d79ff' },
    fat: { grams: 0, kcal: 0, percentage: 0, color: '#ffd11a' }
  });
  const [totalKcal, setTotalKcal] = useState(0);
  const [dietType, setDietType] = useState('');

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
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      if (response.ok) {
        const data = await response.json();

        setTotalKcal(data.totalKcal);
        setMacros({
          carbs: { grams: data.macros.carbs.grams, kcal: data.macros.carbs.kcal, percentage: data.macros.carbs.percentage, color: '#ff4d4d' },
          protein: { grams: data.macros.protein.grams, kcal: data.macros.protein.kcal, percentage: data.macros.protein.percentage, color: '#4d79ff' },
          fat: { grams: data.macros.fat.grams, kcal: data.macros.fat.kcal, percentage: data.macros.fat.percentage, color: '#ffd11a' }
        });
        setDietType(data.dietType || t('diet_type_default'));
      } else {
        console.error('Error fetching user macros:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching user macros:', error);
    }
  };

  useEffect(() => {
    fetchUserMacros();
  }, []);

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
          <IonRow className="ion-text-center" style={{ marginBottom: '10px' }}>
            <IonCol size="12">
              <IonLabel style={{ fontSize: '24px', fontWeight: 'bold' }}>{dietType}</IonLabel>
            </IonCol>
          </IonRow>

          {/* Calorías Totales */}
          <IonRow className="ion-text-center" style={{ marginBottom: '20px' }}>
            <IonCol size="12">
              <IonLabel style={{ fontSize: '18px', fontWeight: 'normal', color: '#444' }}>{totalKcal} {t('macros_total_kcal')}</IonLabel>
            </IonCol>
          </IonRow>

          {/* Tarjetas para los macronutrientes centradas */}
          <IonRow className="ion-justify-content-center ion-align-items-center">
            {Object.keys(macros).map((macro) => (
              <IonCol size="4" className="ion-align-self-center" key={macro}>
                <IonCard style={{
                  border: `2px solid ${macros[macro as keyof typeof macros].color}`,
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  margin: '10px',
                }}>
                  <IonCardHeader className="ion-text-center">
                    <IonLabel>{t(`macros_${macro}`)}</IonLabel>
                  </IonCardHeader>
                  <IonCardContent className="ion-text-center">
                    <h3 style={{ color: macros[macro as keyof typeof macros].color, fontSize: '20px', fontWeight: 'bold' }}>
                      {macros[macro as keyof typeof macros].grams}g
                    </h3>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>



          {/* Título y gráfica circular de los macronutrientes */}
          <IonRow className="ion-justify-content-center ion-align-items-center" style={{ marginTop: '20px', marginBottom: '20px' }}>
            <IonCol size="12" className="ion-text-center">
              <IonLabel style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#444' }}>{t('macros_distribution')}</IonLabel>
              <PieChart width={300} height={300} style={{ display: 'inline-block', marginTop: '10px' }}>
                <Pie
                  data={pieData}
                  dataKey="value"
                  outerRadius={100}
                  innerRadius={70}
                  label={({ percent, x, y }) => (
                    <text
                      x={x}
                      y={y}
                      fill="#333"
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{ fontSize: '12px', fontWeight: 'bold' }}
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
          <hr style={{ width: '80%', margin: '0 auto', border: 'none', borderBottom: '1px solid #ccc' }} />

          {/* Tabla para la distribución de comidas estilizada */}
          <IonRow className="ion-justify-content-center" style={{ marginTop: '20px', marginBottom: '15%'}}>
            <IonCol size="12" className="ion-text-center">
              {/* Título de la distribución de comidas */}
              <IonLabel style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
                {t('meal_distribution')}
              </IonLabel>
            </IonCol>
            <IonCol size="10" className="ion-justify-content-center">
              <table style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: '0 10px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                textAlign: 'center',
                margin: '0 auto',
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#4CAF50', color: '#fff', fontWeight: 'bold' }}>
                    <th style={{ padding: '12px' }}>{t('breakfast')}</th>
                    <th style={{ padding: '12px' }}>{t('lunch')}</th>
                    <th style={{ padding: '12px' }}>{t('dinner')}</th>
                    <th style={{ padding: '12px' }}>{t('snacks')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ backgroundColor: '#f9f9f9' }}>
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
