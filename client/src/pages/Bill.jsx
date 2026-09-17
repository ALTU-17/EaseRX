import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Bill() {
  const [bills, setBills] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getBills().then(setBills).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-error text-sm">{error}</p>;

  return (
    <div className="space-y-4">
      {bills.length === 0 && (
        <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-10 text-center">
          <p className="text-on-surface-variant text-sm">
            No bills yet. Save a prescription from the <strong>Rx</strong> tab to generate one.
          </p>
        </div>
      )}
      {bills.map((b) => (
        <div key={b.id} className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-on-background">{b.patientName}</p>
              <p className="text-xs text-on-surface-variant">{b.id} • {new Date(b.date).toLocaleDateString()}</p>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                b.status === 'paid' ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 'bg-error-container text-on-error-container'
              }`}
            >
              {b.status === 'paid' ? 'Paid' : 'Unpaid'}
            </span>
          </div>
          <div className="mt-4 divide-y divide-surface-variant border-t border-surface-variant">
            {b.items.map((item, i) => (
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
