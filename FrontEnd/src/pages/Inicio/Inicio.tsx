import React from 'react';
import { Button, Container, Typography } from '@mui/material'; // Importación de componentes de Material UI.
import { useHistory } from 'react-router-dom'; // Hook de redirección para React Router v5.

import '../../theme/variables.css';  // Archivo de estilos personalizados, que define variables CSS.

const MainScreen: React.FC = () => {
  const history = useHistory(); // Hook para manejar la navegación del usuario.

  // Función para redirigir a la página de registro.
  const handleRegister = () => {
    history.push('/register');
  };

  // Función para redirigir a la página de inicio de sesión.
  const handleLogin = () => {
    history.push('/login');
  };

  return (
    // Contenedor principal con diseño centralizado vertical y horizontalmente.
    <Container
      maxWidth="xs" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh', 
        textAlign: 'center', 
      }}
    >
      {/* Imagen superior */}
      <div style={{ width: '100%', marginBottom: '1.5rem' }}>
        <img
          src="https://via.placeholder.com/300x150" 
          alt="IMG"
          style={{ width: '100%', marginBottom: '1rem' }} // Imagen de ancho completo dentro del contenedor.
        />
      </div>

      {/* Texto de bienvenida */}
      <Typography variant="h5" style={{ marginBottom: '1.5rem' }}>
        Bienvenido
      </Typography>

      {/* Botón de Registro */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        style={{
          marginBottom: '1rem',
          borderRadius: '50px', 
          padding: '10px 20px', 
          fontSize: '16px', 
          backgroundColor: 'var(--color-verde-lima)', 
        }}
        onClick={handleRegister} // Redirige al usuario a la página de registro.
      >
        Registrar-se
      </Button>

      {/* Botón de Iniciar Sesión */}
      <Button
        variant="outlined"
        fullWidth
        style={{
          marginBottom: '1rem',
          borderRadius: '50px', 
          padding: '10px 20px', 
          fontSize: '16px', 
          color: 'var(--color-verde-lima)', 
          borderColor: 'var(--color-verde-lima)', 
        }}
        onClick={handleLogin} // Redirige al usuario a la página de inicio de sesión.
      >
        Iniciar sesión
      </Button>
    </Container>
  );
};

export default MainScreen;
