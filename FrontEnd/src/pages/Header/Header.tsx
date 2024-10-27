import React from 'react';
import { IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonIcon } from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';

interface HeaderProps {
  title: string;  // El título que se pasará como parámetro
  showBackButton?: boolean;  // Indica si se debe mostrar el botón de retroceso
  onBack?: () => void;  // Función que se ejecuta al hacer clic en el botón de retroceso
}

const Header: React.FC<HeaderProps> = ({ title, onBack = () => {}, showBackButton = false }) => {
  return (
    <IonHeader>
      <IonToolbar
        style={{
          background: '#F5F5F5', // Fondo gris claro
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // Sombra ligera
          height: '56px', // Altura optimizada
          display: 'flex',
          alignItems: 'center', // Alinea los elementos verticalmente en el centro
        }}
      >
        {showBackButton && (
          <IonButtons slot="start" style={{ paddingLeft: '10px' }}>
            <IonButton onClick={onBack}>
              <IonIcon icon={arrowBackOutline} slot="icon-only" style={{color: '#32CD32'}}/>
            </IonButton>
          </IonButtons>
        )}
        
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
