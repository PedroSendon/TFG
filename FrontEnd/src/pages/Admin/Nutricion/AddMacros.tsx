import React, { useEffect, useState, useContext } from 'react';
import {
    TextField, Button, Grid, Container, MenuItem
} from '@mui/material'; // Importación de componentes de Material UI.
import { useHistory } from 'react-router-dom';
import Header from '../../Header/Header'; // Componente de header reutilizable
import { LanguageContext } from '../../../context/LanguageContext'; // Importar el contexto de idioma
import { IonPage } from '@ionic/react';

const AddMacros: React.FC = () => {
    const { t } = useContext(LanguageContext); // Usamos el contexto de idioma
    const history = useHistory(); // Hook para navegación.

    // Estado del formulario.
    const [formData, setFormData] = useState({
        kcal: '',
        proteins: '',
        carbs: '',
        fats: '',
        dietType: '',
        description: '', // Nueva descripción de la dieta
    });

    // Estado para manejar los errores de validación.
    const [errors, setErrors] = useState<any>({});

    // Estado para los tipos de dieta.
    const [dietTypes, setDietTypes] = useState<{ value: string; label: string }[]>([]);

    // Obtener los tipos de dieta desde la base de datos al cargar el componente.
    useEffect(() => {

        const fetchDietTypes = async () => {
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
                        'Authorization': `Bearer ${accessToken}`,  // Agrega el token JWT aquí
                    },
                });
                const data = await response.json();

                // Mapeamos las categorías
                const types = data.categories.map((category: any) => ({
                    value: category.name,
                    label: category.description || category.name, // Ajusta según el formato de tu backend
                }));

                setDietTypes(types); // Guardar en el estado
            } catch (error) {
                console.error('Error fetching diet types:', error);
            }
        };

        fetchDietTypes();
    }, []);


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
                const accessToken = localStorage.getItem('access_token');

                if (!accessToken) {
                    console.error(t('no_token'));
                    return;
                }
                const response = await fetch('http://127.0.0.1:8000/api/mealplans/create/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,  // Agrega el token JWT aquí
                    },
                    body: JSON.stringify({
                        kcal: formData.kcal,
                        proteins: formData.proteins,
                        carbs: formData.carbs,
                        fats: formData.fats,
                        dietType: formData.dietType,
                        description: formData.description,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(t('recommendation_added'), data);
                    history.push('/admin/macros'); // Redirigir después de añadir.
                } else {
                    const errorData = await response.json();
                    console.error(t('error_adding_recommendation'), errorData);
                    setErrors({ submit: errorData.error || t('unknown_error') });
                }
            } catch (error) {
                console.error(t('connection_error'), error);
                setErrors({ submit: t('server_connection_error') });
            }
        } else {
            console.log(t('form_errors'));
        }
    };

    const handleCancel = () => {
        history.push('/admin/nutrition');  // Cancelar y redirigir a la lista de ejercicios
    };

    return (
        <IonPage>
        <Container component="main" maxWidth="xs" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header title={t('add_macros_title')} />
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
                                onChange={handleChange}
                                value={formData.description}
                                helperText={t('description_helper')}
                            />
                        </Grid>
                    </Grid>
                </form>
            </div>

            {/* Botones de Cancelar y Guardar */}
            <Grid item xs={12} style={{ padding: '1rem 0', marginBottom: '15%' }}>
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
                            type="submit"
                            style={{
                                border: '1px solid #32CD32',
                                backgroundColor: '#FFFFFF',
                                color: '#32CD32',
                                padding: '3% 0',
                                borderRadius: '5px',
                                fontSize: '1em',
                                width: '100%',
                            }}
                            onClick={handleSubmit}
                            disabled={!formData.kcal || !formData.proteins || !formData.carbs || !formData.fats || !formData.dietType}
                        >
                            {t('add')}
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Container>
        </IonPage>
    );
};

export default AddMacros;
