import React, { useState } from 'react';
import {
    TextField, Button, Grid, Container, MenuItem
} from '@mui/material'; // Importación de componentes de Material UI.
import { useHistory } from 'react-router-dom';
import Header from '../../Header/Header'; // Componente de header reutilizable

// Definir los tipos de dieta disponibles
const dietTypes = [
    { value: 'weightLoss', label: 'Pérdida de Peso' },
    { value: 'muscleGain', label: 'Ganancia Muscular' },
    { value: 'maintenance', label: 'Mantenimiento' },
];

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
            console.log('Recomendación agregada:', formData);
            history.push('/admin/macros'); // Redirigir después de añadir.
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
