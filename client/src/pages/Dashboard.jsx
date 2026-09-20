import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import StatCard from '../components/StatCard.jsx';
import ShareBookingLink from '../components/ShareBookingLink.jsx';

const ACTIVITY_ICON = {
  prescription: { icon: 'description', bg: 'bg-primary-fixed', color: 'text-primary' },
  patient: { icon: 'person_add', bg: 'bg-secondary-fixed', color: 'text-secondary' },
  alert: { icon: 'warning', bg: 'bg-error-container', color: 'text-on-error-container' },
};

function formatApptDay(dateStr) {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [showAllAppts, setShowAllAppts] = useState(false);

  useEffect(() => {
    api.getDashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-error text-sm">{error}</p>;
  if (!data) return <p className="text-on-surface-variant text-sm">Loading dashboard…</p>;

  const { stats, revenueTrend, recentActivity, newPatients, upcomingAppointments } = data;
  const maxRevenue = Math.max(...revenueTrend.map((r) => r.value));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="PATIENTS" value={stats.patients.toLocaleString()} icon="groups" trend="+12% this month" />
        <StatCard label="PRESCRIPTIONS" value={stats.prescriptions.toLocaleString()} icon="description" trend="+5% this month" iconBg="bg-secondary-fixed" iconColor="text-secondary" />
        <StatCard label="RECEIPTS" value={stats.receipts.toLocaleString()} icon="receipt_long" trend="-2% this month" trendDir="down" iconBg="bg-error-container" iconColor="text-on-error-container" />
        <StatCard label="REVENUE" value={`₹${stats.revenue.toLocaleString()}`} icon="payments" trend="+18% this month" iconBg="bg-secondary-fixed" iconColor="text-secondary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant overflow-hidden">
            <div className="p-4 border-b border-surface-variant flex justify-between items-center">
              <h3 className="text-title-lg font-bold text-on-background">Recent Activity</h3>
              <button className="text-sm text-primary font-medium hover:underline">View All</button>
            </div>
            <ul className="divide-y divide-surface-variant">
              {recentActivity.map((a) => {
                const cfg = ACTIVITY_ICON[a.type] || ACTIVITY_ICON.patient;
                return (
                  <li key={a.id} className="p-4 flex gap-3">
                    <div className={`w-8 h-8 rounded-full ${cfg.bg} ${cfg.color} flex-shrink-0 flex items-center justify-center mt-1`}>
                      <span className="material-symbols-outlined text-[16px]">{cfg.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm text-on-background font-medium">{a.text}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{a.meta}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <ShareBookingLink />

          <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant overflow-hidden">
            <div className="p-4 border-b border-surface-variant flex justify-between items-center">
              <h3 className="text-title-lg font-bold text-on-background">New Patients</h3>
              <button className="text-sm text-primary font-medium hover:underline">Manage</button>
            </div>
            <div className="p-4 space-y-4">
              {newPatients.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-on-background">{p.name}</p>
                    <p className="text-xs text-on-surface-variant">DOB: {p.dob}</p>
                  </div>
                  <span className="material-symbols-outlined text-primary">chevron_right</span>
                </div>
              ))}
            </div>
          </div>

          
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-5 cursor-pointer hover:border-secondary transition-colors" onClick={() => navigate('/prescriptions')}>
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-primary">description</span>
              </div>
              <h4 className="font-bold text-on-background">Draft Prescriptions</h4>
              <p className="text-3xl font-bold text-primary mt-2">{stats.draftPrescriptions}</p>
              <p className="text-xs text-on-surface-variant mt-1">Awaiting your approval</p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-5 cursor-pointer hover:border-secondary transition-colors" onClick={() => navigate('/appointments')}>
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-primary">event</span>
              </div>
              <h4 className="font-bold text-on-background">Today's Appointments</h4>
              <p className="text-3xl font-bold text-primary mt-2">{stats.todaysAppointments}</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Next: {upcomingAppointments?.[0]?.time || '—'}
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant overflow-hidden">
            <div className="p-4 border-b border-surface-variant flex justify-between items-center">
              <div>
                <h3 className="text-title-lg font-bold text-on-background">Upcoming Patients</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">{showAllAppts ? `Showing all ${upcomingAppointments?.length || 0} appointments — click icon to collapse` : 'Next appointments from your booking page'}</p>
              </div>
              <button onClick={() => setShowAllAppts((s) => !s)} title="View full upcoming list" className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-primary-fixed flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-primary">event_upcoming</span></button>
            </div>

            {(!upcomingAppointments || upcomingAppointments.length === 0) ? (
              <p className="p-6 text-sm text-on-surface-variant text-center">No upcoming appointments yet.</p>
            ) : (
              <ul className="divide-y divide-surface-variant">
                {(showAllAppts ? upcomingAppointments : (upcomingAppointments || []).slice(0, 3)).map((a) => (
                  <li key={a.id} className="p-4 flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center bg-primary-fixed text-primary rounded-lg w-16 h-14 flex-shrink-0">
                      <span className="text-[10px] font-bold leading-none">{formatApptDay(a.date)}</span>
                      <span className="text-xs font-bold leading-tight mt-1">{a.time}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-on-background truncate">{a.name}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">assignment</span>
                        {a.complaint || 'General Checkup'}
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-secondary-fixed text-on-secondary-fixed-variant px-2.5 py-1 rounded-full flex-shrink-0">
                      {a.gender || '—'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-title-lg font-bold text-on-background">Revenue Trend</h3>
                <p className="text-sm text-on-surface-variant">Monthly revenue overview</p>
              </div>
              <span className="text-sm bg-surface-container rounded-md px-3 py-1.5">This Year</span>
            </div>
            <div className="flex items-end justify-between gap-3 h-56 border-l border-b border-surface-variant pl-2 pb-6 relative">
              {revenueTrend.map((r, i) => (
                <div key={r.month} className="flex-1 flex flex-col items-center justify-end h-full">
                  <span className="text-xs text-on-surface-variant mb-1">₹{Math.round(r.value / 1000)}k</span>
                  <div
                    className={`w-full max-w-[36px] rounded-t-sm ${i % 2 === 0 ? 'bg-primary' : 'bg-secondary'}`}
                    style={{ height: `${(r.value / maxRevenue) * 100}%`, opacity: 0.5 + (i / revenueTrend.length) * 0.5 }}
                  />
                  <span className="text-xs text-on-surface-variant mt-2 absolute -bottom-0">{r.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}