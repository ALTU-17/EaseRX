# EaseRX — Demo MVP

A clickable demo of **EaseRX**, a smart practice-management app for doctors
(patients, prescriptions, billing, settings, plans). Built as a two-part app:

- **`/server`** — Node.js + Express API with an in-memory mock database
  (resets on restart — perfect for a demo, no DB setup required).
- **`/client`** — React 18 + Vite + Tailwind CSS front end, using the
  "Clinical Precision" design system (navy/cyan, Plus Jakarta Sans,
  soft-shadow cards) supplied for this project.

## Quick start

Open two terminals.

**1. Start the API (port 4000)**
```bash
cd server
npm install
npm start
```

**2. Start the client (port 5173)**
```bash
cd client
npm install
npm run dev
```

Then open **http://localhost:5173**.

### Auth APIs (real server contract, mock backend)

Auth calls go to the **real server's API contract** (register / login /
forgot-password / reset-password). Since the real server isn't available yet,
a **dummy base URL** (`https://mock.easerx.local` in `client/src/config.js`)
routes auth to a local mock implementing the exact same endpoints:

```bash
cd server
node mock-auth-server.js   # mock auth API on http://localhost:4001
```

| Endpoint | Payload |
|---|---|
| `POST /api/auth/register` | `{ fullName, clinicName?, registrationNo?, phoneNumber, email, password, role }` |
| `POST /api/auth/login` | `{ emailOrPhone, password }` — email **or** phone works |
| `POST /api/auth/forgot-password` | `{ email, client: "easeRX" }` |
| `POST /api/auth/reset-password` | `{ userId, token, newPassword }` |

**When the real server is ready:** open `client/src/config.js` and change
`API_BASE_URL` to the real URL (use `'/api'` to go through the Vite proxy to
port 4000). No other change needed anywhere.

> Demo feature endpoints (dashboard, patients, prescriptions, bills, settings,
> plans, booking) still run on the main Express server (port 4000) above.

## What's included

| Screen | Route | Notes |
|---|---|---|
| Sign in / Join now | `/login` | Mock auth, issues a fake token stored in `localStorage` |
| Dashboard & Analytics | `/dashboard` | Stat cards, recent activity, new patients, revenue trend bar chart |
| Patients | `/patients` | Searchable patient list, add-patient modal |
| Rx — New Prescription & Bill | `/rx` | Patient info + vitals + line-item medicines, saves a draft prescription |
| Bill | `/bill` | Invoice list generated from saved prescriptions |
| Settings | `/settings` | Account verification form + PDF/print configuration with a live prescription preview |
| Plans | `/plans` | Basic / Pro / Elite pricing cards with a mock upgrade flow |

## Notes for the client

This is an MVP demo, not production software:
- Auth uses the real API contract against a local mock (`server/mock-auth-server.js`, port 4001) until the real server is available — **register first**, then sign in.
- Demo feature data lives in memory on the main server and resets whenever it restarts.
- No real PDF generation or payment processing is wired up — the
  "Save Configuration" and "Upgrade to Pro" actions simulate the result.
