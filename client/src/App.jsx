import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Home from './pages/Home.jsx';
import BookAppointment from './pages/BookAppointment.jsx';
import Auth from './pages/Auth.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Patients from './pages/Patients.jsx';
import Rx from './pages/Rx.jsx';
import Bill from './pages/Bill.jsx';
import Settings from './pages/Settings.jsx';
import Plans from './pages/Plans.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('easerx_user');
    if (stored) setUser(JSON.parse(stored));
    setChecked(true);
  }, []);

  const handleAuth = (userData, token) => {
    localStorage.setItem('easerx_token', token);
    localStorage.setItem('easerx_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('easerx_token');
    localStorage.removeItem('easerx_user');
    setUser(null);
  };

  if (!checked) return null;

  // Blocks any /dashboard, /patients, /rx... route until someone is logged in.
  const RequireAuth = () => {
    if (!user) return <Navigate to="/login" replace />;
    return <Layout user={user} onLogout={handleLogout} />;
  };

  return (
    <Routes>
      {/* Public marketing page — always visible, logged in or not */}
      <Route path="/" element={<Home />} />

      {/* Public patient self-booking page — shared via link or QR code, no login needed */}
      <Route path="/book" element={<BookAppointment />} />

      {/* Auth screen — if already logged in, bounce straight to the dashboard */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Auth onAuth={handleAuth} />}
      />

      {/* Everything below requires a logged-in user */}
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/rx" element={<Rx />} />
        <Route path="/bill" element={<Bill />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/plans" element={<Plans />} />
      </Route>

      {/* Unknown paths fall back to the homepage */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}