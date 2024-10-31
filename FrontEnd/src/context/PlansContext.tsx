import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PlansContextType {
  plansAssigned: boolean;
  setPlansAssigned: (assigned: boolean) => void;
}

const PlansContext = createContext<PlansContextType | undefined>(undefined);

interface PlansProviderProps {
  children: ReactNode;
}

export const PlansProvider: React.FC<PlansProviderProps> = ({ children }) => {
  const [plansAssigned, setPlansAssigned] = useState<boolean>(true);

  return (
    <PlansContext.Provider value={{ plansAssigned, setPlansAssigned }}>
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
