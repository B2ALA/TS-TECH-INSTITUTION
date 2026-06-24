const express = require('express');
const router = express.Router();

const { readDB, writeDB } = require('../utils/db');
const { generateOtp, setOtp, verifyOtp } = require('../utils/otp');
const { sendOtpEmail } = require('../utils/email');
const { signToken } = require('../utils/token');
const { requireAdmin } = require('../middleware/auth.middleware');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || 'admin-group@tstechpark.com';

/* STEP 1: username + password (hashed comparison should replace this literal
   check once you wire ADMIN_PASSWORD to a hashed value in a real deployment) */
router.post('/request-otp', async (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid admin username or password' });
  }
  const code = generateOtp();
  setOtp('admin:login', code);
  const mail = await sendOtpEmail(ADMIN_EMAIL, code, 'Admin Login');
  res.json({ message: 'OTP sent to the admin group', devOtp: mail.simulated ? code : undefined });
});

/* STEP 2: 6-digit code → short-lived admin JWT */
router.post('/verify-otp', (req, res) => {
  const { code } = req.body;
  const result = verifyOtp('admin:login', code);
  if (!result.ok) return res.status(400).json({ error: result.reason });
  const token = signToken({ role: 'admin', username: ADMIN_USERNAME }, '6h');
  res.json({ token });
});

router.get('/stats', requireAdmin, (req, res) => {
  const db = readDB();
  const students = db.users.filter((u) => u.role === 'Student').length;
  const instructors = db.users.filter((u) => u.role === 'Instructor').length;
  const totalRevenue = db.payments.filter((p) => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
  res.json({
    totalUsers: db.users.length,
    students,
    instructors,
    totalRevenue,
    totalTransactions: db.payments.length,
    paidTransactions: db.payments.filter((p) => p.status === 'Paid').length,
    pendingTransactions: db.payments.filter((p) => p.status !== 'Paid').length,
    pendingInstructors: db.users
      .filter((u) => u.role === 'Instructor' && u.status === 'pending')
      .map(({ passwordHash, ...u }) => u),
  });
});

router.get('/users', requireAdmin, (req, res) => {
  const { search = '', role = '', page = 1, pageSize = 6 } = req.query;
  const db = readDB();
  let users = db.users.map(({ passwordHash, ...u }) => u);
  if (search) {
    const s = String(search).toLowerCase();
    users = users.filter((u) => `${u.firstName} ${u.lastName}`.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
  }
  if (role) users = users.filter((u) => u.role === role);
  const total = users.length;
  const start = (Number(page) - 1) * Number(pageSize);
  const paged = users.slice(start, start + Number(pageSize));
  res.json({ users: paged, total, page: Number(page), pageSize: Number(pageSize) });
});

router.patch('/users/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body; // 'active' | 'suspended'
  const db = readDB();
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.status = status;
  writeDB(db);
  res.json({ message: 'Status updated' });
});

router.patch('/users/:id/approve', requireAdmin, (req, res) => {
  const db = readDB();
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.status = 'active';
  writeDB(db);
  res.json({ message: 'Instructor approved' });
});

router.get('/payments', requireAdmin, (req, res) => {
  const db = readDB();
  res.json({ payments: db.payments });
});

router.post('/live', requireAdmin, (req, res) => {
  const { title, instructor, link, type } = req.body;
  if (!title || !link) return res.status(400).json({ error: 'Title and link are required' });
  const db = readDB();
  const listType = type === 'upcoming' ? 'upcoming' : 'live';
  const session = {
    id: 'live_' + Date.now(),
    title,
    instructor: instructor || 'TS Tech Park',
    link,
    type: listType,
    time: listType === 'upcoming' ? 'Starting soon' : 'LIVE NOW',
    attendees: 0,
  };
  db.live[listType].unshift(session);
  writeDB(db);
  res.json({ message: 'Live session published', session });
});

module.exports = router;
