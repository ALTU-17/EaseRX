import { API_BASE_URL, USE_PROXY, MOCK_BASE_URL, USE_MOCK } from './config.js';

// Resolution order: Vite proxy (relative '/api' base) → dummy-base mock → real API base.
const BASE = USE_MOCK ? MOCK_BASE_URL : API_BASE_URL;
const PREFIX = USE_PROXY ? '/api' : BASE;

async function request(path, options = {}) {
  const res = await fetch(`${PREFIX}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.message || json.error || 'Something went wrong. Please try again.');
  }
  return json.data ?? json;
}

export const api = {
  // ---------- Real Auth APIs (server contract) ----------
  // POST /api/auth/register
  register: (payload) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

  // POST /api/auth/login — note: emailOrPhone (not email)
  login: (emailOrPhone, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ emailOrPhone, password }) }),

  // POST /api/auth/forgot-password — client is fixed to 'easeRX'
  forgotPassword: (email) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email, client: 'easeRX' }) }),

  // POST /api/auth/reset-password
  resetPassword: (userId, token, newPassword) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ userId, token, newPassword }) }),

  // ---------- Demo features (mock server / proxy) ----------
  getDashboard: () => request('/dashboard'),
  getPatients: (q = '') => request(`/patients?q=${encodeURIComponent(q)}`),
  addPatient: (patient) => request('/patients', { method: 'POST', body: JSON.stringify(patient) }),
  getPrescriptions: () => request('/prescriptions'),
  addPrescription: (rx) => request('/prescriptions', { method: 'POST', body: JSON.stringify(rx) }),
  getBills: () => request('/bills'),
  addBill: (bill) => request('/bills', { method: 'POST', body: JSON.stringify(bill) }),
  getSettings: () => request('/settings'),
  updateSettings: (settings) => request('/settings', { method: 'PUT', body: JSON.stringify(settings) }),
  getPlans: () => request('/plans'),
  upgradePlan: (planId) => request('/plans/upgrade', { method: 'POST', body: JSON.stringify({ planId }) }),
  getAppointments: () => request('/appointments'),
  getSlots: () => request('/appointments/slots'),
  getComplaints: () => request('/appointments/complaints'),
  bookAppointment: (payload) =>
    request('/appointments/book', { method: 'POST', body: JSON.stringify(payload) }),
};
