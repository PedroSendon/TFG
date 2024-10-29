import React, { useState, useEffect, useContext } from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FoodBankIcon from '@mui/icons-material/FoodBank';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GroupIcon from '@mui/icons-material/Group';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useHistory, useLocation } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext';

const Navbar: React.FC = () => {
  const { t } = useContext(LanguageContext);
  const history = useHistory();
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [value, setValue] = useState(0);
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

  useEffect(() => {
    fetchUserRole();
    const handleStorageChange = () => {
      setIsAdminView(localStorage.getItem('isAdminView') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleNavigation = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    const adminPaths = ['/admin/workout', '/admin/nutrition', '/admin/statistics', '/admin/users'];
    const clientPaths = ['/workout', '/macronutrients', '/progress', '/profile'];
    const paths = isAdminView ? adminPaths : clientPaths;
    history.push(paths[newValue]);
  };

  return (
    <BottomNavigation
      value={value}
      onChange={handleNavigation}
      showLabels
      sx={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        zIndex: 1000,
        backgroundColor: '#fff',
        boxShadow: '0 -1px 10px rgba(0,0,0,0.1)',
      }}
    >
      <BottomNavigationAction
        icon={<FitnessCenterIcon />}
        sx={{
          color: value === 0 ? '#FFFFFF' : '#6b6b6b',
          backgroundColor: value === 0 ? '#c1c1c1' : 'transparent',
          '&.Mui-selected': {
            color: '#FFFFFF',
          },
        }}
      />
      <BottomNavigationAction
        icon={<FoodBankIcon />}
        sx={{
          color: value === 1 ? '#FFFFFF' : '#6b6b6b',
          backgroundColor: value === 1 ? '#c1c1c1' : 'transparent',
          '&.Mui-selected': {
            color: '#FFFFFF',
          },
        }}
      />
      <BottomNavigationAction
        icon={isAdminView ? <BarChartIcon /> : <TrendingUpIcon />}
        sx={{
          color: value === 2 ? '#FFFFFF' : '#6b6b6b',
          backgroundColor: value === 2 ? '#c1c1c1' : 'transparent',
          '&.Mui-selected': {
            color: '#FFFFFF',
          },
        }}
      />
      <BottomNavigationAction
        icon={isAdminView ? <GroupIcon /> : <AccountCircleIcon />}
        sx={{
          color: value === 3 ? '#FFFFFF' : '#6b6b6b',
          backgroundColor: value === 3 ? '#c1c1c1' : 'transparent',
          '&.Mui-selected': {
            color: '#FFFFFF',
          },
        }}
      />
    </BottomNavigation>
  );
};

export default Navbar;
