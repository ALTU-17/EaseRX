# EaseRX — Project Graph (Graphify)

> Visual maps of the EaseRX codebase, generated from a full codebase scan.
> Companion to `context.md` (the text-based Feature → File Map). When a command
> arrives, use the relevant graph to jump to the right file instantly.

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BROWSER (localhost:5173)                   │
│                                                                     │
│  React 18 + Vite + Tailwind        state: localStorage              │
│  ───────────────────────────       ─────────────────────            │
│  App.jsx  ──── routing + auth guard                                 │
│     │                                                               │
│     ├── pages/*        (9 screens)                                  │
│     ├── components/*   (shell + UI)                                 │
│     └── api.js         (single fetch client, unwraps {success,data}│
│              ▲                                                      │
│              └── config.js → API_BASE_URL (dummy ↔ real switch)     │
└──────────┬───────────────────────────────────┬──────────────────────┘
           │ (dummy base)                      │ (real base or proxy)
           ▼                                   ▼
┌────────────────────────────┐    ┌─────────────────────────────────────┐
│ MOCK AUTH (port 4001)      │    │ EXPRESS API (port 4000)             │
│ server/mock-auth-server.js │    │ server/index.js — routes+validation │
│ register/login/forgot/reset│    │   │                                 │
│ (exact server contract)    │    │   ▼                                 │
└────────────────────────────┘    │ server/data.js — IN-MEMORY STORE    │
                                  └─────────────────────────────────────┘
```

> **Dummy base URL mode (current):** auth → mock server (4001). Demo features
> (dashboard/patients/rx/bills/settings/plans/booking) still need the main
> server on port 4000, otherwise they 501 through the mock.

## 2. Route Graph (client)

```
App.jsx
│
├── PUBLIC (no auth)
│   ├── / ............... Home.jsx .................. marketing page
│   ├── /book ........... BookAppointment.jsx ....... patient self-booking
│   └── /login .......... Auth.jsx .................. bounce→/dashboard if logged in
│
├── RequireAuth wrapper ──┬── Layout.jsx (Sidebar + header + BottomNav + <Outlet/>)
│                         │
│   ├── /dashboard ───────┼── Dashboard.jsx
│   ├── /patients ────────┼── Patients.jsx
│   ├── /rx ──────────────┼── Rx.jsx
│   ├── /bill ────────────┼── Bill.jsx
│   ├── /settings ────────┼── Settings.jsx
│   └── /plans ───────────┼── Plans.jsx
│
└── * → redirect /
```

## 3. Feature Flows

### 3.1 Auth flow (real server contract)
```
Auth.jsx (4 views: signin / register / forgot / reset)
   ├── register ──▶ POST /api/auth/register
   │                 { fullName, clinicName?, registrationNo?, phoneNumber, email, password, role:'Doctor' }
   │                 ──▶ { userId, email, message }
   ├── signin ───▶ POST /api/auth/login  { emailOrPhone, password } ──▶ { token, user }
   │                 │
   │                 ▼
   │      localStorage.easerx_user / easerx_token  → RequireAuth → /dashboard
   ├── forgot ───▶ POST /api/auth/forgot-password { email, client:'easeRX' }
   │                 ──▶ reset code by email (mock: also returns devToken) → reset view
   └── reset ────▶ POST /api/auth/reset-password { userId, token, newPassword }

Base URL switch: client/src/config.js → API_BASE_URL
   'https://mock.easerx.local' → server/mock-auth-server.js (port 4001)
   real URL / relative '/api'  → real server (via Vite proxy when relative)
```

### 3.2 Appointment booking flow (public /book page)
```
BookAppointment.jsx
   ├── api.getSlots() ──────▶ GET /api/appointments/slots ──▶ db.appointmentSlots
   │                                                  (14 slots × 5 days, some pre-booked)
   ├── api.getComplaints() ─▶ GET /api/appointments/complaints ─▶ db.chiefComplaints
   │
   └── submit {slotId, name, phone, gender, address, complaint}
          └─▶ POST /api/appointments/book ──▶ db.bookSlot()
                                                 ├── slot.status = 'booked'   (409 if taken)
                                                 ├── bookedAppointments.push(apt)
                                                 └── stats.todaysAppointments += 1
                                                        │
Dashboard.jsx ◀── GET /api/dashboard ◀── getDashboard()
              └── upcomingAppointments (soonest 3, sorted by parseApptDateTime)
```

### 3.3 Prescription → Bill flow
```
Rx.jsx
   ├── patient info + vitals + medicine line items
   ├── save ──▶ POST /api/prescriptions ──▶ db.prescriptions.unshift(rx)
   │                                           └── stats.prescriptions += 1
   │                                               (draft → stats.draftPrescriptions += 1)
   └── auto-creates matching invoice ──▶ api.addBill() ──▶ POST /api/bills

Bill.jsx
   ├── GET /api/bills ──▶ db.bills (invoices generated from prescriptions)
   └── POST /api/bills ──▶ total = Σ items.amount; status 'unpaid'; stats.receipts += 1
```

### 3.4 Settings → branding flow (single source of truth)
```
Settings.jsx
   └── save ──▶ PUT /api/settings ──▶ db.settings = {...db.settings, ...body}
                                        │
        ┌───────────────────────────────┼──────────────────────────────┐
        ▼                               ▼                              ▼
Layout.jsx header              Sidebar.jsx (logo/plan card)     live printed-prescription
(clinicName, doctorName)                                preview inside Settings.jsx
        ▲
        └── api.getSettings() on mount
```

### 3.5 Plans / upgrade flow
```
Plans.jsx ──▶ GET /api/plans ──▶ db.plans + currentPlan
   └── upgrade ──▶ POST /api/plans/upgrade {planId} ──▶ db.currentPlan = planId
Sidebar.jsx plan-upgrade card (hardcoded "Basic Plan Active")
```

## 4. Component Dependency Graph

```
App.jsx
├── Home.jsx
├── BookAppointment.jsx
├── Auth.jsx ──────────── (signin/register/forgot/reset views)
├── Layout.jsx
│   ├── Sidebar.jsx      (NAV_ITEMS — 6 items)
│   ├── BottomNav.jsx    (ITEMS — 5 items, md:hidden)
│   └── Outlet → pages/* (title/subtitle from TITLES map)
├── pages/*
│   ├── Dashboard.jsx ──── StatCard.jsx
│   ├── Patients.jsx
│   ├── Rx.jsx
│   ├── Bill.jsx
│   ├── Settings.jsx
│   └── Plans.jsx
└── (all data via) api.js ──▶ /api/*
ShareBookingLink.jsx ── used by Dashboard.jsx only (booking link + QR card)
Loader.jsx ──────────── full-screen splash — currently NOT imported anywhere (unused)
```

## 5. Data Mutation Map (who writes what)

```
server/data.js  = ONLY mutable state
├── patients            ◀── POST /api/patients
├── prescriptions       ◀── POST /api/prescriptions
├── bills               ◀── POST /api/bills
├── settings            ◀── PUT /api/settings (merge-patch)
├── currentPlan         ◀── POST /api/plans/upgrade
├── appointmentSlots[].status   ◀── bookSlot()
├── bookedAppointments  ◀── bookSlot() (also seeded with APT-1001/1002)
└── stats               ◀── prescriptions/receipts/todaysAppointments increments
```

## 6. Key Locations Cheat-Sheet

| What you want to change | Go to |
|---|---|
| Page titles / subtitles | `Layout.jsx` → `TITLES` |
| Sidebar / bottom nav items | `Sidebar.jsx` → `NAV_ITEMS`, `BottomNav.jsx` → `ITEMS` |
| Add endpoint | `server/index.js` + wrapper in `client/src/api.js` |
| Seed/mock data | `server/data.js` |
| Colors, fonts, shadows | `client/tailwind.config.js`, `client/src/index.css` |
| Booking slot times / complaints list | `server/data.js` → `SLOT_TIMES`, `chiefComplaints` |
| Dashboard cards | `Dashboard.jsx` + `StatCard.jsx` |
| Prescription print layout | `Settings.jsx` (live preview) |
| QR / share link | `ShareBookingLink.jsx` |
| Auth guard | `App.jsx` → `RequireAuth` |
