// Navbar.js
import React, { useEffect, useState } from 'react';
import NavbarAdmin from './NavbarAdmin';
import NavbarCliente from './NavbarCliente';
import NavbarTrainerNutritionist from './NavbarTrainerNutritionist';
import { useHistory } from 'react-router-dom';

const Navbar = () => {
  const [userRole, setUserRole] = useState(null);
  const [plansAssigned, setPlansAssigned] = useState(false); // Determina si ambos planes están asignados
  const history = useHistory();

  const fetchUserRole = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      history.push('/login');
      return;
    }
    try {
      // Obtener rol del usuario
      const roleResponse = await fetch('http://127.0.0.1:8000/api/user/role/', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const roleData = await roleResponse.json();
      const role = roleData.role;
      setUserRole(role);
      // Verificar si ambos planes están asignados
      const trainingPlanResponse = await fetch('http://127.0.0.1:8000/api/assigned-training-plan/', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      const mealPlanResponse = await fetch('http://127.0.0.1:8000/api/mealplans/', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      // Si ambos endpoints responden con 200, setear `plansAssigned` en `true`
      if (trainingPlanResponse.ok && mealPlanResponse.ok) {
        setPlansAssigned(true);
      }
    } catch (error) {
      console.error('Error fetching user role or plan assignment:', error);
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, []);

  // Renderizar la navbar en función del rol y el estado de los planes
  if (userRole === 'administrador') {
    return <NavbarAdmin/>;
  } else if (userRole === 'cliente') {
    return <NavbarCliente plansAssigned={plansAssigned} />;
  } else if (userRole === 'nutricionista' || userRole === 'entrenador') {
    return <NavbarTrainerNutritionist/>;
  } else {
    return null;
  }
};

export default Navbar;
