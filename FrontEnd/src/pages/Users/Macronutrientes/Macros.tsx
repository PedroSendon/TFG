import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext';

const MacronutrientPage: React.FC = () => {
  const { t } = useContext(LanguageContext);
  const [macros, setMacros] = useState({
    carbs: { grams: 0, kcal: 0, percentage: 0, color: '#ff4d4d' },
    protein: { grams: 0, kcal: 0, percentage: 0, color: '#4d79ff' },
    fat: { grams: 0, kcal: 0, percentage: 0, color: '#ffd11a' }
  });
  const [totalKcal, setTotalKcal] = useState(0);
  const [dietType, setDietType] = useState('');
  const [mealDistribution, setMealDistribution] = useState<{ [key: string]: number }>({});

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
        setMealDistribution(data.meal_distribution);
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
    <Box sx={{ width: '100%', height: '92vh', backgroundColor: '#f5f5f5', marginTop: '16%' }}>
      <Header title={t('macros_title')} />
      <Box sx={{ textAlign: 'center', mt: 2, paddingTop: '5%' }}>
        <Typography fontSize={'1.2em'} fontWeight="bold">
          {dietType}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 3 }}>
        {Object.keys(macros).map((macro) => (
          <Card
            key={macro}
            sx={{
              border: `1px solid ${macros[macro as keyof typeof macros].color}`,
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              width: '90px',
              textAlign: 'center',
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, p: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Typography variant="body2" color="textPrimary">
                  {t(`macros_${macro}`)}
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ color: macros[macro as keyof typeof macros].color, fontSize: '16px' }}>
                {macros[macro as keyof typeof macros].grams}g
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ textAlign: 'center' }}>
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
          <text
            x={150}
            y={150}
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontSize: '18px', fontWeight: 'bold', fill: '#333' }}
          >
            {totalKcal} kcal
          </text>
          <Legend />
          <Tooltip />
        </PieChart>
      </Box>

      <Box sx={{ borderTop: '1px solid #ccc', width: '80%', m: '20px auto' }} />

      {/* Meal Distribution Table based on dynamic columns */}
      <Box sx={{ textAlign: 'center', mt: 3, paddingBottom: '15%' }}>
        <Typography sx={{ mb: 2, color: '#333', textAlign: 'center', fontWeight: 'bold' }}>
          {t('meal_distribution')}
        </Typography>
        <Table
          sx={{
            maxWidth: '90%',
            margin: '20px auto',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#fff',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: '#333' }}>
              {Object.keys(mealDistribution).map((meal, index) => (
                <TableCell key={index} align="center" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>
                  {t(meal)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {Object.values(mealDistribution).map((percentage, index) => (
                <TableCell key={index} align="center" sx={{ fontSize: '13px', fontWeight: 'bold' }}>
                  {`${percentage}%`}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default MacronutrientPage;
