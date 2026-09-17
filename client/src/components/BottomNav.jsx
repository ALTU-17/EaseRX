import React from 'react';
import { NavLink } from 'react-router-dom';

const ITEMS = [
  { to: '/dashboard', label: 'Home', icon: 'home' },
  { to: '/rx', label: 'Rx', icon: 'clinical_notes' },
  { to: '/bill', label: 'Bill', icon: 'receipt_long' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
  { to: '/plans', label: 'Plans', icon: 'star' },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 px-2 bg-surface-container-lowest shadow-modal border-t border-surface-variant rounded-t-xl">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-2 rounded-lg w-16 transition-colors ${
              isActive ? 'text-primary' : 'text-on-surface-variant'
            }`
          }
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="text-label-sm mt-1">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
