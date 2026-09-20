import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

const emptyMed = { name: '', sig: '', dispense: '', refills: 0 };

function Section({ icon, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <span className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </span>
          <span className="text-title-lg font-bold text-on-background">{title}</span>
        </span>
        <span className="material-symbols-outlined text-on-surface-variant transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
          expand_more
        </span>
      </button>
      {open && <div className="px-4 pb-5 border-t border-surface-variant pt-4">{children}</div>}
    </div>
  );
}

export default function Rx() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState({ name: '', phone: '', age: '', gender: '', consultationDate: new Date().toISOString().slice(0, 10) });
  const [vitals, setVitals] = useState({ bp: '', temp: '', complaint: '' });
  const [advice, setAdvice] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [medicines, setMedicines] = useState([{ ...emptyMed }]);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getMedicines().then(setCatalog).catch(() => {});
  }, []);

  const updateMed = (i, key, value) =>
    setMedicines((meds) => meds.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)));

  const addMed = () => setMedicines((meds) => [...meds, { ...emptyMed }]);
  const removeMed = (i) => setMedicines((meds) => meds.filter((_, idx) => idx !== i));

  const save = async (status) => {
    setError('');
    if (!patient.name.trim()) {
      setError('Patient full name is required.');
      return;
    }
    setSaving(true);
    try {
      const rx = await api.addPrescription({ patient, vitals, medicines, status, advice, consultationDate: patient.consultationDate });
      setSaved(rx);
      if (status === 'final') {
        await api.generateBillFromPrescription(rx.id, {
          consultationFee: 500,
          extraItems: medicines
            .filter((m) => m.name)
            .map((m) => ({ description: m.name, amount: 200, quantity: 1 })),
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="max-w-lg mx-auto bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[28px]">task_alt</span>
        </div>
        <h3 className="text-headline-sm font-bold text-on-background">
          {saved.status === 'final' ? 'Prescription & bill saved' : 'Draft saved'}
        </h3>
        <p className="text-sm text-on-surface-variant">
          {saved.id} for {saved.patient.name} — {saved.medicines.length} medicine(s).
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button onClick={() => navigate('/bill')} className="text-sm font-bold border border-outline-variant rounded-lg px-4 py-2.5 hover:bg-surface-container">
            View Bill
          </button>
          <button
            onClick={() => {
              setSaved(null);
              setPatient({ name: '', phone: '', age: '', gender: '', consultationDate: new Date().toISOString().slice(0, 10) });
              setVitals({ bp: '', temp: '', complaint: '' });
              setAdvice('');
              setMedicines([{ ...emptyMed }]);
            }}
            className="text-sm font-bold bg-primary text-on-primary rounded-lg px-4 py-2.5 hover:opacity-90"
          >
            New Prescription
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Section icon="person" title="Patient Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="text-label-md text-on-surface-variant">
            Patient Full Name *
            <input
              required
              value={patient.name}
              onChange={(e) => setPatient({ ...patient, name: e.target.value })}
              placeholder="Search database or enter patient name…"
              className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm text-on-background outline-none focus:border-secondary"
            />
          </label>
          <label className="text-label-md text-on-surface-variant">
            WhatsApp Phone Number
            <input
              value={patient.phone}
              onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
              placeholder="+91 8830121XXX"
              className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm text-on-background outline-none focus:border-secondary"
            />
          </label>
          <label className="text-label-md text-on-surface-variant">
            Age (yrs)
            <input
              value={patient.age}
              onChange={(e) => setPatient({ ...patient, age: e.target.value })}
              placeholder="e.g. 25"
              className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm text-on-background outline-none focus:border-secondary"
            />
          </label>
          <div className="text-label-md text-on-surface-variant">
            Sex / Gender
            <div className="mt-1 flex gap-2">
              {['F', 'M', 'Other'].map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setPatient({ ...patient, gender: g })}
                  className={`flex-1 rounded-lg py-2.5 text-sm border transition-colors ${
                    patient.gender === g ? 'bg-primary text-on-primary border-primary' : 'border-surface-variant text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <label className="text-label-md text-on-surface-variant sm:col-span-2">
            Consultation Date
            <input
              type="date"
              value={patient.consultationDate}
              onChange={(e) => setPatient({ ...patient, consultationDate: e.target.value })}
              className="mt-1 w-full sm:w-64 bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm text-on-background outline-none focus:border-secondary"
            />
          </label>
        </div>
      </Section>

      <Section icon="assignment" title="Chief Complaints & Vitals">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="text-label-md text-on-surface-variant">
            Blood Pressure
            <input value={vitals.bp} onChange={(e) => setVitals({ ...vitals, bp: e.target.value })} placeholder="120/80" className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary" />
          </label>
          <label className="text-label-md text-on-surface-variant">
            Temperature
            <input value={vitals.temp} onChange={(e) => setVitals({ ...vitals, temp: e.target.value })} placeholder="98.6°F" className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary" />
          </label>
          <label className="text-label-md text-on-surface-variant sm:col-span-1">
            Chief Complaint
            <input value={vitals.complaint} onChange={(e) => setVitals({ ...vitals, complaint: e.target.value })} placeholder="Fever, cough…" className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary" />
          </label>
          <label className="text-label-md text-on-surface-variant sm:col-span-3">
            Doctor&apos;s Advice (optional)
            <textarea
              rows={2}
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              placeholder="Rest and fluids, salt-water gargle…"
              className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary"
            />
          </label>
        </div>
      </Section>

      <Section icon="medication" title="Medicines">
        <div className="space-y-4">
          {catalog.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <select
                value=""
                onChange={(e) => {
                  const med = catalog.find((c) => c.id === e.target.value);
                  if (!med) return;
                  setMedicines((meds) => {
                    const line = {
                      name: med.name,
                      sig: med.defaultSig || '',
                      dispense: med.defaultDispenseQty ?? '',
                      refills: med.defaultRefills ?? 0,
                      medicineId: med.id,
                    };
                    const first = meds[0];
                    return first && !first.name ? [line, ...meds.slice(1)] : [...meds, line];
                  });
                }}
                className="w-full sm:w-72 bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary"
              >
                <option value="">Add from medicine catalog…</option>
                {catalog.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button type="button" onClick={() => navigate('/medicines')} className="text-sm font-bold text-secondary hover:underline">
                Manage catalog
              </button>
            </div>
          )}
          {medicines.map((m, i) => (
            <div key={i} className="border border-surface-variant rounded-lg p-4 space-y-3 relative">
              {medicines.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMed(i)}
                  className="absolute top-3 right-3 text-on-surface-variant hover:text-error"
                  aria-label="Remove medicine"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
              <input
                value={m.name}
                onChange={(e) => updateMed(i, 'name', e.target.value)}
                placeholder="Medicine name & strength, e.g. Amoxicillin 500mg Capsule"
                className="w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:border-secondary"
              />
              <input
                value={m.sig}
                onChange={(e) => updateMed(i, 'sig', e.target.value)}
                placeholder="Sig — dosage instructions, e.g. Take 1 capsule three times daily for 10 days."
                className="w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={m.dispense}
                  onChange={(e) => updateMed(i, 'dispense', e.target.value)}
                  placeholder="Dispense qty"
                  className="bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary"
                />
                <input
                  value={m.refills}
                  onChange={(e) => updateMed(i, 'refills', e.target.value)}
                  placeholder="Refills"
                  className="bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addMed}
            className="inline-flex items-center gap-1 text-sm font-bold text-secondary hover:underline"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add another medicine
          </button>
        </div>
      </Section>

      {error && <p className="text-sm text-error">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <button
          disabled={saving}
          onClick={() => save('draft')}
          className="border border-outline-variant text-on-background font-bold rounded-lg px-5 py-3 hover:bg-surface-container-low transition-colors disabled:opacity-60"
        >
          Save as Draft
        </button>
        <button
          disabled={saving}
          onClick={() => save('final')}
          className="bg-primary text-on-primary font-bold rounded-lg px-5 py-3 hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Prescription & Generate Bill'}
        </button>
      </div>
    </div>
  );
}
