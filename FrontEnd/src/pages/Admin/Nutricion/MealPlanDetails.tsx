import React, { useEffect, useState, useContext } from 'react';
import { Card, CardContent, Typography, Box, Divider, List, ListItem, ListItemText } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext';

const MealPlanDetails: React.FC = () => {
    const { t } = useContext(LanguageContext);
    const location = useLocation<{ mealPlanId: number }>();
    const mealPlanId = location.state?.mealPlanId;
    const [mealPlanData, setMealPlanData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (mealPlanId) fetchMealPlanDetails();
    }, [mealPlanId]);

    const fetchMealPlanDetails = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken || !mealPlanId) return;
            const response = await fetch(`http://127.0.0.1:8000/api/mealplans/${mealPlanId}/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            if (response.ok) setMealPlanData(await response.json());
        } catch (error) {
            console.error('Error fetching meal plan data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>{t('loading_meal_plan')}</p>;

    return (
        <Box sx={{ marginTop: '16%', paddingBottom: '15%' }}>
            <Header title={t('meal_plan_details')} />
            <Box sx={{ padding: '20px', backgroundColor: '#f5f5f5' }}>

                {/* General Information */}
                <Card sx={{
                    padding: '10px',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e0e0e0',
                    marginBottom: '15px'
                }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                            {mealPlanData?.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {t('diet_type')}: {t(mealPlanData?.dietType)}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body1">
                            {t('description')}: {mealPlanData?.description || t('no_description')}
                        </Typography>
                    </CardContent>
                </Card>

                {/* Macronutrient Details */}
                <Card variant="outlined" sx={{
                    borderRadius: '8px',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                    marginBottom: '15px'
                }}>
                    <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
                            {t('macronutrient_info')}
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemText primary={t('calories')} secondary={`${mealPlanData?.calories} kcal`} />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemText primary={t('proteins')} secondary={`${mealPlanData?.proteins} g`} />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemText primary={t('carbs')} secondary={`${mealPlanData?.carbs} g`} />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemText primary={t('fats')} secondary={`${mealPlanData?.fats} g`} />
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>

                {/* Meal Distribution */}
                {mealPlanData?.meal_distribution && (
                    <Card variant="outlined" sx={{
                        borderRadius: '8px',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                        marginBottom: '15px'
                    }}>
                        <CardContent>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
                                {t('meal_distribution')}
                            </Typography>
                            <List dense>
                                {Object.entries(mealPlanData.meal_distribution).map(([meal, percentage], index) => (
                                    <ListItem key={index}>
                                        <ListItemText primary={`${t('meal')} ${index + 1}`} secondary={`${percentage}%`} />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                )}

            </Box>
        </Box>
    );
};

export default MealPlanDetails;
