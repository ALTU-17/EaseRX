// Local contract MIRROR for the real .NET server's /api/rx/* endpoints.
// Same paths and same DTO field names as the frontend handoff, but backed by
// the in-memory demo store (data.js). Lets the client's adapter layer be
// exercised end-to-end with USE_DEMO=false + API_BASE_URL=http://localhost:4000/api.
const express = require('express');
const db = require('./data');

const router = express.Router();
const ok = (res, data) => res.json({ success: true, data });
const fail = (res, status, message) => res.status(status).json({ success: false, message });

const pad = (n) => String(n).padStart(2, '0');
const cap = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1).toLowerCase();
const uid = () => require('crypto').randomUUID();

const PAPER_TO_SERVER = { 'A4 (210 x 297 mm)': 'A4', 'Letter (8.5 x 11 in)': 'Letter', 'A5 (148 x 210 mm)': 'A5' };
const PAPER_TO_UI = { A4: 'A4 (210 x 297 mm)', Letter: 'Letter (8.5 x 11 in)', A5: 'A5 (148 x 210 mm)' };
const APPT_STATUS_OUT = { pending: 'Scheduled', scheduled: 'Scheduled', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled', canceled: 'Cancelled' };
const APPT_STATUS_IN = { scheduled: 'pending', pending: 'pending', confirmed: 'confirmed', completed: 'completed', cancelled: 'cancelled', canceled: 'cancelled' };

function dobToIso(display) {
  if (!display) return null;
  const m = String(display).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${pad(m[1])}-${pad(m[2])}`;
  return display;
}
function dobToDisplay(iso) {
  if (!iso) return '';
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[2]}/${m[3]}/${m[1]}`;
  return iso;
}
function parseTimeToIso(date, time) {
  if (!date) return new Date().toISOString();
  if (!time) return new Date(`${date}T09:00:00`).toISOString();
  const m = String(time).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return new Date(`${date}T09:00:00`).toISOString();
  let h = Number(m[1]);
  const mer = m[3].toUpperCase();
  if (mer === 'PM' && h !== 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  return new Date(`${date}T${pad(h)}:${m[2]}:00`).toISOString();
}
function isoToParts(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return { date: '', time: '' };
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  let h = d.getHours();
  const mer = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return { date, time: `${pad(h)}:${pad(d.getMinutes())} ${mer}` };
}
function baseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

// ---------- internal → real DTO ----------
function patientOut(p) {
  return {
    id: p.id,
    fullName: p.name,
    dateOfBirth: dobToIso(p.dob),
    phone: p.phone || null,
    email: p.email || null,
    gender: p.gender || null,
    notes: p.notes || null,
    createdAt: p.createdAt || null,
  };
}
function medicineOut(m) {
  return { id: m.id, name: m.name, genericName: m.genericName || null, form: m.form || null, strength: m.strength || null, defaultSig: m.defaultSig || null, defaultDispenseQty: m.defaultDispenseQty ?? null, defaultRefills: m.defaultRefills ?? 0, isActive: m.isActive !== false };
}
function rxOut(rx) {
  return {
    id: rx.id,
    patientId: rx.patientId || null,
    patientName: rx.patient?.name || '',
    consultationDate: rx.date,
    bloodPressure: rx.vitals?.bp || null,
    temperature: rx.vitals?.temp || null,
    chiefComplaint: rx.vitals?.complaint || null,
    doctorAdvice: rx.advice || null,
    status: rx.status === 'final' ? 'Final' : 'Draft',
    medicines: (rx.medicines || []).map((m) => ({ medicineId: m.medicineId || null, medicineName: m.name, sig: m.sig || null, dispenseQty: Number(m.dispense) || 0, refills: Number(m.refills) || 0 })),
    createdAt: rx.date,
  };
}
function invoiceOut(b) {
  return {
    id: b.id,
    invoiceNumber: b.number || b.id,
    patientId: b.patientId || null,
    patientName: b.patientName,
    invoiceDate: b.date,
    items: (b.items || []).map((i) => ({ description: i.label, amount: i.amount, quantity: i.quantity || 1 })),
    subtotal: b.total,
    total: b.total,
    paidAmount: b.paidAmount || 0,
    status: cap(b.status === 'partial' ? 'Partial' : b.status === 'paid' ? 'Paid' : 'Unpaid'),
    notes: b.notes || null,
  };
}
function apptOut(a) {
  return {
    id: a.id,
    patientId: a.patientId || null,
    patientName: a.name,
    phone: a.phone || null,
    gender: a.gender || null,
    email: a.email || null,
    startAt: parseTimeToIso(a.date, a.time),
    endAt: null,
    reason: a.complaint || null,
    status: APPT_STATUS_OUT[a.status] || 'Scheduled',
    notes: a.address || null,
  };
}
function planOut(p) {
  return { id: p.id, name: p.name, price: p.price, tagline: p.tagline, popular: !!p.popular, features: p.features };
}
function settingsOut() {
  const s = db.settings;
  return {
    firstName: s.firstName, lastName: s.lastName,
    registrationNo: s.licenseNumber || null, npiNumber: s.npi || null, stateOfLicensure: s.state || null,
    qualification: s.qualification || null, specialization: s.specialization || null,
    isVerified: !!s.verified,
    clinicName: s.clinic.name, address: s.clinic.address, phone: s.clinic.phone, email: s.clinic.email || null,
    pdfTopMarginMm: s.pdf.marginTop, pdfBottomMarginMm: s.pdf.marginBottom,
    pdfLeftMarginMm: s.pdf.marginLeft, pdfRightMarginMm: s.pdf.marginRight,
    pdfPrintScale: s.pdf.scale, pdfPaperSize: PAPER_TO_SERVER[s.pdf.paperSize] || s.pdf.paperSize || 'A4',
    pdfIncludeLogo: s.pdf.includeClinicLogo !== false,
    pdfIncludeSignature: s.pdf.includeSignature !== false,
    pdfAddWatermark: !!s.pdf.addWatermark,
  };
}
const page = (items, pageNum, pageSize) => ({ items, total: items.length, page: pageNum, pageSize });

// ---------- dashboard ----------
router.get('/dashboard', (req, res) => {
  const d = db.getDashboard();
  const plan = db.plans.find((p) => p.id === db.currentPlan);
  ok(res, {
    clinicName: db.settings.clinic.name,
    doctorName: `${db.settings.firstName} ${db.settings.lastName}`.trim(),
    patients: { value: d.stats.patients, percentChange: 12 },
    prescriptions: { value: d.stats.prescriptions, percentChange: 5 },
    receipts: { value: d.stats.receipts, percentChange: -2 },
    revenue: { value: d.stats.revenue, percentChange: 18 },
    draftPrescriptionsCount: d.stats.draftPrescriptions,
    todayAppointmentsCount: d.stats.todaysAppointments,
    recentActivity: d.recentActivity,
    newPatients: d.newPatients.map(patientOut),
    upcomingPatients: d.upcomingAppointments.map(apptOut),
    revenueTrend: d.revenueTrend,
    bookingLink: `${baseUrl(req)}/book/clinic-demo-1`,
    plan: { name: plan?.name || 'Basic', isActive: true, message: 'Upgrade for advanced features.' },
  });
});

// ---------- patients ----------
router.get('/patients', (req, res) => {
  const search = String(req.query.search || '').toLowerCase();
  const pageNum = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;
  const list = db.patients.filter((p) => p.name.toLowerCase().includes(search)).map(patientOut);
  ok(res, page(list, pageNum, pageSize));
});

router.post('/patients', (req, res) => {
  const dto = req.body || {};
  if (!dto.fullName) return fail(res, 400, 'Patient full name is required.');
  const patient = {
    id: uid(),
    name: dto.fullName,
    dob: dobToDisplay(dto.dateOfBirth),
    phone: dto.phone || '',
    email: dto.email || '',
    gender: dto.gender || '',
    notes: dto.notes || '',
    createdAt: new Date().toISOString(),
  };
  db.patients.unshift(patient);
  ok(res, patientOut(patient));
});

router.get('/patients/:id', (req, res) => {
  const p = db.patients.find((x) => x.id === req.params.id);
  if (!p) return fail(res, 404, 'Patient not found.');
  ok(res, patientOut(p));
});

router.put('/patients/:id', (req, res) => {
  const p = db.patients.find((x) => x.id === req.params.id);
  if (!p) return fail(res, 404, 'Patient not found.');
  const dto = req.body || {};
  p.name = dto.fullName ?? p.name;
  p.dob = dto.dateOfBirth !== undefined ? dobToDisplay(dto.dateOfBirth) : p.dob;
  p.phone = dto.phone ?? p.phone;
  p.email = dto.email ?? p.email;
  p.gender = dto.gender ?? p.gender;
  p.notes = dto.notes ?? p.notes;
  ok(res, patientOut(p));
});

router.delete('/patients/:id', (req, res) => {
  const i = db.patients.findIndex((x) => x.id === req.params.id);
  if (i === -1) return fail(res, 404, 'Patient not found.');
  db.patients.splice(i, 1);
  ok(res, { id: req.params.id });
});

// ---------- medicines ----------
router.get('/medicines', (req, res) => {
  const search = String(req.query.search || '').toLowerCase();
  const pageNum = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 50;
  const list = db.medicines.filter((m) => m.name.toLowerCase().includes(search)).map(medicineOut);
  ok(res, page(list, pageNum, pageSize));
});

router.post('/medicines', (req, res) => {
  const dto = req.body || {};
  if (!dto.name) return fail(res, 400, 'Medicine name is required.');
  const med = {
    id: uid(),
    name: dto.name,
    genericName: dto.genericName || '',
    form: dto.form || '',
    strength: dto.strength || '',
    defaultSig: dto.defaultSig || '',
    defaultDispenseQty: dto.defaultDispenseQty ?? '',
    defaultRefills: dto.defaultRefills ?? 0,
    isActive: dto.isActive !== false,
  };
  db.medicines.unshift(med);
  ok(res, medicineOut(med));
});

router.get('/medicines/:id', (req, res) => {
  const m = db.medicines.find((x) => x.id === req.params.id);
  if (!m) return fail(res, 404, 'Medicine not found.');
  ok(res, medicineOut(m));
});

router.put('/medicines/:id', (req, res) => {
  const m = db.medicines.find((x) => x.id === req.params.id);
  if (!m) return fail(res, 404, 'Medicine not found.');
  const dto = req.body || {};
  Object.assign(m, {
    name: dto.name ?? m.name,
    genericName: dto.genericName ?? m.genericName,
    form: dto.form ?? m.form,
    strength: dto.strength ?? m.strength,
    defaultSig: dto.defaultSig ?? m.defaultSig,
    defaultDispenseQty: dto.defaultDispenseQty ?? m.defaultDispenseQty,
    defaultRefills: dto.defaultRefills ?? m.defaultRefills,
    isActive: dto.isActive ?? m.isActive,
  });
  ok(res, medicineOut(m));
});

router.delete('/medicines/:id', (req, res) => {
  const i = db.medicines.findIndex((x) => x.id === req.params.id);
  if (i === -1) return fail(res, 404, 'Medicine not found.');
  db.medicines.splice(i, 1);
  ok(res, { id: req.params.id });
});

// ---------- prescriptions ----------
router.get('/prescriptions', (req, res) => {
  const search = String(req.query.search || '').toLowerCase();
  const status = String(req.query.status || '').toLowerCase();
  const pageNum = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;
  const list = db.prescriptions
    .filter((rx) => !status || rx.status === status)
    .filter((rx) => !search || (rx.patient?.name || '').toLowerCase().includes(search))
    .map(rxOut);
  ok(res, page(list, pageNum, pageSize));
});

router.post('/prescriptions', (req, res) => {
  const dto = req.body || {};
  if (!dto.patientId && !dto.patient) return fail(res, 400, 'A patient is required.');
  const rx = {
    id: 'RX-' + (90000 + db.prescriptions.length + 1),
    patientId: dto.patientId || null,
    patient: dto.patient
      ? { name: dto.patient.fullName, dob: dobToDisplay(dto.patient.dateOfBirth), phone: dto.patient.phone || '', gender: dto.patient.gender || '' }
      : { name: db.patients.find((p) => p.id === dto.patientId)?.name || 'Unknown' },
    vitals: { bp: dto.bloodPressure || '', temp: dto.temperature || '', complaint: dto.chiefComplaint || '' },
    advice: dto.doctorAdvice || '',
    medicines: (dto.medicines || []).map((m) => ({ medicineId: m.medicineId || null, name: m.medicineName, sig: m.sig || '', dispense: m.dispenseQty ?? '', refills: m.refills ?? 0 })),
    status: String(dto.status || 'Draft').toLowerCase() === 'final' ? 'final' : 'draft',
    date: dto.consultationDate ? new Date(dto.consultationDate).toISOString() : new Date().toISOString(),
  };
  db.prescriptions.unshift(rx);
  if (rx.status === 'draft') db.stats.draftPrescriptions += 1;
  db.stats.prescriptions += 1;
  ok(res, rxOut(rx));
});

router.get('/prescriptions/:id', (req, res) => {
  const rx = db.prescriptions.find((x) => x.id === req.params.id);
  if (!rx) return fail(res, 404, 'Prescription not found.');
  ok(res, rxOut(rx));
});

router.put('/prescriptions/:id', (req, res) => {
  const rx = db.prescriptions.find((x) => x.id === req.params.id);
  if (!rx) return fail(res, 404, 'Prescription not found.');
  const dto = req.body || {};
  const nextStatus = String(dto.status || 'Draft').toLowerCase() === 'final' ? 'final' : 'draft';
  if (rx.status === 'draft' && nextStatus === 'final') db.stats.draftPrescriptions = Math.max(0, db.stats.draftPrescriptions - 1);
  if (rx.status === 'final' && nextStatus === 'draft') db.stats.draftPrescriptions += 1;
  rx.vitals = { bp: dto.bloodPressure || '', temp: dto.temperature || '', complaint: dto.chiefComplaint || '' };
  rx.advice = dto.doctorAdvice || '';
  rx.status = nextStatus;
  if (dto.medicines) rx.medicines = dto.medicines.map((m) => ({ medicineId: m.medicineId || null, name: m.medicineName, sig: m.sig || '', dispense: m.dispenseQty ?? '', refills: m.refills ?? 0 }));
  ok(res, rxOut(rx));
});

router.delete('/prescriptions/:id', (req, res) => {
  const i = db.prescriptions.findIndex((x) => x.id === req.params.id);
  if (i === -1) return fail(res, 404, 'Prescription not found.');
  const [rx] = db.prescriptions.splice(i, 1);
  if (rx.status === 'draft') db.stats.draftPrescriptions = Math.max(0, db.stats.draftPrescriptions - 1);
  db.stats.prescriptions = Math.max(0, db.stats.prescriptions - 1);
  ok(res, { id: req.params.id });
});

// ---------- invoices ----------
router.get('/invoices', (req, res) => {
  const status = String(req.query.status || '').toLowerCase();
  const search = String(req.query.search || '').toLowerCase();
  const pageNum = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;
  const list = db.bills
    .filter((b) => !status || b.status === status)
    .filter((b) => !search || (b.patientName || '').toLowerCase().includes(search))
    .map(invoiceOut);
  ok(res, page(list, pageNum, pageSize));
});

function createInvoice(items, patientName, patientId, notes) {
  const clean = (items || []).map((i) => ({ label: i.description ?? i.label, amount: Number(i.amount) || 0, quantity: Number(i.quantity) || 1 }));
  const total = clean.reduce((s, i) => s + i.amount * i.quantity, 0);
  const bill = {
    id: uid(),
    number: 'INV-' + (5000 + db.bills.length + 1),
    patientId: patientId || null,
    patientName: patientName || 'Walk-in',
    items: clean,
    total,
    paidAmount: 0,
    status: 'unpaid',
    notes: notes || '',
    date: new Date().toISOString(),
  };
  db.bills.unshift(bill);
  db.stats.receipts += 1;
  return bill;
}

router.post('/invoices', (req, res) => {
  const dto = req.body || {};
  const patientName = dto.patient?.fullName || db.patients.find((p) => p.id === dto.patientId)?.name || 'Walk-in';
  ok(res, invoiceOut(createInvoice(dto.items, patientName, dto.patientId, dto.notes)));
});

router.post('/invoices/from-prescription/:prescriptionId', (req, res) => {
  const rx = db.prescriptions.find((x) => x.id === req.params.prescriptionId);
  if (!rx) return fail(res, 404, 'Prescription not found.');
  const dto = req.body || {};
  const items = [
    { description: 'Consultation', amount: dto.consultationFee ?? 500, quantity: 1 },
    ...(dto.extraItems || []).map((e) => ({ description: e.description, amount: Number(e.amount) || 0, quantity: Number(e.quantity) || 1 })),
  ];
  ok(res, invoiceOut(createInvoice(items, rx.patient?.name, rx.patientId, dto.notes)));
});

// NOTE: register before /invoices/:id so the literal path wins
router.put('/invoices/:id/payment', (req, res) => {
  const bill = db.bills.find((b) => b.id === req.params.id);
  if (!bill) return fail(res, 404, 'Invoice not found.');
  const dto = req.body || {};
  if (dto.paidAmount !== undefined) bill.paidAmount = Number(dto.paidAmount) || 0;
  if (dto.status) bill.status = String(dto.status).toLowerCase();
  else bill.status = bill.paidAmount >= bill.total ? 'paid' : bill.paidAmount > 0 ? 'partial' : 'unpaid';
  ok(res, invoiceOut(bill));
});

router.get('/invoices/:id', (req, res) => {
  const bill = db.bills.find((b) => b.id === req.params.id);
  if (!bill) return fail(res, 404, 'Invoice not found.');
  ok(res, invoiceOut(bill));
});

router.delete('/invoices/:id', (req, res) => {
  const i = db.bills.findIndex((b) => b.id === req.params.id);
  if (i === -1) return fail(res, 404, 'Invoice not found.');
  db.bills.splice(i, 1);
  db.stats.receipts = Math.max(0, db.stats.receipts - 1);
  ok(res, { id: req.params.id });
});

// ---------- appointments ----------
router.get('/appointments/booking-info', (req, res) => {
  ok(res, { clinicId: 'clinic-demo-1', clinicName: db.settings.clinic.name, bookingLink: `${baseUrl(req)}/book/clinic-demo-1` });
});

router.get('/appointments', (req, res) => {
  const status = String(req.query.status || '').toLowerCase();
  const pageNum = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 100;
  const list = db.bookedAppointments
    .filter((a) => !status || (APPT_STATUS_OUT[a.status] || 'Scheduled').toLowerCase() === status)
    .sort((a, b) => parseTimeToIso(a.date, a.time).localeCompare(parseTimeToIso(b.date, b.time)))
    .map(apptOut);
  ok(res, page(list, pageNum, pageSize));
});

router.post('/appointments', (req, res) => {
  const dto = req.body || {};
  if (!dto.patientName || !dto.startAt) return fail(res, 400, 'patientName and startAt are required.');
  const { date, time } = isoToParts(dto.startAt);
  const appt = {
    id: 'APT-' + (2000 + db.bookedAppointments.length + 1),
    patientId: dto.patientId || null,
    date,
    time,
    name: dto.patientName,
    phone: dto.phone || '',
    gender: dto.gender || '',
    email: dto.email || '',
    address: dto.notes || '',
    complaint: dto.reason || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  db.bookedAppointments.push(appt);
  db.stats.todaysAppointments += 1;
  ok(res, apptOut(appt));
});

router.get('/appointments/:id', (req, res) => {
  const a = db.bookedAppointments.find((x) => x.id === req.params.id);
  if (!a) return fail(res, 404, 'Appointment not found.');
  ok(res, apptOut(a));
});

router.put('/appointments/:id', (req, res) => {
  const a = db.bookedAppointments.find((x) => x.id === req.params.id);
  if (!a) return fail(res, 404, 'Appointment not found.');
  const dto = req.body || {};
  if (dto.startAt) {
    const { date, time } = isoToParts(dto.startAt);
    a.date = date;
    a.time = time;
  }
  a.name = dto.patientName ?? a.name;
  a.phone = dto.phone ?? a.phone;
  a.gender = dto.gender ?? a.gender;
  a.address = dto.notes ?? a.address;
  a.complaint = dto.reason ?? a.complaint;
  if (dto.status) a.status = APPT_STATUS_IN[String(dto.status).toLowerCase()] || a.status;
  ok(res, apptOut(a));
});

router.post('/appointments/:id/cancel', (req, res) => {
  const a = db.bookedAppointments.find((x) => x.id === req.params.id);
  if (!a) return fail(res, 404, 'Appointment not found.');
  a.status = 'cancelled';
  ok(res, apptOut(a));
});

// ---------- public booking ----------
router.get('/public/booking/:clinicId', (req, res) => {
  ok(res, { clinicId: req.params.clinicId, clinicName: db.settings.clinic.name, bookingLink: `${baseUrl(req)}/book/${req.params.clinicId}` });
});

router.post('/public/booking/:clinicId', (req, res) => {
  const dto = req.body || {};
  if (!dto.patientName || !dto.startAt) return fail(res, 400, 'patientName and startAt are required.');
  const { date, time } = isoToParts(dto.startAt);
  const appt = {
    id: 'APT-' + (2000 + db.bookedAppointments.length + 1),
    date,
    time,
    name: dto.patientName,
    phone: dto.phone || '',
    gender: dto.gender || '',
    email: dto.email || '',
    address: dto.notes || '',
    complaint: dto.reason || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  db.bookedAppointments.push(appt);
  db.stats.todaysAppointments += 1;
  ok(res, apptOut(appt));
});

// ---------- settings ----------
router.get('/settings', (req, res) => ok(res, settingsOut()));

router.put('/settings/profile', (req, res) => {
  const dto = req.body || {};
  const s = db.settings;
  s.firstName = dto.firstName ?? s.firstName;
  s.lastName = dto.lastName ?? s.lastName;
  s.licenseNumber = dto.registrationNo ?? s.licenseNumber;
  s.npi = dto.npiNumber ?? s.npi;
  s.state = dto.stateOfLicensure ?? s.state;
  s.qualification = dto.qualification ?? s.qualification;
  s.specialization = dto.specialization ?? s.specialization;
  ok(res, settingsOut());
});

router.post('/settings/profile/submit-verification', (req, res) => {
  db.settings.verified = true;
  ok(res, settingsOut());
});

router.put('/settings/pdf', (req, res) => {
  const dto = req.body || {};
  const s = db.settings;
  s.clinic = {
    ...s.clinic,
    address: dto.address ?? s.clinic.address,
    phone: dto.phone ?? s.clinic.phone,
    email: dto.email ?? s.clinic.email,
  };
  s.pdf = {
    ...s.pdf,
    marginTop: dto.pdfTopMarginMm ?? s.pdf.marginTop,
    marginBottom: dto.pdfBottomMarginMm ?? s.pdf.marginBottom,
    marginLeft: dto.pdfLeftMarginMm ?? s.pdf.marginLeft,
    marginRight: dto.pdfRightMarginMm ?? s.pdf.marginRight,
    scale: dto.pdfPrintScale ?? s.pdf.scale,
    paperSize: PAPER_TO_UI[dto.pdfPaperSize] ?? s.pdf.paperSize,
    includeClinicLogo: dto.pdfIncludeLogo ?? s.pdf.includeClinicLogo,
    includeSignature: dto.pdfIncludeSignature ?? s.pdf.includeSignature,
    addWatermark: dto.pdfAddWatermark ?? s.pdf.addWatermark,
  };
  ok(res, settingsOut());
});

router.post('/settings/pdf/reset', (req, res) => {
  db.settings.pdf = {
    marginTop: 15, marginBottom: 15, marginLeft: 20, marginRight: 20, scale: 100,
    paperSize: 'A4 (210 x 297 mm)', includeClinicLogo: true, includeSignature: true, addWatermark: false,
  };
  ok(res, settingsOut());
});

// ---------- plans ----------
router.get('/plans', (req, res) => {
  ok(res, { plans: db.plans.map(planOut), currentPlan: { planId: db.currentPlan, name: db.plans.find((p) => p.id === db.currentPlan)?.name || '' } });
});

router.get('/plans/current', (req, res) => {
  ok(res, { planId: db.currentPlan, name: db.plans.find((p) => p.id === db.currentPlan)?.name || '' });
});

router.post('/plans/upgrade', (req, res) => {
  const { planId } = req.body || {};
  if (!db.plans.some((p) => p.id === planId)) return fail(res, 404, 'Plan not found.');
  db.currentPlan = planId;
  ok(res, { planId: db.currentPlan });
});

module.exports = router;
