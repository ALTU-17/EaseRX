import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';

function ageFromDob(dob) {
  if (!dob) return '—';
  const d = new Date(dob);
  if (isNaN(d)) return dob;
  const diff = Date.now() - d.getTime();
  return `${Math.floor(diff / (365.25 * 24 * 3600 * 1000))} yrs`;
}

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [savedNote, setSavedNote] = useState('');

  useEffect(() => {
    Promise.all([api.getPatient(id), api.getPrescriptions(), api.getBills()])
      .then(([p, rx, bl]) => {
        setPatient(p);
        setForm({ name: p.name, dob: p.dob, phone: p.phone, gender: p.gender });
        // match prescriptions & bills by patient name (demo data model)
        setPrescriptions(rx.filter((r) => r.patient?.name === p.name));
        setBills(bl.filter((b) => b.patientName === p.name));
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error)
    return (
      <div className="space-y-4">
        <p className="text-sm text-error">{error}</p>
        <Link to="/patients" className="text-sm text-primary hover:underline">
          ← Back to Patients
        </Link>
      </div>
    );
  if (!patient) return <p className="text-on-surface-variant text-sm">Loading patient…</p>;

  const saveInfo = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updatePatient(id, form);
      setPatient(updated);
      setForm({ name: updated.name, dob: updated.dob, phone: updated.phone, gender: updated.gender });
      setEditing(false);
      setSavedNote('Patient info updated.');
      setTimeout(() => setSavedNote(''), 2500);
    } catch (err) {
      setError(err.message);
    }
  };

  const removePatient = async () => {
    if (!window.confirm(`Delete ${patient.name}? This cannot be undone.`)) return;
    try {
      await api.deletePatient(id);
      navigate('/patients');
    } catch (err) {
      setError(err.message);
    }
  };

  const totalBilled = bills.reduce((s, b) => s + (b.total || 0), 0);
  const outstanding = bills.filter((b) => b.status !== 'paid').reduce((s, b) => s + (b.total || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <Link to="/patients" className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Patients
      </Link>

      {/* Header card */}
      <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-primary-fixed text-primary flex items-center justify-center text-xl font-bold flex-shrink-0">
          {patient.name?.split(' ').map((w) => w[0]).slice(0, 2).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-headline-sm font-bold text-on-background">{patient.name}</h3>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {patient.id} · {patient.gender || '—'} · {ageFromDob(patient.dob)}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setEditing((s) => !s)}
            className="inline-flex items-center gap-1 text-sm font-medium border border-outline-variant text-on-background rounded-lg px-4 py-2.5 hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Info
          </button>
          <Link
            to="/rx"
            className="inline-flex items-center gap-1 text-sm font-medium bg-primary text-on-primary rounded-lg px-4 py-2.5 hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Rx
          </Link>
          <button
            onClick={removePatient}
            title="Delete patient"
            className="inline-flex items-center gap-1 text-sm font-medium border border-outline-variant text-error rounded-lg px-4 py-2.5 hover:bg-error-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            Delete
          </button>
        </div>
      </div>

      {savedNote && <p className="text-sm text-green-600">{savedNote}</p>}

      {editing && (
        <form onSubmit={saveInfo} className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-5 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary" />
          <input value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} placeholder="DOB (mm/dd/yyyy)" className="bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary" />
          <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary">
            <option value="">Gender</option>
            <option value="F">Female</option>
            <option value="M">Male</option>
            <option value="Other">Other</option>
          </select>
          <div className="sm:col-span-4 flex justify-end gap-3">
            <button type="button" onClick={() => setEditing(false)} className="text-sm text-on-surface-variant hover:underline">
              Cancel
            </button>
            <button type="submit" className="bg-primary text-on-primary text-sm font-bold rounded-lg px-5 py-2.5 hover:opacity-90">
              Save
            </button>
          </div>
        </form>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-4">
          <p className="text-label-md text-on-surface-variant">VISITS (RX)</p>
          <p className="text-2xl font-bold text-primary mt-1">{prescriptions.length}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-4">
          <p className="text-label-md text-on-surface-variant">TOTAL BILLED</p>
          <p className="text-2xl font-bold text-on-background mt-1">₹{totalBilled.toLocaleString()}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-4">
          <p className="text-label-md text-on-surface-variant">OUTSTANDING</p>
          <p className="text-2xl font-bold text-error mt-1">₹{outstanding.toLocaleString()}</p>
        </div>
      </div>

      {/* Demographics */}
      <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-6">
        <h4 className="text-title-lg font-bold text-on-background mb-4">Demographics</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-on-surface-variant text-xs">Date of Birth</p>
            <p className="font-bold text-on-background mt-0.5">{patient.dob || '—'}</p>
          </div>
          <div>
            <p className="text-on-surface-variant text-xs">Phone</p>
            <p className="font-bold text-on-background mt-0.5">{patient.phone || '—'}</p>
          </div>
          <div>
            <p className="text-on-surface-variant text-xs">Registered</p>
            <p className="font-bold text-on-background mt-0.5">{patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : '—'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prescriptions history */}
        <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant overflow-hidden">
          <div className="p-4 border-b border-surface-variant">
            <h4 className="text-title-lg font-bold text-on-background">Prescription History</h4>
          </div>
          {prescriptions.length === 0 ? (
            <p className="p-6 text-sm text-on-surface-variant text-center">No prescriptions for this patient yet.</p>
          ) : (
            <ul className="divide-y divide-surface-variant">
              {prescriptions.map((rx) => (
                <li key={rx.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-on-background">{rx.id}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {new Date(rx.date).toLocaleDateString()} · {rx.medicines?.length || 0} medicine(s)
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${rx.status === 'final' ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    {rx.status === 'final' ? 'Final' : 'Draft'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Billing history */}
        <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant overflow-hidden">
          <div className="p-4 border-b border-surface-variant">
            <h4 className="text-title-lg font-bold text-on-background">Billing History</h4>
          </div>
          {bills.length === 0 ? (
            <p className="p-6 text-sm text-on-surface-variant text-center">No bills for this patient yet.</p>
          ) : (
            <ul className="divide-y divide-surface-variant">
              {bills.map((b) => (
                <li key={b.id} className="p-4">
                  <Link to={`/bill/${b.id}`} className="flex items-center justify-between group">
                    <div>
                      <p className="text-sm font-bold text-on-background group-hover:text-primary">{b.id}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{new Date(b.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-on-background">₹{b.total}</p>
                      <p className={`text-xs font-bold ${b.status === 'paid' ? 'text-secondary' : 'text-error'}`}>{b.status === 'paid' ? 'Paid' : 'Unpaid'}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
