import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import Inicio from '../Inicio/Inicio';
import './Tab2.css';

const Tab2: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
        
        <Inicio/>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
