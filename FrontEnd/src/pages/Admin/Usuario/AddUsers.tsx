import React, { useState } from 'react';
import {
    TextField, IconButton, Button, Grid, Typography, Container,
    MenuItem
} from '@mui/material'; // Importación de componentes de Material UI.
import { useHistory } from 'react-router-dom'; // Hook para redirección.
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // Componente de selector de fecha.
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; // Proveedor de localización para el selector de fechas.
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'; // Adaptador para el manejo de fechas con Day.js.
import dayjs from 'dayjs'; // Librería para manipular fechas.
import Header from '../../Header/Header'; // Componente de header reutilizable

const AddUsers: React.FC = () => {
    const history = useHistory(); // Inicializa el hook para manejar la navegación.

    // Estado para almacenar los datos del formulario.
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        birthDate: dayjs(), // Se inicializa con la fecha actual.
        gender: '',
        role: '', // Nuevo estado para el rol.
    });

    // Estado para manejar los errores de validación.
    const [errors, setErrors] = useState<any>({});

    // Validaciones (similar al registro original).
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

    // Manejar cambios en el formulario.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });

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

    // Verifica si el formulario es válido para habilitar el botón de enviar.
    const isFormValid = () => {
        return Object.keys(errors).length === 0 &&
            formData.firstName &&
            formData.lastName &&
            formData.email &&
            formData.password &&
            formData.gender &&
            formData.role; // Verificamos que se haya seleccionado un rol.
    };

    // Maneja el envío del formulario.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isFormValid()) {
            console.log('Usuario agregado con éxito:', formData);
            history.push('/admin/users'); // Redirige de nuevo a la lista de usuarios.
        } else {
            console.log('Errores en el formulario');
        }
    };
    const handleCancel = () => {
        history.push('/admin/users');  // Cancelar y redirigir a la lista de ejercicios
    };

    return (
        <Container component="main" maxWidth="xs" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header title="Add User" />
            <div style={{ marginTop: '2rem', textAlign: 'center', flexGrow: 1 }}>
                {/* Formulario de agregar usuario */}
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        {/* Campo de nombre */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="firstName"
                                label="Nombre"
                                name="firstName"
                                onChange={handleChange}
                                error={!!errors.firstName}
                                helperText={errors.firstName}
                            />
                        </Grid>

                        {/* Campo de apellidos */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="lastName"
                                label="Apellidos"
                                name="lastName"
                                onChange={handleChange}
                                error={!!errors.lastName}
                                helperText={errors.lastName}
                            />
                        </Grid>

                        {/* Campo de correo electrónico */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="email"
                                label="Correo electrónico"
                                name="email"
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                            />
                        </Grid>

                        {/* Campo de contraseña */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                name="password"
                                label="Contraseña"
                                type="password"
                                id="password"
                                onChange={handleChange}
                                error={!!errors.password}
                                helperText={errors.password}
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
                                label="Género"
                                id="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                error={!!errors.gender}
                                helperText={errors.gender}
                            >
                                <MenuItem value="M">Masculino</MenuItem>
                                <MenuItem value="F">Femenino</MenuItem>
                                <MenuItem value="Otro">Otro</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Selector de rol */}
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                select
                                fullWidth
                                name="role"
                                label="Rol"
                                id="role"
                                value={formData.role}
                                onChange={handleChange}
                                error={!!errors.role}
                                helperText={errors.role}
                            >
                                <MenuItem value="cliente">Cliente</MenuItem>
                                <MenuItem value="administrador">Administrador</MenuItem>
                                <MenuItem value="entrenador">Entrenador</MenuItem>
                                <MenuItem value="nutricionista">Nutricionista</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Selector de fecha de nacimiento */}
                        <Grid item xs={12}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Fecha de nacimiento"
                                    value={formData.birthDate}
                                    onChange={handleDateChange}
                                />
                            </LocalizationProvider>
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
                            disabled={!isFormValid()}                        >
                            ADD
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AddUsers;
