import React, { useContext } from 'react';
import { Redirect, Route, BrowserRouter as Router, Switch, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material';
import { LanguageContext, LanguageProvider } from './context/LanguageContext';
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

/* MUI icons */
import TriangleIcon from '@mui/icons-material/ChangeHistory';  // Replace with icons that resemble Ionic icons
import CircleIcon from '@mui/icons-material/PanoramaFishEye';

const App: React.FC = () => {
  const { language, changeLanguage } = useContext(LanguageContext);  // Use context for language

  return (
    <LanguageProvider>
      <Router>
        <Switch>
          <Route exact path="/register" component={Register} />
          <Route exact path="/form" component={Form} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/" component={Home} />

          {/* Workout Routes */}
          <Route exact path="/workout" component={WorkoutOverview} />
          <Route exact path="/workout/day" component={WorkoutDay} />
          <Route exact path="/workout/day/exercise" component={Exercice} />

          {/* Macros Route */}
          <Route exact path="/macronutrients" component={Macros} />

          {/* Progress Route */}
          <Route exact path="/progress" component={Progress} />

          {/* Profile Routes */}
          <Route exact path="/profile" component={Perfil} key={Date.now()} />
          <Route exact path="/profile/edit" component={Editar} />

          {/* Admin User Routes */}
          <Route exact path="/admin/users" component={AdminUsers} />
          <Route exact path="/admin/users/modify" component={AdminModifyUsers} />
          <Route exact path="/admin/users/add" component={AdminAddUsers} />
          <Route exact path="/admin/users/assign" component={AssignPlans} />

          {/* Admin Workout Routes */}
          <Route exact path="/admin/workout" component={AdminWorkout} />
          <Route exact path="/admin/exercise/add" component={AdminAddExercise} />
          <Route exact path="/admin/exercise/modify" component={AdminModifyExercise} />
          <Route exact path="/admin/workout/add" component={AdminAddWorkout} />
          <Route exact path="/admin/workout/modify" component={AdminModifyWorkout} />
          <Route exact path="/admin/trainingplan/add" component={CreateTrainingPlan} />
          <Route exact path="/admin/trainingplan/modify" component={ModifyTrainingPlan} />

          {/* Admin Statistics Route */}
          <Route exact path="/admin/statistics" component={AdminStatistics} />

          {/* Admin Macros Routes */}
          <Route exact path="/admin/nutrition" component={AdminMacronutrient} />
          <Route exact path="/admin/nutrition/add" component={AdminMacronutrientAdd} />
          <Route exact path="/admin/nutrition/modify" component={AdminMacronutrientModify} />

          {/* Bottom Tabs Navigation */}
          <Route path="/tab1" component={Tab1} />
          <Route path="/tab2" component={Tab2} />
        </Switch>

        {/* Conditional Navbar Wrapper */}
        <NavbarWrapper />

        {/* Bottom Navigation for Tabs */}
        <BottomTabs />
      </Router>
    </LanguageProvider>
  );
};

// Component for Navbar Display Control
const NavbarWrapper: React.FC = () => {
  const location = useLocation();
  const noNavbarRoutes = ['/login', '/register', '/'];
  const showNavbar = !noNavbarRoutes.includes(location.pathname);

  return showNavbar ? <Navbar /> : null;
};

// Bottom Navigation Tabs Component
const BottomTabs: React.FC = () => {
  const [value, setValue] = React.useState('/tab1');

  return (
    <Box sx={{ width: '100%', position: 'fixed', bottom: 0 }}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        <BottomNavigationAction
          label="Tab 1"
          icon={<TriangleIcon />}
          value="/tab1"
          href="/tab1"
        />
        <BottomNavigationAction
          label="Tab 2"
          icon={<CircleIcon />}
          value="/tab2"
          href="/tab2"
        />
      </BottomNavigation>
    </Box>
  );
};

export default App;
