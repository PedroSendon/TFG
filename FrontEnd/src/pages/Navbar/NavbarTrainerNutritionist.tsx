// NavbarEntrenadorNutricionista.js
import React, { useState, useEffect } from 'react';
import { AppBar, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FoodBankIcon from '@mui/icons-material/FoodBank';
import PeopleIcon from '@mui/icons-material/People';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { useHistory } from 'react-router-dom';

const NavbarEntrenadorNutricionista = () => {
  const history = useHistory();
  const [value, setValue] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);

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
      setUserRole(data.role);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, []);

  const handleNavigation = (path: string, index: number) => {
    setValue(index);
    history.push(path);
  };

  const actions = [
    userRole === 'entrenador' && (
      <BottomNavigationAction
        key="workouts"
        icon={<FitnessCenterIcon sx={{ fontSize: value === 0 ? 35 : 22 }} />}
        onClick={() => handleNavigation('/admin/workout', 0)}
        sx={{
          color: value === 0 ? '#FFFFFF' : '#6b6b6b',
          backgroundColor: value === 0 ? '#c1c1c1' : 'transparent',
          '&.Mui-selected': { color: '#FFFFFF' },
        }}
      />
    ),
    userRole === 'nutricionista' && (
      <BottomNavigationAction
        key="macros"
        icon={<FoodBankIcon sx={{ fontSize: value === 0 ? 35 : 22 }} />}
        onClick={() => handleNavigation('/admin/nutrition', 0)}
        sx={{
          color: value === 0 ? '#FFFFFF' : '#6b6b6b',
          backgroundColor: value === 0 ? '#c1c1c1' : 'transparent',
          '&.Mui-selected': { color: '#FFFFFF' },
        }}
      />
    ),
    <BottomNavigationAction
      key="pending-users"
      icon={<GroupAddIcon sx={{ fontSize: value === 1 ? 35 : 22 }} />}
      onClick={() => handleNavigation('/admin/pending-users', 1)}
      sx={{
        color: value === 1 ? '#FFFFFF' : '#6b6b6b',
        backgroundColor: value === 1 ? '#c1c1c1' : 'transparent',
        '&.Mui-selected': { color: '#FFFFFF' },
      }}
    />,
    <BottomNavigationAction
      key="users"
      icon={<PeopleIcon sx={{ fontSize: value === 2 ? 35 : 22 }} />}
      onClick={() => handleNavigation('/admin/users', 2)}
      sx={{
        color: value === 2 ? '#FFFFFF' : '#6b6b6b',
        backgroundColor: value === 2 ? '#c1c1c1' : 'transparent',
        '&.Mui-selected': { color: '#FFFFFF' },
      }}
    />,
  ];

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
          value={value}
          onChange={(event, newValue) => setValue(newValue)}
          sx={{ backgroundColor: 'transparent' }}
        >
          {actions.filter(Boolean)} {/* Filter out null items */}
        </BottomNavigation>
      </Paper>
    </AppBar>
  );
};

export default NavbarEntrenadorNutricionista;
