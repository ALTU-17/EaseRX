// ⚙️ EK HI JAGAH SWITCH — API mode yahin se control hota hai.
//
// Modes:
//   USE_DEMO = true   → static client-side demo (demoData.js), backend ki zaroorat NAHI  [default]
//   USE_DEMO = false  → real HTTP API. API_BASE_URL ko inme se ek par set karo:
//        REAL_BASE_URL    → actual .NET server   (https://localhost:7161/api)
//        MIRROR_BASE_URL  → local contract mirror (http://localhost:4000/api)
//
// Real server par jaane ke liye bas 2 lines:
//   export const USE_DEMO = false;
//   export const API_BASE_URL = REAL_BASE_URL;

export const USE_DEMO = true;

// Real .NET backend (frontend handoff)
export const REAL_BASE_URL = 'https://localhost:7161/api';
// Local Express server, extended to mirror the same /api/rx/* contract (verification ke liye)
export const MIRROR_BASE_URL = 'http://localhost:4000/api';
// Legacy alias kept for backwards compatibility
export const MOCK_BASE_URL = MIRROR_BASE_URL;

// Dummy base URL — USE_DEMO=true mein use nahi hota
export const API_BASE_URL = 'https://mock.easerx.local';

// Relative base (e.g. '/api') = Vite proxy use hoga → http://localhost:4000
export const USE_PROXY = !API_BASE_URL.startsWith('http');
export const USE_MOCK = API_BASE_URL.includes('mock.easerx.local');

// forgot-password ke saath bheja jaane wala client identifier (latest handoff: RxMaker)
export const CLIENT_ID = 'RxMaker';
