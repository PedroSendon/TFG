import React, { useContext, useState } from 'react';
import { TextField, IconButton, Button, Grid, Typography, Container, FormControlLabel, Checkbox, Link, Box } from '@mui/material';
import { useHistory } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { LanguageContext } from '../../context/LanguageContext'; // Importamos el contexto de idioma

const Login: React.FC = () => {
    const history = useHistory();
    const { t } = useContext(LanguageContext);

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

                localStorage.setItem('access_token', data.access); // Almacena el token de acceso
                localStorage.setItem('refresh_token', data.refresh); // Almacena el token de refresco

                // Esto forzará que la navbar se vuelva a renderizar
                localStorage.setItem('navbar_reload', 'true');
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
        <Container component="main" maxWidth="xs" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{
                width: '100%',
                backgroundColor: '#ffffff',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                borderRadius: 2,
                p: 4
            }}>
                <Box textAlign="center" sx={{ mb: 4 }}>
                    <img src="/src/components/logo.png" alt="logo" style={{ marginBottom: '1.5rem', width: '100px', borderRadius: '50%' }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333333', mb: 2 }}>
                        {t('welcome_back')}
                    </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                id="email"
                                label={t('email')}
                                name="email"
                                autoComplete="email"
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                InputProps={{
                                    style: { color: '#333333' },
                                }}
                                sx={{
                                    '& label.Mui-focused': { color: '#555555' },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                }}
                            />
                        </Grid>


                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                name="password"
                                label={t('password')}
                                type={formData.showPassword ? 'text' : 'password'}
                                id="password"
                                autoComplete="current-password"
                                onChange={handleChange}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton onClick={handlePasswordVisibilityToggle}>
                                            {formData.showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    ),
                                }}
                                sx={{
                                    '& label.Mui-focused': { color: '#555555' },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#CCCCCC' },
                                        '&:hover fieldset': { borderColor: '#AAAAAA' },
                                        '&.Mui-focused fieldset': { borderColor: '#555555' },
                                    },
                                }}
                            />
                        </Grid>
                        {/*
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Checkbox checked={formData.rememberMe} onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })} />}
                                label={t('remember_me')}
                                sx={{ color: '#555555' }}
                            />
                            <Link href="#" variant="body2" sx={{ color: '#777777' }}>
                                {t('forgot_password')}
                            </Link>
                        </Grid>*/}
                    </Grid>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            backgroundColor: '#666666',
                            color: '#ffffff',
                            mt: 2,
                            borderRadius: 2,
                            fontWeight: 'bold',
                            '&:hover': { backgroundColor: '#555555' },
                        }}
                    >
                        {t('login_button')}
                    </Button>

                    <Grid container justifyContent="center" sx={{ mt: 2 }}>
                        <Grid item>
                            <Typography component="span" variant="body2" sx={{ color: '#777777' }}>
                                {t('no_account')}
                            </Typography>
                            <Button
                                onClick={() => history.push('/register')}
                                variant="text"
                                sx={{
                                    ml: 1,
                                    color: '#555555',
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                    padding: 0,
                                    minWidth: 'auto',
                                }}
                            >
                                {t('sign_up')}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Container>
    );
};

export default Login;
