import React, { useEffect, useState, useContext } from 'react';
import { AppBar, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FoodBankIcon from '@mui/icons-material/FoodBank';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useHistory, useLocation } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext';
import { usePlansContext } from '../../context/PlansContext';

const NavbarCliente: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { t } = useContext(LanguageContext);
  const { plansAssigned, setPlansAssigned } = usePlansContext(); // Usa el contexto aquí
  

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          console.error(t('no_token'));
          return;
        }
        
        const response = await fetch('http://127.0.0.1:8000/api/user/status/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          // Si el status es distinto de 'assigned', mostramos `pendingPlans`
          setPlansAssigned(data.status === 'assigned');
        } else {
          console.error('Error fetching user status:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching user status:', error);
      }
    };

    fetchUserStatus();
  }, []);

  // Labels for navigation items
  const labels = {
    workout: t('workout_label'),
    macronutrients: t('macronutrients_label'),
    progress: t('progress_label'),
    profile: t('profile_label'),
    pendingPlans: t('pending_plans_label'),
  };

  const getValueFromPath = (path: string) => {
    if (plansAssigned) {
      switch (path) {
        case '/workout':
          return 0;
        case '/macronutrients':
          return 1;
        case '/progress':
          return 2;
        case '/profile':
          return 3;
        default:
          return 0;
      }
    } else {
      switch (path) {
        case '/profile':
          return 0;
        case '/pendingplans':
          return 1;
        default:
          return 0;
      }
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
            const path = plansAssigned
              ? (newValue === 0 ? '/workout' : newValue === 1 ? '/macronutrients' : newValue === 2 ? '/progress' : '/profile')
              : (newValue === 0 ? '/profile' : '/pendingplans');
            handleNavigation(path);
          }}
          sx={{ backgroundColor: 'transparent' }}
          showLabels
        >
          {plansAssigned ? [
            <BottomNavigationAction
              key="workout"
              label={labels.workout}
              icon={<FitnessCenterIcon sx={{ fontSize: 24 }} />}
              sx={{
                color: getValueFromPath(location.pathname) === 0 ? '#FFFFFF' : '#6b6b6b',
                backgroundColor: getValueFromPath(location.pathname) === 0 ? '#c1c1c1' : 'transparent',
                '&.Mui-selected': { color: '#FFFFFF', backgroundColor: '#c1c1c1' },
              }}
            />,
            <BottomNavigationAction
              key="macronutrients"
              label={labels.macronutrients}
              icon={<FoodBankIcon sx={{ fontSize: 24 }} />}
              sx={{
                color: getValueFromPath(location.pathname) === 1 ? '#FFFFFF' : '#6b6b6b',
                backgroundColor: getValueFromPath(location.pathname) === 1 ? '#c1c1c1' : 'transparent',
                '&.Mui-selected': { color: '#FFFFFF', backgroundColor: '#c1c1c1' },
              }}
            />,
            <BottomNavigationAction
              key="progress"
              label={labels.progress}
              icon={<TrendingUpIcon sx={{ fontSize: 24 }} />}
              sx={{
                color: getValueFromPath(location.pathname) === 2 ? '#FFFFFF' : '#6b6b6b',
                backgroundColor: getValueFromPath(location.pathname) === 2 ? '#c1c1c1' : 'transparent',
                '&.Mui-selected': { color: '#FFFFFF', backgroundColor: '#c1c1c1' },
              }}
            />,
            <BottomNavigationAction
              key="profile"
              label={labels.profile}
              icon={<AccountCircleIcon sx={{ fontSize: 24 }} />}
              sx={{
                color: getValueFromPath(location.pathname) === 3 ? '#FFFFFF' : '#6b6b6b',
                backgroundColor: getValueFromPath(location.pathname) === 3 ? '#c1c1c1' : 'transparent',
                '&.Mui-selected': { color: '#FFFFFF', backgroundColor: '#c1c1c1' },
              }}
            />
          ] : [
            <BottomNavigationAction
              key="profile"
              label={labels.profile}
              icon={<AccountCircleIcon sx={{ fontSize: 24 }} />}
              sx={{
                color: getValueFromPath(location.pathname) === 0 ? '#FFFFFF' : '#6b6b6b',
                backgroundColor: getValueFromPath(location.pathname) === 0 ? '#c1c1c1' : 'transparent',
                '&.Mui-selected': { color: '#FFFFFF', backgroundColor: '#c1c1c1' },
              }}
            />,
            <BottomNavigationAction
              key="pendingPlans"
              label={labels.pendingPlans}
              icon={<HourglassEmptyIcon sx={{ fontSize: 24 }} />}
              sx={{
                color: getValueFromPath(location.pathname) === 1 ? '#FFFFFF' : '#6b6b6b',
                backgroundColor: getValueFromPath(location.pathname) === 1 ? '#c1c1c1' : 'transparent',
                '&.Mui-selected': { color: '#FFFFFF', backgroundColor: '#c1c1c1' },
              }}
            />
          ]}
        </BottomNavigation>
      </Paper>
    </AppBar>
  );
};

export default NavbarCliente;
