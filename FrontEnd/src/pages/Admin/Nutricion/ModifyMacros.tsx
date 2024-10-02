import React, { useState, useEffect } from 'react';
import {
    TextField, Button, Grid, Container, MenuItem
} from '@mui/material'; // Importación de componentes de Material UI.
import { useHistory, useLocation } from 'react-router-dom'; // Hook para redirección y obtener datos.
import Header from '../../Header/Header'; // Componente de header reutilizable

// Definir los tipos de dieta disponibles
const dietTypes = [
    { value: 'weightLoss', label: 'Pérdida de Peso' },
    { value: 'muscleGain', label: 'Ganancia Muscular' },
    { value: 'maintenance', label: 'Mantenimiento' },
];

const ModifyMacros: React.FC = () => {
    const history = useHistory(); // Hook para redirección.
    interface LocationState {
        recommendation?: {
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
    }, [recommendationData]);

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
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            console.log('Recomendación modificada:', formData);
            history.push('/admin/macros'); // Redirigir después de la modificación.
        } else {
            console.log('Errores en el formulario');
        }
    };

    return (
        <Container component="main" maxWidth="xs" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header title="Modificar Macronutrientes" />
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
                                label="Proteínas (g)"
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
                                label="Carbohidratos (g)"
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
                                label="Grasas (g)"
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
                                value={formData.description}
                                onChange={handleChange}
                                helperText="Ej: Dieta alta en proteínas, baja en carbohidratos"
                            />
                        </Grid>
                    </Grid>
                </form>
            </div>

            {/* Botón de enviar */}
            <div style={{ padding: '1rem 0', marginBottom: '15%' }}>
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    style={{
                        backgroundColor: '#32CD32', // Color verde lima
                        color: '#FFFFFF',
                        marginTop: '1rem',
                    }}
                    onClick={handleSubmit}
                    disabled={!formData.kcal || !formData.proteins || !formData.carbs || !formData.fats || !formData.dietType}
                >
                    Guardar Cambios
                </Button>
            </div>
        </Container>
    );
};

export default ModifyMacros;
