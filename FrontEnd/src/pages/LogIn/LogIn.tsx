import React, { useContext, useState } from 'react';
import { TextField, IconButton, Button, Grid, Typography, Container, FormControlLabel, Checkbox, Link } from '@mui/material';
import { useHistory } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { LanguageContext } from '../../context/LanguageContext'; // Importamos el contexto de idioma
import '../../theme/variables.css';

const Login: React.FC = () => {
    const history = useHistory();
    const { t } = useContext(LanguageContext); // Usamos la función de traducción t desde el contexto

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        showPassword: false,
        rememberMe: false,
    });

    const [errors, setErrors] = useState<any>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            rememberMe: e.target.checked,
        });
    };

    const handlePasswordVisibilityToggle = () => {
        setFormData({
            ...formData,
            showPassword: !formData.showPassword,
        });
    };

    const validateEmail = (email: string) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => { 
        e.preventDefault();
    
        const newErrors: any = {};
    
        if (!validateEmail(formData.email)) {
            newErrors.email = t('invalid_email'); // Mensaje de error traducido
        }
    
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
    
        try {
            const response = await fetch('http://127.0.0.1:8000/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    remember_me: formData.rememberMe,
                }),
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log('Inicio de sesión exitoso:', data);
                // Almacenar tokens
                console.log('Access token:', data.access);  
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh); // Opcional
                history.push('/workout');
            } else {
                const errorData = await response.json();
                console.log('Error:', errorData);
                setErrors({ apiError: errorData.error });
            }
        } catch (error) {
            console.log('Error en la petición:', error);
            setErrors({ apiError: 'Error de conexión con el servidor.' });
        }
    };
    
    return (
        <Container component="main" maxWidth="xs">
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                {/* Logo de la aplicación */}
                <img src="https://via.placeholder.com/150" alt="logo" style={{ marginBottom: '1.5rem' }} />

                {/* Título de bienvenida */}
                <Typography component="h1" variant="h5" marginBottom={"6%"}>
                    {t('welcome_back')} {/* Texto traducido */}
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        {/* Input para el correo electrónico */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="email"
                                label={t('email')} 
                                name="email"
                                autoComplete="email"
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                InputLabelProps={{
                                    style: { color: 'var(--color-gris-oscuro)' }
                                }}
                                sx={{
                                    '& label.Mui-focused': {
                                        color: 'var(--color-verde-lima)',
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'var(--color-gris-oscuro)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'var(--color-verde-lima)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'var(--color-verde-lima)',
                                        },
                                    },
                                }}
                                InputProps={{
                                    style: { color: 'var(--color-gris-oscuro)' },
                                }}
                            />
                        </Grid>

                        {/* Input para la contraseña */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                name="password"
                                label={t('password')}
                                type={formData.showPassword ? 'text' : 'password'}
                                id="password"
                                autoComplete="current-password"
                                onChange={handleChange}
                                InputLabelProps={{
                                    style: { color: 'var(--color-gris-oscuro)' }
                                }}
                                sx={{
                                    '& label.Mui-focused': {
                                        color: 'var(--color-verde-lima)',
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'var(--color-gris-oscuro)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'var(--color-verde-lima)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'var(--color-verde-lima)',
                                        },
                                    },
                                }}
                                InputProps={{
                                    style: { color: 'var(--color-gris-oscuro)' },
                                    endAdornment: (
                                        <IconButton onClick={handlePasswordVisibilityToggle}>
                                            {formData.showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    ),
                                }}
                            />
                        </Grid>

                        {/* Opción para recordar la sesión */}
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        style={{ color: 'var(--color-verde-lima)' }}
                                        checked={formData.rememberMe}
                                        onChange={handleCheckboxChange}
                                        name="rememberMe"
                                    />
                                }
                                label={t('remember_me')} 
                                style={{ color: 'var(--color-gris-oscuro)' }}
                            />
                            <Link href="#" variant="body2" style={{ color: 'var(--color-verde-lima)' }}>
                                {t('forgot_password')} {/* Texto traducido */}
                            </Link>
                        </Grid>
                    </Grid>

                    {/* Botón para iniciar sesión */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        style={{
                            backgroundColor: 'var(--color-verde-lima)',
                            color: 'var(--color-blanco)',
                            marginTop: '1rem'
                        }}
                    >
                        {t('login_button')} {/* Texto traducido */}
                    </Button>

                    {/* Enlace para registrarse */}
                    <Grid container justifyContent="center" alignItems="center" style={{ marginTop: '1rem', color: 'var(--color-gris-oscuro)' }}>
                        <Grid item>
                            <Typography component="span" variant="body2">
                                {t('no_account')} {/* Texto traducido */}
                            </Typography>
                            <Link href="/register" variant="body2" style={{ marginLeft: '0.5rem', color: 'var(--color-verde-lima)' }}>
                                {t('sign_up')} {/* Texto traducido */}
                            </Link>
                        </Grid>
                    </Grid>
                </form>
            </div>
        </Container>
    );
};

export default Login;
