import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

const emptyItem = { label: '', amount: '' };

export default function Bill() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [saving, setSaving] = useState(false);

  const load = () => api.getBills().then(setBills).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const updateItem = (i, key, value) =>
    setItems((list) => list.map((item, idx) => (idx === i ? { ...item, [key]: value } : item)));

  const total = items.reduce((s, i) => s + Number(i.amount || 0), 0);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!patientName.trim()) {
      setError('Patient name is required.');
      return;
    }
    const cleanItems = items.filter((i) => i.label.trim());
    if (cleanItems.length === 0) {
      setError('Add at least one bill item.');
      return;
    }
    setSaving(true);
    try {
      await api.addBill({ patientName, items: cleanItems });
      setPatientName('');
      setItems([{ ...emptyItem }]);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-1 text-sm font-medium bg-primary text-on-primary rounded-lg px-4 py-2.5 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Invoice
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-5 space-y-4">
          <input
            required
            placeholder="Patient name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary"
          />
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex gap-3 items-center">
                <input
                  placeholder="Item description (e.g. Consultation)"
                  value={item.label}
                  onChange={(e) => updateItem(i, 'label', e.target.value)}
                  className="flex-1 bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="₹"
                  value={item.amount}
                  onChange={(e) => updateItem(i, 'amount', e.target.value)}
                  className="w-28 bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setItems((list) => list.filter((_, idx) => idx !== i))}
                    className="text-on-surface-variant hover:text-error"
                    aria-label="Remove item"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setItems((list) => [...list, { ...emptyItem }])}
              className="inline-flex items-center gap-1 text-sm font-bold text-secondary hover:underline"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add item
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-on-background">Total: ₹{total}</span>
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-on-primary text-sm font-bold rounded-lg px-5 py-2.5 hover:opacity-90 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-error">{error}</p>}

      {bills.length === 0 && !showForm && (
        <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-10 text-center">
          <p className="text-on-surface-variant text-sm">
            No bills yet. Save a prescription from the <strong>Rx</strong> tab or create a{' '}
            <strong>New Invoice</strong>.
          </p>
        </div>
      )}

      {bills.map((b) => (
        <div
          key={b.id}
          onClick={() => navigate(`/bill/${b.id}`)}
          className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-5 cursor-pointer hover:border-secondary transition-colors"
          title="Open invoice"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-on-background">{b.patientName}</p>
              <p className="text-xs text-on-surface-variant">
                {b.id} • {new Date(b.date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  b.status === 'paid'
                    ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                    : 'bg-error-container text-on-error-container'
                }`}
              >
                {b.status === 'paid' ? 'Paid' : 'Unpaid'}
              </span>
              <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </div>
          </div>
          <div className="mt-4 divide-y divide-surface-variant border-t border-surface-variant">
            {(b.items || []).map((item, i) => (
              <div key={i} className="flex justify-between py-2 text-sm">
                <span className="text-on-surface-variant">{item.label}</span>
                <span className="text-on-background font-medium">₹{item.amount}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-3 mt-1 border-t border-surface-variant font-bold text-on-background">
            <span>Total</span>
            <span>₹{b.total}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
