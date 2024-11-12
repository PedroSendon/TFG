import React, { useEffect, useState, useContext } from 'react';
import { Card, CardContent, Typography, Box, Divider, List, ListItem, ListItemText, Avatar, Grid } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext';

const ExerciseDetails: React.FC = () => {
    const { t } = useContext(LanguageContext);
    const location = useLocation<{ exerciseId: number }>();
    const exerciseId = location.state?.exerciseId;
    const [exerciseData, setExerciseData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (exerciseId) fetchExerciseDetails();
    }, [exerciseId]);

    const fetchExerciseDetails = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error('Access token missing');
                return;
            }

            const response = await fetch(`http://127.0.0.1:8000/api/exercises/${exerciseId}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                }
            });

            if (response.ok) {
                const data = await response.json();
                setExerciseData(data);
            } else {
                console.error("Failed to fetch exercise details:", response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching exercise data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>{t('loading_exercise')}</p>;

    return (
        <Box sx={{ marginTop: '16%', paddingBottom: '15%' }}>
            <Header title={t('exercise_details')} />
            <Box sx={{ padding: '20px', backgroundColor: '#f5f5f5' }}>

                {/* General Information */}
                <Card sx={{
                    padding: '20px',
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e0e0e0',
                    marginBottom: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    {/* Exercise Image */}
                    <Avatar
                        src={exerciseData?.media}
                        alt={exerciseData?.name}
                        variant="rounded"
                        sx={{
                            width: '100%',
                            maxWidth: '300px',
                            height: 'auto',
                            marginBottom: 2,
                            borderRadius: '8px'
                        }}
                    />

                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', marginBottom: 1, textAlign: 'center' }}>
                        {exerciseData?.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', marginBottom: 2 }}>
                        {exerciseData?.description || t('no_description')}
                    </Typography>
                </Card>

                {/* Exercise Details */}
                <Card variant="outlined" sx={{
                    borderRadius: '10px',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                    padding: '15px',
                    marginBottom: '15px',
                    border: '1px solid #e0e0e0',
                }}>
                    <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
                            {t('exercise_details')}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {/* Exercise Information */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" sx={{ color: '#555', fontWeight: 'bold' }}>
                                    {t('muscle_groups')}
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                    {exerciseData?.muscleGroups.join(', ')}
                                </Typography>
                            </Grid>

                        </Grid>

                        <Divider sx={{ my: 2 }} />

                        {/* Instructions */}
                        <Typography variant="body2" sx={{ color: '#555', fontWeight: 'bold' }}>
                            {t('instructions')}
                        </Typography>
                        <List dense sx={{ paddingLeft: 2 }}>
                            {exerciseData?.instructions.map((instruction: string, index: number) => (
                                <ListItem key={index} sx={{ alignItems: 'flex-start', paddingY: 0.5 }}>
                                    <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        {index + 1}.
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {instruction}
                                    </Typography>
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default ExerciseDetails;
