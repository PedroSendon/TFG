import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface HeaderProps {
  title: string;  // El título que se pasará como parámetro
  showBackButton?: boolean;  // Indica si se debe mostrar el botón de retroceso
  onBack?: () => void;  // Función que se ejecuta al hacer clic en el botón de retroceso
}

const Header: React.FC<HeaderProps> = ({ title, onBack = () => {}, showBackButton = false }) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#c1c1c1', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', height: '64px' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {showBackButton && (
          <IconButton edge="start" color="inherit" onClick={onBack} aria-label="back">
            <ArrowBackIcon />
          </IconButton>
        )}

        {/* Contenedor para el título con alineación condicional */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          flexGrow: 1,
          justifyContent: showBackButton ? 'center' : 'flex-start',  // Centrado si hay flecha de retroceso, alineado a la izquierda si no
          marginLeft: showBackButton ? 0 : '16px',  // Espaciado opcional para estética cuando está alineado a la izquierda
        }}>
          <Typography variant="h6" sx={{ color: 'black', textAlign: showBackButton ? 'center' : 'left' }}>
            {title}
          </Typography>
        </Box>

        {/* Logo en la esquina superior derecha */}
        <Box>
          <img
            src="/src/components/FitProX.png"  // Ruta de la imagen del logo
            alt="Logo"
            style={{ width: '80px', height: '80px' }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
