import { API_BASE_URL, USE_PROXY, MOCK_BASE_URL, USE_MOCK, USE_DEMO, CLIENT_ID } from './config.js';
import * as demo from './demoData.js';
import { slotToIso } from './bookingSlots.js';

// Resolution order: demo (client-side static) → real/mirror HTTP API.
const PREFIX = USE_PROXY ? '/api' : API_BASE_URL.startsWith('http') ? API_BASE_URL : MOCK_BASE_URL;

function authToken() {
  try {
    return localStorage.getItem('easerx_token') || '';
  } catch {
    return '';
  }
}

async function request(path, options = {}) {
  const token = authToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${PREFIX}${path}`, { headers, ...options });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.message || json.error || json.title || 'Something went wrong. Please try again.');
  }
  return json.data ?? json;
}

// Demo mode: resolve instantly from the client-side store (async shape preserved).
function demoRequest(fn) {
  return async (...args) => {
    await new Promise((r) => setTimeout(r, 120)); // tiny delay so loaders feel real
    return fn(...args);
  };
}

// ---------- shared helpers ----------
const pad = (n) => String(n).padStart(2, '0');

function toDisplayDob(value) {
  if (!value) return '';
  const s = String(value);
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[2]}/${iso[3]}/${iso[1]}`;
  return s; // already mm/dd/yyyy
}

function toIsoDob(value) {
  if (!value) return null;
  const s = String(value).trim();
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) return `${us[3]}-${pad(us[1])}-${pad(us[2])}`;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  return isNaN(d) ? null : d.toISOString().slice(0, 10);
}

// ISO datetime → local YYYY-MM-DD
function dateOnly(value) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d)) return String(value).slice(0, 10);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ISO datetime → 'hh:mm AM'
function timeLabel(value) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d)) return '';
  let h = d.getHours();
  const m = d.getMinutes();
  const mer = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${pad(h)}:${pad(m)} ${mer}`;
}

const APPT_STATUS_TO_UI = {
  scheduled: 'pending',
  pending: 'pending',
  confirmed: 'confirmed',
  completed: 'completed',
  cancelled: 'cancelled',
  canceled: 'cancelled',
  noshow: 'cancelled',
};
const APPT_STATUS_TO_SERVER = {
  pending: 'Scheduled',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const PAPER_TO_UI = { A4: 'A4 (210 x 297 mm)', Letter: 'Letter (8.5 x 11 in)', A5: 'A5 (148 x 210 mm)' };
const PAPER_TO_SERVER = { 'A4 (210 x 297 mm)': 'A4', 'Letter (8.5 x 11 in)': 'Letter', 'A5 (148 x 210 mm)': 'A5' };

function num(v, fallback = 0) {
  if (v && typeof v === 'object') return v.value ?? fallback;
  return v ?? fallback;
}

// list responses may be an array, {items}, or {data}
function asList(body) {
  if (Array.isArray(body)) return body;
  return body?.items ?? body?.data ?? body?.results ?? [];
}

// ---------- mappers: real DTO ↔ UI model ----------
function mapPatient(row) {
  if (!row) return row;
  return {
    id: row.id ?? row.patientId,
    name: row.fullName ?? row.name ?? '',
    dob: toDisplayDob(row.dateOfBirth ?? row.dob),
    phone: row.phone ?? '',
    email: row.email ?? '',
    gender: row.gender ?? '',
    notes: row.notes ?? '',
    createdAt: row.createdAt ?? '',
  };
}

function toPatientDto(ui) {
  return {
    fullName: ui.name,
    dateOfBirth: toIsoDob(ui.dob),
    phone: ui.phone || null,
    email: ui.email || null,
    gender: ui.gender || null,
    notes: ui.notes || null,
  };
}

function mapMedicine(row) {
  if (!row) return row;
  return {
    id: row.id ?? row.medicineId,
    name: row.name ?? '',
    genericName: row.genericName ?? '',
    form: row.form ?? '',
    strength: row.strength ?? '',
    defaultSig: row.defaultSig ?? '',
    defaultDispenseQty: row.defaultDispenseQty ?? '',
    defaultRefills: row.defaultRefills ?? 0,
    isActive: row.isActive ?? true,
  };
}

function toMedicineDto(ui) {
  return {
    name: ui.name,
    genericName: ui.genericName || null,
    form: ui.form || null,
    strength: ui.strength || null,
    defaultSig: ui.defaultSig || null,
    defaultDispenseQty: ui.defaultDispenseQty === '' || ui.defaultDispenseQty == null ? null : Number(ui.defaultDispenseQty),
    defaultRefills: ui.defaultRefills === '' || ui.defaultRefills == null ? 0 : Number(ui.defaultRefills),
    isActive: ui.isActive !== false,
  };
}

function mapPrescription(row) {
  if (!row) return row;
  return {
    id: row.id ?? row.prescriptionId,
    patientId: row.patientId ?? null,
    patient: {
      name: row.patientName ?? row.patient?.name ?? 'Unknown',
      dob: toDisplayDob(row.patientDob ?? row.patient?.dob),
      phone: row.patientPhone ?? row.patient?.phone ?? '',
      gender: row.patientGender ?? row.patient?.gender ?? '',
    },
    vitals: {
      bp: row.bloodPressure ?? row.vitals?.bp ?? '',
      temp: row.temperature ?? row.vitals?.temp ?? '',
      complaint: row.chiefComplaint ?? row.vitals?.complaint ?? '',
    },
    advice: row.doctorAdvice ?? row.advice ?? '',
    medicines: (row.medicines || []).map((m) => ({
      medicineId: m.medicineId ?? null,
      name: m.medicineName ?? m.name ?? '',
      sig: m.sig ?? '',
      dispense: m.dispenseQty ?? m.dispense ?? '',
      refills: m.refills ?? 0,
    })),
    status: String(row.status || 'Draft').toLowerCase() === 'final' ? 'final' : 'draft',
    date: row.consultationDate ?? row.createdAt ?? row.date ?? new Date().toISOString(),
  };
}

function toPrescriptionDto(ui) {
  const dto = {
    consultationDate: ui.consultationDate || new Date().toISOString().slice(0, 10),
    bloodPressure: ui.vitals?.bp || null,
    temperature: ui.vitals?.temp || null,
    chiefComplaint: ui.vitals?.complaint || null,
    doctorAdvice: ui.advice || null,
    status: ui.status === 'final' ? 'Final' : 'Draft',
    generateBill: !!ui.generateBill,
    medicines: (ui.medicines || [])
      .filter((m) => m.name)
      .map((m) => ({
        medicineId: m.medicineId || null,
        medicineName: m.name,
        sig: m.sig || null,
        dispenseQty: Number(m.dispense) || 0,
        refills: Number(m.refills) || 0,
      })),
  };
  if (ui.patientId) dto.patientId = ui.patientId;
  else if (ui.patient?.name) dto.patient = toPatientDto(ui.patient);
  return dto;
}

function toPrescriptionUpdateDto(ui) {
  return {
    consultationDate: ui.consultationDate || dateOnly(ui.date) || new Date().toISOString().slice(0, 10),
    bloodPressure: ui.vitals?.bp || null,
    temperature: ui.vitals?.temp || null,
    chiefComplaint: ui.vitals?.complaint || null,
    doctorAdvice: ui.advice || null,
    status: ui.status === 'final' ? 'Final' : 'Draft',
    generateBill: !!ui.generateBill,
    medicines: (ui.medicines || [])
      .filter((m) => m.name)
      .map((m) => ({
        medicineId: m.medicineId || null,
        medicineName: m.name,
        sig: m.sig || null,
        dispenseQty: Number(m.dispense) || 0,
        refills: Number(m.refills) || 0,
      })),
  };
}

function mapInvoice(row) {
  if (!row) return row;
  const total = row.total ?? row.subtotal ?? (row.items || []).reduce((s, i) => s + Number(i.amount || 0) * (i.quantity || 1), 0);
  return {
    id: row.id ?? row.invoiceId,
    number: row.invoiceNumber ?? row.number ?? row.id ?? '',
    patientId: row.patientId ?? null,
    patientName: row.patientName ?? row.patient?.fullName ?? row.patient?.name ?? 'Walk-in',
    items: (row.items || []).map((i) => ({
      label: i.description ?? i.label ?? '',
      amount: i.amount ?? 0,
      quantity: i.quantity ?? 1,
    })),
    total,
    paidAmount: row.paidAmount ?? 0,
    status: String(row.status || 'Unpaid').toLowerCase(),
    date: row.invoiceDate ?? row.createdAt ?? row.date ?? new Date().toISOString(),
  };
}

function toInvoiceDto(ui) {
  const dto = {
    invoiceDate: ui.invoiceDate || new Date().toISOString().slice(0, 10),
    items: (ui.items || [])
      .filter((i) => i.label)
      .map((i) => ({ description: i.label, amount: Number(i.amount) || 0, quantity: Number(i.quantity) || 1 })),
    paidAmount: 0,
    notes: ui.notes || null,
  };
  if (ui.patientId) dto.patientId = ui.patientId;
  else if (ui.patientName) dto.patient = { fullName: ui.patientName };
  return dto;
}

function mapAppointment(row) {
  if (!row) return row;
  return {
    id: row.id ?? row.appointmentId,
    patientId: row.patientId ?? null,
    name: row.patientName ?? row.name ?? '',
    phone: row.phone ?? '',
    gender: row.gender ?? '',
    email: row.email ?? '',
    date: dateOnly(row.startAt ?? row.date),
    time: timeLabel(row.startAt) || row.time || '',
    complaint: row.reason ?? row.complaint ?? '',
    notes: row.notes ?? '',
    status: APPT_STATUS_TO_UI[String(row.status || 'scheduled').toLowerCase()] || 'pending',
  };
}

function toAppointmentCreateDto(a) {
  return {
    patientId: a.patientId || null,
    patientName: a.name,
    phone: a.phone || null,
    gender: a.gender || null,
    email: a.email || null,
    startAt: slotToIso(a.date, a.time),
    endAt: null,
    reason: a.complaint || null,
    notes: a.notes || null,
  };
}

function toAppointmentUpdateDto(a) {
  return {
    patientName: a.name,
    phone: a.phone || null,
    gender: a.gender || null,
    startAt: slotToIso(a.date, a.time),
    endAt: null,
    reason: a.complaint || null,
    status: APPT_STATUS_TO_SERVER[a.status] || 'Scheduled',
    notes: a.notes || null,
  };
}

function mapDashboard(row) {
  return {
    stats: {
      patients: num(row.patients),
      prescriptions: num(row.prescriptions),
      receipts: num(row.receipts),
      revenue: num(row.revenue),
      draftPrescriptions: row.draftPrescriptionsCount ?? row.draftPrescriptions ?? 0,
      todaysAppointments: row.todayAppointmentsCount ?? row.todaysAppointments ?? 0,
    },
    revenueTrend: row.revenueTrend || [],
    recentActivity: row.recentActivity || [],
    newPatients: asList(row.newPatients).map(mapPatient),
    upcomingAppointments: asList(row.upcomingAppointments ?? row.upcomingPatients).map(mapAppointment),
    clinicName: row.clinicName ?? '',
    doctorName: row.doctorName ?? '',
    bookingLink: row.bookingLink ?? '',
    plan: row.plan ?? null,
  };
}

function mapSettings(row) {
  const r = row || {};
  const pdf = r.pdf || {};
  return {
    firstName: r.firstName ?? '',
    lastName: r.lastName ?? '',
    licenseNumber: r.registrationNo ?? r.licenseNumber ?? '',
    npi: r.npiNumber ?? r.npi ?? '',
    state: r.stateOfLicensure ?? r.state ?? '',
    qualification: r.qualification ?? '',
    specialization: r.specialization ?? '',
    verified: r.isVerified ?? r.verified ?? false,
    clinic: {
      name: r.clinicName ?? r.clinic?.name ?? 'EaseRX',
      address: r.address ?? r.clinic?.address ?? '',
      phone: r.phone ?? r.clinic?.phone ?? '',
      email: r.email ?? r.clinic?.email ?? '',
    },
    pdf: {
      marginTop: r.pdfTopMarginMm ?? pdf.marginTop ?? 15,
      marginBottom: r.pdfBottomMarginMm ?? pdf.marginBottom ?? 15,
      marginLeft: r.pdfLeftMarginMm ?? pdf.marginLeft ?? 20,
      marginRight: r.pdfRightMarginMm ?? pdf.marginRight ?? 20,
      scale: r.pdfPrintScale ?? pdf.scale ?? 100,
      paperSize: PAPER_TO_UI[r.pdfPaperSize] ?? pdf.paperSize ?? 'A4 (210 x 297 mm)',
      includeClinicLogo: r.pdfIncludeLogo ?? pdf.includeClinicLogo ?? true,
      includeSignature: r.pdfIncludeSignature ?? pdf.includeSignature ?? true,
      addWatermark: r.pdfAddWatermark ?? pdf.addWatermark ?? false,
    },
  };
}

function toProfileDto(settings) {
  return {
    firstName: settings.firstName ?? null,
    lastName: settings.lastName ?? null,
    registrationNo: settings.licenseNumber ?? null,
    npiNumber: settings.npi ?? null,
    stateOfLicensure: settings.state ?? null,
    qualification: settings.qualification ?? null,
    specialization: settings.specialization ?? null,
  };
}

function toPdfDto(settings) {
  const pdf = settings.pdf || {};
  return {
    address: settings.clinic?.address ?? null,
    phone: settings.clinic?.phone ?? null,
    email: settings.clinic?.email ?? null,
    pdfTopMarginMm: Number(pdf.marginTop) || 15,
    pdfBottomMarginMm: Number(pdf.marginBottom) || 15,
    pdfLeftMarginMm: Number(pdf.marginLeft) || 20,
    pdfRightMarginMm: Number(pdf.marginRight) || 20,
    pdfPrintScale: Number(pdf.scale) || 100,
    pdfPaperSize: PAPER_TO_SERVER[pdf.paperSize] || pdf.paperSize || 'A4',
    pdfIncludeLogo: pdf.includeClinicLogo !== false,
    pdfIncludeSignature: pdf.includeSignature !== false,
    pdfAddWatermark: !!pdf.addWatermark,
  };
}

function mapPlan(row) {
  return {
    id: row.id ?? row.planId,
    name: row.name ?? 'Plan',
    price: row.price ?? row.monthlyPrice ?? 0,
    tagline: row.tagline ?? row.description ?? '',
    popular: row.popular ?? row.isPopular ?? false,
    features: (row.features || []).map((f) =>
      typeof f === 'string' ? { text: f, included: true } : { text: f.text ?? f.name ?? f.title ?? '', included: f.included ?? true }
    ),
  };
}

function currentPlanId(body) {
  const cp = body?.currentPlan ?? body?.subscription ?? body?.current;
  if (!cp) return '';
  if (typeof cp === 'string') return cp;
  return cp.planId ?? cp.id ?? cp.plan?.id ?? '';
}

// ---------- real API (thin funcs so the object can reference them) ----------
const real = {
  getDashboard: async () => mapDashboard(await request('/rx/dashboard')),

  getPatients: async (q = '') =>
    asList(await request(`/rx/patients?search=${encodeURIComponent(q)}&page=1&pageSize=50`)).map(mapPatient),
  addPatient: async (p) => mapPatient(await request('/rx/patients', { method: 'POST', body: JSON.stringify(toPatientDto(p)) })),
  getPatient: async (id) => mapPatient(await request(`/rx/patients/${encodeURIComponent(id)}`)),
  updatePatient: async (id, p) =>
    mapPatient(await request(`/rx/patients/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(toPatientDto(p)) })),
  deletePatient: (id) => request(`/rx/patients/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  getMedicines: async (q = '') =>
    asList(await request(`/rx/medicines?search=${encodeURIComponent(q)}&page=1&pageSize=50`)).map(mapMedicine),
  addMedicine: async (m) => mapMedicine(await request('/rx/medicines', { method: 'POST', body: JSON.stringify(toMedicineDto(m)) })),
  updateMedicine: async (id, m) =>
    mapMedicine(await request(`/rx/medicines/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(toMedicineDto(m)) })),
  deleteMedicine: (id) => request(`/rx/medicines/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  getPrescriptions: async (status = '') =>
    asList(await request(`/rx/prescriptions?status=${encodeURIComponent(status)}&page=1&pageSize=50`)).map(mapPrescription),
  addPrescription: async (rx) =>
    mapPrescription(await request('/rx/prescriptions', { method: 'POST', body: JSON.stringify(toPrescriptionDto(rx)) })),
  getPrescription: async (id) => mapPrescription(await request(`/rx/prescriptions/${encodeURIComponent(id)}`)),
  updatePrescription: async (id, patch) =>
    mapPrescription(
      await request(`/rx/prescriptions/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(toPrescriptionUpdateDto(patch)),
      })
    ),
  deletePrescription: (id) => request(`/rx/prescriptions/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  getBills: async (status = '') =>
    asList(await request(`/rx/invoices?status=${encodeURIComponent(status)}&page=1&pageSize=50`)).map(mapInvoice),
  addBill: async (b) => mapInvoice(await request('/rx/invoices', { method: 'POST', body: JSON.stringify(toInvoiceDto(b)) })),
  getBill: async (id) => mapInvoice(await request(`/rx/invoices/${encodeURIComponent(id)}`)),
  generateBillFromPrescription: async (prescriptionId, payload = {}) =>
    mapInvoice(
      await request(`/rx/invoices/from-prescription/${encodeURIComponent(prescriptionId)}`, {
        method: 'POST',
        body: JSON.stringify({
          consultationFee: payload.consultationFee ?? 500,
          extraItems: payload.extraItems || [],
          paidAmount: payload.paidAmount ?? 0,
          notes: payload.notes || null,
        }),
      })
    ),
  markBillPaid: async (id, payload = {}) =>
    mapInvoice(
      await request(`/rx/invoices/${encodeURIComponent(id)}/payment`, {
        method: 'PUT',
        body: JSON.stringify({ paidAmount: payload.paidAmount ?? 0, status: payload.status || 'Paid' }),
      })
    ),
  deleteBill: (id) => request(`/rx/invoices/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  getAppointments: async () => asList(await request('/rx/appointments?page=1&pageSize=100')).map(mapAppointment),
  addAppointment: async (a) => mapAppointment(await request('/rx/appointments', { method: 'POST', body: JSON.stringify(toAppointmentCreateDto(a)) })),
  getAppointment: async (id) => mapAppointment(await request(`/rx/appointments/${encodeURIComponent(id)}`)),
  updateAppointment: async (id, patch) =>
    mapAppointment(await request(`/rx/appointments/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(toAppointmentUpdateDto(patch)) })),
  cancelAppointment: async (id) => {
    await request(`/rx/appointments/${encodeURIComponent(id)}/cancel`, { method: 'POST' });
    return { id, status: 'cancelled' };
  },
  getBookingInfo: () => request('/rx/appointments/booking-info'),

  getSettings: async () => mapSettings(await request('/rx/settings')),
  updateSettings: async (patch = {}) => {
    if (patch.pdf) return real.savePdfSettings(patch);
    if (patch.verified) return real.submitVerification();
    return real.saveProfile(patch);
  },
  saveProfile: async (settings) => mapSettings(await request('/rx/settings/profile', { method: 'PUT', body: JSON.stringify(toProfileDto(settings)) })),
  submitVerification: async () => mapSettings(await request('/rx/settings/profile/submit-verification', { method: 'POST' })),
  savePdfSettings: async (settings) => mapSettings(await request('/rx/settings/pdf', { method: 'PUT', body: JSON.stringify(toPdfDto(settings)) })),
  resetPdfSettings: async () => mapSettings(await request('/rx/settings/pdf/reset', { method: 'POST' })),

  getPlans: async () => {
    const body = await request('/rx/plans');
    return { plans: asList(Array.isArray(body) ? body : body.plans).map(mapPlan), currentPlan: currentPlanId(body) };
  },
  upgradePlan: async (planId, paymentReference = null) => {
    await request('/rx/plans/upgrade', { method: 'POST', body: JSON.stringify({ planId, paymentReference }) });
    return { currentPlan: planId };
  },

  getBookingClinic: (clinicId) => request(`/rx/public/booking/${encodeURIComponent(clinicId)}`),
  bookPublicAppointment: (clinicId, payload) =>
    request(`/rx/public/booking/${encodeURIComponent(clinicId)}`, { method: 'POST', body: JSON.stringify(payload) }),
  getComplaints: async () => [],
};

// ---------- demo API (static client-side store, same surface) ----------
const demoApi = {
  getDashboard: demoRequest(() => demo.getDashboard()),
  getPatients: demoRequest((q = '') => demo.patients.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))),
  addPatient: demoRequest((patient) => {
    const p = {
      id: 'P' + (1000 + demo.patients.length + 1),
      name: patient.name || 'Unnamed',
      dob: patient.dob || '',
      phone: patient.phone || '',
      email: patient.email || '',
      gender: patient.gender || '',
      createdAt: new Date().toISOString(),
    };
    demo.patients.unshift(p);
    return p;
  }),
  getPatient: demoRequest((id) => {
    const p = demo.getPatientById(id);
    if (!p) throw new Error('Patient not found.');
    return p;
  }),
  updatePatient: demoRequest((id, patch) => {
    const res = demo.updatePatient(id, { name: patch.name, dob: patch.dob, phone: patch.phone, gender: patch.gender, email: patch.email, notes: patch.notes });
    if (res.error) throw new Error(res.error);
    return res.patient;
  }),
  deletePatient: demoRequest((id) => {
    const res = demo.deletePatient(id);
    if (res.error) throw new Error(res.error);
    return res;
  }),

  getMedicines: demoRequest((q = '') => demo.getMedicines(q)),
  addMedicine: demoRequest((m) => demo.addMedicine(m)),
  updateMedicine: demoRequest((id, patch) => demo.updateMedicine(id, patch)),
  deleteMedicine: demoRequest((id) => demo.deleteMedicine(id)),

  getPrescriptions: demoRequest((status = '') =>
    demo.prescriptions.filter((r) => !status || r.status === String(status).toLowerCase())
  ),
  getPrescription: demoRequest((id) => {
    const rx = demo.getPrescription(id);
    if (!rx) throw new Error('Prescription not found.');
    return rx;
  }),
  addPrescription: demoRequest((rx) => {
    const created = {
      id: 'RX-' + (90000 + demo.prescriptions.length + 1),
      patient: rx.patient,
      patientId: rx.patientId || null,
      vitals: rx.vitals || {},
      advice: rx.advice || '',
      medicines: rx.medicines || [],
      status: rx.status || 'draft',
      date: new Date().toISOString(),
    };
    demo.prescriptions.unshift(created);
    if (created.status === 'draft') demo.stats.draftPrescriptions += 1;
    demo.stats.prescriptions += 1;
    return created;
  }),
  updatePrescription: demoRequest((id, patch) => {
    const rx = demo.prescriptions.find((r) => r.id === id);
    if (!rx) throw new Error('Prescription not found.');
    if (patch.status && patch.status !== rx.status) {
      if (rx.status === 'draft' && patch.status === 'final') demo.stats.draftPrescriptions = Math.max(0, demo.stats.draftPrescriptions - 1);
      if (rx.status === 'final' && patch.status === 'draft') demo.stats.draftPrescriptions += 1;
      rx.status = patch.status;
    }
    if (patch.advice !== undefined) rx.advice = patch.advice;
    return rx;
  }),
  deletePrescription: demoRequest((id) => {
    const res = demo.deletePrescription(id);
    if (res.error) throw new Error(res.error);
    return res;
  }),

  getBills: demoRequest((status = '') =>
    demo.bills.filter((b) => !status || b.status === String(status).toLowerCase())
  ),
  addBill: demoRequest((bill) => {
    const created = {
      id: 'INV-' + (5000 + demo.bills.length + 1),
      number: 'INV-' + (5000 + demo.bills.length + 1),
      patientName: bill.patientName || 'Walk-in',
      items: bill.items || [],
      total: (bill.items || []).reduce((s, i) => s + Number(i.amount || 0), 0),
      paidAmount: 0,
      status: 'unpaid',
      date: new Date().toISOString(),
    };
    demo.bills.unshift(created);
    demo.stats.receipts += 1;
    return created;
  }),
  getBill: demoRequest((id) => {
    const bill = demo.bills.find((b) => b.id === id);
    if (!bill) throw new Error('Bill not found.');
    return bill;
  }),
  generateBillFromPrescription: demoRequest((prescriptionId, payload = {}) => {
    const rx = demo.getPrescription(prescriptionId);
    const patientName = rx?.patient?.name || 'Walk-in';
    const extra = payload.extraItems || [];
    const items = [
      { label: 'Consultation', amount: payload.consultationFee ?? 500 },
      ...extra.map((e) => ({ label: e.description, amount: Number(e.amount) || 0 })),
    ];
    const created = {
      id: 'INV-' + (5000 + demo.bills.length + 1),
      number: 'INV-' + (5000 + demo.bills.length + 1),
      patientName,
      items,
      total: items.reduce((s, i) => s + Number(i.amount || 0), 0),
      paidAmount: 0,
      status: 'unpaid',
      date: new Date().toISOString(),
    };
    demo.bills.unshift(created);
    demo.stats.receipts += 1;
    return created;
  }),
  markBillPaid: demoRequest((id, payload = {}) => {
    const bill = demo.bills.find((b) => b.id === id);
    if (!bill) throw new Error('Bill not found.');
    const status = payload.status ? String(payload.status).toLowerCase() : 'paid';
    bill.status = status;
    if (payload.paidAmount !== undefined) bill.paidAmount = Number(payload.paidAmount);
    else if (status === 'paid') bill.paidAmount = bill.total;
    return bill;
  }),
  deleteBill: demoRequest((id) => {
    const res = demo.deleteBill(id);
    if (res.error) throw new Error(res.error);
    return res;
  }),

  getSettings: demoRequest(() => demo.settings),
  updateSettings: demoRequest((patch) => Object.assign(demo.settings, patch)),
  saveProfile: demoRequest((settings) =>
    Object.assign(demo.settings, {
      firstName: settings.firstName, lastName: settings.lastName,
      licenseNumber: settings.licenseNumber, npi: settings.npi, state: settings.state,
    })
  ),
  submitVerification: demoRequest(() => {
    demo.settings.verified = true;
    return demo.settings;
  }),
  savePdfSettings: demoRequest((settings) => {
    demo.settings.pdf = { ...demo.settings.pdf, ...settings.pdf };
    if (settings.clinic) demo.settings.clinic = { ...demo.settings.clinic, ...settings.clinic };
    return demo.settings;
  }),
  resetPdfSettings: demoRequest(() => {
    demo.settings.pdf = {
      marginTop: 15, marginBottom: 15, marginLeft: 20, marginRight: 20, scale: 100,
      paperSize: 'A4 (210 x 297 mm)', includeClinicLogo: true, includeSignature: true, addWatermark: false,
    };
    return demo.settings;
  }),

  getPlans: demoRequest(() => ({ plans: demo.plans, currentPlan: demo.getCurrentPlan() })),
  upgradePlan: demoRequest((planId) => {
    demo.setCurrentPlan(planId);
    return { currentPlan: demo.getCurrentPlan() };
  }),

  getAppointments: demoRequest(() => demo.getUpcomingAppointments(1000)),
  getAppointment: demoRequest((id) => {
    const a = demo.bookedAppointments.find((x) => x.id === id);
    if (!a) throw new Error('Appointment not found.');
    return a;
  }),
  addAppointment: demoRequest((payload) => {
    const res = demo.createAppointment(payload);
    return res.appointment;
  }),
  updateAppointment: demoRequest((id, patch) => {
    const res = demo.updateAppointment(id, patch);
    if (res.error) throw new Error(res.error);
    return res.appointment;
  }),
  cancelAppointment: demoRequest((id) => {
    const res = demo.updateAppointment(id, { status: 'cancelled' });
    if (res.error) throw new Error(res.error);
    return res.appointment;
  }),
  getBookingInfo: demoRequest(() => demo.getBookingInfo()),

  getSlots: demoRequest(() => demo.appointmentSlots),
  getComplaints: demoRequest(() => demo.chiefComplaints),
  bookAppointment: demoRequest((payload) => {
    const result = demo.bookSlot(payload);
    if (result.error) throw new Error(result.error);
    return result.appointment;
  }),
  getBookingClinic: demoRequest((clinicId) => ({
    clinicId: clinicId || 'clinic-demo-1',
    clinicName: demo.getBookingInfo().clinicName,
    bookingLink: demo.getBookingInfo().bookingLink,
  })),
  bookPublicAppointment: demoRequest((clinicId, payload) => {
    const res = demo.createAppointment({
      name: payload.patientName,
      phone: payload.phone,
      gender: payload.gender,
      date: (payload.startAt || '').slice(0, 10),
      time: '',
      complaint: payload.reason,
    });
    return res.appointment;
  }),
};

export const api = {
  // ---------- Auth (real server contract) — kabhi demo mapper nahi ----------
  register: (payload) =>
    USE_DEMO
      ? demoRequest(() => ({ userId: 'U1001', email: payload.email, message: 'Registration successful.' }))()
      : request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (emailOrPhone, password) =>
    USE_DEMO
      ? demoRequest(() => {
          if (!emailOrPhone || !password) throw new Error('Email/phone and password are required.');
          return { token: 'demo-token', user: { name: 'Dr. Altamash Shaikh', email: emailOrPhone, role: 'Professional' } };
        })()
      : request('/auth/login', { method: 'POST', body: JSON.stringify({ emailOrPhone, password }) }),
  forgotPassword: (email) =>
    USE_DEMO
      ? demoRequest(() => ({ message: 'Reset instructions sent.', devToken: 'RESET-DEMO1' }))()
      : request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email, client: CLIENT_ID }) }),
  resetPassword: (userId, token, newPassword) =>
    USE_DEMO
      ? demoRequest(() => ({ message: 'Password updated successfully.' }))()
      : request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ userId, token, newPassword }) }),

  // ---------- Features: demo (static) ya real/mirror (adapters) ----------
  ...(USE_DEMO ? demoApi : real),
};
