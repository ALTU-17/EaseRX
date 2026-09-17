// ⚙️ EK HI JAGAH SWITCH — real server aaye toh sirf API_BASE_URL badalna.
// Dummy base URL (server abhi available nahi):
export const API_BASE_URL = 'https://mock.easerx.local';

// Relative base (e.g. '/api') = Vite proxy use hoga → http://localhost:4000
export const USE_PROXY = !API_BASE_URL.startsWith('http');

// Dummy base URL ke peeche ka local mock (server/mock-auth-server.js, port 4001)
export const MOCK_BASE_URL = 'http://localhost:4001/api';
export const USE_MOCK = API_BASE_URL.includes('mock.easerx.local');
