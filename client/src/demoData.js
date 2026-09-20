// Static demo store — browser-memory copy of server/data.js.
// Active only when USE_DEMO is true (config.js) — zero backend needed.
// All screens (dashboard, patients, rx, bills, appointments, settings, plans)
// render from this; writes mutate in-browser and reset on refresh, demo-style.

const doctorAvatar = 'https://altamash-shaikh-portfolio.vercel.app/images/myprofileimage.jpeg';

const stats = {
  patients: 1248,
  prescriptions: 8340,
  receipts: 3192,
  revenue: 425000,
  draftPrescriptions: 12,
  todaysAppointments: 8,
};

const revenueTrend = [
  { month: 'Jan', value: 210000 },
  { month: 'Feb', value: 275000 },
  { month: 'Mar', value: 230000 },
  { month: 'Apr', value: 315000 },
  { month: 'May', value: 410000 },
  { month: 'Jun', value: 355000 },
  { month: 'Jul', value: 425000 },
];

const recentActivity = [
  { id: 1, type: 'prescription', text: 'Prescription created for Sarah Jenkins', meta: 'Amoxicillin 500mg • 10 mins ago' },
  { id: 2, type: 'patient', text: 'New patient registered', meta: 'Michael Chen • 1 hr ago' },
  { id: 3, type: 'alert', text: 'Refill request denied', meta: 'Robert Smith • 2 hrs ago' },
];

const patients = [
  { id: 'P1001', name: 'Emma Thompson', dob: '05/12/1990', phone: '+91 8830121001', gender: 'F', createdAt: '2026-08-20T10:00:00Z' },
  { id: 'P1002', name: 'David Rodriguez', dob: '11/24/1975', phone: '+91 8830121002', gender: 'M', createdAt: '2026-08-19T10:00:00Z' },
  { id: 'P1003', name: 'Sarah Jenkins', dob: '02/03/1988', phone: '+91 8830121003', gender: 'F', createdAt: '2026-08-18T10:00:00Z' },
  { id: 'P1004', name: 'Michael Chen', dob: '09/17/1995', phone: '+91 8830121004', gender: 'M', createdAt: '2026-08-17T10:00:00Z' },
  { id: 'P1005', name: 'Robert Smith', dob: '01/30/1966', phone: '+91 8830121005', gender: 'M', createdAt: '2026-08-16T10:00:00Z' },
];

const prescriptions = [
  {
    id: 'RX-90001',
    patient: { name: 'Jane Smith', dob: '05/12/1985', phone: '+91 8830121999', age: 41, gender: 'F' },
    vitals: { bp: '120/80', temp: '98.6°F', complaint: 'Fever and body ache' },
    medicines: [
      { name: 'Amoxicillin 500mg Capsule', sig: 'Take 1 capsule by mouth three times daily for 10 days.', dispense: 30, refills: 0 },
      { name: 'Ibuprofen 400mg Tablet', sig: 'Take 1 tablet by mouth every 6 hours as needed for pain.', dispense: 20, refills: 1 },
    ],
    status: 'final',
    date: '2026-08-24T09:00:00Z',
  },
  {
    id: 'RX-90002',
    patient: { name: 'Emma Thompson', dob: '05/12/1990', phone: '+91 8830121001', age: 36, gender: 'F' },
    vitals: { bp: '118/76', temp: '98.2°F', complaint: 'Follow-up Visit' },
    medicines: [
      { name: 'Paracetamol 650mg Tablet', sig: 'Take 1 tablet by mouth twice daily for 5 days.', dispense: 10, refills: 0 },
    ],
    status: 'draft',
    date: '2026-09-18T10:30:00Z',
  },
  {
    id: 'RX-90003',
    patient: { name: 'David Rodriguez', dob: '11/24/1975', phone: '+91 8830121002', age: 50, gender: 'M' },
    vitals: { bp: '128/84', temp: '98.6°F', complaint: 'Root Canal Consultation' },
    medicines: [
      { name: 'Amoxicillin 500mg Capsule', sig: 'Take 1 capsule by mouth three times daily for 7 days.', dispense: 21, refills: 1 },
      { name: 'Ibuprofen 400mg Tablet', sig: 'Take 1 tablet every 8 hours as needed for pain.', dispense: 15, refills: 0 },
    ],
    status: 'final',
    date: '2026-09-17T04:50:00Z',
  },
];

const bills = [
  { id: 'INV-5001', patientName: 'Jane Smith', items: [{ label: 'Consultation', amount: 500 }, { label: 'Amoxicillin 500mg', amount: 240 }], total: 740, status: 'paid', date: '2026-08-24T09:10:00Z' },
  { id: 'INV-5002', patientName: 'Emma Thompson', items: [{ label: 'Follow-up Visit', amount: 300 }], total: 300, status: 'unpaid', date: '2026-09-18T10:35:00Z' },
];

// Medicine catalog (real API: /api/rx/medicines) — no UI existed for this before.
const medicines = [
  { id: 'MED-1', name: 'Amoxicillin 500mg Capsule', genericName: 'Amoxicillin', form: 'Capsule', strength: '500mg', defaultSig: 'Take 1 capsule by mouth three times daily for 10 days', defaultDispenseQty: 30, defaultRefills: 0, isActive: true },
  { id: 'MED-2', name: 'Ibuprofen 400mg Tablet', genericName: 'Ibuprofen', form: 'Tablet', strength: '400mg', defaultSig: 'Take 1 tablet by mouth every 6 hours as needed for pain', defaultDispenseQty: 20, defaultRefills: 1, isActive: true },
  { id: 'MED-3', name: 'Paracetamol 650mg Tablet', genericName: 'Paracetamol', form: 'Tablet', strength: '650mg', defaultSig: 'Take 1 tablet by mouth twice daily for 5 days', defaultDispenseQty: 10, defaultRefills: 0, isActive: true },
  { id: 'MED-4', name: 'Chlorhexidine 0.2% Mouthwash', genericName: 'Chlorhexidine', form: 'Mouthwash', strength: '0.2%', defaultSig: 'Rinse 10ml twice daily for 7 days', defaultDispenseQty: 1, defaultRefills: 0, isActive: true },
];

const settings = {
  firstName: 'Altamash',
  lastName: 'Shaikh',
  licenseNumber: '',
  npi: '',
  state: '',
  verified: false,
  pdf: {
    marginTop: 15,
    marginBottom: 15,
    marginLeft: 20,
    marginRight: 20,
    scale: 100,
    paperSize: 'A4 (210 x 297 mm)',
    includeClinicLogo: true,
    includeSignature: true,
    addWatermark: false,
  },
  clinic: {
    name: 'Ease Dental Clinic',
    address: '123 Health Ave, Medical District, New York, NY 10001',
    phone: '(555) 123-4567',
  },
};

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 400,
    tagline: 'Essential features for starting practices.',
    features: [
      { text: 'Unlimited patients', included: true },
      { text: 'Basic prescription generation', included: true },
      { text: 'Advanced billing', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 7000,
    popular: true,
    tagline: 'Ideal for growing clinics and active practitioners.',
    features: [
      { text: 'Unlimited patients', included: true },
      { text: 'Advanced prescription templates', included: true },
      { text: 'Integrated billing & invoicing', included: true },
      { text: 'Priority email support', included: true },
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 2499,
    tagline: 'Complete suite for large practices and hospitals.',
    features: [
      { text: 'Unlimited patients', included: true },
      { text: 'Advanced prescription templates', included: true },
      { text: 'Integrated billing & invoicing', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Everything in Pro', included: true },
      { text: 'Multi-doctor management', included: true },
      { text: 'Custom branding', included: true },
      { 'text': '24/7 phone support', included: true },
      { text: 'WhatsApp automation support', included: true },
    ],
  },
];

let currentPlan = 'basic';
function getCurrentPlan() { return currentPlan; }
function setCurrentPlan(v) { currentPlan = v; }

// ---------- appointments (same shape as server) ----------
const SLOT_TIMES = ['09:00 AM', '09:20 AM', '09:40 AM', '10:00 AM', '10:20 AM', '10:40 AM', '11:00 AM', '11:20 AM', '04:00 PM', '04:20 PM', '04:40 PM', '05:00 PM', '05:20 PM', '05:40 PM'];

function dateLabel(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const appointmentSlots = (() => {
  const slots = [];
  let counter = 1;
  for (let day = 0; day < 5; day++) {
    const date = dateLabel(day);
    SLOT_TIMES.forEach((time, i) => {
      const preBooked = day === 0 && (i === 1 || i === 4 || i === 9);
      slots.push({
        id: 'SLOT-' + counter++,
        date,
        time,
        status: preBooked ? 'booked' : 'available',
        patientName: preBooked ? 'Existing Patient' : null,
      });
    });
  }
  return slots;
})();

const chiefComplaints = [
  'Toothache / Dental Pain', 'Tooth Sensitivity', 'Cavities / Tooth Decay', 'Gum Pain / Swelling',
  'Bleeding Gums', 'Broken / Chipped Tooth', 'Loose Tooth', 'Wisdom Tooth Pain', 'Bad Breath',
  'Dental Cleaning', 'Teeth Whitening', 'Braces / Orthodontic Consultation', 'Root Canal Consultation',
  'Dental Implant Consultation', 'Follow-up Visit', 'Routine Dental Checkup', 'Other',
];

const bookedAppointments = [
  { id: 'APT-1001', slotId: null, date: dateLabel(0), time: '02:00 PM', name: 'Emma Thompson', phone: '+91 8830121001', gender: 'F', address: 'Near City Mall, Andheri West', complaint: 'Follow-up Visit', status: 'confirmed', createdAt: new Date().toISOString() },
  { id: 'APT-1002', slotId: null, date: dateLabel(0), time: '04:20 PM', name: 'David Rodriguez', phone: '+91 8830121002', gender: 'M', address: 'Opp. Central Park, Bandra', complaint: 'Root Canal Consultation', status: 'confirmed', createdAt: new Date().toISOString() },
  { id: 'APT-1003', slotId: null, date: dateLabel(1), time: '09:40 AM', name: 'Sarah Jenkins', phone: '+91 8830121003', gender: 'F', address: 'MG Road, Pune', complaint: 'Dental Cleaning', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'APT-1004', slotId: null, date: dateLabel(2), time: '11:20 AM', name: 'Michael Chen', phone: '+91 8830121004', gender: 'M', address: 'Sector 18, Noida', complaint: 'Routine Dental Checkup', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'APT-1005', slotId: null, date: dateLabel(3), time: '05:00 PM', name: 'Robert Smith', phone: '+91 8830121005', gender: 'M', address: 'Kala Nagar, Mumbai', complaint: 'Wisdom Tooth Pain', status: 'confirmed', createdAt: new Date().toISOString() },
];

function parseApptDateTime(date, time) {
  const [t, meridian] = time.split(' ');
  let [h, m] = t.split(':').map(Number);
  if (meridian === 'PM' && h !== 12) h += 12;
  if (meridian === 'AM' && h === 12) h = 0;
  return new Date(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
}

function getUpcomingAppointments(limit = 20) {
  return [...bookedAppointments]
    .sort((a, b) => parseApptDateTime(a.date, a.time) - parseApptDateTime(b.date, b.time))
    .slice(0, limit);
}

function bookSlot({ slotId, name, phone, gender, address, complaint }) {
  const slot = appointmentSlots.find((s) => s.id === slotId);
  if (!slot) return { error: 'This slot no longer exists.' };
  if (slot.status === 'booked') return { error: 'This slot was just booked by someone else. Please pick another.' };
  slot.status = 'booked';
  slot.patientName = name;
  const appointment = {
    id: 'APT-' + (2000 + bookedAppointments.length + 1),
    slotId,
    date: slot.date,
    time: slot.time,
    name,
    phone,
    gender,
    address,
    complaint,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  bookedAppointments.push(appointment);
  stats.todaysAppointments += 1;
  return { appointment };
}

function updateAppointment(id, { status, date, time }) {
  const appt = bookedAppointments.find((a) => a.id === id);
  if (!appt) return { error: 'Appointment not found.' };
  if (status) appt.status = status;
  if (date) appt.date = date;
  if (time) appt.time = time;
  return { appointment: appt };
}

function markBillPaid(id) {
  const bill = bills.find((b) => b.id === id);
  if (!bill) return { error: 'Bill not found.' };
  bill.status = 'paid';
  return { bill };
}

// ---------- patient / rx / bill mutations (demo parity with real API) ----------
function getPatientById(id) {
  return patients.find((p) => p.id === id) || null;
}

function updatePatient(id, patch) {
  const p = patients.find((x) => x.id === id);
  if (!p) return { error: 'Patient not found.' };
  Object.assign(p, patch);
  return { patient: p };
}

function deletePatient(id) {
  const i = patients.findIndex((x) => x.id === id);
  if (i === -1) return { error: 'Patient not found.' };
  patients.splice(i, 1);
  return { ok: true };
}

function getPrescription(id) {
  return prescriptions.find((r) => r.id === id) || null;
}

function deletePrescription(id) {
  const i = prescriptions.findIndex((r) => r.id === id);
  if (i === -1) return { error: 'Prescription not found.' };
  const [rx] = prescriptions.splice(i, 1);
  if (rx.status === 'draft') stats.draftPrescriptions = Math.max(0, stats.draftPrescriptions - 1);
  stats.prescriptions = Math.max(0, stats.prescriptions - 1);
  return { ok: true };
}

function deleteBill(id) {
  const i = bills.findIndex((b) => b.id === id);
  if (i === -1) return { error: 'Bill not found.' };
  bills.splice(i, 1);
  stats.receipts = Math.max(0, stats.receipts - 1);
  return { ok: true };
}

function createAppointment({ name, phone, gender, date, time, complaint, address }) {
  const appt = {
    id: 'APT-' + (2000 + bookedAppointments.length + 1),
    slotId: null,
    date,
    time,
    name,
    phone,
    gender,
    address: address || '',
    complaint,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  bookedAppointments.push(appt);
  stats.todaysAppointments += 1;
  return { appointment: appt };
}

// ---------- medicines catalog ----------
function getMedicines(q = '') {
  return medicines.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()));
}

function addMedicine(m) {
  const created = {
    id: 'MED-' + (medicines.length + 1),
    name: m.name || 'Unnamed medicine',
    genericName: m.genericName || '',
    form: m.form || '',
    strength: m.strength || '',
    defaultSig: m.defaultSig || '',
    defaultDispenseQty: m.defaultDispenseQty || '',
    defaultRefills: m.defaultRefills || 0,
    isActive: m.isActive !== false,
  };
  medicines.unshift(created);
  return created;
}

function updateMedicine(id, patch) {
  const m = medicines.find((x) => x.id === id);
  if (!m) return null;
  Object.assign(m, patch);
  return m;
}

function deleteMedicine(id) {
  const i = medicines.findIndex((x) => x.id === id);
  if (i === -1) return false;
  medicines.splice(i, 1);
  return true;
}

function getBookingInfo() {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return { clinicId: 'clinic-demo-1', clinicName: settings.clinic.name, bookingLink: `${origin}/book/clinic-demo-1` };
}

function getDashboard() {
  return {
    stats,
    revenueTrend,
    recentActivity,
    newPatients: patients.slice(0, 2),
    upcomingAppointments: getUpcomingAppointments(20),
  };
}

export {
  doctorAvatar,
  medicines,
  getPatientById,
  updatePatient,
  deletePatient,
  getPrescription,
  deletePrescription,
  deleteBill,
  createAppointment,
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  getBookingInfo,
  stats,
  revenueTrend,
  recentActivity,
  patients,
  prescriptions,
  bills,
  settings,
  plans,
  getCurrentPlan,
  setCurrentPlan,
  getDashboard,
  getUpcomingAppointments,
  appointmentSlots,
  chiefComplaints,
  bookedAppointments,
  bookSlot,
  updateAppointment,
  markBillPaid,
};
