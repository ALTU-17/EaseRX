import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const empty = {
  name: '',
  genericName: '',
  form: '',
  strength: '',
  defaultSig: '',
  defaultDispenseQty: '',
  defaultRefills: 0,
};

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...empty });
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = (q) => api.getMedicines(q).then(setMedicines).catch((e) => setError(e.message));

  useEffect(() => {
    load('');
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const startAdd = () => {
    setEditingId(null);
    setForm({ ...empty });
    setShowForm(true);
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setForm({ ...empty, ...m });
    setShowForm(true);
  };

  const cancel = () => {
    setEditingId(null);
    setForm({ ...empty });
    setShowForm(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Medicine name is required.');
      return;
    }
    setBusy(true);
    try {
      if (editingId) await api.updateMedicine(editingId, form);
      else await api.addMedicine(form);
      cancel();
      load(query);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (m) => {
    if (!window.confirm(`Delete ${m.name}? This cannot be undone.`)) return;
    setError('');
    try {
      await api.deleteMedicine(m.id);
      setMedicines((list) => list.filter((x) => x.id !== m.id));
    } catch (err) {
      setError(err.message);
    }
  };

  const field = (key, label, extra = {}) => (
    <label className="text-label-md text-on-surface-variant">
      {label}
      <input
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary"
        {...extra}
      />
    </label>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 bg-surface-container-lowest border border-surface-variant rounded-lg px-3 py-2.5 w-full sm:max-w-xs">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search medicines…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-sm text-on-background placeholder:text-on-surface-variant"
          />
        </label>
        <button
          onClick={startAdd}
          className="inline-flex items-center justify-center gap-1 text-sm font-medium bg-primary text-on-primary rounded-lg px-4 py-2.5 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Medicine
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-3 flex items-center justify-between">
            <h3 className="text-title-lg font-bold text-on-background">
              {editingId ? 'Edit Medicine' : 'New Medicine'}
            </h3>
            <button type="button" onClick={cancel} className="text-sm text-on-surface-variant hover:underline">
              Cancel
            </button>
          </div>
          {field('name', 'Name *', { required: true, placeholder: 'Amoxicillin 500mg Capsule' })}
          {field('genericName', 'Generic Name', { placeholder: 'Amoxicillin' })}
          {field('form', 'Form', { placeholder: 'Capsule / Tablet / Syrup' })}
          {field('strength', 'Strength', { placeholder: '500mg' })}
          {field('defaultDispenseQty', 'Default Dispense Qty', { type: 'number', min: '0' })}
          {field('defaultRefills', 'Default Refills', { type: 'number', min: '0' })}
          <label className="text-label-md text-on-surface-variant sm:col-span-3">
            Default Sig (dosage instructions)
            <input
              value={form.defaultSig}
              onChange={(e) => setForm({ ...form, defaultSig: e.target.value })}
              placeholder="Take 1 capsule by mouth three times daily for 10 days"
              className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary"
            />
          </label>
          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={busy}
              className="bg-primary text-on-primary text-sm font-bold rounded-lg px-5 py-2.5 hover:opacity-90 disabled:opacity-60"
            >
              {busy ? 'Saving…' : editingId ? 'Save Changes' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-surface-container-low text-on-surface-variant text-label-md">
            <tr>
              <th className="text-left px-5 py-3">Medicine</th>
              <th className="text-left px-5 py-3">Form / Strength</th>
              <th className="text-left px-5 py-3">Default Sig</th>
              <th className="text-center px-5 py-3">Qty</th>
              <th className="text-center px-5 py-3">Refills</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant">
            {medicines.map((m) => (
              <tr key={m.id} className="hover:bg-surface-container-low transition-colors">
                <td className="px-5 py-3">
                  <p className="font-bold text-on-background">{m.name}</p>
                  <p className="text-xs text-on-surface-variant">{m.genericName || m.id}</p>
                </td>
                <td className="px-5 py-3 text-on-surface-variant">
                  {[m.form, m.strength].filter(Boolean).join(' · ') || '—'}
                </td>
                <td className="px-5 py-3 text-on-surface-variant max-w-xs truncate">{m.defaultSig || '—'}</td>
                <td className="px-5 py-3 text-center text-on-surface-variant">{m.defaultDispenseQty || '—'}</td>
                <td className="px-5 py-3 text-center text-on-surface-variant">{m.defaultRefills ?? 0}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => startEdit(m)}
                      title="Edit medicine"
                      className="w-9 h-9 rounded-lg hover:bg-surface-container-high flex items-center justify-center text-primary"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => remove(m)}
                      title="Delete medicine"
                      className="w-9 h-9 rounded-lg hover:bg-error-container flex items-center justify-center text-error"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {medicines.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-on-surface-variant">
                  No medicines match &quot;{query}&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
