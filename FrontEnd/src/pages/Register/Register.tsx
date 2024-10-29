import React, { useState, useContext } from 'react';
import {
  TextField, Button, Grid, Typography, Container,
  FormControlLabel, Checkbox, MenuItem,
  Box
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { LanguageContext } from '../../context/LanguageContext'; // Importamos el contexto de idioma

const Register: React.FC = () => {
  const history = useHistory();
  const { t } = useContext(LanguageContext); // Usamos el contexto de idioma

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    birthDate: dayjs(),
    gender: '',
    termsAccepted: false,
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
      newErrors.email = t('invalid_email'); // Mensaje de error traducido
    } else if (name === 'email') {
      delete newErrors.email;
    }

    if (name === 'firstName' && !validateName(value)) {
      newErrors.firstName = t('invalid_name'); // Mensaje de error traducido
    } else if (name === 'firstName') {
      delete newErrors.firstName;
    }

    if (name === 'lastName' && !validateName(value)) {
      newErrors.lastName = t('invalid_lastname'); // Mensaje de error traducido
    } else if (name === 'lastName') {
      delete newErrors.lastName;
    }

    if (name === 'password' && !validatePassword(value)) {
      newErrors.password = t('invalid_password'); // Mensaje de error traducido
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
      newErrors.birthDate = t('invalid_age'); // Mensaje de error traducido
    } else {
      delete newErrors.birthDate;
    }
    setErrors(newErrors);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      termsAccepted: e.target.checked,
    });
  };

  const isFormValid = () => {
    return Object.keys(errors).length === 0 &&
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.password &&
      formData.gender &&
      formData.termsAccepted;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      console.log('Errores en el formulario');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          birth_date: formData.birthDate.format('YYYY-MM-DD'),
          gender: formData.gender,
          terms_accepted: formData.termsAccepted,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Usuario registrado:', data);

        // Almacenar los tokens JWT en el localStorage o sessionStorage
        localStorage.setItem('access_token', data.access); // Almacena el token de acceso
        localStorage.setItem('refresh_token', data.refresh); // Almacena el token de refresco

        // Redirigir al usuario a otra página, por ejemplo el formulario o dashboard
        history.push('/form');
      } else {
        const errorData = await response.json();
        console.log('Error:', errorData);
        setErrors({ apiError: errorData.error });
      }
    } catch (error) {
      console.log('Error en la petición:', error);
      setErrors({ apiError: t('connection_error') }); // Mensaje de error traducido
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
          <img src="/src/components/logo.png" alt="logo" style={{ width: '60px', borderRadius: '50%' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333333', mt: 2 }}>
            {t('welcome')}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                label={t('name')}
                name="firstName"
                autoComplete="given-name"
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                InputProps={{ style: { color: '#333333' } }}
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
                required
                fullWidth
                label={t('last_name')}
                name="lastName"
                autoComplete="family-name"
                onChange={handleChange}
                error={!!errors.lastName}
                helperText={errors.lastName}
                InputProps={{ style: { color: '#333333' } }}
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
                required
                fullWidth
                label={t('email')}
                name="email"
                autoComplete="email"
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{ style: { color: '#333333' } }}
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
                required
                fullWidth
                label={t('password')}
                type="password"
                name="password"
                autoComplete="current-password"
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{ style: { color: '#333333' } }}
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
                required
                select
                fullWidth
                label={t('gender')}
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                error={!!errors.gender}
                helperText={errors.gender}
                InputProps={{ style: { color: '#333333' } }}
                sx={{
                  '& label.Mui-focused': { color: '#555555' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#CCCCCC' },
                    '&:hover fieldset': { borderColor: '#AAAAAA' },
                    '&.Mui-focused fieldset': { borderColor: '#555555' },
                  },
                }}
              >
                <MenuItem value="M">{t('male')}</MenuItem>
                <MenuItem value="F">{t('female')}</MenuItem>
                <MenuItem value="Otro">{t('other')}</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={8} container justifyContent="center">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label={t('birthdate')}
                  value={formData.birthDate}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.birthDate}
                      helperText={errors.birthDate}
                      sx={{
                        '& label.Mui-focused': { color: '#555555' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#CCCCCC' },
                          '&:hover fieldset': { borderColor: '#AAAAAA' },
                          '&.Mui-focused fieldset': { borderColor: '#555555 !important' },
                        },
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    sx={{ color: '#555555' }}
                    checked={formData.termsAccepted}
                    onChange={handleCheckboxChange}
                    name="termsAccepted"
                  />
                }
                label={<Typography variant="body2" sx={{ color: '#555555' }}>{t('terms_and_conditions')}</Typography>}
              />
              {errors.termsAccepted && (
                <Typography color="error">{errors.termsAccepted}</Typography>
              )}
            </Grid>
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
            disabled={!isFormValid()}
          >
            {t('register_button')}
          </Button>

          {errors.apiError && (
            <Typography color="error" sx={{ mt: 1 }}>{errors.apiError}</Typography>
          )}


          <Grid container justifyContent="center" sx={{ mt: 2 }}>
            <Grid item>
              <Typography component="span" variant="body2" sx={{ color: '#777777' }}>
                {t('already_have_account')}
              </Typography>
              <Button
                onClick={() => history.push('/login')}
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
                {t('login_button')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  );
};

export default Register;