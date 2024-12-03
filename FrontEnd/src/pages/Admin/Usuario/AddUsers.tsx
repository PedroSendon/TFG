import React, { useState } from 'react';
import {
    TextField, Button, Grid, MenuItem, Container,
    Box
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import Header from '../../Header/Header';
import { useContext } from 'react';
import { LanguageContext } from '../../../context/LanguageContext'; // Importar el contexto de idioma

const AddUsers: React.FC = () => {
    const history = useHistory();
    const { t } = useContext(LanguageContext); // Usamos el contexto de idioma

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        birthDate: dayjs(),
        gender: '',
        role: '',
    });

    const [errors, setErrors] = useState<any>({});

    const validateEmail = (email: string) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    };

    const validatePassword = (password: string) => {
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        return re.test(password);
    };

    const validateName = (name: string) => {
        const re = /^[A-Za-zÀ-ÿ\s]+$/;
        return re.test(name);
    };

    const validateAge = (date: any) => {
        const today = dayjs();
        const birthDate = dayjs(date);
        const age = today.diff(birthDate, 'year');
        return age >= 18 && age <= 120;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });

        const newErrors: any = { ...errors };

        if (name === 'email' && !validateEmail(value)) {
            newErrors.email = t('invalid_email');
        } else if (name === 'email') {
            delete newErrors.email;
        }

        if (name === 'firstName' && !validateName(value)) {
            newErrors.firstName = t('invalid_firstname');
        } else if (name === 'firstName') {
            delete newErrors.firstName;
        }

        if (name === 'lastName' && !validateName(value)) {
            newErrors.lastName = t('invalid_lastname');
        } else if (name === 'lastName') {
            delete newErrors.lastName;
        }

        if (name === 'password' && !validatePassword(value)) {
            newErrors.password = t('invalid_password');
        } else if (name === 'password') {
            delete newErrors.password;
        }

        setErrors(newErrors);
    };

    const handleDateChange = (date: any) => {
        setFormData({
            ...formData,
            birthDate: date,
        });

        const newErrors: any = { ...errors };
        if (!validateAge(date)) {
            newErrors.birthDate = t('invalid_age');
        } else {
            delete newErrors.birthDate;
        }
        setErrors(newErrors);
    };

    const isFormValid = () => {
        return Object.keys(errors).length === 0 &&
            formData.firstName &&
            formData.lastName &&
            formData.email &&
            formData.password &&
            formData.gender &&
            formData.role;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid()) {
            console.log(t('form_errors'));
            return;
        }

        try {
            const accessToken = localStorage.getItem('access_token');

            if (!accessToken) {
                console.error(t('no_token'));
                return;
            }
            const response = await fetch('http://127.0.0.1:8000/api/users/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,  // Agrega el token JWT aquí
                },
                body: JSON.stringify({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    birth_date: formData.birthDate.format('YYYY-MM-DD'),  // Asegúrate de que esto esté correcto
                    gender: formData.gender,
                    role: formData.role,  // Asegúrate de que este campo tenga un valor válido
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(t('user_created'), data);
                history.push({
                    pathname: '/admin/users',
                    state: { reload: true }  // Pasar un estado para indicar recarga
                });
            } else {
                const errorData = await response.json();
                console.error('Error en la creación del usuario:', errorData);
            }
        } catch (error) {
            console.error('Error en la petición:', error);
        }
    };


    const handleCancel = () => {
        history.push('/admin/users');
    };

    return (
        <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '90vh', paddingBottom: '16px', marginTop:'16%' }}>
            <Header title={t('add_user')} />

            <Container component="main" maxWidth="xs" sx={{ mt: 8 , paddingTop:'5%'}}>
                <form onSubmit={(e) => e.preventDefault()}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                required
                                id="firstName"
                                label={t('first_name')}
                                name="firstName"
                                onChange={handleChange}
                                error={!!errors.firstName}
                                helperText={errors.firstName}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#555555',
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                required
                                id="lastName"
                                label={t('last_name')}
                                name="lastName"
                                onChange={handleChange}
                                error={!!errors.lastName}
                                helperText={errors.lastName}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#555555',
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                required
                                id="email"
                                label={t('email')}
                                name="email"
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#555555',
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                required
                                name="password"
                                label={t('password')}
                                type="password"
                                id="password"
                                onChange={handleChange}
                                error={!!errors.password}
                                helperText={errors.password}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#555555',
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                required
                                select
                                name="gender"
                                label={t('gender')}
                                id="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#555555',
                                    },
                                }}
                            >
                                <MenuItem value="M">{t('male')}</MenuItem>
                                <MenuItem value="F">{t('female')}</MenuItem>
                                <MenuItem value="Otro">{t('other')}</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                required
                                select
                                name="role"
                                label={t('role')}
                                id="role"
                                value={formData.role}
                                onChange={handleChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#555555',
                                    },
                                }}
                            >
                                <MenuItem value="cliente">{t('client')}</MenuItem>
                                <MenuItem value="administrador">{t('admin')}</MenuItem>
                                <MenuItem value="entrenador">{t('trainer')}</MenuItem>
                                <MenuItem value="nutricionista">{t('nutritionist')}</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label={t('birthdate')}
                                    value={formData.birthDate}
                                    onChange={handleDateChange}
                                    renderInput={(params: any) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            error={!!errors.birthDate}
                                            helperText={errors.birthDate}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '8px',
                                                    '& fieldset': { borderColor: '#CCCCCC' },
                                                    '&:hover fieldset': { borderColor: '#AAAAAA' },
                                                    '&.Mui-focused fieldset': { borderColor: '#555555' },
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: '#555555',
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>
                </form>

                <Grid container spacing={2} sx={{ mt: 4 }}>
                    <Grid item xs={6}>
                        <Button
                            fullWidth
                            variant="outlined"
                            sx={{
                                color: '#777', borderColor: '#777', fontWeight: 'bold', py: 1, borderRadius: '8px',
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
                                backgroundColor: '#555', color: '#FFF', fontWeight: 'bold', py: 1, borderRadius: '8px', '&:hover': { backgroundColor: '#333' },
                            }}
                            onClick={handleSubmit}
                        >
                            {t('save')}
                        </Button>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default AddUsers;
