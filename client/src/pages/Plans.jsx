import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPlans().then((d) => {
      setPlans(d.plans);
      setCurrentPlan(d.currentPlan);
    }).catch((e) => setError(e.message));
  }, []);

  const upgrade = async (planId) => {
    setBusy(planId);
    setError('');
    try {
      const res = await api.upgradePlan(planId);
      setCurrentPlan(res.currentPlan);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  return (
    <div>
      <p className="text-sm text-on-surface-variant max-w-xl mb-8">
        Select the plan that fits your practice. Upgrade anytime to unlock advanced features and streamline your workflow.
      </p>

      {error && <p className="text-sm text-error mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className={`bg-surface-container-lowest rounded-xl p-6 border relative flex flex-col h-full ${
                plan.popular ? 'border-2 border-primary shadow-modal' : 'border-surface-variant shadow-card'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-headline-sm font-bold text-primary">{plan.name}</h3>
              <p className="mt-2">
                <span className="text-display-lg text-on-background">₹{plan.price}</span>
                <span className="text-sm text-on-surface-variant">/month</span>
              </p>
              <p className="text-sm text-on-surface-variant mt-2">{plan.tagline}</p>

              <ul className="mt-5 space-y-3 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className={`material-symbols-outlined text-[18px] mt-0.5 ${f.included ? 'text-secondary' : 'text-on-surface-variant'}`}>
                      {f.included ? 'check_circle' : 'remove'}
                    </span>
                    <span className={f.included ? 'text-on-background' : 'text-on-surface-variant'}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => (plan.id === 'elite' ? undefined : upgrade(plan.id))}
                disabled={isCurrent || busy === plan.id}
                className={`mt-6 w-full rounded-lg py-3 text-sm font-bold transition-opacity ${
                  isCurrent
                    ? 'bg-surface-container text-on-surface-variant cursor-default'
                    : plan.popular
                    ? 'bg-primary text-on-primary hover:opacity-90'
                    : 'border border-outline-variant text-on-background hover:bg-surface-container-low'
                }`}
              >
                {isCurrent
                  ? 'Current Plan'
                  : busy === plan.id
                  ? 'Upgrading…'
                  : plan.id === 'elite'
                  ? 'Contact Sales'
                  : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
