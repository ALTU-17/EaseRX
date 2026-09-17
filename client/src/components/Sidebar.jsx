import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'grid_view' },
  { to: '/patients', label: 'Patients', icon: 'groups' },
  { to: '/rx', label: 'Rx', icon: 'clinical_notes' },
  { to: '/bill', label: 'Bill', icon: 'receipt_long' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
  { to: '/plans', label: 'Plans', icon: 'monitor' },
];

export default function Sidebar({ onLogout }) {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-surface-container-lowest border-r border-surface-variant">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold">
         🦷
        </div>
        <div>
          <p className="font-bold text-on-background leading-tight">EaseRX</p>
          <p className="text-xs text-on-surface-variant">Professional</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 space-y-4">
        <div className="rounded-lg bg-secondary-fixed p-4">
          <p className="text-sm font-bold text-on-secondary-fixed">Basic Plan Active</p>
          <p className="text-xs text-on-secondary-fixed-variant mt-1">
            Upgrade for unlimited e-prescriptions.
          </p>
          <NavLink
            to="/plans"
            className="mt-3 block text-center text-xs font-bold bg-secondary text-on-secondary rounded-md py-2 hover:opacity-90 transition-opacity"
          >
            Upgrade Now
          </NavLink>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-error transition-colors px-1"
        >
          <span className="material-symbols-outlined text-[20px]">exit_to_app</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
