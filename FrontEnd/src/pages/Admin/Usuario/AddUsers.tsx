import React, { useState } from 'react';
import {
    TextField, Button, Grid, MenuItem, Container
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
                history.push('/admin/users');
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
        <Container component="main" maxWidth="xs" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header title={t('add_user')} />
            <div style={{ marginTop: '2rem', textAlign: 'center', flexGrow: 1 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="firstName"
                                label={t('first_name')}
                                name="firstName"
                                onChange={handleChange}
                                error={!!errors.firstName}
                                helperText={errors.firstName}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="lastName"
                                label={t('last_name')}
                                name="lastName"
                                onChange={handleChange}
                                error={!!errors.lastName}
                                helperText={errors.lastName}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="email"
                                label={t('email')}
                                name="email"
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                name="password"
                                label={t('password')}
                                type="password"
                                id="password"
                                onChange={handleChange}
                                error={!!errors.password}
                                helperText={errors.password}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                select
                                fullWidth
                                name="gender"
                                label={t('gender')}
                                id="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                error={!!errors.gender}
                                helperText={errors.gender}
                            >
                                <MenuItem value="M">{t('male')}</MenuItem>
                                <MenuItem value="F">{t('female')}</MenuItem>
                                <MenuItem value="Otro">{t('other')}</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                select
                                fullWidth
                                name="role"
                                label={t('role')}
                                id="role"
                                value={formData.role}
                                onChange={handleChange}
                                error={!!errors.role}
                                helperText={errors.role}
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
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>
                </form>
            </div>
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
                            disabled={!isFormValid()}                        >
                            {t('add')}
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AddUsers;
