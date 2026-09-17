// Standalone MOCK AUTH SERVER — implements the exact 4 real auth API contracts.
// Dummy base URL (https://mock.easerx.local) ke peeche yeh locally chalta hai.
// Real server aane par sirf client/src/config.js mein API_BASE_URL badalna hai.
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4001;

const users = []; // { userId, fullName, email, phoneNumber, role, clinicName, registrationNo, password, createdAt }
const resetTokens = []; // { userId, token, expiresAt }

// ---------- 1. Register ----------
app.post('/api/auth/register', (req, res) => {
  const { fullName, email, phoneNumber, password, role = 'Doctor', clinicName, registrationNo } =
    req.body || {};
  if (!fullName || !email || !phoneNumber || !password) {
    return res.status(400).json({
      success: false,
      message: 'fullName, email, phoneNumber and password are required.',
    });
  }
  if (users.some((u) => u.email === email)) {
    return res
      .status(409)
      .json({ success: false, message: 'An account with this email already exists.' });
  }
  const userId = 'U' + (1000 + users.length + 1);
  const user = {
    userId,
    fullName,
    email,
    phoneNumber,
    role,
    clinicName: clinicName || null,
    registrationNo: registrationNo || null,
    password,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  res.json({
    success: true,
    data: { userId, email, message: 'Registration successful.' },
  });
});

// ---------- 2. Login (emailOrPhone) ----------
app.post('/api/auth/login', (req, res) => {
  const { emailOrPhone, password } = req.body || {};
  if (!emailOrPhone || !password) {
    return res.status(400).json({ success: false, message: 'emailOrPhone and password are required.' });
  }
  const user = users.find(
    (u) => (u.email === emailOrPhone || u.phoneNumber === emailOrPhone) && u.password === password
  );
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email/phone or password.' });
  }
  res.json({
    success: true,
    data: {
      token: 'jwt-mock-' + Date.now(),
      user: { userId: user.userId, name: user.fullName, email: user.email, role: user.role },
    },
  });
});

// ---------- 3. Forgot password ----------
app.post('/api/auth/forgot-password', (req, res) => {
  const { email, client } = req.body || {};
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }
  const user = users.find((u) => u.email === email);
  const token = 'RESET-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  if (user) {
    resetTokens.push({ userId: user.userId, token, expiresAt: Date.now() + 15 * 60 * 1000 });
  }
  // devToken sirf mock convenience — real server pe email se code aayega
  res.json({
    success: true,
    data: { message: 'Reset instructions sent.', client: client || null, devToken: token },
  });
});

// ---------- 4. Reset password ----------
app.post('/api/auth/reset-password', (req, res) => {
  const { userId, token, newPassword } = req.body || {};
  if (!userId || !token || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: 'userId, token and newPassword are required.' });
  }
  const entry = resetTokens.find(
    (t) => t.userId === userId && t.token === token && t.expiresAt > Date.now()
  );
  if (!entry) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
  }
  const user = users.find((u) => u.userId === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
  user.password = newPassword;
  resetTokens.splice(resetTokens.indexOf(entry), 1);
  res.json({ success: true, data: { message: 'Password updated successfully.' } });
});

// ---------- Demo feature endpoints: yahan nahi hain ----------
app.use('/api', (req, res) =>
  res.status(501).json({
    success: false,
    message: 'Demo features need the main server (port 4000), or set USE_MOCK=false in config.js.',
  })
);

app.listen(PORT, () => {
  console.log(`EaseRX MOCK AUTH API (dummy base URL target) on http://localhost:${PORT}`);
});
