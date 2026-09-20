import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function BillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getBill(id).then(setBill).catch((e) => setError(e.message));
    api.getSettings().then(setSettings).catch(() => {});
  }, [id]);

  const markPaid = async () => {
    setBusy(true);
    setError('');
    try {
      const updated = await api.markBillPaid(id, { paidAmount: bill.total, status: 'Paid' });
      setBill(updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const recordPayment = async () => {
    const input = window.prompt(`Payment received towards ₹${bill.total} (₹${bill.paidAmount || 0} already paid)?`, String(bill.total - (bill.paidAmount || 0)));
    if (input === null) return;
    const amount = Number(input);
    if (isNaN(amount) || amount <= 0) {
      setError('Enter a valid payment amount.');
      return;
    }
    const paidAmount = (bill.paidAmount || 0) + amount;
    const status = paidAmount >= bill.total ? 'Paid' : 'Partial';
    setBusy(true);
    setError('');
    try {
      const updated = await api.markBillPaid(id, { paidAmount, status });
      setBill(updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const removeBill = async () => {
    if (!window.confirm(`Delete invoice ${bill.number || bill.id}? This cannot be undone.`)) return;
    try {
      await api.deleteBill(id);
      navigate('/bill');
    } catch (e) {
      setError(e.message);
    }
  };

  if (error && !bill)
    return (
      <div className="space-y-4">
        <p className="text-sm text-error">{error}</p>
        <Link to="/bill" className="text-sm text-primary hover:underline">← Back to Billing</Link>
      </div>
    );
  if (!bill) return <p className="text-on-surface-variant text-sm">Loading bill…</p>;

  return (
    <div className="space-y-5 max-w-3xl">
      <Link to="/bill" className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Billing
      </Link>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-headline-sm font-bold text-on-background">{bill.number || bill.id}</h3>
          <p className="text-sm text-on-surface-variant mt-0.5">{new Date(bill.date).toLocaleString()}</p>
        </div>
        <div className="flex gap-3">
          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-full self-center ${
              bill.status === 'paid' ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 'bg-error-container text-on-error-container'
            }`}
          >
            {bill.status === 'paid' ? 'Paid' : 'Unpaid'}
          </span>
          {bill.status !== 'paid' && (
            <>
              <button
                disabled={busy}
                onClick={recordPayment}
                className="text-sm font-bold border border-outline-variant text-on-background rounded-lg px-4 py-2.5 hover:bg-surface-container disabled:opacity-60"
              >
                Record Payment
              </button>
              <button
                disabled={busy}
                onClick={markPaid}
                className="text-sm font-bold bg-secondary text-on-secondary rounded-lg px-4 py-2.5 hover:opacity-90 disabled:opacity-60"
              >
                {busy ? 'Saving…' : 'Mark as Paid'}
              </button>
            </>
          )}
          <button
            onClick={removeBill}
            className="inline-flex items-center gap-1 text-sm font-bold border border-outline-variant text-error rounded-lg px-4 py-2.5 hover:bg-error-container"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            Delete
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1 text-sm font-bold border border-outline-variant text-on-background rounded-lg px-4 py-2.5 hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print / PDF
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      {/* Invoice sheet */}
      <div className="bg-white rounded-xl shadow-card border border-surface-variant p-8">
        <div className="flex justify-between items-start border-b border-gray-200 pb-4">
          <div>
            <p className="text-lg font-bold text-gray-900">{(settings && settings.clinic && settings.clinic.name) || 'Ease Dental Clinic'}</p>
            <p className="text-xs text-gray-500 mt-0.5">{(settings && settings.clinic && settings.clinic.address) || ''}</p>
            <p className="text-xs text-gray-500">Ph: {(settings && settings.clinic && settings.clinic.phone) || '—'}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">INVOICE</p>
            <p className="text-xs text-gray-500 mt-1">{bill.number || bill.id}</p>
            <p className="text-xs text-gray-500">{new Date(bill.date).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex justify-between mt-5 text-sm">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Billed To</p>
            <p className="font-bold text-gray-900 mt-1">{bill.patientName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
            <p className={`font-bold mt-1 ${bill.status === 'paid' ? 'text-green-600' : bill.status === 'partial' ? 'text-amber-600' : 'text-red-500'}`}>
              {bill.status === 'paid' ? 'PAID' : bill.status === 'partial' ? 'PARTIAL' : 'UNPAID'}
            </p>
          </div>
        </div>

        <table className="w-full mt-6 text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="pb-2">Description</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(bill.items || []).map((item, i) => (
              <tr key={i}>
                <td className="py-2.5 text-gray-800">{item.label}</td>
                <td className="py-2.5 text-right text-gray-900 font-medium">₹{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-4">
          <div className="w-48">
            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-800">₹{bill.total}</span>
            </div>
            {(bill.paidAmount || 0) > 0 && (
              <div className="flex justify-between py-1.5 text-sm">
                <span className="text-gray-500">Paid</span>
                <span className="text-gray-800">₹{bill.paidAmount}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 text-sm border-t border-gray-200">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-gray-900">₹{bill.total}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-8 border-t border-gray-100 pt-4 text-center">
          This invoice was generated with EaseRX. Thank you for your visit.
        </p>
      </div>
    </div>
  );
}
