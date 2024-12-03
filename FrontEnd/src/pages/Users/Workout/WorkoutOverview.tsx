import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { LanguageContext } from '../../../context/LanguageContext';
import Header from '../../Header/Header';
import { authenticatedFetch } from '../../../utils/authFetch';
import { Typography, IconButton, Box, Card, CardContent, Divider, Modal, List, ListItem, ListItemText } from '@mui/material';
import { Close as CloseIcon, Info as InfoIcon, PlayCircleOutline, CheckCircleOutline, Lock } from '@mui/icons-material';
import useImage from '../../Image/useImage';
import { STATIC_FILES } from '../../../context/config';

interface Workout {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  completed: boolean;
  statusIcon?: JSX.Element;
}

const WorkoutOverview: React.FC = () => {
  const history = useHistory();
  const { t } = useContext(LanguageContext);
  const location = useLocation<{ reload?: boolean }>();

  const [trainingPlan, setTrainingPlan] = useState<{
    id: number;
    name: string;
    description: string;
    difficulty: string;
    equipment: string;
    duration: number;
    workouts: Workout[];
  } | null>(null);

  const [modalOpen, setModalOpen] = useState(false); // Controla el estado del modal

  // Obtén las imágenes utilizando useImage
  const imageNames = STATIC_FILES.IMAGES;

  const [sliderImages, setSliderImages] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nextWorkout, setNextWorkout] = useState<number | null>(null);

  const [loadingImages, setLoadingImages] = useState<boolean>(true);
  const [errorImages, setErrorImages] = useState<string | null>(null);



  useEffect(() => {
    const fetchImages = async () => {
      try {
        const imageUrls = await Promise.all(
          imageNames.map(async (imageName) => {
            const response = await fetch(`http://127.0.0.1:8000/api/get-image/${imageName}`);
            if (!response.ok) throw new Error(`Error loading image: ${imageName}`);
            const data = await response.json();
            return data.image_url;
          })
        );

        setSliderImages(imageUrls);
        setLoadingImages(false);
      } catch (error) {
        console.error(error);
        setErrorImages(t('error_loading_images'));
        setLoadingImages(false);
      }
    };

    fetchImages();
  }, [t]);



  const fetchWorkouts = async () => {
    try {
      const response = await authenticatedFetch('http://127.0.0.1:8000/api/assigned-training-plan/', {
        method: 'GET',
      });

      if (!response.ok) throw new Error(t('error_fetching_workouts'));

      const data = await response.json();
      setTrainingPlan(data);

      const nextWorkoutResponse = await authenticatedFetch('http://127.0.0.1:8000/api/next-pending-workout/', {
        method: 'GET',
      });

      if (nextWorkoutResponse.ok) {
        const nextWorkoutData = await nextWorkoutResponse.json();
        setNextWorkout(nextWorkoutData?.id || null);
      }

      setLoading(false);
    } catch (err) {
      setError(t('error_fetching_workouts'));
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % sliderImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [sliderImages]);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  useEffect(() => {
    if (location.state?.reload) {
      fetchWorkouts();
      history.replace({ ...location, state: {} });
    }
  }, [location.state]);

  const handleDayClick = (id: number) => {
    history.push({
      pathname: `/workout/day`,
      state: { day_id: id },
    });
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Header title={t('loading_workouts')} />
        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
          <Typography variant="h6" color="textSecondary">
            {t('loading')}...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Header title={t('error')} />
        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', height: '100vh', marginTop: '15%' }}>
      <Header title="Training Plan Overview" />

      <Box sx={{ minHeight: '100vh' }}>

        {/* Slider de imágenes */}
        {sliderImages.length > 0 && (
          <Box
            className="slider"
            sx={{
              width: '100%',
              height: '200px',
              overflow: 'hidden',
              position: 'relative',
              marginBottom: '20px',
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)', // Sombra suave
            }}
          >
            <img
              src={sliderImages[currentSlide]}
              alt="Training plan slide"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: '0.9', // Opacidad para dar efecto elegante
              }}
            />
          </Box>

        )}

<List sx={{ padding: '0 20px', pb: '14%' }}>
  {trainingPlan &&
    trainingPlan.workouts
      .sort((a, b) => {
        if (a.id === nextWorkout) return -1; // El pendiente primero
        if (b.id === nextWorkout) return 1;
        if (a.completed && !b.completed) return 1; // Los completados después de los bloqueados
        if (!a.completed && b.completed) return -1;
        return 0; // Mantén el orden para los que tienen el mismo estado
      })
      .map((workout) => (
        <ListItem
          key={workout.id}
          component="button"
          onClick={() => {
            if (!workout.completed && workout.id !== nextWorkout) return; // No permitir interacción con bloqueados
            handleDayClick(workout.id);
          }}
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e0e0e0',
            marginBottom: '15px',
            padding: '16px',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.15)',
            },
          }}
        >
          <ListItemText
            primary={
              <Typography sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#333' }}>
                {workout.name}
              </Typography>
            }
            secondary={
              <Typography
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  fontSize: '1em',
                  WebkitBoxOrient: 'vertical',
                  color: '#666',
                }}
              >
                {workout.description}
              </Typography>
            }
          />
          <div style={{ marginLeft: '3%', display: 'flex', alignItems: 'center' }}>
            {workout.completed ? (
              <CheckCircleOutline sx={{ color: 'green', fontSize: '1.5em' }} />
            ) : workout.id === nextWorkout ? (
              <PlayCircleOutline sx={{ color: 'blue', fontSize: '1.5em' }} />
            ) : (
              <Lock sx={{ color: 'gray', fontSize: '1.5em' }} />
            )}
          </div>
        </ListItem>
      ))}
</List>


        {/* Botón de información */}
        <IconButton
          sx={{
            position: 'fixed',
            marginBottom: '15%',
            bottom: '20px',
            right: '20px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#f7f7f7',
            border: '1px solid #d0d0d0',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#e0e0e0',
              boxShadow: '0px 6px 14px rgba(0, 0, 0, 0.15)',
              transform: 'scale(1.1)',
            },
            '&:active': {
              backgroundColor: '#d0d0d0',
            },
          }}
          onClick={() => setModalOpen(true)}
        >
          <InfoIcon sx={{ color: '#5a5a5a', fontSize: '24px' }} />
        </IconButton>


        {/* Modal de información */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <Box sx={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%', bgcolor: 'background.paper', p: 4, borderRadius: '10px',
          }}>
            <IconButton onClick={() => setModalOpen(false)} sx={{ position: 'absolute', top: '10px', right: '10px', color: '#6b6b6b', zIndex: 1 }}>
              <CloseIcon />
            </IconButton>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                {t('training_plan_name')}
              </Typography>
              <Divider sx={{ margin: '10px 0', backgroundColor: '#b0b0b0' }} />
              <Typography fontSize={'0.85em'} sx={{ color: '#555', marginBottom: '20px' }}>
                {t('training_plan_description')}
              </Typography>
              <Divider sx={{ margin: '20px 0', backgroundColor: '#b0b0b0' }} />
              <Card sx={{
                backgroundColor: '#f9f9f9',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                border: '1px solid #b0b0b0',
              }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                    {t('training_information')}
                  </Typography>
                  <Divider sx={{ margin: '10px 0', backgroundColor: '#d3d3d3' }} />
                  <Typography fontSize={'0.9em'} sx={{ marginBottom: '10px', color: '#333' }}>
                    <Typography component="span" sx={{ fontWeight: 'bold', color: '#333' }}>
                      {t('training_difficulty')}:
                    </Typography> {trainingPlan?.difficulty}
                  </Typography>
                  <Divider sx={{ margin: '10px 0', backgroundColor: '#d3d3d3' }} />
                  <Typography fontSize={'0.9em'} sx={{ marginBottom: '10px', color: '#333' }}>
                    <Typography component="span" sx={{ fontWeight: 'bold', color: '#333' }}>
                      {t('training_equipment')}:
                    </Typography> {trainingPlan?.equipment}
                  </Typography>
                  <Divider sx={{ margin: '10px 0', backgroundColor: '#d3d3d3' }} />
                  <Typography fontSize={'0.9em'} sx={{ color: '#333' }}>
                    <Typography component="span" sx={{ fontWeight: 'bold', color: '#333' }}>
                      {t('training_duration')}:
                    </Typography> {trainingPlan?.duration} {t('training_duration_unit')}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Modal>

      </Box>
    </Box>
  );
};

export default WorkoutOverview;
