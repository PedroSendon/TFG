import React, { useState } from 'react';
import {
  TextField, IconButton, Button, Grid, Typography, Container,
  FormControlLabel, Checkbox, Link, MenuItem
} from '@mui/material'; // Importación de componentes de Material UI.
import { useHistory } from 'react-router-dom'; // Hook para redirección.
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // Componente de selector de fecha.
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; // Proveedor de localización para el selector de fechas.
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'; // Adaptador para el manejo de fechas con Day.js.
import dayjs from 'dayjs'; // Librería para manipular fechas.
import '../../theme/variables.css'; // Archivo de estilos personalizados.

const Register: React.FC = () => {
  const history = useHistory(); // Inicializa el hook para manejar la navegación.

  // Estado para almacenar los datos del formulario.
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    birthDate: dayjs(), // Se inicializa con la fecha actual.
    gender: '',
    termsAccepted: false,
  });

  // Estado para manejar los errores de validación.
  const [errors, setErrors] = useState<any>({});

  // Validación de correo electrónico.
  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  // Validación de contraseña.
  const validatePassword = (password: string) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return re.test(password);
  };

  // Validación de nombres (solo letras).
  const validateName = (name: string) => {
    const re = /^[A-Za-zÀ-ÿ\s]+$/;
    return re.test(name);
  };

  // Validación de edad, entre 18 y 120 años.
  const validateAge = (date: any) => {
    const today = dayjs();
    const birthDate = dayjs(date);
    const age = today.diff(birthDate, 'year');
    return age >= 18 && age <= 120;
  };

  // Maneja cambios en los campos de texto y valida los valores en tiempo real.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Actualiza el estado del formulario.
    setFormData({
      ...formData,
      [name]: value,
    });

    // Realiza la validación en el campo correspondiente y actualiza los errores.
    const newErrors: any = { ...errors };

    if (name === 'email' && !validateEmail(value)) {
      newErrors.email = 'Correo electrónico no válido.';
    } else if (name === 'email') {
      delete newErrors.email;
    }

    if (name === 'firstName' && !validateName(value)) {
      newErrors.firstName = 'Nombre no debe contener números o símbolos.';
    } else if (name === 'firstName') {
      delete newErrors.firstName;
    }

    if (name === 'lastName' && !validateName(value)) {
      newErrors.lastName = 'Apellido no debe contener números o símbolos.';
    } else if (name === 'lastName') {
      delete newErrors.lastName;
    }

    if (name === 'password' && !validatePassword(value)) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.';
    } else if (name === 'password') {
      delete newErrors.password;
    }

    setErrors(newErrors); // Actualiza el estado de errores.
  };

  // Maneja el cambio de la fecha de nacimiento y realiza la validación.
  const handleDateChange = (date: any) => {
    setFormData({
      ...formData,
      birthDate: date,
    });

    const newErrors: any = { ...errors };
    if (!validateAge(date)) {
      newErrors.birthDate = 'Debe tener al menos 18 años y no más de 120 años.';
    } else {
      delete newErrors.birthDate;
    }
    setErrors(newErrors);
  };

  // Maneja cambios en el checkbox de términos y condiciones.
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      termsAccepted: e.target.checked,
    });
  };

  // Verifica si el formulario es válido para habilitar el botón de enviar.
  const isFormValid = () => {
    return Object.keys(errors).length === 0 &&
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.password &&
      formData.gender &&
      formData.termsAccepted;
  };

  // Maneja el envío del formulario.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isFormValid()) {
      console.log('Registro exitoso:', formData);
      history.push('/form'); // Redirige a otra página si el formulario es válido.
    } else {
      console.log('Errores en el formulario');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      {/* Contenedor principal del formulario */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        {/* Logo o imagen principal */}
        <img src="https://via.placeholder.com/150" alt="logo" style={{ marginBottom: '1.5rem' }} />

        {/* Título de bienvenida */}
        <Typography component="h1" variant="h5" marginBottom={"3%"} style={{ color: 'var(--color-verde-lima)' }}>
          ¡Welcome!
        </Typography>

        {/* Formulario de registro */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Campo de nombre */}
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="firstName"
                label="Name"
                name="firstName"
                autoComplete="given-name"
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                InputLabelProps={{
                  style: { color: 'var(--color-gris-oscuro)' }
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
                      borderColor: 'var(--color-verde-lima)', // Color del borde cuando se pasa el mouse
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--color-verde-lima)', // Color del borde cuando está enfocado
                    },
                  },
                }}
              />
            </Grid>



            {/* Campo de apellidos */}
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="lastName"
                label="Last name"
                name="lastName"
                autoComplete="family-name"
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                InputLabelProps={{
                  style: { color: 'var(--color-gris-oscuro)' }
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
                      borderColor: 'var(--color-verde-lima)', // Color del borde cuando se pasa el mouse
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--color-verde-lima)', // Color del borde cuando está enfocado
                    },
                  },
                }}
              />
            </Grid>

            {/* Campo de correo electrónico */}
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email"
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
                    color: 'var(--color-verde-lima)', // Cambia el color del label cuando está enfocado
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'var(--color-gris-oscuro)', // Color del borde por defecto
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--color-verde-lima)', // Color del borde cuando se pasa el mouse
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--color-verde-lima)', // Color del borde cuando está enfocado
                    },
                  },
                }}
              />
            </Grid>

            {/* Campo de contraseña */}
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                InputLabelProps={{
                  style: { color: 'var(--color-gris-oscuro)' }
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
                      borderColor: 'var(--color-verde-lima)', // Color del borde cuando se pasa el mouse
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--color-verde-lima)', // Color del borde cuando está enfocado
                    },
                  },
                }}
              />
            </Grid>

            {/* Selector de género */}
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                select
                fullWidth
                name="gender"
                label="Gender"
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                error={!!errors.gender}
                helperText={errors.gender}
                InputLabelProps={{
                  style: { color: 'var(--color-gris-oscuro)' }
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
                      borderColor: 'var(--color-verde-lima)', // Color del borde cuando se pasa el mouse
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--color-verde-lima)', // Color del borde cuando está enfocado
                    },
                  },
                }}
              >
                <MenuItem value="M">Male</MenuItem>
                <MenuItem value="F">Female</MenuItem>
                <MenuItem value="Otro">Other</MenuItem>
              </TextField>
            </Grid>

            {/* Selector de fecha de nacimiento */}
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Birthdate"
                  value={formData.birthDate}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.birthDate}
                      helperText={errors.birthDate}
                      InputLabelProps={{
                        style: { color: 'var(--color-gris-oscuro)' } // Cambia el color de la etiqueta
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
                            borderColor: 'var(--color-verde-lima)', // Color del borde cuando se pasa el mouse
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'var(--color-verde-lima)', // Color del borde cuando está enfocado
                          },
                        },
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>


            {/* Checkbox de términos y condiciones */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    style={{ color: 'var(--color-verde-lima)' }}
                    checked={formData.termsAccepted}
                    onChange={handleCheckboxChange}
                    name="termsAccepted"
                  />
                }
                label="I accept the terms and conditions"
              />
              {errors.termsAccepted && (
                <Typography color="error">{errors.termsAccepted}</Typography>
              )}
            </Grid>
          </Grid>

          {/* Botón de registro */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            style={{
              backgroundColor: 'var(--color-verde-lima)',
              color: 'var(--color-blanco)',
              marginTop: '1rem'
            }}
            disabled={!isFormValid()} // Desactiva el botón si el formulario no es válido.
          >
            Register
          </Button>

          {/* Enlace para iniciar sesión si ya tienes una cuenta */}
          <Grid container justifyContent="center" alignItems="center" style={{ marginTop: '1rem' }}>
            <Grid item>
              <Typography component="span" variant="body2" style={{ color: 'var(--color-gris-oscuro)' }}>
                Do you already have an account?
              </Typography>
              <Link href="/login" variant="body2" style={{ marginLeft: '0.5rem', color: 'var(--color-verde-lima)' }}>
              Sign in
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
};

export default Register;
