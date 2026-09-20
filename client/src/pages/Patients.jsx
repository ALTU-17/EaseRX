import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', dob: '', phone: '', gender: '' });
  const [error, setError] = useState('');

  const load = (q) => api.getPatients(q).then(setPatients).catch((e) => setError(e.message));

  useEffect(() => {
    load('');
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.addPatient(form);
      setForm({ name: '', dob: '', phone: '', gender: '' });
      setShowForm(false);
      load(query);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 bg-surface-container-lowest border border-surface-variant rounded-lg px-3 py-2.5 w-full sm:max-w-xs">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search patients…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-sm text-on-background placeholder:text-on-surface-variant"
          />
        </label>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center justify-center gap-1 text-sm font-medium bg-primary text-on-primary rounded-lg px-4 py-2.5 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add Patient
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-5 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary" />
          <input placeholder="DOB (mm/dd/yyyy)" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary" />
          <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary">
            <option value="">Gender</option>
            <option value="F">Female</option>
            <option value="M">Male</option>
            <option value="Other">Other</option>
          </select>
          <div className="sm:col-span-4 flex justify-end">
            <button type="submit" className="bg-primary text-on-primary text-sm font-bold rounded-lg px-5 py-2.5 hover:opacity-90">
              Save Patient
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-low text-on-surface-variant text-label-md">
            <tr>
              <th className="text-left px-5 py-3">Patient</th>
              <th className="text-left px-5 py-3 hidden sm:table-cell">DOB</th>
              <th className="text-left px-5 py-3 hidden md:table-cell">Phone</th>
              <th className="text-left px-5 py-3">Gender</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant">
            {patients.map((p) => (
              <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                <td className="px-5 py-3">
                  <p className="font-bold text-on-background">{p.name}</p>
                  <p className="text-xs text-on-surface-variant">{p.id}</p>
                </td>
                <td className="px-5 py-3 hidden sm:table-cell text-on-surface-variant">{p.dob}</td>
                <td className="px-5 py-3 hidden md:table-cell text-on-surface-variant">{p.phone}</td>
                <td className="px-5 py-3 text-on-surface-variant">{p.gender}</td>
                <td className="px-5 py-3 text-right cursor-pointer hover:opacity-70" onClick={() => navigate(`/patients/${p.id}`)} title="View patient profile">
                  <span className="material-symbols-outlined text-primary">chevron_right</span>
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-on-surface-variant">
                  No patients match "{query}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
