# context.md — EaseRX Project Memory

> **Purpose:** Fast file lookup for AI agents. When a command arrives, jump straight to the
> Feature → File Map below instead of re-scanning the repo. Diagrams live in `docs/PROJECT_GRAPH.md`.

## 1. What This Project Is

**EaseRX** — a dental practice-management demo MVP for doctors (patients, prescriptions,
billing, plans). Two-part app:

- **`server/`** — Node.js + Express API, **port 4000**. All data is **in-memory** in
  `server/data.js` (resets on restart, no DB).
- **`client/`** — React 18 + Vite + Tailwind, **port 5173**. Vite dev server proxies `/api` to the backend.
- Design system: "Clinical Precision" (navy/cyan, Plus Jakarta Sans, soft-shadow cards, Material Symbols icons).
- Run: `cd server && npm start` (terminal 1) + `cd client && npm run dev` (terminal 2) → http://localhost:5173

## 2. Feature → File Map  ⚡ (start here for any command)

| Feature / Command | Client page | Key files | API endpoints | Data source (`server/data.js`) |
|---|---|---|---|---|
| Login / Register / Forgot / Reset password (**real server contract**) | `/login` | `client/src/pages/Auth.jsx` (4 views), `App.jsx` | `POST /api/auth/register`, `POST /api/auth/login` (`emailOrPhone`), `POST /api/auth/forgot-password` (`client:'easeRX'`), `POST /api/auth/reset-password` | main API server (`server/index.js` — **auth merged in**, port 4000) |
| Dashboard & analytics (stat cards, revenue chart, activity, new patients, upcoming appointments) | `/dashboard` | `client/src/pages/Dashboard.jsx`, `components/StatCard.jsx` | `GET /api/dashboard` | `getDashboard()`, `stats`, `revenueTrend`, `recentActivity`, `getUpcomingAppointments()` |
| Patients (search, add modal) | `/patients` | `client/src/pages/Patients.jsx` | `GET /api/patients?q=`, `POST /api/patients` | `patients` |
| New Prescription (patient info, vitals, medicine line items, save draft/final) — **also auto-creates a matching bill** | `/rx` | `client/src/pages/Rx.jsx` | `GET/POST /api/prescriptions`, `POST /api/bills` | `prescriptions`, increments `stats.draftPrescriptions` |
| Billing (invoice list from prescriptions) | `/bill` | `client/src/pages/Bill.jsx` | `GET/POST /api/bills` | `bills`, increments `stats.receipts` |
| Public patient self-booking (slots, complaints) | `/book` (no login) | `client/src/pages/BookAppointment.jsx` | `GET /api/appointments/slots`, `GET /api/appointments/complaints`, `POST /api/appointments/book` | `appointmentSlots`, `chiefComplaints`, `bookSlot()` → pushes to `bookedAppointments`, increments `stats.todaysAppointments` |
| Share booking link + QR (copy / show / download PNG via qrserver.com) | rendered in Dashboard | `client/src/components/ShareBookingLink.jsx` | — (client-only, uses `window.location.origin + /book`) | — |
| Settings — doctor verification + PDF/print config + live prescription preview | `/settings` | `client/src/pages/Settings.jsx` | `GET /api/settings`, `PUT /api/settings` | `settings` (clinic identity **single source of truth** — header, sidebar, printed preview all read it) |
| Plans / upgrade flow (Basic / Pro / Elite) | `/plans` | `client/src/pages/Plans.jsx` | `GET /api/plans`, `POST /api/plans/upgrade` | `plans`, `currentPlan` |
| Marketing homepage | `/` (public) | `client/src/pages/Home.jsx` | — | — |
| App shell, page titles, clinic branding in header | all authed pages | `client/src/components/Layout.jsx` (`TITLES` map), `App.jsx` (`RequireAuth`) | — | `settings.clinic.name` via `api.getSettings()` |
| Desktop sidebar nav (6 items, plan-upgrade card) | — | `client/src/components/Sidebar.jsx` (`NAV_ITEMS`) | — | — |
| Mobile bottom nav (5 items) | — | `client/src/components/BottomNav.jsx` (`ITEMS`) | — | — |
| Full-screen splash loader (⚠ currently not imported/used anywhere) | — | `client/src/components/Loader.jsx` | — | — |
| API client (every fetch goes through here) | — | `client/src/api.js` — add new endpoint wrappers here | — | — |
| **API base URL switch** (dummy ↔ real server) | — | `client/src/config.js` → `API_BASE_URL` (single line change) | — | — |
| Design tokens (colors, fonts, shadows) | — | `client/tailwind.config.js`, `client/src/index.css`, `client/index.html` (Google Fonts + Material Symbols) | — | — |

## 3. API Endpoint Reference

All responses use the envelope `{ success: true, data }` or `{ success: false, message }`
(`server/index.js` helpers `ok()` / `fail()`; `client/src/api.js` unwraps and throws on failure).

| Method | Path | Purpose | Mutates |
|---|---|---|---|
| POST | `/api/auth/register` | real contract: `{ fullName, clinicName?, registrationNo?, phoneNumber, email, password, role }` → userId | `users[]` (merged auth store) |
| POST | `/api/auth/login` | real contract: `{ emailOrPhone, password }` → `{ token, user }` | `users[]` (merged auth store) |
| POST | `/api/auth/forgot-password` | real contract: `{ email, client: 'easeRX' }` → reset code (mock also returns `devToken`) | `resetTokens[]` (merged auth store) |
| POST | `/api/auth/reset-password` | real contract: `{ userId, token, newPassword }` | `user.password` (merged auth store) |
| GET | `/api/dashboard` | stats + revenueTrend + activity + newPatients + upcomingAppointments | — |
| GET | `/api/patients?q=` | search by name (case-insensitive) | — |
| POST | `/api/patients` | create patient (name required) → id `P1001…` | `patients.unshift` |
| GET | `/api/prescriptions` | list | — |
| POST | `/api/prescriptions` | create rx → id `RX-90001…`, status `draft`/`final` | `prescriptions.unshift`, `stats` |
| GET | `/api/bills` | list | — |
| POST | `/api/bills` | create invoice → id `INV-5001…`, total summed from items, status `unpaid` | `bills.unshift`, `stats.receipts` |
| GET / PUT | `/api/settings` | read / merge-patch clinic & PDF settings | `settings` |
| GET | `/api/plans` | plans + currentPlan | — |
| POST | `/api/plans/upgrade` | body `{ planId }` → 404 if unknown | `currentPlan` |
| GET | `/api/appointments/slots` | 14 slots × 5 days, some pre-booked | — |
| GET | `/api/appointments/complaints` | dental chief-complaint list | — |
| POST | `/api/appointments/book` | body `{ slotId, name, phone, gender, address, complaint }`; 409 if slot taken | `slot.status`, `bookedAppointments.push`, `stats.todaysAppointments` |
| GET | `/api/health` | liveness check | — |

## 4. Data Models (all in `server/data.js` — the only place state mutates)

- **patient**: `{ id: 'P1001', name, dob, phone, gender, createdAt }`
- **prescription**: `{ id: 'RX-90001', patient: { name, dob, phone, age, gender }, vitals: { bp, temp, complaint }, medicines: [{ name, sig, dispense, refills }], status: 'draft'|'final', date }`
- **bill**: `{ id: 'INV-5001', patientName, items: [{ label, amount }], total, status: 'unpaid'|'paid', date }`
- **settings**: `{ firstName, lastName, licenseNumber, npi, state, verified, pdf: { margins, scale, paperSize, includeClinicLogo, includeSignature, addWatermark }, clinic: { name, address, phone } }` — **single source of truth for branding**
- **slot**: `{ id: 'SLOT-1', date: 'YYYY-MM-DD', time: '09:00 AM', status: 'available'|'booked', patientName }`
- **appointment**: `{ id: 'APT-1001', slotId, date, time, name, phone, gender, address, complaint, createdAt }`
- **plan**: `{ id: 'basic'|'pro'|'elite', name, price, tagline, features: [{ text, included }], popular? }`
- **stats**: `{ patients, prescriptions, receipts, revenue, draftPrescriptions, todaysAppointments }`

## 5. Routing & Auth Flow (client)

- `client/src/App.jsx`: reads `localStorage.easerx_user` on mount → `user` state.
- **Auth = real server contract** via `api.js` (register/login/forgot/reset); login accepts email OR phone. Auth endpoints live in the single main backend (`server/index.js`, port 4000 — merged from the old mock-auth-server). Dummy base URL (`https://mock.easerx.local`) in `client/src/config.js` resolves to `http://localhost:4000/api`; real server aaye toh sirf `API_BASE_URL` badalna.
- **Public routes:** `/` (Home), `/book` (patient booking), `/login` (bounces to `/dashboard` if logged in).
- **Auth-guarded** via inline `RequireAuth` wrapper → `Layout` (Sidebar + header + BottomNav + `<Outlet/>`): `/dashboard`, `/patients`, `/rx`, `/bill`, `/settings`, `/plans`.
- Storage keys: `easerx_user`, `easerx_token` (`handleAuth` writes, `handleLogout` removes).
- Unknown paths → redirect `/`.

## 6. Conventions — How to Extend

**Add a new page/feature (e.g. "Reports"):**
1. Create `client/src/pages/Reports.jsx`.
2. Register route in `client/src/App.jsx` inside the `RequireAuth` block (public pages go above it).
3. Add nav entry to `Sidebar.jsx` `NAV_ITEMS` (+ `BottomNav.jsx` if mobile).
4. Add title/subtitle to `Layout.jsx` `TITLES` map.
5. Add API wrapper in `client/src/api.js`, then endpoint in `server/index.js` (+ data in `server/data.js`).
6. Update the Feature → File Map above.

**Style:** Tailwind utility classes with custom tokens (`bg-surface-container-lowest`, `text-on-surface-variant`, `text-title-lg`, `shadow-card` — see `tailwind.config.js`). Icons: `<span className="material-symbols-outlined">icon_name</span>`. Cards: rounded-xl + shadow-card + border-surface-variant.

**Known quirks (demo):** auth APIs are real-contract (mock server on 4001 requires registered credentials); demo feature data resets on main-server restart; no real PDF/payment; avatar URL is external (data.js `doctorAvatar`); QR codes generated via external api.qrserver.com; `Loader.jsx` uses `style jsx` (Next.js-style, inert in Vite) with inline `<style>` fallback that actually works.

---

# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
