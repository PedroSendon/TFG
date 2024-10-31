// Navbar.js
import React, { useEffect, useState } from 'react';
import NavbarAdmin from './NavbarAdmin';
import NavbarCliente from './NavbarCliente';
import NavbarTrainerNutritionist from './NavbarTrainerNutritionist';
import { useHistory } from 'react-router-dom';

const Navbar = () => {
  const [userRole, setUserRole] = useState(null);
  const [plansAssigned, setPlansAssigned] = useState(false); // Determina si el plan está completamente asignado
  const history = useHistory();

  const fetchUserDetails = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      history.push('/login');
      return;
    }
    try {
      // Obtener el rol del usuario
      const roleResponse = await fetch('http://127.0.0.1:8000/api/user/role/', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const roleData = await roleResponse.json();
      const role = roleData.role;
      setUserRole(role);

      // Obtener el estado del usuario
      const statusResponse = await fetch('http://127.0.0.1:8000/api/user/status/', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const statusData = await statusResponse.json();

      // Verificar el estado del usuario
      if (statusData.status === 'assigned') {
        setPlansAssigned(true);
      } else {
        setPlansAssigned(false);
      }
    } catch (error) {
      console.error('Error fetching user role or status:', error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Redirigir a "pending plans" si no están ambos planes asignados
  if (!plansAssigned && userRole === 'cliente') {
    history.push('/pending-plans');
    return null;
  }

  // Renderizar la navbar en función del rol del usuario
  if (userRole === 'administrador') {
    return <NavbarAdmin />;
  } else if (userRole === 'cliente') {
    return <NavbarCliente plansAssigned={plansAssigned} />;
  } else if (userRole === 'nutricionista' || userRole === 'entrenador') {
    return <NavbarCliente plansAssigned={plansAssigned} />;
  } else {
    return null;
  }
};

export default Navbar;
