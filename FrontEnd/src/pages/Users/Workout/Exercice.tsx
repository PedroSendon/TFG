import React, { useEffect, useState, useContext } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Header from '../../Header/Header';
import ExerciseInfoModal from './ExerciceInformation';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useLocation, useHistory } from 'react-router';
import { LanguageContext } from '../../../context/LanguageContext';
import { Box, Chip, CircularProgress, Grid, IconButton, Snackbar, Typography, Button, Dialog, DialogActions, DialogContent, DialogContentText } from '@mui/material';

const ExerciseDetailPage: React.FC = () => {
    const location = useLocation<{ day_id: number; exerciseId: string; completedExercises?: { [key: number]: boolean } }>();
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
    const [timer, setTimer] = useState<number | null>(null);
    const [isCounting, setIsCounting] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const { t } = useContext(LanguageContext);

    // Usar el estado recibido o inicializar un objeto vacío
    const [completedExercises, setCompletedExercises] = useState<{ [key: number]: boolean }>(
        location.state?.completedExercises || {}
    );

    const handleMarkAsComplete = () => {
        const updatedCompletedExercises = { ...completedExercises, [exerciseId]: true };
        setCompletedExercises(updatedCompletedExercises);
        localStorage.setItem(`completedExercises_${day_id}`, JSON.stringify(updatedCompletedExercises)); // Guardamos en Local Storage
    
        history.push({
            pathname: '/workout/day',
            state: { day_id, completedExercises: updatedCompletedExercises },
        });
    };
    const fetchExerciseDetails = async (day_id: number, exerciseId: string) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error('No access token found');
                return;
            }
            const response = await fetch(`http://127.0.0.1:8000/api/exercises/details/`, {
                method: 'POST',
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
            setTimer(data.rest || 0);
        } catch (error) {
            console.error('Error fetching exercise details:', error);
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

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
        });
    };

    // Start or reset countdown timer
    const handleStartTimer = () => {
        setIsCounting(true);
        setTimer(exerciseInfo.rest || 0); // Reset timer to initial rest value
    };

    useEffect(() => {
        let countdownInterval: NodeJS.Timeout | undefined;
        if (isCounting && timer && timer > 0) {
            countdownInterval = setInterval(() => {
                setTimer((prevTimer) => (prevTimer || 1) - 1);
            }, 1000);
        } else if (timer === 0) {
            if (countdownInterval) clearInterval(countdownInterval);
            setIsCounting(false);
            setShowAlert(true); // Show alert when timer ends
        }
        return () => {
            if (countdownInterval) clearInterval(countdownInterval);
        };
    }, [isCounting, timer]);

    const handleAlertClose = () => {
        setShowAlert(false);
        setTimer(exerciseInfo.rest || 0); // Reset timer and circle size
    };

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
                    <Grid container justifyContent="center" alignItems="center" >
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

                        <Grid item xs={10}>
                            <Typography fontSize={'1.2em'} fontWeight="bold">
                                {exerciseInfo.name}
                            </Typography>
                        </Grid>
                        <Grid item xs={2} textAlign="right">
                            <IconButton onClick={() => setShowModal(true)}>
                                <InfoIcon sx={{ fontSize: 28, color: '#333' }} />
                            </IconButton>
                        </Grid>

                        <Grid item xs={12} sx={{ textAlign: 'left', mb: 3 }}>
                            {exerciseInfo.muscleGroups.map((muscle, index) => (
                                <Chip
                                    key={index}
                                    label={muscle}
                                    sx={{
                                        backgroundColor: '#333',
                                        color: '#fff',
                                        fontSize: '0.7em',
                                        margin: '4px',
                                        boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
                                    }}
                                />
                            ))}
                        </Grid>

                        {/* Sets and Reps row */}
                        <Grid container justifyContent="center" spacing={4} sx={{ mb: 1 }}>
                            <Grid item xs={3} textAlign="center">
                                <Box
                                    sx={{
                                        width: 70,
                                        height: 70,
                                        borderRadius: '50%',
                                        border: '2px solid #333',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        bgcolor: '#fff',
                                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                    }}
                                >
                                    <Typography fontSize={'0.8em'} color="#555">{t('sets_disc')}</Typography>
                                    <Typography variant="h6" fontWeight="bold" color="#333">
                                        {exerciseInfo.sets}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={3} textAlign="center">
                                <Box
                                    sx={{
                                        width: 70,
                                        height: 70,
                                        borderRadius: '50%',
                                        border: '2px solid #333',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        bgcolor: '#fff',
                                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                    }}
                                >
                                    <Typography fontSize={'0.8em'} color="#555">{t('repetitions_disc')}</Typography>
                                    <Typography variant="h6" fontWeight="bold" color="#333">
                                        {exerciseInfo.reps}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* Rest Timer */}
                        <Grid container justifyContent="center">
                            <Box
                                sx={{
                                    width: 160,
                                    height: 160,
                                    borderRadius: '50%',
                                    border: '2px solid #333',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    bgcolor: '#fff',
                                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                    position: 'relative',
                                    textAlign: 'center',
                                }}
                            >
                                {isCounting && (
                                    <CircularProgress
                                        variant="determinate"
                                        value={(timer || 0) / (exerciseInfo.rest || 1) * 100}
                                        size={160}
                                        thickness={1.5} // Grosor más fino para la barra de progreso
                                        sx={{
                                            color: '#007bff',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                        }}
                                    />
                                )}

                                {/* Top Label for Rest */}
                                <Typography fontSize={'0.9rem'} color="#555" sx={{ position: 'absolute', top: '15%' }}>
                                    {t('rest_disc')}
                                </Typography>

                                {/* Centered Play Button */}
                                <IconButton
                                    onClick={handleStartTimer}
                                    sx={{
                                        backgroundColor: isCounting ? 'grey' : 'transparent',
                                        color: 'blue',
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                                        '&:hover': { backgroundColor: '#0056b3' },
                                        '&.Mui-disabled': { backgroundColor: 'transparent' },
                                    }}
                                    disabled={isCounting}
                                >
                                    <PlayArrowIcon sx={{ fontSize: 36 }} />
                                </IconButton>

                                {/* Bottom Timer */}
                                <Typography fontSize={'1.4rem'} fontWeight="bold" color="#333" sx={{ position: 'absolute', bottom: '15%' }}>
                                    {timer}s
                                </Typography>
                            </Box>
                        </Grid>


                        <Box mt={4} mb={8} display="flex" justifyContent="center" width="100%" sx={{  bottom: 0, left: 0, padding: '16px', boxSizing: 'border-box' }}>
                            <Button
                                onClick={handleMarkAsComplete}
                                variant="contained"
                                sx={{
                                    backgroundColor: '#555555',
                                    color: '#ffffff',
                                    padding: '14px 0',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    width: '100%',
                                    maxWidth: '600px', // Limita el ancho máximo en pantallas grandes
                                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                    '&:hover': {
                                        backgroundColor: '#333333',
                                    },
                                }}
                            >
                                {t('mark_training_completed')}
                            </Button>
                        </Box>


                        <ExerciseInfoModal
                            isOpen={showModal}
                            onClose={() => setShowModal(false)}
                            exerciseName={exerciseInfo.name || ''}
                            description={exerciseInfo.description || ''}
                            steps={exerciseInfo.instructions || []}
                        />

                        <Snackbar
                            open={showToast}
                            autoHideDuration={2000}
                            onClose={() => setShowToast(false)}
                            message={t('error_fetching_exercise_details')}
                        />
                    </Grid>

                    <Dialog open={showAlert} onClose={handleAlertClose} maxWidth="xs" fullWidth>
                        <DialogContent
                            sx={{
                                textAlign: 'center',
                                padding: '24px',
                                bgcolor: '#f5f5f5',
                            }}
                        >
                            <DialogContentText
                                sx={{
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    color: '#333',
                                    marginBottom: '16px',
                                }}
                            >
                                {t('timer_finished')}
                            </DialogContentText>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#666',
                                    marginBottom: '24px',
                                }}
                            >
                                {t('well_done_message')}
                            </Typography>
                        </DialogContent>
                        <DialogActions
                            sx={{
                                justifyContent: 'center',
                                paddingBottom: '16px',
                                bgcolor: '#f5f5f5',
                            }}
                        >
                            <Button
                                onClick={handleAlertClose}
                                variant="contained"
                                sx={{
                                    backgroundColor: '#555',
                                    color: '#fff',
                                    paddingX: '24px',
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        backgroundColor: '#555',
                                    },
                                }}
                            >
                                {t('ok')}
                            </Button>
                        </DialogActions>
                    </Dialog>

                </Box>
            )}
        </Box>
    );
};

export default ExerciseDetailPage;
