import React from 'react';
import { NavLink } from 'react-router-dom';
import { BOTTOM_ITEMS } from '../navItems.js';

export default function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 left-0 w-full z-50 flex items-stretch px-1 pt-1 bg-surface-container-lowest shadow-modal border-t border-surface-variant rounded-t-xl pb-safe-bottom"
    >
      {BOTTOM_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-2 rounded-lg transition-colors ${
              isActive ? 'text-primary font-bold' : 'text-on-surface-variant'
            }`
          }
        >
          <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
          <span className="text-label-sm truncate max-w-full">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
