import React, { useEffect, useState, useContext } from 'react';
import { Box, Button, Card, CardContent, Container, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Grid, IconButton, Tab, Tabs, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Add } from '@mui/icons-material';
import { useHistory, useLocation } from 'react-router';
import { LanguageContext } from '../../../context/LanguageContext';
import Navbar from '../../Navbar/Navbar';
import Header from '../../Header/Header';

interface Category {
    id: number;
    name: string;
    description: string;
}

const MacrosAdmin: React.FC = () => {
    const { t } = useContext(LanguageContext);
    const [categories, setCategories] = useState<Category[]>([]);
    const [macros, setMacros] = useState<Record<string, any[]>>({});
    const [showDialog, setShowDialog] = useState(false);
    const [macroToDelete, setMacroToDelete] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState(0);
    const history = useHistory();

    const fetchCategories = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error(t('no_token'));
                return;
            }
            const response = await fetch('http://127.0.0.1:8000/api/diet-categories/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setCategories(data.categories);
                setSelectedCategory(0); // Seleccionar la primera categoría por defecto
                // Cargar los datos de macros de la primera categoría al iniciar
                if (data.categories.length > 0) {
                    fetchMacros(data.categories[0].name);
                }
            } else {
                console.error('Error fetching categories:', data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchMacros = async (categoryName: string) => {
        try {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                console.error(t('no_token'));
                return;
            }
            const response = await fetch(`http://127.0.0.1:8000/api/mealplans/${categoryName}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setMacros((prev) => ({ ...prev, [categoryName]: data }));
            } else {
                console.error('Error fetching macros:', data);
            }
        } catch (error) {
            console.error('Error fetching macros:', error);
        }
    };

    useEffect(() => {
        fetchCategories();

    }, []);

    useEffect(() => {
        if (categories.length > 0) {
            fetchMacros(categories[selectedCategory].name);
        }
    }, [selectedCategory]);

    const handleDelete = async () => {
        if (macroToDelete !== null) {
            try {
                const accessToken = localStorage.getItem('access_token');
                if (!accessToken) {
                    console.error(t('no_token'));
                    return;
                }
                const response = await fetch(`http://127.0.0.1:8000/api/mealplans/${categories[selectedCategory].name}/${macroToDelete}/delete/`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                if (response.ok) {
                    fetchMacros(categories[selectedCategory].name); // Refrescar la lista de macros tras la eliminación
                } else {
                    console.error('Error deleting macro');
                }
            } catch (error) {
                console.error('Error during deletion:', error);
            }
            setMacroToDelete(null);
            setShowDialog(false);
        }
    };

    const openDeleteDialog = (id: number) => {
        setMacroToDelete(id);
        setShowDialog(true);
    };

    const handleEditMacros = (macro: { id: number; kcal: number; proteins: number; carbs: number; fats: number }) => {
        history.push({
            pathname: `/admin/nutrition/modify`,
            state: { recommendation: macro },
        });
    };

    const handleCategoryChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setSelectedCategory(newValue);
    };

    const handleAddMacros = () => {
        history.push(`/admin/nutrition/add`);
    };

    return (
        <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '3rem 0' }}>
            <Header title={t('nutrition_management_title')} />
            <Container sx={{ paddingTop: '8%' }}>
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
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        centered
                        textColor="inherit"
                        indicatorColor="secondary"
                        sx={{
                            color: 'gray',
                            '.Mui-selected': { color: 'gray' },
                            '.MuiTabs-indicator': { backgroundColor: 'gray' },
                        }}
                    >
                        {categories.map((category, index) => (
                            <Tab key={`${category.id}-${index}`} label={category.name} />
                        ))}
                    </Tabs>
                </Box>
                <Grid container spacing={2} sx={{ mt: 4, mb: 5 }}>
                    {(macros[categories[selectedCategory]?.name] || []).map((macro) => (
                        <Grid item xs={12} sm={6} md={4} key={macro.id}>
                            <Card
                                sx={{
                                    backgroundColor: '#ffffff',
                                    borderRadius: '12px',
                                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid #e0e0e0',
                                    paddingX: '16px',
                                }}
                            >
                                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {/* Título del macro alineado a la izquierda y ocupando todo el ancho */}
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000', textAlign: 'left' }}>
                                        {macro.name || 'Macro Plan'}
                                    </Typography>

                                    {/* Contenedor para la información y los botones */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                        {/* Información del macro alineada a la izquierda */}
                                        <Typography variant="body2" sx={{ color: '#6b6b6b' }}>
                                            {macro.kcal} Kcal, Proteins: {macro.proteins}g, Carbs: {macro.carbs}g, Fats: {macro.fats}g
                                        </Typography>

                                        {/* Botones alineados a la derecha */}
                                        <Box sx={{ display: 'flex', gap: '7px' }}>
                                            <IconButton
                                                onClick={() => handleEditMacros(macro)}
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
                                                onClick={() => openDeleteDialog(macro.id)}
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
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>



                {/* Botón flotante para añadir un nuevo usuario */}
                <Fab
                    onClick={handleAddMacros}
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

                <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
                    <DialogTitle>{t('confirm_delete_alert_title')}</DialogTitle>
                    <DialogContent>
                        <Typography>{t('confirm_delete_alert_message')}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowDialog(false)}>{t('cancel_button')}</Button>
                        <Button onClick={handleDelete} sx={{ color: '#FF0000' }}>{t('delete_button')}</Button>
                    </DialogActions>
                </Dialog>
            </Container>
            <Navbar />
        </Box>
    );
};

export default MacrosAdmin;
