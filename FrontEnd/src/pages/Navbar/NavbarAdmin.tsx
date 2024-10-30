// NavbarAdmin.js
import React, { useState } from 'react';
import { AppBar, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import { useHistory } from 'react-router-dom';

const NavbarAdmin = () => {
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
          <BottomNavigationAction
            icon={<AssignmentIcon sx={{ fontSize: value === 0 ? 35 : 22 }} />}
            onClick={() => handleNavigation('/admin/workout', 0)}
            sx={{
              color: value === 0 ? '#FFFFFF' : '#6b6b6b',
              backgroundColor: value === 0 ? '#c1c1c1' : 'transparent',
              '&.Mui-selected': { color: '#FFFFFF' },
            }}
          />
          <BottomNavigationAction
            icon={<MenuBookIcon sx={{ fontSize: value === 1 ? 35 : 24 }} />}
            onClick={() => handleNavigation('/admin/nutrition', 1)}
            sx={{
              color: value === 1 ? '#FFFFFF' : '#6b6b6b',
              backgroundColor: value === 1 ? '#c1c1c1' : 'transparent',
              '&.Mui-selected': { color: '#FFFFFF' },
            }}
          />
          <BottomNavigationAction
            icon={<GroupIcon sx={{ fontSize: value === 3 ? 35 : 24 }} />}
            onClick={() => handleNavigation('/admin/users', 3)}
            sx={{
              color: value === 3 ? '#FFFFFF' : '#6b6b6b',
              backgroundColor: value === 3 ? '#c1c1c1' : 'transparent',
              '&.Mui-selected': { color: '#FFFFFF' },
            }}
          />
        </BottomNavigation>
      </Paper>
    </AppBar>
  );
};

export default NavbarAdmin;
