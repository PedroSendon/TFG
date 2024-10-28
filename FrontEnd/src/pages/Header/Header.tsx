import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';

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
    <AppBar position="static" style={{ backgroundColor: '#c1c1c1', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', height: '64px' }}>
      <Toolbar style={{ display: 'flex', alignItems: 'center' }}>
        {showBackButton && (
          <IconButton edge="start" color="inherit" onClick={onBack} aria-label="back">
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h6" style={{ flexGrow: 1, textAlign: 'center', color: 'black'}}>
          {title}
        </Typography>
        
      </Toolbar>
    </AppBar>
  );
};

export default Header;
