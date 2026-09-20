// Shared patient-booking catalog.
// The real server exposes no slots endpoint, so slots are generated client-side
// from these times and submitted as a concrete `startAt` datetime.

export const SLOT_TIMES = [
  '09:00 AM', '09:20 AM', '09:40 AM', '10:00 AM', '10:20 AM', '10:40 AM',
  '11:00 AM', '11:20 AM', '04:00 PM', '04:20 PM', '04:40 PM',
  '05:00 PM', '05:20 PM', '05:40 PM',
];

export const CHIEF_COMPLAINTS = [
  'Toothache / Dental Pain', 'Tooth Sensitivity', 'Cavities / Tooth Decay', 'Gum Pain / Swelling',
  'Bleeding Gums', 'Broken / Chipped Tooth', 'Loose Tooth', 'Wisdom Tooth Pain', 'Bad Breath',
  'Dental Cleaning', 'Teeth Whitening', 'Braces / Orthodontic Consultation', 'Root Canal Consultation',
  'Dental Implant Consultation', 'Follow-up Visit', 'Routine Dental Checkup', 'Other',
];

export function dateLabel(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

// 5 days × slot times. A few early slots start pre-booked so the UI looks real.
export function buildBookingSlots(days = 5) {
  const slots = [];
  let counter = 1;
  for (let day = 0; day < days; day++) {
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
}

// '02:00 PM' + '2026-09-20' → ISO string
export function slotToIso(date, time) {
  const [t, meridian] = String(time).split(' ');
  let [h, m] = t.split(':').map(Number);
  if (meridian === 'PM' && h !== 12) h += 12;
  if (meridian === 'AM' && h === 12) h = 0;
  return new Date(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`).toISOString();
}
