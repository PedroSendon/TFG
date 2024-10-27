import React, { useContext } from 'react';
import { Redirect, Route, useLocation } from 'react-router-dom';
import {
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
import { LanguageContext, LanguageProvider } from './context/LanguageContext'; // Importamos el contexto de idioma
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
import CreateTrainingPlan from './pages/Admin/Entrenos/AddTrainingPlan';
import ModifyTrainingPlan from './pages/Admin/Entrenos/ModifyTrainingPlan';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const { language, changeLanguage } = useContext(LanguageContext); // Usamos el contexto para cambiar idioma

  return (
    <LanguageProvider>
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/register" component={Register} />
          <Route exact path="/form" component={Form} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/" component={Home} />

          {/* Rutas workout */}
          <Route exact path="/workout" component={WorkoutOverview} />
          <Route exact path="/workout/day" component={WorkoutDay} />
          <Route exact path="/workout/day/exercise" component={Exercice} />


          {/* Rutas macros */}
          <Route exact path="/macronutrients" component={Macros} />

          {/* Rutas progress */}
          <Route exact path="/progress" component={Progress} />

          {/* Rutas perfil */}
          <Route exact path="/profile" component={Perfil} />
          <Route exact path="/profile/edit" component={Editar} />

          {/* Rutas Admin Users*/}
          <Route exact path="/admin/users" component={AdminUsers} />
          <Route exact path="/admin/users/modify" component={AdminModifyUsers} />
          <Route exact path="/admin/users/add" component={AdminAddUsers} />
          <Route exact path="/admin/users/assign" component={AssignPlans} />

          {/* Rutas Admin workouts*/}
          <Route exact path="/admin/workout" component={AdminWorkout} />
          <Route exact path="/admin/exercise/add" component={AdminAddExercise} />
          <Route exact path="/admin/exercise/modify" component={AdminModifyExercise} />
          <Route exact path="/admin/workout/add" component={AdminAddWorkout} />
          <Route exact path="/admin/workout/modify" component={AdminModifyWorkout} />
          <Route exact path="/admin/trainingplan/add" component={CreateTrainingPlan} />
          <Route exact path="/admin/trainingplan/modify" component={ModifyTrainingPlan} />

          {/* Rutas Admin estadisticas*/}
          <Route exact path="/admin/statistics" component={AdminStatistics} />

          {/* Rutas Admin macros*/}
          <Route exact path="/admin/nutrition" component={AdminMacronutrient} />
          <Route exact path="/admin/nutrition/add" component={AdminMacronutrientAdd} />
          <Route exact path="/admin/nutrition/modify" component={AdminMacronutrientModify} />

          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/tab1" component={Tab1} />
              <Route exact path="/tab2" component={Tab2} />
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
        <NavbarWrapper />

      </IonReactRouter>
    </IonApp>
    </LanguageProvider>
  );
};

const NavbarWrapper: React.FC = () => {
  const location = useLocation();  // Ahora se ejecuta dentro del IonReactRouter context

  // Definir rutas sin navbar
  const noNavbarRoutes = ['/login', '/register', '/'];
  const showNavbar = !noNavbarRoutes.includes(location.pathname);

  return showNavbar ? <Navbar /> : null;  // Mostrar o esconder la navbar
};

export default App;
