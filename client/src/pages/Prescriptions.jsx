import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const STATUS_STYLE = {
  draft: 'bg-surface-container-high text-on-surface-variant',
  final: 'bg-secondary-fixed text-on-secondary-fixed-variant',
};

export default function Prescriptions() {
  const [list, setList] = useState(null);
  const [tab, setTab] = useState('draft');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getPrescriptions().then(setList).catch((e) => setError(e.message));
  }, []);

  const filtered = (list || []).filter((rx) => rx.status === tab);

  const open = (rx) => setSelected(rx);

  const finalize = async (rx) => {
    setBusy(true);
    setError('');
    try {
      // Real API PUT is a full update, so send the whole prescription back.
      const updated = await api.updatePrescription(rx.id, { ...rx, status: 'final' });
      setList((l) => l.map((x) => (x.id === rx.id ? updated : x)));
      setSelected(updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (rx) => {
    if (!window.confirm(`Delete prescription ${rx.id}? This cannot be undone.`)) return;
    setError('');
    try {
      await api.deletePrescription(rx.id);
      setList((l) => l.filter((x) => x.id !== rx.id));
      setSelected(null);
    } catch (e) {
      setError(e.message);
    }
  };

  if (error && !list) return <p className="text-error text-sm">{error}</p>;
  if (!list) return <p className="text-on-surface-variant text-sm">Loading prescriptions…</p>;

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {['draft', 'final'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${
              tab === t
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-lowest border border-surface-variant text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {t === 'draft' ? 'Drafts' : 'Final'}
            <span className="ml-2 text-xs opacity-70">
              ({(list || []).filter((rx) => rx.status === t).length})
            </span>
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant overflow-hidden">
          {filtered.length === 0 ? (
            <p className="p-10 text-sm text-on-surface-variant text-center">
              No {tab} prescriptions.
            </p>
          ) : (
            <ul className="divide-y divide-surface-variant">
              {filtered.map((rx) => (
                <li key={rx.id}>
                  <button
                    onClick={() => open(rx)}
                    className={`w-full text-left p-4 flex items-center justify-between gap-3 transition-colors ${
                      selected && selected.id === rx.id ? 'bg-primary-fixed' : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-on-background truncate">{rx.patient && rx.patient.name}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {rx.id} · {new Date(rx.date).toLocaleDateString()} · {(rx.medicines || []).length} med(s)
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_STYLE[rx.status]}`}>
                      {rx.status === 'final' ? 'Final' : 'Draft'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-3">
          {!selected ? (
            <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-10 text-center">
              <span className="material-symbols-outlined text-[40px] text-on-surface-variant">clinical_notes</span>
              <p className="text-sm text-on-surface-variant mt-3">Select a prescription to view details.</p>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-title-lg font-bold text-on-background">{selected.patient && selected.patient.name}</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {selected.id} · {new Date(selected.date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[selected.status]}`}>
                  {selected.status === 'final' ? 'Final' : 'Draft'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-on-surface-variant">Blood Pressure</p>
                  <p className="font-bold text-on-background mt-0.5">{(selected.vitals && selected.vitals.bp) || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Temperature</p>
                  <p className="font-bold text-on-background mt-0.5">{(selected.vitals && selected.vitals.temp) || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Complaint</p>
                  <p className="font-bold text-on-background mt-0.5">{(selected.vitals && selected.vitals.complaint) || '—'}</p>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-bold text-on-background mb-2">Medicines</h5>
                <div className="space-y-3">
                  {(selected.medicines || []).map((m, i) => (
                    <div key={i} className="border border-surface-variant rounded-lg p-3">
                      <p className="text-sm font-bold text-on-background">{m.name}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{m.sig}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Dispense: {m.dispense || '—'} · Refills: {m.refills === undefined ? '—' : m.refills}
                      </p>
                    </div>
                  ))}
                  {(selected.medicines || []).length === 0 && (
                    <p className="text-sm text-on-surface-variant">No medicines recorded.</p>
                  )}
                </div>
              </div>

              {selected.advice && (
                <div>
                  <h5 className="text-sm font-bold text-on-background mb-1">Doctor&apos;s Advice</h5>
                  <p className="text-sm text-on-surface-variant">{selected.advice}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2 border-t border-surface-variant">
                <button
                  onClick={() => remove(selected)}
                  className="text-sm font-bold border border-outline-variant text-error rounded-lg px-4 py-2.5 hover:bg-error-container"
                >
                  Delete
                </button>
                <button
                  onClick={() => window.print()}
                  className="text-sm font-bold border border-outline-variant text-on-background rounded-lg px-4 py-2.5 hover:bg-surface-container"
                >
                  Print
                </button>
                {selected.status === 'draft' && (
                  <button
                    disabled={busy}
                    onClick={() => finalize(selected)}
                    className="bg-primary text-on-primary text-sm font-bold rounded-lg px-4 py-2.5 hover:opacity-90 disabled:opacity-60"
                  >
                    {busy ? 'Finalizing…' : 'Approve & Finalize'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
