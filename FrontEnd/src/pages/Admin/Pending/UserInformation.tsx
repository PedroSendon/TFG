import React, { useEffect, useState, useContext } from 'react';
import { Button, Card, CardContent, Divider, Typography, Box, List, ListItem, ListItemText, Avatar, Select, MenuItem } from '@mui/material';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext';

const UserInformation: React.FC = () => {
    const location = useLocation<{ userId: number }>(); // Extrae `userId` desde `location.state`
    const { userId } = location.state;
    const history = useHistory();
    const { t } = useContext(LanguageContext);
    const [userData, setUserData] = useState<any>(null);
    const [trainingPlans, setTrainingPlans] = useState<any[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<number | "new" | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isNutritionPlan, setIsNutritionPlan] = useState<boolean>(false); // Nuevo estado para el tipo de plan

    useEffect(() => {
        fetchUserDetails();
        fetchTrainingPlans();
        fetchUserRole();  // Nueva función para determinar el tipo de plan
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
                // Si el rol es 'nutricionista', configuramos `isNutritionPlan` a `true`, de lo contrario a `false`
                setIsNutritionPlan(data.role === 'nutricionista');
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
            if (response.ok) setUserData(await response.json());
        } catch (error) {
            console.error('Error fetching user details', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrainingPlans = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) return;
            const response = await fetch(`http://127.0.0.1:8000/api/trainingplans/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            if (response.ok) {
                const data = await response.json();
                setTrainingPlans(data.data);
            }
        } catch (error) {
            console.error('Error fetching training plans', error);
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
                    const result = await response.json();
                    console.log(result.message);
                } else {
                    console.error("Failed to assign the plan");
                }
            } catch (error) {
                console.error('Error assigning plan:', error);
            }
        }
    };

    const handleSelectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const value = event.target.value as number | "new";
        setSelectedPlan(value);

        if (value === "new") {
            history.push('/admin/trainingplans/add');
        }
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

                {/* Asignación de Plan de Entrenamiento */}
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
                            {trainingPlans.map((plan) => (
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
                            sx={{ mt: 2 }}
                            onClick={handlePlanAssign}
                        >
                            {t("assign_plan_admin")}
                        </Button>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default UserInformation;
