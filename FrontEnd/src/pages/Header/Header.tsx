import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Button, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onBack = () => {}, showBackButton = false }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdminView, setIsAdminView] = useState<boolean>(localStorage.getItem('isAdminView') === 'true');

  const fetchUserRole = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No access token found');
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:8000/api/user/role/', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const data = await response.json();
      const role = data.role === 'nutricionista' || data.role === 'entrenador' ? 'administrador' : data.role;
      setUserRole(role);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const toggleView = () => {
    const newView = !isAdminView;
    setIsAdminView(newView);
    localStorage.setItem('isAdminView', newView.toString());
    window.dispatchEvent(new Event('storage'));  // Refresca navbar
  };

  useEffect(() => {
    fetchUserRole();
  }, []);

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#c1c1c1', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', height: '64px' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {showBackButton && (
          <IconButton edge="start" color="inherit" onClick={onBack} aria-label="back">
            <ArrowBackIcon />
          </IconButton>
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,
            justifyContent: showBackButton ? 'center' : 'flex-start',
            marginLeft: showBackButton ? 0 : '16px',
          }}
        >
          <Typography variant="h6" sx={{ color: 'black', textAlign: showBackButton ? 'center' : 'left' }}>
            {title}
          </Typography>
        </Box>

        {userRole === 'administrador' ? (
          <Button
            startIcon={<SwapHorizIcon />}
            color="inherit"
            onClick={toggleView}
            sx={{ color: 'black', fontSize: '0.8rem' }}
          >
            {isAdminView ? 'Modo Cliente' : 'Modo Admin'}
          </Button>
        ) : (
          <Box>
            <img
              src="/src/components/FitProX.png"
              alt="Logo"
              style={{ width: '80px', height: '80px' }}
            />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
