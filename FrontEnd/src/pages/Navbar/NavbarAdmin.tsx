// NavbarAdmin.js
import React from 'react';
import { AppBar, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupIcon from '@mui/icons-material/Group';
import { useHistory, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';

const NavbarAdmin = () => {
  const history = useHistory();
  const location = useLocation();
  const { t } = useContext(LanguageContext);

  // Labels for navigation items
  const labels = {
    workout: t('workout_label'),
    nutrition: t('nutrition_label'),
    users: t('all_users_label'),
  };

  // Asignar el índice de la pestaña en función de la URL actual
  const getValueFromPath = (path: string) => {
    switch (path) {
      case '/admin/workout':
        return 0;
      case '/admin/nutrition':
        return 1;
      case '/admin/users':
        return 2;
      default:
        return 0; // Valor predeterminado
    }
  };

  const handleNavigation = (path: string) => {
    history.push(path);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        top: 'auto',
        bottom: 0,
        backgroundColor: '#c1c1c1',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Paper elevation={3}>
        <BottomNavigation
          value={getValueFromPath(location.pathname)}
          onChange={(event, newValue) => {
            handleNavigation(
              newValue === 0
                ? '/admin/workout'
                : newValue === 1
                ? '/admin/nutrition'
                : '/admin/users'
            );
          }}
          sx={{ backgroundColor: 'transparent' }}
          showLabels
        >
          <BottomNavigationAction
            label={labels.workout}
            icon={<AssignmentIcon sx={{ fontSize: 24 }} />}
            sx={{
              color: getValueFromPath(location.pathname) === 0 ? '#FFFFFF' : '#6b6b6b',
              backgroundColor: getValueFromPath(location.pathname) === 0 ? '#c1c1c1' : 'transparent',
              '&.Mui-selected': { color: '#FFFFFF', backgroundColor: '#c1c1c1' },
            }}
          />
          <BottomNavigationAction
            label={labels.nutrition}
            icon={<MenuBookIcon sx={{ fontSize: 24 }} />}
            sx={{
              color: getValueFromPath(location.pathname) === 1 ? '#FFFFFF' : '#6b6b6b',
              backgroundColor: getValueFromPath(location.pathname) === 1 ? '#c1c1c1' : 'transparent',
              '&.Mui-selected': { color: '#FFFFFF', backgroundColor: '#c1c1c1' },
            }}
          />
          <BottomNavigationAction
            label={labels.users}
            icon={<GroupIcon sx={{ fontSize: 24 }} />}
            sx={{
              color: getValueFromPath(location.pathname) === 2 ? '#FFFFFF' : '#6b6b6b',
              backgroundColor: getValueFromPath(location.pathname) === 2 ? '#c1c1c1' : 'transparent',
              '&.Mui-selected': { color: '#FFFFFF', backgroundColor: '#c1c1c1' },
            }}
          />
        </BottomNavigation>
      </Paper>
    </AppBar>
  );
};

export default NavbarAdmin;
