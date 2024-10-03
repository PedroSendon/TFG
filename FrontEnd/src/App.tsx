import React from 'react';
import { Redirect, Route } from 'react-router-dom';import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle } from 'ionicons/icons';


import Tab1 from './pages/Tab/Tab1';
import Tab2 from './pages/Tab/Tab2';
import Register from './pages/Register/Register';
import Login from './pages/LogIn/LogIn';
import Form from './pages/Users/Form/Form';
import Home from './pages/Inicio/Inicio';
import WorkoutOverview from './pages/Users/Workout/WorkoutOverview';
import WorkoutDay from './pages/Users/Workout/WorkoutDay';
import Exercice from './pages/Users/Workout/Exercice';
import Navbar from './pages/Navbar/Navbar';
import Macros from './pages/Users/Macronutrientes/Macros';
import Perfil from './pages/Users/Perfil/Perfil';
import Editar from './pages/Users/Perfil/EditPerfil';
import Progress from './pages/Users/Progress/Progress';
import AdminUsers from './pages/Admin/Usuario/Users';
import AdminModifyUsers from './pages/Admin/Usuario/ModifyUsers';
import AdminAddUsers from './pages/Admin/Usuario/AddUsers';
import AdminWorkout from './pages/Admin/Entrenos/Workout';
import AdminAddWorkout from './pages/Admin/Entrenos/AddWorkouts';
import AdminModifyWorkout from './pages/Admin/Entrenos/ModifyWorkouts';
import AdminAddExercise from './pages/Admin/Entrenos/AddExercises';
import AdminModifyExercise from './pages/Admin/Entrenos/ModifyExercises';
import AdminStatistics from './pages/Admin/Estadisticas/AdminStatistics';
import AdminMacronutrient from './pages/Admin/Nutricion/MacrosAdmin';
import AdminMacronutrientAdd from './pages/Admin/Nutricion/AddMacros';
import AdminMacronutrientModify from './pages/Admin/Nutricion/ModifyMacros';
import AssignPlans from './pages/Admin/Usuario/AssignPlans';


/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */

/* Theme variables */
import './theme/variables.css';

setupIonicReact();


const App: React.FC = () => {
  

  // Verificamos si la ruta actual es una de las que no necesita la navbar
  const noNavbarRoutes = ['/login', '/register', '/', '/form'];
  const showNavbar = !noNavbarRoutes.includes(window.location.pathname);

  return (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/register" component={Register}/>
        <Route exact path="/form" component={Form} />
        <Route exact path="/login" component={Login}/>
        <Route exact path="/" component={Home}/>

        {/* Rutas workout */}
        <Route exact path="/workout" component={WorkoutOverview}/>
        <Route exact path="/workout/day" component={WorkoutDay}/>
        <Route exact path="/workout/day/exercise" component={Exercice}/>

        {/* Rutas macros */}
        <Route exact path="/macronutrients" component={Macros}/>

        {/* Rutas progress */}
        <Route exact path="/progress" component={Progress}/>
        
        {/* Rutas perfil */}
        <Route exact path="/profile" component={Perfil}/>
        <Route exact path="/profile/edit" component={Editar}/>

        {/* Rutas Admin Users*/}
        <Route exact path="/admin/users" component={AdminUsers}/>
        <Route exact path="/admin/users/modify" component={AdminModifyUsers}/>
        <Route exact path="/admin/users/add" component={AdminAddUsers}/>
        <Route path="/admin/users/assign" component={AssignPlans} />


        {/* Rutas Admin workouts*/}
        <Route exact path="/admin/workout" component={AdminWorkout}/>
        <Route exact path="/admin/exercise/add" component={AdminAddExercise}/>
        <Route exact path="/admin/exercise/modify" component={AdminModifyExercise}/>
        <Route exact path="/admin/workout/add" component={AdminAddWorkout}/>
        <Route exact path="/admin/workout/modify" component={AdminModifyWorkout}/>

        {/* Rutas Admin estadisticas*/}
        <Route exact path="/admin/statistics" component={AdminStatistics}/>

        {/* Rutas Admin macros*/}
        <Route exact path="/admin/nutrition" component={AdminMacronutrient}/>
        <Route exact path="/admin/nutrition/add" component={AdminMacronutrientAdd}/>
        <Route exact path="/admin/nutrition/modify" component={AdminMacronutrientModify}/>
        
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/tab1" component={Tab1}/>
            <Route exact path="/tab2" component={Tab2}/>

          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="tab1" href="/tab1">
              <IonIcon aria-hidden="true" icon={triangle} />
            </IonTabButton>
            <IonTabButton tab="tab2" href="/tab2">
              <IonIcon aria-hidden="true" icon={ellipse} />
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonRouterOutlet>

      {/* Mostrar la navbar si no estamos en login, registro o inicio */}
      {showNavbar && <Navbar />}

    </IonReactRouter>

  </IonApp>
  );
};

export default App;
