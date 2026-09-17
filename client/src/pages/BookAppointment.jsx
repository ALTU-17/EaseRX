import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';

const COLORS = {
  primary: '#132359',
  secondary: '#00658d',
  cyan: '#2dbcfe',
  bg: '#f7f9fb',
  surface: '#ffffff',
  onBg: '#191c1e',
  onVariant: '#45464f',
  outline: '#c6c5d1',
  errorText: '#93000a',
  errorBg: '#ffdad6',
  secondaryFixed: '#c6e7ff',
};

function formatDateLabel(dateStr, index) {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatFullDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BookAppointment() {
  const [slots, setSlots] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    gender: '',
    address: '',
    complaint: '',
    customComplaint: '',
  });
  const [activeDate, setActiveDate] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');

  useEffect(() => {
    Promise.all([api.getSlots(), api.getComplaints()])
      .then(([slotData, complaintData]) => {
        setSlots(slotData);
        setComplaints(complaintData);
        const dates = [...new Set(slotData.map((s) => s.date))];
        if (dates.length) setActiveDate(dates[0]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const dates = useMemo(() => [...new Set(slots.map((s) => s.date))], [slots]);
  const slotsForActiveDate = useMemo(
    () => slots.filter((s) => s.date === activeDate),
    [slots, activeDate]
  );

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Please enter your full name and mobile number.');
      return;
    }
    if (!selectedSlotId) {
      setError('Please pick an available time slot.');
      return;
    }
    const complaint = form.complaint === 'Other' ? form.customComplaint : form.complaint;
    if (!complaint || !complaint.trim()) {
      setError('Please select or describe your chief complaint.');
      return;
    }
    setSubmitting(true);
    try {
      const appointment = await api.bookAppointment({
        slotId: selectedSlotId,
        name: form.name,
        phone: form.phone,
        gender: form.gender,
        address: form.address,
        complaint,
      });
      setConfirmed(appointment);
    } catch (err) {
      setError(err.message);
      api.getSlots().then(setSlots).catch(() => {});
      setSelectedSlotId('');
    } finally {
      setSubmitting(false);
    }
  };

  // Download PDF
  const downloadPDF = () => {
    if (!confirmed) return;
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: `Appointment Confirmation - ${confirmed.id}`,
      subject: 'EaseRX Clinic Appointment',
      author: 'EaseRX Clinic',
    });
    
    // Header
    doc.setFillColor(19, 35, 89);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('EaseRX Clinic', 105, 18, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Appointment Confirmation', 105, 30, { align: 'center' });
    
    // Content
    doc.setTextColor(25, 28, 30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Appointment Details', 20, 55);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const details = [
      ['Booking ID', confirmed.id],
      ['Patient Name', confirmed.name],
      ['Phone', confirmed.phone || 'N/A'],
      ['Gender', confirmed.gender || 'N/A'],
      ['Date', formatFullDate(confirmed.date)],
      ['Time', confirmed.time],
      ['Complaint', confirmed.complaint || 'N/A'],
      ['Address', confirmed.address || 'N/A'],
    ];
    
    let y = 65;
    details.forEach(([label, value]) => {
      doc.setTextColor(69, 70, 79);
      doc.setFont('helvetica', 'normal');
      doc.text(label + ':', 20, y);
      
      doc.setTextColor(25, 28, 30);
      doc.setFont('helvetica', 'bold');
      doc.text(String(value), 70, y);
      
      y += 10;
    });
    
    // Add line
    y += 5;
    doc.setDrawColor(198, 197, 209);
    doc.line(20, y, 190, y);
    
    // Footer
    y += 10;
    doc.setFontSize(9);
    doc.setTextColor(69, 70, 79);
    doc.setFont('helvetica', 'normal');
    doc.text('Please arrive 10 minutes early for your appointment.', 20, y);
    y += 5;
    doc.text('For any queries, please contact our front desk.', 20, y);
    
    // Save the PDF
    doc.save(`Appointment-${confirmed.id}.pdf`);
  };

  // Add to Google Calendar
  const addToGoogleCalendar = () => {
    if (!confirmed) return;
    
    // Parse time (assuming format like "10:00 AM")
    const timeStr = confirmed.time;
    const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    
    if (!timeMatch) return;
    
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const meridiem = timeMatch[3].toUpperCase();
    
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    
    // Create date objects
    const startDate = new Date(confirmed.date + 'T00:00:00');
    startDate.setHours(hours, minutes, 0);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 30); // 30 min appointment
    
    // Format for Google Calendar
    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const startFormatted = formatDate(startDate);
    const endFormatted = formatDate(endDate);
    
    const title = encodeURIComponent(`Appointment at EaseRX Clinic`);
    const details = encodeURIComponent(
      `Booking ID: ${confirmed.id}\nPatient: ${confirmed.name}\nComplaint: ${confirmed.complaint || 'N/A'}\n\nPlease arrive 10 minutes early.`
    );
    const location = encodeURIComponent('EaseRX Clinic');
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startFormatted}/${endFormatted}&details=${details}&location=${location}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className="erx-book">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        
        .erx-book { font-family: 'Plus Jakarta Sans', sans-serif; color: ${COLORS.onBg}; background: ${COLORS.bg}; min-height: 100vh; }
        .erx-book * { box-sizing: border-box; }
        .erx-book .erx-icon { font-family: 'Material Symbols Outlined'; font-weight: normal; font-style: normal; line-height: 1; -webkit-font-smoothing: antialiased; }
        .erx-book .erx-wrap { max-width: 640px; margin: 0 auto; padding: 32px 20px 80px; }
        .erx-book .erx-card { background: ${COLORS.surface}; border: 1px solid #e6e8ea; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); padding: 24px; margin-bottom: 20px; }
        .erx-book label.erx-field { display: block; font-size: 12px; font-weight: 700; letter-spacing: 0.03em; color: ${COLORS.onVariant}; text-transform: uppercase; margin-bottom: 16px; }
        .erx-book input, .erx-book select, .erx-book textarea { width: 100%; margin-top: 6px; font-family: inherit; font-size: 14px; font-weight: 500; color: ${COLORS.onBg}; background: #f2f4f6; border: 1px solid #e6e8ea; border-radius: 10px; padding: 12px 14px; outline: none; }
        .erx-book input:focus, .erx-book select:focus, .erx-book textarea:focus { border-color: ${COLORS.secondary}; box-shadow: 0 0 0 3px rgba(0,101,141,0.12); }
        .erx-book .erx-pill { flex: 1; text-align: center; padding: 10px; border-radius: 10px; border: 1px solid #e6e8ea; background: #f2f4f6; font-size: 13px; font-weight: 700; cursor: pointer; color: ${COLORS.onVariant}; }
        .erx-book .erx-pill.active { background: ${COLORS.primary}; border-color: ${COLORS.primary}; color: #fff; }
        .erx-book .erx-date-tab { padding: 10px 16px; border-radius: 999px; border: 1px solid #e6e8ea; background: #fff; font-size: 13px; font-weight: 700; white-space: nowrap; cursor: pointer; color: ${COLORS.onVariant}; }
        .erx-book .erx-date-tab.active { background: ${COLORS.primary}; border-color: ${COLORS.primary}; color: #fff; }
        .erx-book .erx-slot { padding: 10px 6px; border-radius: 10px; border: 1px solid #e6e8ea; background: #fff; font-size: 12.5px; font-weight: 700; cursor: pointer; text-align: center; color: ${COLORS.onBg}; }
        .erx-book .erx-slot.selected { background: ${COLORS.secondary}; border-color: ${COLORS.secondary}; color: #fff; }
        .erx-book .erx-slot.booked { background: #f2f4f6; color: #b3b6ba; border-color: #e6e8ea; cursor: not-allowed; text-decoration: line-through; }
        .erx-book .erx-btn { width: 100%; text-align: center; display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: ${COLORS.primary}; color: #fff; font-weight: 700; font-size: 15px; border: none; border-radius: 12px; padding: 15px; cursor: pointer; }
        .erx-book .erx-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .erx-book .erx-btn-outline { width: 100%; text-align: center; display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: transparent; color: ${COLORS.primary}; font-weight: 700; font-size: 14px; border: 2px solid ${COLORS.primary}; border-radius: 12px; padding: 13px; cursor: pointer; transition: all 0.3s; }
        .erx-book .erx-btn-outline:hover { background: ${COLORS.primary}; color: #fff; }
        .erx-book .erx-btn-secondary { width: 100%; text-align: center; display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: ${COLORS.secondary}; color: #fff; font-weight: 700; font-size: 14px; border: none; border-radius: 12px; padding: 13px; cursor: pointer; transition: all 0.3s; }
        .erx-book .erx-btn-secondary:hover { background: ${COLORS.primary}; }
      `}</style>

      <div className="erx-wrap">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            {/* <span className="erx-icon" style={{ color: '#fff', fontSize: 26 }}>stethoscope</span> */}
            <span className="erx-icon" style={{ color: '#fff', fontSize: 26 }}>🦷</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 20, color: COLORS.primary }}>EaseRX Clinic</div>
          <p style={{ fontSize: 13.5, color: COLORS.onVariant, marginTop: 4 }}>Book your appointment in under a minute.</p>
        </div>

        {loading && <p style={{ textAlign: 'center', color: COLORS.onVariant, fontSize: 14 }}>Loading available slots…</p>}

        {!loading && confirmed && (
          <div className="erx-card" style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: COLORS.secondaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span className="erx-icon" style={{ color: COLORS.secondary, fontSize: 30 }}>task_alt</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>Appointment Confirmed</h2>
            <p style={{ fontSize: 13.5, color: COLORS.onVariant, marginBottom: 20 }}>
              We've saved your slot. Please arrive 10 minutes early.
            </p>
            <div style={{ background: '#f2f4f6', borderRadius: 12, padding: 16, textAlign: 'left', fontSize: 13.5, marginBottom: 20 }}>
              <Row label="Booking ID" value={confirmed.id} />
              <Row label="Patient" value={confirmed.name} />
              <Row label="Date" value={formatDateLabel(confirmed.date, dates.indexOf(confirmed.date))} />
              <Row label="Time" value={confirmed.time} />
              <Row label="Complaint" value={confirmed.complaint || 'N/A'} last />
            </div>
            
            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={downloadPDF} className="erx-btn-secondary">
                <span className="erx-icon" style={{ fontSize: 18 }}>download</span>
                Download PDF
              </button>
              
              <button onClick={addToGoogleCalendar} className="erx-btn-outline">
                <span className="erx-icon" style={{ fontSize: 18 }}>calendar_month</span>
                Add to Google Calendar
              </button>
              
              <button onClick={() => { setConfirmed(null); setSelectedSlotId(''); }} className="erx-btn-outline" style={{ borderColor: COLORS.outline, color: COLORS.onVariant }}>
                <span className="erx-icon" style={{ fontSize: 18 }}>add</span>
                Book Another Appointment
              </button>
            </div>
          </div>
        )}

                {!loading && !confirmed && (
          <form onSubmit={submit}>
            <div className="erx-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <span className="erx-icon" style={{ color: COLORS.primary }}>person</span>
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Your Information</h3>
              </div>
 
              <label className="erx-field">
                Full Name *
                <input required placeholder="e.g. Priya Sharma" value={form.name} onChange={update('name')} />
              </label>
 
              <label className="erx-field">
                Mobile Number *
                <input required type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={update('phone')} />
              </label>
 
              <div className="erx-field">
                Gender
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {['Female', 'Male', 'Other'].map((g) => (
                    <div
                      key={g}
                      className={`erx-pill ${form.gender === g ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, gender: g })}
                    >
                      {g}
                    </div>
                  ))}
                </div>
              </div>
 
              <label className="erx-field" style={{ marginBottom: 4 }}>
                Landmark / Address
                <textarea rows={2} placeholder="House no., street, nearby landmark…" value={form.address} onChange={update('address')} />
              </label>
            </div>
 
            <div className="erx-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <span className="erx-icon" style={{ color: COLORS.primary }}>assignment</span>
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Chief Complaint</h3>
              </div>
 
              <label className="erx-field">
                What brings you in today? *
                <select required value={form.complaint} onChange={update('complaint')}>
                  <option value="">Select a reason…</option>
                  {complaints.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
 
              {form.complaint === 'Other' && (
                <label className="erx-field" style={{ marginBottom: 0 }}>
                  Please describe
                  <input placeholder="Briefly describe your concern" value={form.customComplaint} onChange={update('customComplaint')} />
                </label>
              )}
            </div>
 
            <div className="erx-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <span className="erx-icon" style={{ color: COLORS.primary }}>event_available</span>
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Choose a Slot</h3>
              </div>
 
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 16 }}>
                {dates.map((d, i) => (
                  <div
                    key={d}
                    className={`erx-date-tab ${d === activeDate ? 'active' : ''}`}
                    onClick={() => setActiveDate(d)}
                  >
                    {formatDateLabel(d, i)}
                  </div>
                ))}
              </div>
 
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {slotsForActiveDate.map((s) => (
                  <div
                    key={s.id}
                    className={`erx-slot ${s.status === 'booked' ? 'booked' : selectedSlotId === s.id ? 'selected' : ''}`}
                    onClick={() => s.status !== 'booked' && setSelectedSlotId(s.id)}
                  >
                    {s.time}
                  </div>
                ))}
              </div>
              {slotsForActiveDate.every((s) => s.status === 'booked') && (
                <p style={{ fontSize: 12.5, color: COLORS.onVariant, marginTop: 10 }}>
                  No slots left for this day — try another date above.
                </p>
              )}
            </div>
 
            {error && (
              <p style={{ background: COLORS.errorBg, color: COLORS.errorText, fontSize: 13, fontWeight: 600, padding: '10px 14px', borderRadius: 10, marginBottom: 16 }}>
                {error}
              </p>
            )}
 
            <button type="submit" className="erx-btn" disabled={submitting}>
              {submitting ? 'Booking…' : 'Book Appointment'}
              {!submitting && <span className="erx-icon" style={{ fontSize: 18 }}>arrow_forward</span>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
 


function Row({ label, value, last }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: last ? 'none' : '1px solid #e6e8ea' }}>
      <span style={{ color: COLORS.onVariant }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}