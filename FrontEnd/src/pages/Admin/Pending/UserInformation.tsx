import React, { useEffect, useState, useContext } from 'react';
import { Button, Card, CardContent, Divider, Typography, Box, List, ListItem, ListItemText, Avatar, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useHistory, useLocation } from 'react-router-dom';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext';
import { Line } from 'react-chartjs-2';

const UserInformation: React.FC = () => {
    const location = useLocation<{ userId: number; showPlanSection: boolean }>();
    const { userId } = location.state;
    const { showPlanSection } = location.state;
    const history = useHistory();
    const { t } = useContext(LanguageContext);
    const [userData, setUserData] = useState<any>(null);
    const [plans, setPlans] = useState<any[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<number | "new" | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isNutritionPlan, setIsNutritionPlan] = useState<boolean>(false);

    useEffect(() => {
        const storedUserData = localStorage.getItem(`user_data_${userId}`);
        const storedPlans = localStorage.getItem(`plans_${userId}`);

        if (storedUserData) {
            setUserData(JSON.parse(storedUserData));
            setLoading(false);
        } else {
            fetchUserDetails();
        }

        if (showPlanSection) {
            if (storedPlans) {
                setPlans(JSON.parse(storedPlans));
            } else {
                fetchUserRole();
            }
        }
    }, []);

    const fetchUserRole = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) return;
            const response = await fetch(`http://127.0.0.1:8000/api/user/role/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            if (response.ok) {
                const data = await response.json();
                const isNutriRole = data.role === 'nutricionista';
                setIsNutritionPlan(isNutriRole);

                fetchPlans(isNutriRole);
            } else {
                console.error("Error fetching user role");
            }
        } catch (error) {
            console.error("Error fetching user role:", error);
        }
    };

    const fetchUserDetails = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) return;
            const response = await fetch(`http://127.0.0.1:8000/api/users/all-details/${userId}/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            if (response.ok) {
                const data = await response.json();
                setUserData(data);
                localStorage.setItem(`user_data_${userId}`, JSON.stringify(data)); // Guardar en localStorage
            }
        } catch (error) {
            console.error('Error fetching user details', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPlans = async (isNutritionPlan: boolean) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) return;

            const endpoint = isNutritionPlan
                ? `http://127.0.0.1:8000/api/nutritionplans/`
                : `http://127.0.0.1:8000/api/trainingplans/`;

            const response = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });

            if (response.ok) {
                const data = await response.json();
                setPlans(data.data);
                localStorage.setItem(`plans_${userId}`, JSON.stringify(data.data)); // Guardar en localStorage
            }
        } catch (error) {
            console.error('Error fetching plans', error);
        }
    };

    const handlePlanAssign = async () => {
        if (selectedPlan && selectedPlan !== "new") {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) return;

            try {
                const response = await fetch(`http://127.0.0.1:8000/api/assign-single-plan/${userId}/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id_plan: selectedPlan,
                        is_nutrition_plan: isNutritionPlan,
                    }),
                });

                if (response.ok) {
                    history.push('/admin/pending-users');
                } else {
                    console.error("Failed to assign the plan");
                }
            } catch (error) {
                console.error('Error assigning plan:', error);
            }
        }
    };

    const handleSelectChange = (event: SelectChangeEvent<number | "new">) => {
        const value = event.target.value as number | "new";
        setSelectedPlan(value);

        if (value === "new") {
            const path = isNutritionPlan ? '/admin/nutrition/add' : '/admin/trainingplans/add';
            history.push(path);
        }
    };

    const chartData = userData && userData.weight_records ? {
        labels: userData.weight_records.map((record: { date: string }) =>
            new Date(record.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })
        ),
        datasets: [
            {
                label: t('Weight Evolution'),
                data: userData.weight_records.map((record: { weight: number }) => record.weight),
                borderColor: 'rgba(70, 130, 180, 1)',
                backgroundColor: 'rgba(70, 130, 180, 0.2)',
                fill: true,
            },
        ],
    } : {
        labels: [],
        datasets: [
            {
                label: t('Weight Evolution'),
                data: [],
                borderColor: 'rgba(70, 130, 180, 1)',
                backgroundColor: 'rgba(70, 130, 180, 0.2)',
                fill: true,
            },
        ],
    };


    if (loading) return <Typography>{t("loading_admin")}</Typography>;


    return (
        <Box sx={{ marginTop: '16%' }}>
            <Header title={t('user_profile_admin')} />
            <Box style={{ padding: '20px', backgroundColor: '#f5f5f5', paddingBottom: '15%' }}>

                {/* Información Personal */}
                <Card sx={{ padding: '10px', marginTop: '10px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center">
                            <Avatar sx={{ width: '60px', height: '60px', marginRight: '15px' }}>
                                {userData?.profile_photo ? (
                                    <img src={userData.profile_photo} alt={t('profile_picture_alt_admin')} style={{ width: '100%', height: '100%' }} />
                                ) : (
                                    t('no_image_admin')
                                )}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{userData?.first_name} {userData?.last_name}</Typography>
                                <Typography variant="body2" color="textSecondary">{userData?.email}</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Card>

                {/* Información Física */}
                <Card variant="outlined" sx={{ marginTop: '15px', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                    <CardContent>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                            {t('physical_information_admin')}
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemText primary={t('age_label')} secondary={`${userData?.age} ${t('years')}`} />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemText primary={t('height_label_admin')} secondary={`${userData?.details?.height} cm`} />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemText primary={t('weight_label_admin')} secondary={`${userData?.details?.weight} kg`} />
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>

                {/* Información Deportiva */}
                <Card variant="outlined" sx={{ marginTop: '15px', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                    <CardContent>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                            {t('sports_information_admin')}
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemText primary={t('weight_goal_admin')} secondary={t(userData?.details?.weight_goal)} />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemText primary={t('physical_activity_level_admin')} secondary={t(userData?.details?.physical_activity_level)} />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemText primary={t('weekly_training_days_admin')} secondary={`${userData?.details?.weekly_training_days} ${t('days_per_week_admin')}`} />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemText primary={t('daily_training_time_admin')} secondary={userData?.details?.daily_training_time} />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemText primary={t('available_equipment_admin')} secondary={t(userData?.details?.available_equipment)} />
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>

                {/* Información Nutricional */}
                <Card variant="outlined" sx={{ marginTop: '15px', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                    <CardContent>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                            {t('nutritional_information_admin')}
                        </Typography>
                        <List dense>
                            <ListItem>
                                <ListItemText primary={t('diet_type_admin')} secondary={userData?.diet_preferences?.diet_type} />
                            </ListItem>
                            <Divider component="li" />
                            <ListItem>
                                <ListItemText primary={t('meals_per_day_admin')} secondary={`${userData?.diet_preferences?.meals_per_day} ${t('meals_admin')}`} />
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>

                {/* Section for Weight Evolution Chart */}
                <Card variant="outlined" sx={{ marginTop: '15px', mb: '10%', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                    <CardContent>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                            {t('weight_record_history')}
                        </Typography>
                        <Line
                            data={chartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { display: false },
                                },
                                scales: {
                                    x: { title: { display: true, text: t('Date') } },
                                    y: { title: { display: true, text: t('Weight (kg)') } },
                                },
                            }}
                        />
                    </CardContent>
                </Card>

                {/* Sección de asignación de planes, solo si `showPlanSection` es true */}
                {showPlanSection && (
                    <Card variant="outlined" sx={{ marginTop: '15px', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                                {t('assign_training_plan_admin')}
                            </Typography>
                            <Select
                                fullWidth
                                value={selectedPlan || ""}
                                onChange={handleSelectChange}
                            >
                                {plans.map((plan) => (
                                    <MenuItem key={plan.id} value={plan.id}>
                                        {plan.name}
                                    </MenuItem>
                                ))}
                                <MenuItem value="new">{t("create_new_plan_admin")}</MenuItem>
                            </Select>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{
                                    backgroundColor: '#primary',
                                    color: '#ffffff',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    mt: 2,
                                    width: '100%',
                                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                    '&:hover': {
                                        backgroundColor: '#333333',
                                    },
                                }}
                                onClick={handlePlanAssign}
                            >
                                {t("assign_plan_admin")}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </Box>
        </Box>
    );
};

export default UserInformation;
