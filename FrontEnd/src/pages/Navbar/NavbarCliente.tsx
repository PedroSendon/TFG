// NavbarCliente.js
import React, { useState } from 'react';
import { AppBar, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FoodBankIcon from '@mui/icons-material/FoodBank';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useHistory } from 'react-router-dom';

interface NavbarClienteProps {
  plansAssigned: boolean;
}

const NavbarCliente: React.FC<NavbarClienteProps> = ({ plansAssigned }) => {
  const history = useHistory();
  const [value, setValue] = useState(0);

  const handleNavigation = (path: string, index: number) => {
    setValue(index);
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
          value={value}
          onChange={(event, newValue) => setValue(newValue)}
          sx={{ backgroundColor: 'transparent' }}
        >
          {plansAssigned ? (
            <>
              <BottomNavigationAction
                icon={<FitnessCenterIcon sx={{ fontSize: value === 0 ? 35 : 22 }} />}
                onClick={() => handleNavigation('/workout', 0)}
                sx={{
                  color: value === 0 ? '#FFFFFF' : '#6b6b6b',
                  backgroundColor: value === 0 ? '#c1c1c1' : 'transparent',
                  '&.Mui-selected': { color: '#FFFFFF' },
                }}
              />
              <BottomNavigationAction
                icon={<FoodBankIcon sx={{ fontSize: value === 1 ? 35 : 22 }} />}
                onClick={() => handleNavigation('/macronutrients', 1)}
                sx={{
                  color: value === 1 ? '#FFFFFF' : '#6b6b6b',
                  backgroundColor: value === 1 ? '#c1c1c1' : 'transparent',
                  '&.Mui-selected': { color: '#FFFFFF' },
                }}
              />
              <BottomNavigationAction
                icon={<TrendingUpIcon sx={{ fontSize: value === 2 ? 35 : 22 }} />}
                onClick={() => handleNavigation('/progress', 2)}
                sx={{
                  color: value === 2 ? '#FFFFFF' : '#6b6b6b',
                  backgroundColor: value === 2 ? '#c1c1c1' : 'transparent',
                  '&.Mui-selected': { color: '#FFFFFF' },
                }}
              />
              <BottomNavigationAction
                icon={<AccountCircleIcon sx={{ fontSize: value === 3 ? 35 : 22 }} />}
                onClick={() => handleNavigation('/profile', 3)}
                sx={{
                  color: value === 3 ? '#FFFFFF' : '#6b6b6b',
                  backgroundColor: value === 3 ? '#c1c1c1' : 'transparent',
                  '&.Mui-selected': { color: '#FFFFFF' },
                }}
              />
            </>
          ) : (
            <>
              <BottomNavigationAction
                icon={<AccountCircleIcon sx={{ fontSize: value === 0 ? 35 : 22 }} />}
                onClick={() => handleNavigation('/profile', 0)}
                sx={{
                  color: value === 0 ? '#FFFFFF' : '#6b6b6b',
                  backgroundColor: value === 0 ? '#c1c1c1' : 'transparent',
                  '&.Mui-selected': { color: '#FFFFFF' },
                }}
              />
              <BottomNavigationAction
                icon={<HourglassEmptyIcon sx={{ fontSize: value === 1 ? 35 : 22 }} />}
                onClick={() => handleNavigation('/pendingplans', 1)}
                sx={{
                  color: value === 1 ? '#FFFFFF' : '#6b6b6b',
                  backgroundColor: value === 1 ? '#c1c1c1' : 'transparent',
                  '&.Mui-selected': { color: '#FFFFFF' },
                }}
              />
            </>
          )}
        </BottomNavigation>
      </Paper>
    </AppBar>
  );
};

export default NavbarCliente;
