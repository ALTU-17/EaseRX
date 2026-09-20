import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import BottomNav from './BottomNav.jsx';
import { api } from '../api.js';

const TITLES = {
  '/dashboard': ['Dashboard & Analytics', "Welcome back — here's what's happening today."],
  '/appointments': ['Appointments', 'Confirm, complete, reschedule or cancel patient visits.'],
  '/patients': ['Patients', 'Search, add, and manage your patient records.'],
  '/medicines': ['Medicines', 'Build and maintain your medicine catalog.'],
  '/prescriptions': ['Prescriptions', 'Review drafts, approve final prescriptions, and print.'],
  '/rx': ['New Prescription & Bill', 'Create a prescription and generate the matching bill.'],
  '/bill': ['Billing', 'Invoices generated from your prescriptions.'],
  '/settings': ['Settings', 'Verify your credentials and configure your prescription PDF.'],
  '/plans': ['Choose Your Plan', 'Upgrade anytime to unlock advanced features.'],
};

export default function Layout({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [title, subtitle] = TITLES[location.pathname] || ['EaseRX', ''];

  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {});
  }, []);

  const clinicName = settings?.clinic?.name || 'EaseRX';
  const doctorName = settings ? `${settings.firstName} ${settings.lastName}`.trim() : '';

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onLogout={onLogout} />

      <div className="md:pl-64">
        <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-surface-variant">
          <div className="flex items-center justify-between px-4 md:px-8 h-16">
            <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-sm">
                🦷
              </div>
              <span className="font-bold text-on-background">{clinicName}</span>
            </div>

            <div className="hidden md:flex md:flex-col md:leading-tight">
              <h1 className="text-title-lg font-bold text-primary">{clinicName}</h1>
              {doctorName && (
                <p className="text-xs text-on-surface-variant font-medium">Hello, Dr. {doctorName}</p>
              )}
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => navigate('/rx')}
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium border border-outline-variant text-on-background rounded-lg px-3 py-2 hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Med
              </button>
              <button
                onClick={() => navigate('/rx')}
                className="inline-flex items-center gap-1 text-sm font-medium bg-primary text-on-primary rounded-lg px-3 py-2 hover:opacity-90 transition-opacity"
              >
                🦷 New Prescription
              </button>
              <button
                onClick={onLogout}
                className="md:hidden text-on-surface-variant"
                aria-label="Logout"
              >
                <span className="material-symbols-outlined">exit_to_app</span>
              </button>
              <img
                src={user?.avatar || 'https://i.pravatar.cc/100'}
                alt={user?.name || 'Doctor avatar'}
                className="w-9 h-9 rounded-full object-cover border border-surface-variant"
              />
            </div>
          </div>
        </header>

        <main className="px-4 md:px-8 py-6 pb-24 md:pb-10">
          <div className="mb-6">
            <h2 className="text-headline-sm md:text-headline-md font-bold text-on-background">{title}</h2>
            {subtitle && <p className="text-sm text-on-surface-variant mt-1">{subtitle}</p>}
          </div>
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}