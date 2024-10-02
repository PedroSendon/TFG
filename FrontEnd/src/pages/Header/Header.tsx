import React from 'react';
import { IonHeader, IonToolbar, IonTitle, IonButton, IonIcon } from '@ionic/react';

interface HeaderProps {
  title: string;  // El título que se pasará como parámetro
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <IonHeader>
      <IonToolbar
        style={{
          background: '#F5F5F5', // Fondo gris claro
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // Sombra ligera
          height: '56px', // Altura optimizada
          display: 'flex',
          justifyContent: 'space-between', // Espacio entre los elementos
          alignItems: 'center', // Alinea los elementos verticalmente en el centro
        }}
      >
        <IonTitle
          style={{
            flexGrow: 1, // El título ocupará el espacio restante
            textAlign: 'center',
            color: '#32CD32', // Verde lima para el título
            fontWeight: 'bold',
            fontSize: '1.1em', // Tamaño de fuente optimizado
            overflow: 'hidden', // Evita que el título se desborde
            textOverflow: 'ellipsis', // Añade puntos suspensivos si es necesario
            whiteSpace: 'nowrap', // Evita saltos de línea en el título
          }}
        >
          {title}  {/* Mostramos el título que se pasa como prop */}
        </IonTitle>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
