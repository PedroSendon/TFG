import React, { useState } from 'react';
import { TextField, IconButton, Button, Grid, Typography, Container, FormControlLabel, Checkbox, Link } from '@mui/material';
import { useHistory } from 'react-router-dom'; // Hook para la redirección
import Visibility from '@mui/icons-material/Visibility'; // Icono para mostrar la contraseña
import VisibilityOff from '@mui/icons-material/VisibilityOff'; // Icono para ocultar la contraseña
import '../../theme/variables.css'; // Importa las variables de color personalizadas

const Login: React.FC = () => {
    const history = useHistory(); // Inicializa el hook de redirección
    // Estado para los datos del formulario
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        showPassword: false, // Controla la visibilidad de la contraseña
        rememberMe: false, // Controla si se recuerda al usuario o no
    });

    const [errors, setErrors] = useState<any>({}); // Estado para los errores del formulario

    // Manejador para cambios en los campos de texto
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value, // Actualiza el valor del campo correspondiente
        });
    };

    // Manejador para el checkbox de "Recuérdame"
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            rememberMe: e.target.checked, // Actualiza el estado del checkbox
        });
    };

    // Manejador para mostrar/ocultar la contraseña
    const handlePasswordVisibilityToggle = () => {
        setFormData({
            ...formData,
            showPassword: !formData.showPassword, // Alterna entre mostrar u ocultar la contraseña
        });
    };

    // Validación básica de correo electrónico
    const validateEmail = (email: string) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email); // Retorna true si el email es válido
    };

    // Manejador para el envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Previene el comportamiento por defecto del formulario

        const newErrors: any = {};

        // Validación del campo de correo electrónico
        if (!validateEmail(formData.email)) {
            newErrors.email = 'Correo electrónico no válido.'; // Mensaje de error si el email no es válido
        }

        // Si hay errores, los mostramos
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors); // Actualiza el estado de errores
            return;
        }

        try {
            // Hacer la solicitud POST al backend
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
                history.push('/home');  // Redirige a la página principal después del inicio de sesión
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
                    ¡Bienvenido de nuevo!
                </Typography>

                {/* Formulario de inicio de sesión */}
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        {/* Input para el correo electrónico */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="email"
                                label="Email"
                                name="email"
                                autoComplete="email"
                                onChange={handleChange} // Actualiza el estado con el valor del correo
                                error={!!errors.email} // Muestra el error si es necesario
                                helperText={errors.email} // Mensaje de ayuda si hay un error
                                InputLabelProps={{
                                    style: { color: 'var(--color-gris-oscuro)' } // Color personalizado para el label
                                }}
                                sx={{
                                    '& label.Mui-focused': {
                                        color: 'var(--color-verde-lima)', // Cambia el color del label cuando está enfocado
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'var(--color-gris-oscuro)', // Color del borde por defecto
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'var(--color-verde-lima)', // Color del borde al pasar el mouse
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'var(--color-verde-lima)', // Color del borde cuando está enfocado
                                        },
                                    },
                                }}
                                InputProps={{
                                    style: { color: 'var(--color-gris-oscuro)' }, // Color del texto dentro del input
                                }}
                            />
                        </Grid>

                        {/* Input para la contraseña con botón para mostrar/ocultar */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type={formData.showPassword ? 'text' : 'password'} // Controla la visibilidad de la contraseña
                                id="password"
                                autoComplete="current-password"
                                onChange={handleChange} // Actualiza el estado con el valor de la contraseña
                                InputLabelProps={{
                                    style: { color: 'var(--color-gris-oscuro)' } // Color personalizado para el label
                                }}
                                sx={{
                                    '& label.Mui-focused': {
                                        color: 'var(--color-verde-lima)', // Cambia el color del label cuando está enfocado
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'var(--color-gris-oscuro)', // Color del borde por defecto
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'var(--color-verde-lima)', // Color del borde al pasar el mouse
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'var(--color-verde-lima)', // Color del borde cuando está enfocado
                                        },
                                    },
                                }}
                                InputProps={{
                                    style: { color: 'var(--color-gris-oscuro)' }, // Color del texto dentro del input
                                    // Botón de mostrar/ocultar contraseña
                                    endAdornment: (
                                        <IconButton onClick={handlePasswordVisibilityToggle}>
                                            {formData.showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    ),
                                }}
                            />
                        </Grid>

                        {/* Opción para recordar la sesión y enlace para recuperar la contraseña */}
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        style={{ color: 'var(--color-verde-lima)' }} // Color del checkbox
                                        checked={formData.rememberMe} // Estado del checkbox
                                        onChange={handleCheckboxChange} // Actualiza el estado del checkbox
                                        name="rememberMe"
                                    />
                                }
                                label="Remember me" // Etiqueta del checkbox
                                style={{ color: 'var(--color-gris-oscuro)' }} // Color del texto de la etiqueta
                            />
                            {/* Enlace para recuperar la contraseña */}
                            <Link href="#" variant="body2" style={{ color: 'var(--color-verde-lima)' }}>
                                Have you forgotten your password?
                            </Link>
                        </Grid>
                    </Grid>

                    {/* Botón para iniciar sesión */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        style={{
                            backgroundColor: 'var(--color-verde-lima)', // Color del botón
                            color: 'var(--color-blanco)', // Color del texto en el botón
                            marginTop: '1rem'
                        }}
                    >
                        Login
                    </Button>

                    {/* Enlace para registrarse si no tiene cuenta */}
                    <Grid container justifyContent="center" alignItems="center" style={{ marginTop: '1rem', color: 'var(--color-gris-oscuro)' }}>
                        <Grid item>
                            <Typography component="span" variant="body2">
                                Don't have an account?
                            </Typography>
                            <Link href="/register" variant="body2" style={{ marginLeft: '0.5rem', color: 'var(--color-verde-lima)' }}>
                                Sign up
                            </Link>
                        </Grid>
                    </Grid>
                </form>
            </div>
        </Container>
    );
};

export default Login;
