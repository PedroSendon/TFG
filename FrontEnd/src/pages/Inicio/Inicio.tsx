import React, { useContext, useEffect, useState } from 'react';
import { Select, MenuItem, Container, Button, Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext'; // Importar el contexto de idioma
import '../../theme/variables.css';

const MainScreen: React.FC = () => {
  const history = useHistory();
  const { language, changeLanguage } = useContext(LanguageContext); // Usar el contexto de idioma

  // Estado para almacenar la URL del logo
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const handleRegister = () => {
    history.push('/register');
  };

  const handleLogin = () => {
    history.push('/login');
  };

  const fetchLogo = async () => {
    try {
      // Realizar la solicitud GET a la API para obtener el logo
      const response = await fetch('http://127.0.0.1:8000/api/logo/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Verificar si la respuesta es correcta
      if (!response.ok) {
        throw new Error('Error al obtener el logo');
      }

      // Parsear la respuesta como JSON
      const data = await response.json();

      // Actualizar el estado con la URL del logo si está presente
      if (data.logo_url) {
        console.log('Logo encontrado:', data.logo_url);
        setLogoUrl(data.logo_url);  // Establecer la URL del logo
      } else {
        console.error('Logo no encontrado');
      }

    } catch (err) {
      if (err instanceof Error) {
        console.error('Error al obtener el logo:', err.message);
      } else {
        console.error('Error al obtener el logo:', err);
      }
    }
  };

  // useEffect para cargar los datos cuando el componente se monta
  useEffect(() => {
    fetchLogo(); // Llama a la función que obtiene los datos
  }, []); // El array vacío asegura que esto solo se ejecute una vez al montar el componente

  return (
    <Container
      maxWidth="xs"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        position: 'relative', // Esto es importante para posicionar el dropdown en relación al container
      }}
    >
      {/* Desplegable de selección de idioma con banderas y sin flecha */}
      <Select
        value={language}
        onChange={(e) => changeLanguage(e.target.value as 'en' | 'es' | 'ca')}
        disableUnderline // Desactiva la línea de subrayado del select
        IconComponent={() => null} // Elimina la flecha del select
        style={{
          position: 'absolute',
          top: '20px', // Ajusta según sea necesario
          right: '20px', // Ajusta según sea necesario
          width: '50px', // Tamaño del cuadradito
          height: '50px',
          padding: 0, // Sin padding para que se vea cuadrado
        }}
        renderValue={() => (
          <img
            src={
              language === 'en'
                ? 'https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg'
                : language === 'es'
                  ? 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg'
                  : 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Estelada_blava.svg/1024px-Estelada_blava.svg.png'
            }
            alt={language}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      >
        <MenuItem value="en">
          <img
            src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg"
            alt="English"
            style={{ width: '50px', height: '30px', marginRight: '10px' }} // Tamaño ajustado de la bandera
          />
          English
        </MenuItem>
        <MenuItem value="es">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg"
            alt="Español"
            style={{ width: '50px', height: '30px', marginRight: '10px' }} // Tamaño ajustado de la bandera
          />
          Español
        </MenuItem>
        <MenuItem value="ca">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/c/ce/Flag_of_Catalonia.svg"
            alt="Català"
            style={{ width: '50px', height: '30px', marginRight: '10px' }} // Tamaño ajustado de la bandera
          />
          Català
        </MenuItem>
      </Select>

      <div style={{ width: '100%', marginBottom: '1.5rem' }}>
        <img
          src={'http://localhost:8000/media/productos/FitProX.png'} 
          alt="Logo de la App"
          style={{ width: '100%', marginBottom: '1rem' }}
        />
      </div>

      <Typography variant="h5" style={{ marginBottom: '1.5rem' }}>
        {language === 'en' ? 'Welcome!' : language === 'es' ? '¡Bienvenido!' : 'Benvingut!'}
      </Typography>

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
        onClick={handleRegister}
      >
        {language === 'en' ? 'Register' : language === 'es' ? 'Registrarse' : 'Registrar-se'}
      </Button>

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
        onClick={handleLogin}
      >
        {language === 'en' ? 'Login' : language === 'es' ? 'Iniciar sesión' : 'Iniciar sessió'}
      </Button>
    </Container>
  );
};

export default MainScreen;
