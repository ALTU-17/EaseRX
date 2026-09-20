import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';

const STATUS_STYLE = {
  pending: 'bg-surface-container-high text-on-surface-variant',
  confirmed: 'bg-primary-fixed text-primary',
  completed: 'bg-secondary-fixed text-on-secondary-fixed-variant',
  cancelled: 'bg-error-container text-on-error-container',
};

function formatApptDay(dateStr) {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function Appointments() {
  const [appointments, setAppointments] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('upcoming');
  const [rescheduling, setRescheduling] = useState(null);
  const [rsForm, setRsForm] = useState({ date: '', time: '' });
  const [busyId, setBusyId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', phone: '', gender: '', date: '', time: '', complaint: '' });

  const load = () => api.getAppointments().then(setAppointments).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!appointments) return [];
    if (filter === 'upcoming') {
      const today = new Date().toISOString().slice(0, 10);
      return appointments.filter(
        (a) => a.date >= today && a.status !== 'cancelled' && a.status !== 'completed'
      );
    }
    return appointments.filter((a) => a.status === filter);
  }, [appointments, filter]);

  const setStatus = async (appt, status) => {
    setBusyId(appt.id);
    setError('');
    try {
      // Real API PUT replaces the whole appointment, so send the full object back.
      const updated = await api.updateAppointment(appt.id, { ...appt, status });
      setAppointments((list) => list.map((a) => (a.id === appt.id ? updated : a)));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const cancelAppt = async (appt) => {
    if (!window.confirm(`Cancel ${appt.name}'s appointment?`)) return;
    setBusyId(appt.id);
    setError('');
    try {
      const updated = await api.cancelAppointment(appt.id);
      setAppointments((list) => list.map((a) => (a.id === appt.id ? { ...appt, ...updated, status: 'cancelled' } : a)));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!newForm.name.trim() || !newForm.date || !newForm.time) {
      setError('Patient name, date and time are required.');
      return;
    }
    try {
      const created = await api.addAppointment(newForm);
      setAppointments((list) => [...list, created]);
      setCreating(false);
      setNewForm({ name: '', phone: '', gender: '', date: '', time: '', complaint: '' });
    } catch (e) {
      setError(e.message);
    }
  };

  const openReschedule = (a) => {
    setRescheduling(a);
    setRsForm({ date: a.date, time: a.time });
  };

  const submitReschedule = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const updated = await api.updateAppointment(rescheduling.id, { ...rescheduling, date: rsForm.date, time: rsForm.time });
      setAppointments((list) => list.map((a) => (a.id === rescheduling.id ? updated : a)));
      setRescheduling(null);
    } catch (e) {
      setError(e.message);
    }
  };

  if (error && !appointments) return <p className="text-error text-sm">{error}</p>;
  if (!appointments) return <p className="text-on-surface-variant text-sm">Loading appointments…</p>;

  return (
    <div className="space-y-5">
      {/* Filter chips + create */}
      <div className="flex flex-wrap items-center gap-2">
        {['upcoming', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${
              filter === f
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-lowest border border-surface-variant text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <button
          onClick={() => setCreating(true)}
          className="ml-auto inline-flex items-center gap-1 text-sm font-bold bg-primary text-on-primary rounded-lg px-4 py-2 hover:opacity-90"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Appointment
        </button>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      {/* List */}
      <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-10 text-sm text-on-surface-variant text-center">No {filter} appointments.</p>
        ) : (
          <ul className="divide-y divide-surface-variant">
            {filtered.map((a) => (
              <li key={a.id} className="p-4 flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex flex-col items-center justify-center bg-primary-fixed text-primary rounded-lg w-16 h-14 flex-shrink-0">
                  <span className="text-[10px] font-bold leading-none">{formatApptDay(a.date)}</span>
                  <span className="text-xs font-bold leading-tight mt-1">{a.time}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-on-background">
                    {a.name} <span className="text-on-surface-variant font-medium">· {a.phone}</span>
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1 flex-wrap">
                    <span className="material-symbols-outlined text-[14px]">assignment</span>
                    {a.complaint || 'General Checkup'}
                    <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[a.status] || STATUS_STYLE.pending}`}>
                      {a.status}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {a.status === 'pending' && (
                    <button
                      disabled={busyId === a.id}
                      onClick={() => setStatus(a, 'confirmed')}
                      className="text-xs font-bold bg-secondary text-on-secondary rounded-lg px-3 py-2 hover:opacity-90 disabled:opacity-50"
                    >
                      Confirm
                    </button>
                  )}
                  {a.status !== 'completed' && a.status !== 'cancelled' && (
                    <button
                      disabled={busyId === a.id}
                      onClick={() => setStatus(a, 'completed')}
                      className="text-xs font-bold border border-outline-variant text-on-background rounded-lg px-3 py-2 hover:bg-surface-container disabled:opacity-50"
                    >
                      Complete
                    </button>
                  )}
                  {a.status !== 'completed' && a.status !== 'cancelled' && (
                    <button
                      disabled={busyId === a.id}
                      onClick={() => openReschedule(a)}
                      className="text-xs font-bold border border-outline-variant text-on-background rounded-lg px-3 py-2 hover:bg-surface-container disabled:opacity-50"
                    >
                      Reschedule
                    </button>
                  )}
                  {a.status !== 'completed' && a.status !== 'cancelled' && (
                    <button
                      disabled={busyId === a.id}
                      onClick={() => cancelAppt(a)}
                      className="text-xs font-bold text-error border border-outline-variant rounded-lg px-3 py-2 hover:bg-error-container disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create appointment modal (doctor-side) */}
      {creating && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          onClick={() => setCreating(false)}
        >
          <form
            onSubmit={submitCreate}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest rounded-xl shadow-modal border border-surface-variant p-6 w-full max-w-md space-y-4"
          >
            <h4 className="text-title-lg font-bold text-on-background">New Appointment</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-sm text-on-surface-variant sm:col-span-2">
                Patient Name *
                <input
                  required
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm text-on-background outline-none focus:border-secondary"
                />
              </label>
              <label className="text-sm text-on-surface-variant">
                Phone
                <input
                  value={newForm.phone}
                  onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                  className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm text-on-background outline-none focus:border-secondary"
                />
              </label>
              <label className="text-sm text-on-surface-variant">
                Gender
                <select
                  value={newForm.gender}
                  onChange={(e) => setNewForm({ ...newForm, gender: e.target.value })}
                  className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm text-on-background outline-none focus:border-secondary"
                >
                  <option value="">Select</option>
                  <option value="F">Female</option>
                  <option value="M">Male</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="text-sm text-on-surface-variant">
                Date *
                <input
                  required
                  type="date"
                  value={newForm.date}
                  onChange={(e) => setNewForm({ ...newForm, date: e.target.value })}
                  className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm text-on-background outline-none focus:border-secondary"
                />
              </label>
              <label className="text-sm text-on-surface-variant">
                Time *
                <input
                  required
                  type="time"
                  value={newForm.time}
                  onChange={(e) => setNewForm({ ...newForm, time: e.target.value })}
                  className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm text-on-background outline-none focus:border-secondary"
                />
              </label>
              <label className="text-sm text-on-surface-variant sm:col-span-2">
                Reason / Complaint
                <input
                  value={newForm.complaint}
                  onChange={(e) => setNewForm({ ...newForm, complaint: e.target.value })}
                  className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm text-on-background outline-none focus:border-secondary"
                />
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setCreating(false)} className="text-sm text-on-surface-variant hover:underline">
                Cancel
              </button>
              <button type="submit" className="bg-primary text-on-primary text-sm font-bold rounded-lg px-5 py-2.5 hover:opacity-90">
                Create Appointment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reschedule modal */}
      {rescheduling && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          onClick={() => setRescheduling(null)}
        >
          <form
            onSubmit={submitReschedule}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest rounded-xl shadow-modal border border-surface-variant p-6 w-full max-w-sm space-y-4"
          >
            <h4 className="text-title-lg font-bold text-on-background">
              Reschedule — {rescheduling.name}
            </h4>
            <label className="block text-sm text-on-surface-variant">
              Date
              <input
                type="date"
                value={rsForm.date}
                onChange={(e) => setRsForm({ ...rsForm, date: e.target.value })}
                className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm text-on-background outline-none focus:border-secondary"
              />
            </label>
            <label className="block text-sm text-on-surface-variant">
              Time
              <input
                type="time"
                value={rsForm.time}
                onChange={(e) => setRsForm({ ...rsForm, time: e.target.value })}
                className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm text-on-background outline-none focus:border-secondary"
              />
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setRescheduling(null)} className="text-sm text-on-surface-variant hover:underline">
                Cancel
              </button>
              <button type="submit" className="bg-primary text-on-primary text-sm font-bold rounded-lg px-5 py-2.5 hover:opacity-90">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
