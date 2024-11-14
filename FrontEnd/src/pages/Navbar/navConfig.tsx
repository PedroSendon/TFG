export type NavItem = {
  label: string;
  icon: string;
  path: string;
  condition?: 'plansAssigned' | '!plansAssigned';
};

export const navItems: Record<string, NavItem[]> = {
  administrador: [
    { label: 'workout_label', icon: 'AssignmentIcon', path: '/admin/workout' },
    { label: 'nutrition_label', icon: 'MenuBookIcon', path: '/admin/nutrition' },
    { label: 'all_users_label', icon: 'GroupIcon', path: '/admin/users' },
    { label: 'unassigned_users_label', icon: 'GroupAddIcon', path: '/admin/pending-users' }, // Nuevo ítem agregado
  ],
    cliente: [
      { label: 'workout_label', icon: 'FitnessCenterIcon', path: '/workout', condition: 'plansAssigned' },
      { label: 'macronutrients_label', icon: 'FoodBankIcon', path: '/macronutrients', condition: 'plansAssigned' },
      { label: 'progress_label', icon: 'TrendingUpIcon', path: '/progress', condition: 'plansAssigned' },
      { label: 'profile_label', icon: 'AccountCircleIcon', path: '/profile' },
      { label: 'pending_plans_label', icon: 'HourglassEmptyIcon', path: '/pendingplans', condition: '!plansAssigned' },
    ],
    entrenador: [
      { label: 'workouts_label', icon: 'FitnessCenterIcon', path: '/admin/workout' },
      { label: 'unassigned_users_label', icon: 'GroupAddIcon', path: '/admin/pending-users' },
      { label: 'all_users_label', icon: 'PeopleIcon', path: '/admin/users' },
    ],
    nutricionista: [
      { label: 'nutrition_label', icon: 'FoodBankIcon', path: '/admin/nutrition' },
      { label: 'unassigned_users_label', icon: 'GroupAddIcon', path: '/admin/pending-users' },
      { label: 'all_users_label', icon: 'PeopleIcon', path: '/admin/users' },
    ],
  };
