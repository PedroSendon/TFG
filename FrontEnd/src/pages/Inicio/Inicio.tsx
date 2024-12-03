import React, { useContext } from 'react';
import { Select, MenuItem, Container, Button, Box, OutlinedInput, Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext';
import useImage from '../Image/useImage';
import { STATIC_FILES } from "../../context/config";

const MainScreen: React.FC = () => {
  const { imageUrl } = useImage(STATIC_FILES.LOGO);
  const history = useHistory();
  const { language, changeLanguage } = useContext(LanguageContext);
  const { t } = useContext(LanguageContext); // Usamos el contexto de idioma

  const handleRegister = () => {
    history.push('/register');
  };

  const handleLogin = () => {
    history.push('/login');
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        bgcolor: '#f5f5f5',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        position: 'relative',
      }}
    >
      <Select
        value={language}
        onChange={(e) => changeLanguage(e.target.value as 'en' | 'es' | 'ca')}
        IconComponent={() => null} // Elimina el icono de flecha
        input={<OutlinedInput notched={false} />}
        sx={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '50px', // Tamaño ajustado
          height: '50px',
          padding: 0,
          border: '1px solid #d0d0d0',
          borderRadius: '8px',
          backgroundColor: 'transparent', // Fondo transparente cuando está cerrado
          '&.Mui-focused': {
            backgroundColor: '#f5f5f5', // Fondo cuando está abierto
          },
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          },
        }}
        renderValue={() => (
          <Box
            component="img"
            src={
              language === 'en'
                ? 'https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg'
                : language === 'es'
                  ? 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg'
                  : 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Flag_of_Catalonia.svg'
            }
            alt={language}
            sx={{
              width: '32px', // Ocupa todo el ancho disponible
              height: '100%', // Ocupa toda la altura disponible
              objectFit: 'cover', // Ajusta la imagen
              marginLeft: '30px', // Espacio entre la imagen y el texto
            }}
          />
        )}
      >
        <MenuItem
          value="en"
          sx={{
            '&.Mui-selected': {
              backgroundColor: '#e0e0e0', // Fondo gris cuando está seleccionado
            },
            '&.Mui-selected:hover': {
              backgroundColor: '#d3d3d3', // Fondo gris más oscuro al pasar el ratón
            },
          }}
        >
          <Box
            component="img"
            src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg"
            alt="English"
            sx={{ width: '30px', height: '20px', marginRight: '10px' }}
          />
          English
        </MenuItem>
        <MenuItem
          value="es"
          sx={{
            '&.Mui-selected': {
              backgroundColor: '#e0e0e0',
            },
            '&.Mui-selected:hover': {
              backgroundColor: '#d3d3d3',
            },
          }}
        >
          <Box
            component="img"
            src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg"
            alt="Español"
            sx={{ width: '30px', height: '20px', marginRight: '10px' }}
          />
          Español
        </MenuItem>
        <MenuItem
          value="ca"
          sx={{
            '&.Mui-selected': {
              backgroundColor: '#e0e0e0',
            },
            '&.Mui-selected:hover': {
              backgroundColor: '#d3d3d3',
            },
          }}
        >
          <Box
            component="img"
            src="https://upload.wikimedia.org/wikipedia/commons/c/ce/Flag_of_Catalonia.svg"
            alt="Català"
            sx={{ width: '30px', height: '20px', marginRight: '10px' }}
          />
          Català
        </MenuItem>
      </Select>



      {/* Logo */}
      <Box sx={{ width: '80%', marginBottom: '1.5rem' }}>

        <img src={imageUrl || ''} alt="Logo de la App" style={{ width: '100%' }} />
      </Box>

      {/* Bienvenida 
      <Typography variant="h5" sx={{ marginBottom: '1.5rem', color: '#333' }}>
        {language === 'en' ? 'Welcome!' : language === 'es' ? '¡Bienvenido!' : 'Benvingut!'}
      </Typography>
      */}

      {/* Botón de Registro */}
      <Button
        variant="contained"
        fullWidth
        onClick={handleRegister}
        sx={{
          marginBottom: '1rem',
          borderRadius: '25px',
          padding: '12px 20px',
          fontSize: '16px',
          fontWeight: 'bold',
          bgcolor: '#5f5f5f',
          color: '#ffffff',
          boxShadow: '0 4px 10px rgba(95, 95, 95, 0.3)',
          '&:hover': {
            bgcolor: '#4b4b4b',
          },
        }}
      >
        {language === 'en' ? 'Register' : language === 'es' ? 'Registrarse' : 'Registrar-se'}
      </Button>

      {/* Botón de Inicio de Sesión */}
      <Button
        variant="outlined"
        fullWidth
        onClick={handleLogin}
        sx={{
          borderRadius: '25px',
          padding: '12px 20px',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#5f5f5f',
          borderColor: '#5f5f5f',
          boxShadow: '0 4px 10px rgba(95, 95, 95, 0.2)',
          '&:hover': {
            borderColor: '#4b4b4b',
            color: '#4b4b4b',
          },
        }}
      >
        {language === 'en' ? 'Login' : language === 'es' ? 'Iniciar sesión' : 'Iniciar sessió'}
      </Button>
    </Container>
  );
};

export default MainScreen;
