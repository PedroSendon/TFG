import React, { useEffect, useState, useContext } from 'react';
import { AppBar, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useHistory, useLocation } from 'react-router-dom';
import { navItems, NavItem } from './navConfig'; // Importa NavItem aquí
import { LanguageContext } from '../../context/LanguageContext';
import { usePlansContext } from '../../context/PlansContext';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FoodBankIcon from '@mui/icons-material/FoodBank';
import PeopleIcon from '@mui/icons-material/People';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupIcon from '@mui/icons-material/Group';


const iconMap = {
  AssignmentIcon,
  MenuBookIcon,
  GroupIcon,
  FitnessCenterIcon,
  FoodBankIcon,
  TrendingUpIcon,
  AccountCircleIcon,
  HourglassEmptyIcon,
  PeopleIcon,
  GroupAddIcon,
};

const Navbar = () => {
  const { t } = useContext(LanguageContext);
  const { plansAssigned } = usePlansContext();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdminView, setIsAdminView] = useState<boolean>(localStorage.getItem('isAdminView') === 'true');
  const history = useHistory();
  const location = useLocation();
  const [userData, setUserData] = useState<{ profilePhoto?: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
    const fetchUserRoleAndStatus = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        history.push('/login');
        return;
      }
      try {
        const roleResponse = await fetch('http://127.0.0.1:8000/api/user/role/', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        const roleData = await roleResponse.json();
        const role = roleData.role;
        setUserRole(role);
        localStorage.setItem('role', role);
      } catch (error) {
        console.error('Error fetching user role or status:', error);
      }
    };

    const handleStorageChange = () => {
      setIsAdminView(localStorage.getItem('isAdminView') === 'true');
    };

    fetchUserRoleAndStatus();
    fetchUserProfile();
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };



  }, [history]);

  const fetchUserProfile = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) return;
      const profileResponse = await fetch(`http://127.0.0.1:8000/api/profile/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (profileResponse.ok) setUserData(await profileResponse.json());
    } catch (error) {
      console.error('Error fetching profile data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (path: string) => {
    history.push(path);
  };

  if (!userRole) {
    return null;
  }

  const currentRole = isAdminView ? userRole : 'cliente';
  const filteredNavItems = navItems[currentRole as keyof typeof navItems].filter((item: NavItem) => {
    if (item.condition === 'plansAssigned') return plansAssigned;
    if (item.condition === '!plansAssigned') return !plansAssigned;
    return true;
  });

  return (
    <AppBar
      position="fixed"
      sx={{ top: 'auto', bottom: 0, backgroundColor: '#c1c1c1', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }}
    >
      <Paper elevation={3}>
        <BottomNavigation
          value={location.pathname}
          onChange={(event, newValue) => handleNavigation(newValue)}
          sx={{
            backgroundColor: 'transparent',
            justifyContent: filteredNavItems.length <= 3 ? 'space-around' : 'flex-start', // Centrar si hay pocos ítems
            width: filteredNavItems.length <= 3 ? '100%' : 'auto', // Usar todo el ancho si pocos ítems
          }}
          showLabels
        >
          {filteredNavItems.map((item, index) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];

            const isProfileIcon = item.label === 'profile_label' && userData?.profilePhoto; // Verifica si es el ítem de perfil
            const avatarIcon = (
              <img
                src={userData?.profilePhoto}
                alt="Profile"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            );

            return (
              <BottomNavigationAction
                key={index}
                label={t(item.label)}
                icon={isProfileIcon ? avatarIcon : <IconComponent sx={{ fontSize: 24 }} />}
                sx={{
                  color: location.pathname === item.path ? '#FFFFFF' : '#6b6b6b',
                  backgroundColor: location.pathname === item.path ? '#c1c1c1' : 'transparent',
                  '&.Mui-selected': { color: '#FFFFFF', backgroundColor: '#c1c1c1' },
                }}
                onClick={() => handleNavigation(item.path)}
              />
            );
          })}

        </BottomNavigation>
      </Paper>
    </AppBar>
  );
};

export default Navbar;