const express = require('express');
const cors = require('cors');
const db = require('./data');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// ---------- helpers ----------
const ok = (res, data) => res.json({ success: true, data });
const fail = (res, status, message) => res.status(status).json({ success: false, message });

// ---------- auth (REAL SERVER CONTRACT — merged from mock-auth-server.js) ----------
// In-memory stores: users[] + resetTokens[] (resets on restart, like all demo data)
const users = [];
const resetTokens = [];

app.post('/api/auth/register', (req, res) => {
  const { fullName, email, phoneNumber, password, role = 'Doctor', clinicName, registrationNo } = req.body || {};
  if (!fullName || !email || !phoneNumber || !password) {
    return fail(res, 400, 'fullName, email, phoneNumber and password are required.');
  }
  if (users.some((u) => u.email === email)) {
    return fail(res, 409, 'An account with this email already exists.');
  }
  const userId = 'U' + (1000 + users.length + 1);
  users.push({
    userId,
    fullName,
    email,
    phoneNumber,
    role,
    clinicName: clinicName || null,
    registrationNo: registrationNo || null,
    password,
    createdAt: new Date().toISOString(),
  });
  ok(res, { userId, email, message: 'Registration successful.' });
});

app.post('/api/auth/login', (req, res) => {
  const { emailOrPhone, password } = req.body || {};
  if (!emailOrPhone || !password) return fail(res, 400, 'emailOrPhone and password are required.');
  const user = users.find(
    (u) => (u.email === emailOrPhone || u.phoneNumber === emailOrPhone) && u.password === password
  );
  if (!user) return fail(res, 401, 'Invalid email/phone or password.');
  ok(res, {
    token: 'jwt-mock-' + Date.now(),
    user: { userId: user.userId, name: user.fullName, email: user.email, role: user.role },
  });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email, client } = req.body || {};
  if (!email) return fail(res, 400, 'Email is required.');
  const user = users.find((u) => u.email === email);
  const token = 'RESET-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  if (user) resetTokens.push({ userId: user.userId, token, expiresAt: Date.now() + 15 * 60 * 1000 });
  ok(res, { message: 'Reset instructions sent.', client: client || null, devToken: token });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { userId, token, newPassword } = req.body || {};
  if (!userId || !token || !newPassword) return fail(res, 400, 'userId, token and newPassword are required.');
  const entry = resetTokens.find(
    (t) => t.userId === userId && t.token === token && t.expiresAt > Date.now()
  );
  if (!entry) return fail(res, 400, 'Invalid or expired reset token.');
  const user = users.find((u) => u.userId === userId);
  if (!user) return fail(res, 404, 'User not found.');
  user.password = newPassword;
  resetTokens.splice(resetTokens.indexOf(entry), 1);
  ok(res, { message: 'Password updated successfully.' });
});

// ---------- dashboard ----------
app.get('/api/dashboard', (req, res) => {
  ok(res, db.getDashboard());
});

// ---------- patients ----------
app.get('/api/patients', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const list = db.patients.filter((p) => p.name.toLowerCase().includes(q));
  ok(res, list);
});

app.post('/api/patients', (req, res) => {
  const { name, dob, phone, gender } = req.body || {};
  if (!name) return fail(res, 400, 'Patient name is required.');
  const patient = {
    id: 'P' + (1000 + db.patients.length + 1),
    name,
    dob: dob || '',
    phone: phone || '',
    gender: gender || '',
    createdAt: new Date().toISOString(),
  };
  db.patients.unshift(patient);
  ok(res, patient);
});

// ---------- prescriptions ----------
app.get('/api/prescriptions', (req, res) => {
  ok(res, db.prescriptions);
});

app.post('/api/prescriptions', (req, res) => {
  const { patient, vitals, medicines, status } = req.body || {};
  if (!patient || !patient.name) return fail(res, 400, 'Patient name is required.');
  const rx = {
    id: 'RX-' + (90000 + db.prescriptions.length + 1),
    patient,
    vitals: vitals || {},
    medicines: medicines || [],
    status: status || 'draft',
    date: new Date().toISOString(),
  };
  db.prescriptions.unshift(rx);
  if (rx.status === 'draft') db.stats.draftPrescriptions += 1;
  db.stats.prescriptions += 1;
  ok(res, rx);
});

// ---------- bills ----------
app.get('/api/bills', (req, res) => {
  ok(res, db.bills);
});

app.post('/api/bills', (req, res) => {
  const { patientName, items } = req.body || {};
  if (!patientName) return fail(res, 400, 'Patient name is required.');
  const total = (items || []).reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const bill = {
    id: 'INV-' + (5000 + db.bills.length + 1),
    patientName,
    items: items || [],
    total,
    status: 'unpaid',
    date: new Date().toISOString(),
  };
  db.bills.unshift(bill);
  db.stats.receipts += 1;
  ok(res, bill);
});

// ---------- settings ----------
app.get('/api/settings', (req, res) => ok(res, db.settings));

app.put('/api/settings', (req, res) => {
  db.settings = { ...db.settings, ...req.body };
  ok(res, db.settings);
});

// ---------- plans ----------
app.get('/api/plans', (req, res) => ok(res, { plans: db.plans, currentPlan: db.currentPlan }));

app.post('/api/plans/upgrade', (req, res) => {
  const { planId } = req.body || {};
  const plan = db.plans.find((p) => p.id === planId);
  if (!plan) return fail(res, 404, 'Plan not found.');
  db.currentPlan = plan.id;
  ok(res, { currentPlan: db.currentPlan });
});

// ---------- public patient booking ----------
app.get('/api/appointments/slots', (req, res) => {
  ok(res, db.appointmentSlots);
});

app.get('/api/appointments/complaints', (req, res) => {
  ok(res, db.chiefComplaints);
});

app.get('/api/appointments', (req, res) => {
  ok(res, db.getUpcomingAppointments(1000)); // full list, soonest first
});

app.post('/api/appointments/book', (req, res) => {
  const { slotId, name, phone, gender, address, complaint } = req.body || {};
  if (!slotId) return fail(res, 400, 'Please select a time slot.');
  if (!name || !phone) return fail(res, 400, 'Name and mobile number are required.');
  const result = db.bookSlot({ slotId, name, phone, gender, address, complaint });
  if (result.error) return fail(res, 409, result.error);
  ok(res, result.appointment);
});

app.get('/api/health', (req, res) => ok(res, { status: 'EaseRX API is running' }));

// ---------- real-contract mirror: /api/rx/* (patients, medicines, prescriptions, invoices,
// dashboard, appointments, public booking, settings, plans). Backed by the same in-memory store.
app.use('/api/rx', require('./rx'));

// ---------- catch-all: unknown /api routes ----------
app.use('/api', (req, res) => fail(res, 404, 'Unknown API endpoint.'));

app.listen(PORT, () => {
  console.log(`EaseRX API listening on http://localhost:${PORT}`);
});