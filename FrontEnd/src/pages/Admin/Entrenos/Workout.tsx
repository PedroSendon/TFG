import React, { useState, useEffect, useContext } from 'react';
import { AssignmentOutlined, FitnessCenter, Edit as EditIcon, Delete as DeleteIcon, Close, Add } from '@mui/icons-material';
import Header from '../../Header/Header';
import Navbar from '../../Navbar/Navbar';
import { useHistory } from 'react-router';
import { Box, Button, Card, CardContent, Container, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Grid, IconButton, Tab, Tabs, Typography } from '@mui/material';
import { LanguageContext } from '../../../context/LanguageContext'; // Importamos el contexto de idioma

interface Workout {
    id: number;
    name: string;
    description: string;
}

interface Exercise {
    id: number;
    name: string;
    description: string;
}

interface TrainingPlan {
    id: number;
    name: string;
    description: string;
}

const WorkoutsExercises: React.FC = () => {
    const { t } = useContext(LanguageContext); // Usamos el contexto de idioma
    const history = useHistory();
    const [selectedSection, setSelectedSection] = useState<string>('workouts');
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]); // Nueva constante
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteDetails, setDeleteDetails] = useState<{ id: number; type: string } | null>(null);
    const [refreshData, setRefreshData] = useState(false); // Nueva variable de estado

    // Función para obtener datos desde el BE
    const fetchData = async () => {
        await fetchWorkouts();
        await fetchExercises();
        await fetchTrainingPlans();
    };

    // Obtener datos al cargar el componente o cuando `refreshData` cambie
    useEffect(() => {
        fetchData();
    }, [refreshData]);

    const fetchWorkouts = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');

            if (!accessToken) {
                console.error(t('no_token'));
                return;
            }
            const response = await fetch('http://127.0.0.1:8000/api/workouts/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,  // Agrega el token JWT aquí
                },
            });
            const data = await response.json();
            setWorkouts(data.data.map((workout: any) => ({
                id: workout.id,
                name: workout.name,
                description: workout.description,
                media: workout.media,
            })));
        } catch (error) {
            console.error(t('error_fetching_workouts'), error);
        }
    };
    const fetchTrainingPlans = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');

            if (!accessToken) {
                console.error("Token no encontrado");
                return;
            }

            const response = await fetch('http://127.0.0.1:8000/api/trainingplans/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Detalles del error:", errorData);
                throw new Error(`Error fetching training plans: ${response.status}`);
            }

            const data = await response.json();
            setTrainingPlans(data.data.map((plan: any) => ({
                id: plan.id,
                name: plan.name,
                description: plan.description,
                difficulty: plan.difficulty,
                equipment: plan.equipment,
                media: plan.media,
                duration: plan.duration,
                workouts: plan.workouts,
            })));
        } catch (error) {
            console.error("Error al obtener planes de entrenamiento:", error);
        }
    };



    const fetchExercises = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error(t('no_token'));
                return;
            }
            const response = await fetch('http://127.0.0.1:8000/api/exercises/all/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            setExercises(data.data || []); // Asegúrate de que sea un array vacío si no hay datos
        } catch (error) {
            console.error(t('error_fetching_exercises'), error);
        }
    };



    const openDeleteDialog = (id: number, type: string) => {
        if (['workout', 'exercise', 'trainingPlan'].includes(type)) { // Asegura que el tipo sea válido
            setDeleteDetails({ id, type });
            setOpenDialog(true);
        } else {
            console.error(`Tipo no válido para eliminación: ${type}`);
        }
    };

    const handleDelete = async () => {
        if (!deleteDetails) return;
        const { id, type } = deleteDetails;
        const accessToken = localStorage.getItem('access_token');

        let deleteUrl = '';
        if (type === 'workout') {
            deleteUrl = `http://127.0.0.1:8000/api/workouts/${id}/delete/`;
        } else if (type === 'exercise') {
            deleteUrl = `http://127.0.0.1:8000/api/exercises/${id}/delete/`;
        } else if (type === 'trainingPlan') {
            deleteUrl = `http://127.0.0.1:8000/api/trainingplans/${id}/delete/`;
        } else {
            console.error('Tipo de eliminación no válido');
            return;
        }

        try {
            const response = await fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                setRefreshData(!refreshData); // Actualiza `refreshData` para forzar el reload
            } else {
                console.error('Error al eliminar el elemento');
            }
        } catch (error) {
            console.error('Error en la solicitud de eliminación:', error);
        } finally {
            setOpenDialog(false);
            setDeleteDetails(null);
        }
    };


    const handleSectionChange = (event: React.SyntheticEvent, newValue: string) => {
        setSelectedSection(newValue);
    };


    const handleEdit = (id: number, type: string) => {
        const selectedData = type === 'workout'
            ? workouts.find((workout) => workout.id === id)
            : exercises.find((exercise) => exercise.id === id);
        if (!selectedData) {
            console.error(t('not_found'));
            return;
        }

        history.push({
            pathname: `/admin/${type}/modify`,
            state: { data: { ...selectedData, id } },
        });
    };

    const handleAdd = (type: string) => {
        history.push(`/admin/${type}/add`);
    };

    const handleCardClick = (id: number) => {
        if (selectedSection === 'workouts') {
            history.push({
                pathname: '/admin/workout/details',
                state: { workoutId: id },
            });
        } else if (selectedSection === 'exercises') {
            history.push({
                pathname: '/admin/exercises/details',
                state: { exerciseId: id },
            });
        } else if (selectedSection === 'trainingPlans') {
            history.push({
                pathname: '/admin/trainingplans/details',
                state: { trainingPlanId: id },
            });
        }
    };

    return (
        <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header title={t(selectedSection === 'workouts' ? 'workouts' : 'exercises')} />
            <Container maxWidth="sm" sx={{ mt: 8, pb: 16, flexGrow: 1 }}>
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        backgroundColor: '#f5f5f5',
                        paddingTop: '16%',
                        zIndex: 1000,
                        borderBottom: '1px solid #ccc', // Línea inferior para separación
                    }}
                >
                    <Tabs
                        value={selectedSection}
                        onChange={handleSectionChange}
                        centered
                        sx={{
                            color: 'gray',
                            '.MuiTab-root': {
                                color: '#b0b0b0',
                                '&.Mui-selected': {
                                    color: 'gray', // Color gris para el texto seleccionado
                                },
                            },
                            '.MuiTabs-indicator': {
                                backgroundColor: 'gray', // Color gris para el indicador seleccionado
                            },
                        }}
                    >
                        <Tab label={t('workouts')} value="workouts" />
                        <Tab label={t('exercises')} value="exercises" />
                        <Tab label={t('training_plans')} value="trainingPlans" />
                    </Tabs>
                </Box>
                <Box sx={{ mt: 4, paddingTop: '9%' }}>
                    <Grid container spacing={2}>
                        {(selectedSection === 'workouts' ? workouts : selectedSection === 'trainingPlans' ? trainingPlans : exercises).map((item) => (
                            <Grid item xs={12} key={item.id}>
                                <Card sx={{
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '10px',
                                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid #e0e0e0',
                                    paddingX: 2,
                                    '&:hover': {
                                        transform: 'scale(1.02)',
                                        boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.15)'
                                    },
                                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                }}
                                    onClick={() => handleCardClick(item.id)} // Añadimos el evento onClick
                                >
                                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography sx={{ color: '#000000', fontWeight: 'bold', fontSize: '1em' }}>
                                            {item.name}
                                        </Typography>
                                        {/* Botones alineados a la derecha */}
                                        <Box sx={{ display: 'flex', gap: '7px' }}>
                                            <IconButton
                                                onClick={(e) => { e.stopPropagation(); handleEdit(item.id, selectedSection); }}
                                                sx={{
                                                    border: '1px solid #000',
                                                    backgroundColor: '#FFFFFF',
                                                    color: '#000',
                                                    borderRadius: '5px',
                                                    padding: '4px',
                                                    fontSize: '0.8em',
                                                    '&:hover': { backgroundColor: '#f3f3f3' },
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const type = selectedSection === 'workouts' ? 'workout' :
                                                        selectedSection === 'exercises' ? 'exercise' :
                                                            'trainingPlan';
                                                    openDeleteDialog(item.id, type);
                                                }}
                                                sx={{
                                                    border: '1px solid #FF0000',
                                                    backgroundColor: '#FFFFFF',
                                                    color: '#FF0000',
                                                    borderRadius: '5px',
                                                    padding: '4px',
                                                    fontSize: '0.8em',
                                                    '&:hover': { backgroundColor: '#f3f3f3' },
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>

                                        </Box>

                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Botones flotantes para agregar elementos */}
                <Fab
                    onClick={() => handleAdd(selectedSection)}
                    sx={{
                        position: 'fixed',
                        bottom: '10%',
                        right: '5%',
                        backgroundColor: '#FFFFFF',
                        color: '#000',
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        border: '2px solid #000',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
                        '&:hover': {
                            backgroundColor: '#f5f5f5',
                        },
                    }}
                >
                   <Add sx={{ fontSize: 24 }} />
                </Fab>
            </Container>
            {/* Diálogo de confirmación de eliminación */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>
                    {t('confirm_delete')}
                    <IconButton
                        edge="end"
                        onClick={() => setOpenDialog(false)}
                        sx={{ position: 'absolute', right: 8, top: 8, color: '#888' }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography>{t('delete_message')}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} sx={{ color: '#555' }}>
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleDelete} sx={{ color: '#FF0000' }}>
                        {t('delete')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WorkoutsExercises;
