import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const STATUS_STYLE = {
  draft: 'bg-surface-container-high text-on-surface-variant',
  final: 'bg-secondary-fixed text-on-secondary-fixed-variant',
};

function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_STYLE[status] || STATUS_STYLE.draft}`}>
      {status === 'final' ? 'Final' : 'Draft'}
    </span>
  );
}

function DetailPanel({ rx, busy, onFinalize, onDelete, showHeader = true }) {
  return (
    <div className={showHeader ? 'bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-4 sm:p-6 space-y-5' : 'space-y-5'}>
      {showHeader && (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="text-title-lg font-bold text-on-background break-words">
              {rx.patient && rx.patient.name}
            </h4>
            <p className="text-xs text-on-surface-variant mt-0.5 break-words">
              {rx.id} · {new Date(rx.date).toLocaleDateString()}
            </p>
          </div>
          <StatusBadge status={rx.status} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-xs text-on-surface-variant">Blood Pressure</p>
          <p className="font-bold text-on-background mt-0.5">{(rx.vitals && rx.vitals.bp) || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-on-surface-variant">Temperature</p>
          <p className="font-bold text-on-background mt-0.5">{(rx.vitals && rx.vitals.temp) || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-on-surface-variant">Complaint</p>
          <p className="font-bold text-on-background mt-0.5">{(rx.vitals && rx.vitals.complaint) || '—'}</p>
        </div>
      </div>

      <div>
        <h5 className="text-sm font-bold text-on-background mb-2">Medicines</h5>
        <div className="space-y-3">
          {(rx.medicines || []).map((m, i) => (
            <div key={i} className="border border-surface-variant rounded-lg p-3">
              <p className="text-sm font-bold text-on-background break-words">{m.name}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{m.sig}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Dispense: {m.dispense || '—'} · Refills: {m.refills === undefined ? '—' : m.refills}
              </p>
            </div>
          ))}
          {(rx.medicines || []).length === 0 && (
            <p className="text-sm text-on-surface-variant">No medicines recorded.</p>
          )}
        </div>
      </div>

      {rx.advice && (
        <div>
          <h5 className="text-sm font-bold text-on-background mb-1">Doctor&apos;s Advice</h5>
          <p className="text-sm text-on-surface-variant">{rx.advice}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-3 sm:pt-2 border-t border-surface-variant">
        <button
          onClick={() => onDelete(rx)}
          className="w-full sm:w-auto text-sm font-bold border border-outline-variant text-error rounded-lg px-4 py-3 sm:py-2.5 hover:bg-error-container"
        >
          Delete
        </button>
        <button
          onClick={() => window.print()}
          className="w-full sm:w-auto text-sm font-bold border border-outline-variant text-on-background rounded-lg px-4 py-3 sm:py-2.5 hover:bg-surface-container"
        >
          Print
        </button>
        {rx.status === 'draft' && (
          <button
            disabled={busy}
            onClick={() => onFinalize(rx)}
            className="w-full sm:w-auto bg-primary text-on-primary text-sm font-bold rounded-lg px-4 py-3 sm:py-2.5 hover:opacity-90 disabled:opacity-60"
          >
            {busy ? 'Finalizing…' : 'Approve & Finalize'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Prescriptions() {
  const [list, setList] = useState(null);
  const [tab, setTab] = useState('draft');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getPrescriptions().then(setList).catch((e) => setError(e.message));
  }, []);

  // On phones the detail panel covers the screen — freeze the page behind it
  // and let Escape close it. Desktop keeps the two-column layout untouched.
  useEffect(() => {
    if (!selected || typeof window === 'undefined') return undefined;
    const isPhone = window.matchMedia('(max-width: 1023px)').matches;
    if (!isPhone) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelected(null);
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [selected]);

  const filtered = (list || []).filter((rx) => rx.status === tab);

  const open = (rx) => setSelected(rx);
  const close = () => setSelected(null);

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
            onClick={() => {
              setTab(t);
              setSelected(null);
            }}
            className={`flex-1 sm:flex-none text-sm font-bold px-4 py-2.5 sm:py-2 rounded-lg transition-colors ${
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
                      selected && selected.id === rx.id ? 'bg-primary-fixed' : 'hover:bg-surface-container-low active:bg-surface-container-low'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-on-background truncate">{rx.patient && rx.patient.name}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5 truncate">
                        {rx.id} · {new Date(rx.date).toLocaleDateString()} · {(rx.medicines || []).length} med(s)
                      </p>
                    </div>
                    <StatusBadge status={rx.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tablet & desktop detail column */}
        <div className="hidden lg:block lg:col-span-3">
          {!selected ? (
            <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-10 text-center">
              <span className="material-symbols-outlined text-[40px] text-on-surface-variant">clinical_notes</span>
              <p className="text-sm text-on-surface-variant mt-3">Select a prescription to view details.</p>
            </div>
          ) : (
            <DetailPanel
              rx={selected}
              busy={busy}
              onFinalize={finalize}
              onDelete={remove}
            />
          )}
        </div>
      </div>

      {/* Phone: full-screen detail sheet */}
      {selected && (
        <div
          className="lg:hidden fixed inset-0 z-[55] bg-background flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Prescription details"
        >
          <div className="flex items-center gap-2 px-2 h-14 bg-surface-container-lowest border-b border-surface-variant pt-safe-top flex-shrink-0">
            <button
              type="button"
              onClick={close}
              aria-label="Back to prescriptions list"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-on-surface-variant active:bg-surface-container flex-shrink-0"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <p className="flex-1 min-w-0 font-bold text-on-background truncate">
              {selected.patient && selected.patient.name}
            </p>
            <StatusBadge status={selected.status} />
            <span className="w-1" />
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-10">
            <p className="text-xs text-on-surface-variant mb-4">
              {selected.id} · {new Date(selected.date).toLocaleDateString()}
            </p>
            <DetailPanel
              rx={selected}
              busy={busy}
              onFinalize={finalize}
              onDelete={remove}
              showHeader={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
