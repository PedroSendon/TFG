import React, { useEffect, useState } from 'react';
import {
    TextField, Button, Grid, Container, MenuItem
} from '@mui/material'; // Importación de componentes de Material UI.
import { useHistory } from 'react-router-dom';
import Header from '../../Header/Header'; // Componente de header reutilizable

const AddMacros: React.FC = () => {
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
    }, []);

    // Validaciones básicas.
    const validateField = (name: string, value: string) => {
        if (!value || isNaN(Number(value))) {
            return `${name} debe ser un número válido.`;
        }
        return '';
    };

    const validateForm = () => {
        const newErrors: any = {};
        newErrors.kcal = validateField('Kcal', formData.kcal);
        newErrors.proteins = validateField('Proteínas', formData.proteins);
        newErrors.carbs = validateField('Carbohidratos', formData.carbs);
        newErrors.fats = validateField('Grasas', formData.fats);
        if (!formData.dietType) {
            newErrors.dietType = 'Seleccione un tipo de dieta.';
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
                const response = await fetch('http://127.0.0.1:8000/api/macros/create/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
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
                    console.log('Recomendación agregada:', data);
                    history.push('/admin/macros'); // Redirigir después de añadir.
                } else {
                    const errorData = await response.json();
                    console.error('Error al añadir la recomendación:', errorData);
                    setErrors({ submit: errorData.error || 'Error desconocido' });
                }
            } catch (error) {
                console.error('Error en la conexión:', error);
                setErrors({ submit: 'Error en la conexión con el servidor' });
            }
        } else {
            console.log('Errores en el formulario');
        }
    };

    const handleCancel = () => {
        history.push('/admin/nutrition');  // Cancelar y redirigir a la lista de ejercicios
    };


    return (
        <Container component="main" maxWidth="xs" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header title="Añadir Macronutrientes" />
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
                                label="Kcal"
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
                                label="Proteínas (g)"
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
                                label="Carbohidratos (g)"
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
                                label="Grasas (g)"
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
                                label="Tipo de Dieta"
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
                                label="Descripción (opcional)"
                                name="description"
                                onChange={handleChange}
                                value={formData.description}
                                helperText="Ej: Dieta alta en proteínas, baja en carbohidratos"
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
                            CANCEL
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
                            ADD
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AddMacros;
