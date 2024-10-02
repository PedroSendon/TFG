import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import Workout from '../Users/Workout/WorkoutOverview';

import './Tab1.css';

const Tab1: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
        <Workout/>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
