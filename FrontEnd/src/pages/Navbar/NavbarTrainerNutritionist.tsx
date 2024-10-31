// NavbarEntrenadorNutricionista.js
import React, { useState, useEffect, useContext } from 'react';
import { AppBar, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FoodBankIcon from '@mui/icons-material/FoodBank';
import PeopleIcon from '@mui/icons-material/People';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { useHistory, useLocation } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext';

const NavbarEntrenadorNutricionista = () => {
  const history = useHistory();
  const location = useLocation();
  const { t } = useContext(LanguageContext);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Labels for navigation items
  const labels = {
    workouts: t('workouts_label'),
    nutrition: t('nutrition_label'),
    unassignedUsers: t('unassigned_users_label'),
    allUsers: t('all_users_label'),
  };

  // Fetch the user role once on component mount
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

  // Determines if the given path is currently active
  const isActive = (path: string) => location.pathname === path;

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
        <BottomNavigation sx={{ backgroundColor: 'transparent' }} showLabels>
          {userRole === 'entrenador' && (
            <BottomNavigationAction
              label={labels.workouts}
              icon={<FitnessCenterIcon sx={{ fontSize: 24 }} />}
              sx={{
                color: isActive('/admin/workout') ? '#FFFFFF' : '#6b6b6b',
                backgroundColor: isActive('/admin/workout') ? '#c1c1c1' : 'transparent',
                '&.Mui-selected': { color: '#FFFFFF', backgroundColor: '#c1c1c1' },
              }}
              onClick={() => handleNavigation('/admin/workout')}
            />
          )}
          {userRole === 'nutricionista' && (
            <BottomNavigationAction
              label={labels.nutrition}
              icon={<FoodBankIcon sx={{ fontSize: 24 }} />}
              sx={{
                color: isActive('/admin/nutrition') ? '#FFFFFF' : '#6b6b6b',
                backgroundColor: isActive('/admin/nutrition') ? '#c1c1c1' : 'transparent',
                '&.Mui-selected': { color: '#FFFFFF', backgroundColor: '#c1c1c1' },
              }}
              onClick={() => handleNavigation('/admin/nutrition')}
            />
          )}
          <BottomNavigationAction
            label={labels.unassignedUsers}
            icon={<GroupAddIcon sx={{ fontSize: 24 }} />}
            sx={{
              color: isActive('/admin/pending-users') ? '#FFFFFF' : '#6b6b6b',
              backgroundColor: isActive('/admin/pending-users') ? '#c1c1c1' : 'transparent',
              '&.Mui-selected': { color: '#FFFFFF', backgroundColor: '#c1c1c1' },
            }}
            onClick={() => handleNavigation('/admin/pending-users')}
          />
          <BottomNavigationAction
            label={labels.allUsers}
            icon={<PeopleIcon sx={{ fontSize: 24 }} />}
            sx={{
              color: isActive('/admin/users') ? '#FFFFFF' : '#6b6b6b',
              backgroundColor: isActive('/admin/users') ? '#c1c1c1' : 'transparent',
              '&.Mui-selected': { color: '#FFFFFF', backgroundColor: '#c1c1c1' },
            }}
            onClick={() => handleNavigation('/admin/users')}
          />
        </BottomNavigation>
      </Paper>
    </AppBar>
  );
};

export default NavbarEntrenadorNutricionista;
