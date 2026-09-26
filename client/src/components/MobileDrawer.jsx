import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../navItems.js';

/**
 * Phone-only slide-in navigation.
 * The desktop sidebar is hidden below `md`, so this is the only way to reach
 * Patients / Medicines / Prescriptions / Settings on a small screen.
 */
export default function MobileDrawer({ open, onClose, onLogout }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    // Lock background scrolling while the panel is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Main navigation">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <aside
        ref={panelRef}
        tabIndex={-1}
        className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-surface-container-lowest border-r border-surface-variant shadow-modal flex flex-col outline-none"
      >
        <div className="flex items-center gap-3 px-4 py-4 border-b border-surface-variant pt-safe-top">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold flex-shrink-0">
            🦷
          </div>
          <div className="min-w-0">
            <p className="font-bold text-on-background leading-tight">EaseRX</p>
            <p className="text-xs text-on-surface-variant">Professional</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="ml-auto w-10 h-10 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container active:bg-surface-container-high flex-shrink-0"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container active:bg-surface-container-high'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-surface-variant pb-safe-bottom">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 w-full text-sm font-medium text-on-surface-variant hover:text-error transition-colors px-1 py-2"
          >
            <span className="material-symbols-outlined text-[20px]">exit_to_app</span>
            Logout
          </button>
        </div>
      </aside>
    </div>
  );
}
