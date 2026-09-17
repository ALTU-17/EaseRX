import React, { useState } from 'react';
import { api } from '../api.js';
import { API_BASE_URL, USE_MOCK } from '../config.js';

const inputCls =
  'bg-transparent outline-none w-full text-sm text-on-background placeholder:text-on-surface-variant';
const rowCls =
  'flex items-center gap-2 bg-surface-container-low border border-surface-variant rounded-lg px-3 py-3';

function Field({ icon, type = 'text', placeholder, value, onChange, required = true, children }) {
  return (
    <label className={rowCls}>
      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{icon}</span>
      <input
        required={required}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={inputCls}
      />
      {children}
    </label>
  );
}

export default function Auth({ onAuth }) {
  // signin | register | forgot | reset
  const [view, setView] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    clinicName: '',
    registrationNo: '',
    phoneNumber: '',
    emailOrPhone: '',
    email: '',
    password: '',
    userId: '',
    token: '',
    newPassword: '',
  });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const go = (v) => {
    setView(v);
    setError('');
    setNotice('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      if (view === 'signin') {
        const data = await api.login(form.emailOrPhone, form.password);
        onAuth(
          data.user ?? { name: form.emailOrPhone, email: form.emailOrPhone },
          data.token ?? 'dev-token'
        );
      } else if (view === 'register') {
        await api.register({
          fullName: form.fullName,
          clinicName: form.clinicName,
          registrationNo: form.registrationNo,
          phoneNumber: form.phoneNumber,
          email: form.email,
          password: form.password,
          role: 'Doctor',
        });
        go('signin');
        setNotice('Account created! Please sign in.');
      } else if (view === 'forgot') {
        const res = await api.forgotPassword(form.email);
        go('reset');
        setNotice(
          `Reset instructions sent.${res?.devToken ? ` (Mock token: ${res.devToken})` : ' Check your email for the code.'}`
        );
      } else if (view === 'reset') {
        await api.resetPassword(form.userId, form.token, form.newPassword);
        go('signin');
        setNotice('Password updated! Please sign in.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    signin: 'Welcome back',
    register: 'Create your clinic account',
    forgot: 'Reset your password',
    reset: 'Set a new password',
  };
  const buttonLabels = {
    signin: 'Sign In',
    register: 'Create Account',
    forgot: 'Send Reset Link',
    reset: 'Update Password',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-on-primary text-[32px]">stethoscope</span>
          </div>
          <h1 className="text-headline-md font-bold text-primary">EaseRX</h1>
          <p className="text-sm text-on-surface-variant mt-1">{titles[view]}</p>
        </div>

        {(view === 'signin' || view === 'register') && (
          <div className="flex mt-6 border-b border-surface-variant">
            <button
              onClick={() => go('signin')}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${
                view === 'signin'
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant border-transparent'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => go('register')}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${
                view === 'register'
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant border-transparent'
              }`}
            >
              Join Now
            </button>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={submit}>
          {view === 'register' && (
            <>
              <Field
                icon="badge"
                placeholder="Full Name (Dr. …)"
                value={form.fullName}
                onChange={update('fullName')}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  icon="local_hospital"
                  placeholder="Clinic Name"
                  value={form.clinicName}
                  onChange={update('clinicName')}
                  required={false}
                />
                <Field
                  icon="pin"
                  placeholder="Reg. No"
                  value={form.registrationNo}
                  onChange={update('registrationNo')}
                  required={false}
                />
              </div>
              <Field
                icon="call"
                placeholder="Phone (e.g. 919876543210)"
                value={form.phoneNumber}
                onChange={update('phoneNumber')}
              />
              <Field
                icon="mail"
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={update('email')}
              />
            </>
          )}

          {view === 'signin' && (
            <Field
              icon="person"
              placeholder="Email or Phone"
              value={form.emailOrPhone}
              onChange={update('emailOrPhone')}
            />
          )}

          {view === 'forgot' && (
            <Field
              icon="mail"
              type="email"
              placeholder="Your account email"
              value={form.email}
              onChange={update('email')}
            />
          )}

          {view === 'reset' && (
            <>
              <Field
                icon="badge"
                placeholder="User ID"
                value={form.userId}
                onChange={update('userId')}
              />
              <Field
                icon="key"
                placeholder="Reset token / code"
                value={form.token}
                onChange={update('token')}
              />
            </>
          )}

          {(view === 'signin' || view === 'register') && (
            <Field
              icon="lock"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={update('password')}
            >
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label="Toggle password visibility"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </Field>
          )}

          {view === 'reset' && (
            <Field
              icon="lock"
              type={showPassword ? 'text' : 'password'}
              placeholder="New Password"
              value={form.newPassword}
              onChange={update('newPassword')}
            >
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label="Toggle password visibility"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </Field>
          )}

          {view === 'signin' && (
            <div className="flex items-center justify-end text-sm">
              <button
                type="button"
                onClick={() => go('forgot')}
                className="text-secondary font-medium hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {(view === 'forgot' || view === 'reset') && (
            <button
              type="button"
              onClick={() => go('signin')}
              className="text-sm text-on-surface-variant hover:underline"
            >
              ← Back to sign in
            </button>
          )}

          {error && <p className="text-sm text-error">{error}</p>}
          {notice && <p className="text-sm text-green-600">{notice}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary font-bold rounded-lg py-3 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? 'Please wait…' : buttonLabels[view]}
          </button>

          <p className="text-xs text-center text-on-surface-variant">
            {USE_MOCK ? 'Mock mode — dummy base URL' : `API: ${API_BASE_URL}`}
          </p>
        </form>
      </div>
    </div>
  );
}
