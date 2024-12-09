import React, { useContext } from 'react';
import { Redirect, Route, BrowserRouter as Router, Switch, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material';
import { LanguageContext, LanguageProvider } from './context/LanguageContext';
import { PlansProvider } from './context/PlansContext';
import Register from './pages/Register/Register';
import Login from './pages/LogIn/LogIn';
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
import PendingPlans from './pages/Users/Loading/PendingPlans';
import PendingUsers from './pages/Admin/Pending/PendingUsers';
import UserDetails from './pages/Admin/Pending/UserInformation';
import MealPlanDetails from './pages/Admin/Nutricion/MealPlanDetails';
import WorkoutDetails from './pages/Admin/Entrenos/WorkoutDetails';
import TrainingPlanDetails from './pages/Admin/Entrenos/TrainingPlanDetails';
import ExerciseDetails from './pages/Admin/Entrenos/ExerciseDetails';
import Introduction from './pages/Users/Form/Introduction';
import PersonalData from './pages/Users/Form/PersonalData';
import FormComplete from './pages/Users/Form/FormComplete';
import Goals from './pages/Users/Form/Goals';
import PhysicalActivity from './pages/Users/Form/PhysicalActivity';
import DietAndNutrition from './pages/Users/Form/DietAndNutrition';

/* MUI icons */
import TriangleIcon from '@mui/icons-material/ChangeHistory';  // Replace with icons that resemble Ionic icons
import CircleIcon from '@mui/icons-material/PanoramaFishEye';

const App: React.FC = () => {
  const { language, changeLanguage } = useContext(LanguageContext);  // Use context for language

  return (
    <PlansProvider>

    <LanguageProvider>
      <Router>
        <Switch>
          <Route exact path="/register" component={Register} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/" component={Home} />

          {/* Form Routes */}
          <Route exact path="/form/introduction" component={Introduction} />
          <Route exact path="/form/personaldata" component={PersonalData} />
          <Route exact path="/form/goals" component={Goals} />
          <Route exact path="/form/physicalactivity" component={PhysicalActivity} />
          <Route exact path="/form/dietandnutrition" component={DietAndNutrition} />
          <Route exact path="/form/summary" component={FormComplete} />

          {/* Workout Routes */}
          <Route exact path="/workout" component={WorkoutOverview} />
          <Route exact path="/workout/day" component={WorkoutDay} />
          <Route exact path="/workout/day/exercise" component={Exercice} />

          {/* Macros Route */}
          <Route exact path="/macronutrients" component={Macros} />

          {/* Macros Route */}
          <Route exact path="/pendingplans" component={PendingPlans} />

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
          <Route exact path="/admin/pending-users" component={PendingUsers} />
          <Route exact path="/admin/users/details" component={UserDetails} />

          {/* Admin Workout Routes */}
          <Route exact path="/admin/workout" component={AdminWorkout} />
          <Route exact path="/admin/workout/details" component={WorkoutDetails} />
          <Route exact path="/admin/workouts/add" component={AdminAddWorkout} />
          <Route exact path="/admin/workouts/modify" component={AdminModifyWorkout} />

          <Route exact path="/admin/exercises/add" component={AdminAddExercise} />
          <Route exact path="/admin/exercises/modify" component={AdminModifyExercise} />
          <Route exact path="/admin/exercises/details" component={ExerciseDetails} />

          {/* Admin Training Plan Routes */}

          <Route exact path="/admin/trainingplans/add" component={CreateTrainingPlan} />
          <Route exact path="/admin/trainingplans/modify" component={ModifyTrainingPlan} />
          <Route exact path="/admin/trainingplans/details" component={TrainingPlanDetails} />

          {/* Admin Statistics Route */}
          <Route exact path="/admin/statistics" component={AdminStatistics} />

          {/* Admin Macros Routes */}
          <Route exact path="/admin/nutrition" component={AdminMacronutrient} />
          <Route exact path="/admin/nutrition/add" component={AdminMacronutrientAdd} />
          <Route exact path="/admin/nutrition/modify" component={AdminMacronutrientModify} />
          <Route exact path="/admin/nutrition/mealplan" component={MealPlanDetails} />
        </Switch>

        {/* Conditional Navbar Wrapper */}
        <NavbarWrapper />

      </Router>
    </LanguageProvider>
    </PlansProvider>
  );
};

// Component for Navbar Display Control
const NavbarWrapper: React.FC = () => {
  const location = useLocation();
  const noNavbarRoutes = ['/login', '/register', '/', '/form'];
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
