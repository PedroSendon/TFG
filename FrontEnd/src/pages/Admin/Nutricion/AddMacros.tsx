import React, { useEffect, useState, useContext } from 'react';
import {
    TextField, Button, Grid, Container, MenuItem, Box
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import Header from '../../Header/Header';
import { LanguageContext } from '../../../context/LanguageContext';

const AddMacros: React.FC = () => {
    const { t } = useContext(LanguageContext);
    const history = useHistory();

    const [formData, setFormData] = useState({
        kcal: '',
        proteins: '',
        carbs: '',
        fats: '',
        dietType: '',
        description: '',
    });

    const [errors, setErrors] = useState<any>({});
    const [dietTypes, setDietTypes] = useState<{ value: string; label: string }[]>([]);

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
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });
                const data = await response.json();
                const types = data.categories.map((category: any) => ({
                    value: category.name,
                    label: category.description || category.name,
                }));
                setDietTypes(types);
            } catch (error) {
                console.error('Error fetching diet types:', error);
            }
        };
        fetchDietTypes();
    }, []);

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
                const response = await fetch('http://127.0.0.1:8000/api/mealplans/create/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(formData),
                });
                if (response.ok) {
                    history.push({
                        pathname: '/admin/macros',
                        state: { reload: true },
                    });
                } else {
                    const errorData = await response.json();
                    setErrors({ submit: errorData.error || t('unknown_error') });
                }
            } catch (error) {
                setErrors({ submit: t('server_connection_error') });
            }
        }
    };

    const handleCancel = () => {
        history.push('/admin/nutrition');
    };

    return (
        <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', marginTop:'16%' }}>
            <Header title={t('add_macros_title')} />
            <Container component="main" maxWidth="xs" sx={{ mt: 4, flexGrow: 1 }}>
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
                    </Grid>
                </form>

                {/* Botones de Cancelar y Guardar */}
                <Box sx={{ mt: 3, pb: 2, textAlign: 'center', width: '100%' }}>
                    <Grid container spacing={2} justifyContent="center">
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
                </Box>
            </Container>
        </Box>
    );
};

export default AddMacros;
