import React, { useContext } from 'react';
import { Button, Container, Typography, Select, MenuItem } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext'; // Importar el contexto de idioma
import '../../theme/variables.css';

const MainScreen: React.FC = () => {
  const history = useHistory();
  const { t, language, changeLanguage } = useContext(LanguageContext); // Usar el contexto de idioma

  const handleRegister = () => {
    history.push('/register');
  };

  const handleLogin = () => {
    history.push('/login');
  };

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
      }}
    >
      <div style={{ width: '100%', marginBottom: '1.5rem' }}>
        <img
          src="https://via.placeholder.com/300x150"
          alt="IMG"
          style={{ width: '100%', marginBottom: '1rem' }}
        />
      </div>

      {/* Desplegable de selección de idioma */}
      <Select
        value={language}
        onChange={(e) => changeLanguage(e.target.value as 'en' | 'es' | 'ca')}
        fullWidth
        style={{ marginBottom: '1rem' }}
      >
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="es">Español</MenuItem>
        <MenuItem value="ca">Català</MenuItem>
      </Select>

      <Typography variant="h5" style={{ marginBottom: '1.5rem' }}>
        {t('welcome_message')}
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
        {t('register_button')}
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
        {t('login_button')}
      </Button>
    </Container>
  );
};

export default MainScreen;
