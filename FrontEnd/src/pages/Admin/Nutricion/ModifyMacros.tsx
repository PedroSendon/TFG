import React, { useState, useEffect, useContext } from 'react';
import {
    TextField, Button, Grid, Container, MenuItem
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

        // Obtener los tipos de dieta desde la base de datos.
        const fetchDietTypes = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/diet-categories/'); // Cambia la URL según tu configuración
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
        return Object.keys(newErrors).length === 0;
    };

    // Manejar los cambios en el formulario.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Manejar el envío del formulario.
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/mealplans/${formData.dietType}/${recommendationData?.id}/update/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        kcal: formData.kcal,
                        proteins: formData.proteins,
                        carbs: formData.carbs,
                        fats: formData.fats,
                        description: formData.description,
                    }),
                });

                if (response.ok) {
                    console.log('Recomendación modificada:', formData);
                    history.push('/admin/macros'); // Redirigir después de la modificación.
                } else {
                    const errorData = await response.json();
                    console.error('Error modificando la recomendación:', errorData);
                }
            } catch (error) {
                console.error('Error al modificar la recomendación:', error);
            }
        } else {
            console.log(t('form_errors'));
        }
    };

    const handleCancel = () => {
        history.push('/admin/nutrition');  // Cancelar y redirigir a la lista de ejercicios
    };

    return (
        <Container component="main" maxWidth="xs" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header title={t('modify_macros_title')} />
            <div style={{ marginTop: '2rem', textAlign: 'center', flexGrow: 1 }}>
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
                            />
                        </Grid>
                    </Grid>
                </form>
            </div>

            {/* Botones de Cancelar y Guardar */}
            <Grid item xs={12} style={{ marginBottom: '15%' }}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Button
                            onClick={handleCancel}
                            style={{
                                border: '1px solid #FF0000',
                                backgroundColor: '#FFFFFF',
                                color: '#FF0000',
                                padding: '3% 0',
                                borderRadius: '5px',
                                fontSize: '1em',
                                width: '100%',
                            }}
                        >
                            {t('cancel')}
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button
                            onClick={handleSubmit}
                            style={{
                                border: '1px solid #32CD32',
                                backgroundColor: '#FFFFFF',
                                color: '#32CD32',
                                padding: '3% 0',
                                borderRadius: '5px',
                                fontSize: '1em',
                                width: '100%',
                            }}
                            disabled={!formData.kcal || !formData.proteins || !formData.carbs || !formData.fats || !formData.dietType}
                        >
                            {t('save')}
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
};

export default ModifyMacros;
