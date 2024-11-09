import React, { useState, useEffect, useContext } from 'react';
import {
    Box, Button, Container, Grid, MenuItem, TextField,
    Typography,
} from '@mui/material'; // Importación de componentes de Material UI.
import { useHistory, useLocation } from 'react-router-dom'; // Hook para redirección y obtener datos.
import Header from '../../Header/Header'; // Componente de header reutilizable
import { LanguageContext } from '../../../context/LanguageContext';  // Importar el contexto de idioma

const ModifyMacros: React.FC = () => {
    const { t } = useContext(LanguageContext); // Usamos el contexto de idioma
    const history = useHistory(); // Hook para redirección.
    interface LocationState {
        recommendation?: {
            id: number; // Agregado para almacenar el ID de la recomendación
            kcal: string;
            proteins: string;
            carbs: string;
            fats: string;
            dietType: string;
            description: string;
        };
    }

    const [mealCount, setMealCount] = useState<number>(); // Número de comidas (inicialmente 2)
    const [mealDistribution, setMealDistribution] = useState<number[]>([25, 25, 25, 25]); // Distribución inicial para 4 comidas

    const location = useLocation<LocationState>(); // Hook para obtener el estado pasado (datos de la recomendación).
    const recommendationData = location.state?.recommendation; // Suponiendo que los datos vienen de la navegación.

    // Estado del formulario.
    const [formData, setFormData] = useState({
        kcal: '',
        proteins: '',
        carbs: '',
        fats: '',
        dietType: '',
        description: '',
    });

    // Estado para manejar los errores de validación.
    const [errors, setErrors] = useState<any>({});

    // Estado para los tipos de dieta.
    const [dietTypes, setDietTypes] = useState<{ value: string; label: string }[]>([]);
    const fetchDietTypes = async () => {
        try {
            const accessToken = localStorage.getItem('access_token');

            if (!accessToken) {
                console.error(t('no_token'));
                return;
            }
            const response = await fetch('http://127.0.0.1:8000/api/diet-categories/', {
                method: 'GET',  // Cambiado a GET
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,  // Agrega el token JWT aquí
                },
            });
            const data = await response.json();
            const types = data.categories.map((category: any) => ({
                value: category.name,
                label: category.description || category.name, // Ajusta según tu modelo
            }));
            setDietTypes(types);
        } catch (error) {
            console.error('Error fetching diet types:', error);
        }
    };



    // Cargar los datos existentes al iniciar el componente.
    useEffect(() => {
        if (recommendationData) {
            setFormData({
                kcal: recommendationData.kcal || '',
                proteins: recommendationData.proteins || '',
                carbs: recommendationData.carbs || '',
                fats: recommendationData.fats || '',
                dietType: recommendationData.dietType || '',
                description: recommendationData.description || '',
            });
        }
        fetchDietTypes();
    }, [recommendationData]);

    // Validaciones básicas.
    const validateField = (name: string, value: string) => {
        if (!value || isNaN(Number(value))) {
            return `${t(name)} ${t('validation_error')}`;
        }
        return '';
    };

    const validateForm = () => {
        const newErrors: any = {};
        newErrors.kcal = validateField('kcal', formData.kcal);
        newErrors.proteins = validateField('proteins', formData.proteins);
        newErrors.carbs = validateField('carbs', formData.carbs);
        newErrors.fats = validateField('fats', formData.fats);

        if (!formData.dietType) {
            newErrors.dietType = t('validation_select_diet_type');
        }

        setErrors(newErrors);

        // Filtrar solo los errores que tengan mensajes no vacíos y verificar si hay alguno.
        const hasErrors = Object.values(newErrors).some((error) => error !== '');
        return !hasErrors;
    };

    // Manejar los cambios en el formulario.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const accessToken = localStorage.getItem('access_token');
    
                if (!accessToken) {
                    console.error(t('no_token'));
                    return;
                }
                const response = await fetch(`http://127.0.0.1:8000/api/mealplans/${formData.dietType}/${recommendationData?.id}/update/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        kcal: formData.kcal,
                        proteins: formData.proteins,
                        carbs: formData.carbs,
                        fats: formData.fats,
                        description: formData.description,
                        mealDistribution: mealDistribution,
                    }),
                });
    
                if (response.ok) {
                    history.push('/admin/nutrition');
                } else {
                    const errorText = await response.text(); // Captura la respuesta completa
                    console.error('Error modificando la recomendación:', errorText);
                }
            } catch (error) {
                console.error('Error al modificar la recomendación:', error);
            }
        } else {
            console.log(t('form_errors'));
        }
    };

    const handleMealCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const count = parseInt(e.target.value);
        setMealCount(count);
        setMealDistribution(Array(count).fill(Math.floor(100 / count))); // Inicializa la distribución al porcentaje más cercano
    };
    
    const handleMealDistributionChange = (index: number, value: string) => {
        const newDistribution = [...mealDistribution];
        newDistribution[index] = Number(value);
        setMealDistribution(newDistribution);
    };

    const handleCancel = () => {
        history.push('/admin/nutrition');  // Cancelar y redirigir a la lista de ejercicios
    };

    return (
        <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', marginTop: '16%' }}>
            <Header title={t('modify_macros_title')} />
            <Container component="main" maxWidth="xs" sx={{ flexGrow: 1, mt: 4 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        {/* Campo de Kcal */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="kcal"
                                label={t('kcal')}
                                name="kcal"
                                value={formData.kcal}
                                onChange={handleChange}
                                error={!!errors.kcal}
                                helperText={errors.kcal}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                                }}
                            />
                        </Grid>

                        {/* Campo de Proteínas */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="proteins"
                                label={t('proteins')}
                                name="proteins"
                                value={formData.proteins}
                                onChange={handleChange}
                                error={!!errors.proteins}
                                helperText={errors.proteins}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                                }}
                            />
                        </Grid>

                        {/* Campo de Carbohidratos */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="carbs"
                                label={t('carbs')}
                                name="carbs"
                                value={formData.carbs}
                                onChange={handleChange}
                                error={!!errors.carbs}
                                helperText={errors.carbs}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                                }}
                            />
                        </Grid>

                        {/* Campo de Grasas */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="fats"
                                label={t('fats')}
                                name="fats"
                                value={formData.fats}
                                onChange={handleChange}
                                error={!!errors.fats}
                                helperText={errors.fats}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                                }}
                            />
                        </Grid>

                        {/* Selector del tipo de dieta */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                select
                                fullWidth
                                id="dietType"
                                label={t('diet_type')}
                                name="dietType"
                                value={formData.dietType}
                                onChange={handleChange}
                                error={!!errors.dietType}
                                helperText={errors.dietType}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                                }}
                            >
                                {dietTypes.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>



                        {/* Campo para la descripción adicional */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                id="description"
                                label={t('description')}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                helperText={t('description_helper')}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                                }}
                            />
                        </Grid>

                         {/* Selección del número de comidas */}
                         <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                select
                                fullWidth
                                label={t('meal_count')}
                                value={mealCount || ''}
                                onChange={handleMealCountChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                                }}
                            >
                                {[2, 3, 4, 5, 6].map((count) => (
                                    <MenuItem key={count} value={count}>
                                        {count} {t('meals_per_day')}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Distribución de comidas */}
                        {mealCount && (
                            <Grid item xs={12}>
                                <Typography sx={{ mb: 1, color:'gray' }}>
                                    {t('meal_distribution')}
                                </Typography>
                                <Grid container spacing={1}>
                                    {mealDistribution.map((percentage, index) => (
                                        <Grid item xs={6} key={index}>
                                            <TextField
                                                variant="outlined"
                                                required
                                                fullWidth
                                                label={`${t('meal')} ${index + 1} (%)`}
                                                value={percentage}
                                                onChange={(e) => handleMealDistributionChange(index, e.target.value)}
                                                error={!!errors.mealDistribution}
                                                helperText={index === mealDistribution.length - 1 && errors.mealDistribution}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '8px',
                                                        '& fieldset': { borderColor: '#CCCCCC' },
                                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': { color: '#555555' },
                                                }}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>
                        )}

                    </Grid>
                </form>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                        <Button
                            fullWidth
                            variant="outlined"
                            sx={{
                                borderColor: '#AAAAAA',
                                color: '#777777',
                                fontWeight: 'bold',
                                py: 1,
                            }}
                            onClick={handleCancel}
                        >
                            {t('cancel')}
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{
                                backgroundColor: '#555555',
                                color: '#FFFFFF',
                                fontWeight: 'bold',
                                py: 1,
                                '&:hover': {
                                    backgroundColor: '#333333',
                                },
                            }}
                            onClick={handleSubmit}
                            disabled={!formData.kcal || !formData.proteins || !formData.carbs || !formData.fats || !formData.dietType}
                        >
                            {t('save')}
                        </Button>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default ModifyMacros;
