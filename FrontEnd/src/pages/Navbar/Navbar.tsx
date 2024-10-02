import React, { useState, useEffect } from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';  // Workout icon
import FastfoodIcon from '@mui/icons-material/Fastfood';  // Macros icon
import TrendingUpIcon from '@mui/icons-material/TrendingUp';  // Progress icon
import AccountCircleIcon from '@mui/icons-material/AccountCircle';  // Perfil icon
import GroupIcon from '@mui/icons-material/Group';  // Usuarios (para administrador)
import BarChartIcon from '@mui/icons-material/BarChart';  // Estadísticas (para administrador)
import { useHistory, useLocation } from 'react-router-dom';  // Para manejar la navegación y obtener la ruta actual

const Navbar: React.FC = () => {
    const history = useHistory();  
    const location = useLocation();  // Obtener la ubicación/ruta actual

    // Simulación del tipo de usuario (puedes modificar este valor según el estado real)
    const isAdmin = true;  // Cambia este valor para simular cliente o administrador

    // Inicializamos el estado basado en la ruta actual
    const [value, setValue] = useState(0);

    // Efecto que se ejecuta al cargar la página o cuando cambia la ruta
    useEffect(() => {
        switch (location.pathname) {
            case isAdmin ? '/admin/workout' : '/workout':
                setValue(0);
                break;
            case isAdmin ? '/admin/nutrition' : '/macronutrients':
                setValue(1);
                break;
            case isAdmin ? '/admin/statistics' : '/progress':
                setValue(2);
                break;
            case isAdmin ? '/admin/users' : '/profile':
                setValue(3);
                break;
            default:
                setValue(0);  // Valor por defecto si ninguna ruta coincide
                break;
        }
    }, [location.pathname, isAdmin]);  // Vuelve a ejecutar si la ruta cambia o si cambia el tipo de usuario

    // Función para manejar el cambio de la selección en la navbar
    const handleNavigation = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        
        // Redirigir a la página adecuada según el valor seleccionado y tipo de usuario
        if (isAdmin) {
            switch(newValue) {
                case 0:
                    history.push('/admin/workout');
                    break;
                case 1:
                    history.push('/admin/nutrition');
                    break;
                case 2:
                    history.push('/admin/statistics');
                    break;
                case 3:
                    history.push('/admin/users');
                    break;
                default:
                    break;
            }
        } else {
            switch(newValue) {
                case 0:
                    history.push('/workout');
                    break;
                case 1:
                    history.push('/macronutrients');
                    break;
                case 2:
                    history.push('/progress');
                    break;
                case 3:
                    history.push('/profile');
                    break;
                default:
                    break;
            }
        }
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
                '& .Mui-selected': {
                    color: '#32CD32',  // Color verde lima para el elemento seleccionado
                },
            }}
        >
            <BottomNavigationAction
                label="Workout"
                icon={<FitnessCenterIcon />}
                sx={{
                    color: value === 0 ? '#32CD32' : '#6b6b6b',
                    '&.Mui-selected': {
                        color: '#32CD32',
                    }
                }}
            />
            <BottomNavigationAction
                label={isAdmin ? "Nutrition" : "Macros"}
                icon={<FastfoodIcon />}
                sx={{
                    color: value === 1 ? '#32CD32' : '#6b6b6b',
                    '&.Mui-selected': {
                        color: '#32CD32',
                    }
                }}
            />
            <BottomNavigationAction
                label={isAdmin ? "Statistics" : "Progress"}
                icon={isAdmin ? <BarChartIcon /> : <TrendingUpIcon />}
                sx={{
                    color: value === 2 ? '#32CD32' : '#6b6b6b',
                    '&.Mui-selected': {
                        color: '#32CD32',
                    }
                }}
            />
            <BottomNavigationAction
                label={isAdmin ? "Users" : "Profile"}
                icon={isAdmin ? <GroupIcon /> : <AccountCircleIcon />}
                sx={{
                    color: value === 3 ? '#32CD32' : '#6b6b6b',
                    '&.Mui-selected': {
                        color: '#32CD32',
                    }
                }}
            />
        </BottomNavigation>
    );
};

export default Navbar;
