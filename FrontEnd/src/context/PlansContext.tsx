import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface PlansContextType {
  plansAssigned: boolean;
  setPlansAssigned: (assigned: boolean) => void;
  fetchPlansStatus: () => Promise<void>; // Nueva función para actualizar el estado desde el backend
}

const PlansContext = createContext<PlansContextType | undefined>(undefined);

interface PlansProviderProps {
  children: ReactNode;
}

export const PlansProvider: React.FC<PlansProviderProps> = ({ children }) => {
  const [plansAssigned, setPlansAssigned] = useState<boolean>(false);

  // Función para obtener el estado de los planes asignados desde el backend
  const fetchPlansStatus = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      return;
    }
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/user/status/', {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPlansAssigned(data.status); // Actualiza el estado según la respuesta
      } else {
        console.error('Failed to fetch plans status:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching plans status:', error);
    }
  };

  // Llamar a `fetchPlansStatus` cuando el componente se monte
  useEffect(() => {
    fetchPlansStatus();
  }, []);

  return (
    <PlansContext.Provider value={{ plansAssigned, setPlansAssigned, fetchPlansStatus }}>
      {children}
    </PlansContext.Provider>
  );
};

export const usePlansContext = () => {
  const context = useContext(PlansContext);
  if (!context) {
    throw new Error('usePlansContext must be used within a PlansProvider');
  }
  return context;
};
