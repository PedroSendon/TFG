// Navbar.js
import React, { useEffect, useState } from 'react';
import NavbarAdmin from './NavbarAdmin';
import NavbarCliente from './NavbarCliente';
import NavbarTrainerNutritionist from './NavbarTrainerNutritionist';
import { useHistory } from 'react-router-dom';

const Navbar = () => {
  const [userRole, setUserRole] = useState(null);
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

    } catch (error) {
      console.error('Error fetching user role or status:', error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Renderizar la navbar en función del rol del usuario
  if (userRole === 'administrador') {
    return <NavbarAdmin />;
  } else if (userRole === 'cliente') {
    return <NavbarCliente />;
  } else if (userRole === 'nutricionista' || userRole === 'entrenador') {
    return <NavbarTrainerNutritionist />;
  } else {
    return null;
  }
};

export default Navbar;
