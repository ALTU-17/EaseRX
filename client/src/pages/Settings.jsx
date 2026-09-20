import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSettings().then(setSettings).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-error text-sm">{error}</p>;
  if (!settings) return <p className="text-on-surface-variant text-sm">Loading settings…</p>;

  const updatePdf = (key, value) => setSettings({ ...settings, pdf: { ...settings.pdf, [key]: value } });

  const submitVerification = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.saveProfile(settings);
      const res = await api.submitVerification();
      setSettings(res && res.firstName !== undefined ? res : { ...settings, verified: true });
    } catch (err) {
      setError(err.message);
    }
  };

  const saveConfig = async () => {
    setError('');
    try {
      const res = await api.savePdfSettings(settings);
      if (res && res.clinic) setSettings(res);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const resetDefaults = async () => {
    setError('');
    try {
      const res = await api.resetPdfSettings();
      setSettings((s) => (res && res.pdf ? { ...s, pdf: res.pdf } : { ...s, pdf: { ...s.pdf, marginTop: 15, marginBottom: 15, marginLeft: 20, marginRight: 20, scale: 100 } }));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
      <div className="xl:col-span-3 space-y-6">
        <form onSubmit={submitVerification} className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </span>
            <h3 className="text-title-lg font-bold text-on-background">Account Verification</h3>
            {settings.verified && (
              <span className="ml-auto text-xs font-bold bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-1 rounded-full">Verified</span>
            )}
          </div>
          <p className="text-sm text-on-surface-variant">
            Verify your professional credentials to unlock advanced prescribing features.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-label-md text-on-surface-variant">
              First Name
              <input value={settings.firstName} onChange={(e) => setSettings({ ...settings, firstName: e.target.value })} className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary" />
            </label>
            <label className="text-label-md text-on-surface-variant">
              Last Name
              <input value={settings.lastName} onChange={(e) => setSettings({ ...settings, lastName: e.target.value })} className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary" />
            </label>
            <label className="text-label-md text-on-surface-variant sm:col-span-2">
              Medical License Number
              <input value={settings.licenseNumber} onChange={(e) => setSettings({ ...settings, licenseNumber: e.target.value })} placeholder="e.g. MD12345678" className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary" />
            </label>
            <label className="text-label-md text-on-surface-variant">
              NPI Number (Optional)
              <input value={settings.npi} onChange={(e) => setSettings({ ...settings, npi: e.target.value })} placeholder="10-digit NPI" className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary" />
            </label>
            <label className="text-label-md text-on-surface-variant">
              State of Licensure
              <select value={settings.state} onChange={(e) => setSettings({ ...settings, state: e.target.value })} className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary">
                <option value="">Select State</option>
                <option>Maharashtra</option>
                <option>Delhi</option>
                <option>Karnataka</option>
                <option>New York</option>
                <option>California</option>
              </select>
            </label>
          </div>
          <button type="submit" className="inline-flex items-center gap-2 bg-primary text-on-primary font-bold rounded-lg px-5 py-2.5 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            Submit for Verification
          </button>
        </form>

        <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-6 space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">print</span>
            </span>
            <h3 className="text-title-lg font-bold text-on-background">PDF Configuration</h3>
            <span className="ml-auto text-xs bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full">Live Preview Active</span>
          </div>

          <div>
            <h4 className="font-bold text-on-background mb-3">Margins (mm)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['marginTop', 'marginBottom', 'marginLeft', 'marginRight'].map((key) => (
                <label key={key} className="text-label-sm text-on-surface-variant text-center block">
                  {key.replace('margin', '').toUpperCase()}
                  <input
                    type="number"
                    value={settings.pdf[key]}
                    onChange={(e) => updatePdf(key, Number(e.target.value))}
                    className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-2 py-2 text-sm text-center outline-none focus:border-secondary"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-on-background mb-3">Scale &amp; Size</h4>
              <label className="text-label-sm text-on-surface-variant flex justify-between">
                Global Scale <span>{settings.pdf.scale}%</span>
              </label>
              <input
                type="range"
                min="50"
                max="150"
                value={settings.pdf.scale}
                onChange={(e) => updatePdf('scale', Number(e.target.value))}
                className="w-full mt-1 accent-primary"
              />
              <label className="text-label-sm text-on-surface-variant block mt-4">
                Paper Size
                <select
                  value={settings.pdf.paperSize}
                  onChange={(e) => updatePdf('paperSize', e.target.value)}
                  className="mt-1 w-full bg-surface-container-low border border-surface-variant rounded-lg px-3 py-2.5 text-sm outline-none focus:border-secondary"
                >
                  <option>A4 (210 x 297 mm)</option>
                  <option>Letter (8.5 x 11 in)</option>
                  <option>A5 (148 x 210 mm)</option>
                </select>
              </label>
            </div>
            <div>
              <h4 className="font-bold text-on-background mb-3">Elements</h4>
              <div className="space-y-2">
                {[
                  ['includeClinicLogo', 'Include Clinic Logo'],
                  ['includeSignature', 'Include Digital Signature'],
                  ['addWatermark', 'Add Watermark'],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-on-background">
                    <input type="checkbox" checked={settings.pdf[key]} onChange={(e) => updatePdf(key, e.target.checked)} className="rounded" />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-surface-variant">
            <button
              type="button"
              onClick={resetDefaults}
              className="text-sm font-medium text-on-surface-variant hover:underline"
            >
              Reset Defaults
            </button>
            <button onClick={saveConfig} className="bg-primary text-on-primary font-bold rounded-lg px-5 py-2.5 hover:opacity-90 transition-opacity">
              {saved ? 'Saved ✓' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>

      <div className="xl:col-span-2 xl:sticky xl:top-24">
        <div className="bg-surface-container p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">visibility</span>
            <h4 className="font-bold text-on-background text-sm">Live Print Preview</h4>
          </div>
          <div
            className="bg-white rounded-lg shadow-modal p-6 text-sm"
            style={{ transform: `scale(${settings.pdf.scale / 100})`, transformOrigin: 'top' }}
          >
            <div className="flex justify-between items-start border-b border-surface-variant pb-3">
              <div>
                <p className="font-bold text-primary text-base">{settings.clinic.name}</p>
                <p className="text-xs text-on-surface-variant">{settings.clinic.address}</p>
                <p className="text-xs text-on-surface-variant">Ph: {settings.clinic.phone}</p>
              </div>
              {settings.pdf.includeClinicLogo && (
                <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center text-on-primary">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </div>
              )}
            </div>
            <div className="flex justify-between mt-3 text-xs">
              <div>
                <p className="text-on-surface-variant">Patient Name</p>
                <p className="font-bold text-on-background">Jane Smith</p>
              </div>
              <div className="text-right">
                <p className="text-on-surface-variant">Date</p>
                <p className="font-bold text-on-background">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-primary mt-4">Rx</p>
            <div className="mt-2 space-y-3">
              <div>
                <p className="font-bold text-on-background">Amoxicillin 500mg Capsule</p>
                <p className="text-xs text-on-surface-variant">Sig: Take 1 capsule by mouth three times daily for 10 days.</p>
                <p className="text-xs text-on-surface-variant">Dispense: 30 · Refills: 0</p>
              </div>
              <div>
                <p className="font-bold text-on-background">Ibuprofen 400mg Tablet</p>
                <p className="text-xs text-on-surface-variant">Sig: Take 1 tablet by mouth every 6 hours as needed for pain.</p>
                <p className="text-xs text-on-surface-variant">Dispense: 20 · Refills: 1</p>
              </div>
            </div>
            {settings.pdf.addWatermark && (
              <p className="text-center text-4xl text-surface-variant font-bold mt-6 select-none">SAMPLE</p>
            )}
            <div className="border-t border-surface-variant mt-8 pt-2 flex justify-between items-end">
              <p className="text-xs text-on-surface-variant max-w-[60%]">
                This prescription is valid only if presented by the named patient.
              </p>
              {settings.pdf.includeSignature && (
                <div className="text-right">
                  <p className="font-bold italic text-on-background">Dr. {settings.firstName} {settings.lastName}</p>
                  <p className="text-xs text-on-surface-variant">Lic #{settings.licenseNumber || '—'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
