// Single source of truth for app navigation.
// Consumed by Sidebar.jsx (desktop), MobileDrawer.jsx (phone menu) and BottomNav.jsx (phone tabs).
export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
  { to: '/appointments', label: 'Appointments', icon: 'calendar_month' },
  { to: '/patients', label: 'Patients', icon: 'groups' },
  { to: '/medicines', label: 'Medicines', icon: 'medication' },
  { to: '/prescriptions', label: 'Prescriptions', icon: 'description' },
  { to: '/rx', label: 'New Rx', icon: 'clinical_notes' },
  { to: '/bill', label: 'Bill', icon: 'receipt_long' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
  { to: '/plans', label: 'Plans', icon: 'monitor' },
];

// The five primary destinations that fit in the phone bottom bar.
export const BOTTOM_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: 'home' },
  { to: '/appointments', label: 'Appts', icon: 'calendar_month' },
  { to: '/rx', label: 'Rx', icon: 'clinical_notes' },
  { to: '/bill', label: 'Bill', icon: 'receipt_long' },
  { to: '/plans', label: 'Plans', icon: 'star' },
];
