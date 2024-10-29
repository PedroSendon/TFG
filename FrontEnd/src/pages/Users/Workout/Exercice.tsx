import React, { useEffect, useState, useContext } from 'react';

import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Header from '../../Header/Header';
import ExerciseInfoModal from './ExerciceInformation';
import { useLocation, useParams, useHistory } from 'react-router';
import { LanguageContext } from '../../../context/LanguageContext'; // Importar el contexto de idioma
import { Box, Chip, CircularProgress, Grid, IconButton, Snackbar, Typography } from '@mui/material';

const ExerciseDetailPage: React.FC = () => {
    const location = useLocation<{ day_id: number, exerciseId: string }>();
    const history = useHistory();
    const day_id = location.state?.day_id;
    const exerciseId = location.state?.exerciseId;


    const [showModal, setShowModal] = useState(false);
    const [exerciseInfo, setExerciseInfo] = useState<{
        id?: number;
        name?: string;
        description?: string;
        muscleGroups: string[];
        instructions?: string[];
        media: string[];
        sets?: number;
        reps?: number;
        rest?: number;
    }>({
        muscleGroups: [],
        media: [],
    });
    const [loading, setLoading] = useState(true);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const { t } = useContext(LanguageContext); // Usar el contexto de idioma

    const fetchExerciseDetails = async (day_id: number, exerciseId: string) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error('No access token found');
                return;
            }
            const response = await fetch(`http://127.0.0.1:8000/api/exercises/details/`, {
                method: 'POST', // Usa POST para enviar parámetros en el cuerpo si prefieres no usar GET
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ day_id, exerciseId }),
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (typeof data.media === "string") {
                data.media = [data.media];
            }
            if (!data.media || data.media.length === 0) {
                data.media = ["https://via.placeholder.com/300x200"];
            }
            setExerciseInfo(data);

        } catch (error) {
            console.error('Error fetching exercise details:', error);
            setShowToast(true);
        }finally {
            setLoading(false);
        }
    };


    // Asegúrate de que `exerciseId` esté definido antes de realizar la petición
    useEffect(() => {
        if (day_id && exerciseId) {
            fetchExerciseDetails(day_id, exerciseId);
        }
    }, [day_id, exerciseId]);

    const handleNextImage = () => {
        if (exerciseInfo?.media && currentImageIndex < exerciseInfo.media.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        }
    };

    const handlePreviousImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
    };
    const handleBack = (id: number) => {
        history.push({
            pathname: `/workout/day`,
            state: { day_id: id },
          });    };


    if (!exerciseInfo) {
        return <p>{t('loading_exercise_details')}</p>;
    }
    return (
        <Box sx={{ minHeight: '92vh', bgcolor: '#f5f5f5', marginTop: '64px' }}>
            <Header title={t('exercise_details')} onBack={() => handleBack(day_id)} showBackButton={true} />
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
                    <CircularProgress color="inherit" />
                </Box>
            ) : (
                <Box padding={3}>

                    {/* Image Viewer */}
                    <Grid container justifyContent="center" alignItems="center" spacing={2}>
                        <Grid item xs={12} sx={{ position: 'relative', textAlign: 'center', mb: 3 }}>
                            <IconButton
                                onClick={handlePreviousImage}
                                sx={{
                                    position: 'absolute', left: 8, top: '50%',
                                    transform: 'translateY(-50%)', color: '#333', zIndex: 1,
                                }}
                            >
                                <ArrowBackIcon sx={{ fontSize: 32 }} />
                            </IconButton>
                            <img
                                src={exerciseInfo.media[currentImageIndex]}
                                alt={t('exercise_image')}
                                style={{
                                    width: '100%',
                                    borderRadius: '10px',
                                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                                    border: '1px solid #e0e0e0',
                                }}
                            />
                            <IconButton
                                onClick={handleNextImage}
                                sx={{
                                    position: 'absolute', right: 8, top: '50%',
                                    transform: 'translateY(-50%)', color: '#333', zIndex: 1,
                                }}
                            >
                                <ArrowForwardIcon sx={{ fontSize: 32 }} />
                            </IconButton>
                        </Grid>

                        {/* Exercise Name and Info Button */}
                        <Grid item xs={10}>
                            <Typography variant="h5" fontWeight="bold">
                                {exerciseInfo.name}
                            </Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButton onClick={() => setShowModal(true)}>
                                <InfoIcon sx={{ fontSize: 28, color: '#333' }} />
                            </IconButton>
                        </Grid>

                        {/* Muscle Groups */}
                        <Grid item xs={12} sx={{ textAlign: 'center', mb: 3 }}>
                            {exerciseInfo.muscleGroups.map((muscle, index) => (
                                <Chip
                                    key={index}
                                    label={muscle}
                                    sx={{
                                        backgroundColor: '#333',
                                        color: '#fff',
                                        fontSize: '12px',
                                        margin: '4px',
                                        boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
                                    }}
                                />
                            ))}
                        </Grid>

                        {/* Exercise Parameters */}
                        <Grid container item xs={12} justifyContent="center" spacing={2}>
                            {['sets', 'reps', 'rest'].map((param, index) => (
                                <Grid item key={index} xs={4} textAlign="center">
                                    <Box
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            borderRadius: '50%',
                                            border: '2px solid #333',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            bgcolor: '#fff',
                                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'scale(1.05)',
                                                boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.2)',
                                            },
                                        }}
                                    >
                                        <Typography variant="subtitle2" color="#555">{t(param)}</Typography>
                                        <Typography variant="h6" fontWeight="bold" color="#333">
                                            {exerciseInfo[param as 'sets' | 'reps' | 'rest']}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Modal with detailed exercise info */}
                        <ExerciseInfoModal
                            isOpen={showModal}
                            onClose={() => setShowModal(false)}
                            exerciseName={exerciseInfo.name || ''}
                            description={exerciseInfo.description || ''}
                            steps={exerciseInfo.instructions || []}
                        />

                        {/* Snackbar for errors */}
                        <Snackbar
                            open={showToast}
                            autoHideDuration={2000}
                            onClose={() => setShowToast(false)}
                            message={t('error_fetching_exercise_details')}
                        />
                    </Grid>
                </Box>
            )}
        </Box>
    );
};

export default ExerciseDetailPage;