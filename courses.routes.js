const express = require('express');
const router = express.Router();

const { readDB, writeDB } = require('../utils/db');
const { requireAuth } = require('../middleware/auth.middleware');
const COURSES = require('../data/courses.json');

router.get('/', (req, res) => {
  res.json({ courses: COURSES });
});

router.get('/:id', (req, res) => {
  const course = COURSES.find((c) => c.id === Number(req.params.id));
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json({ course });
});

/* Server-side enrollment: price comes from the backend catalog, never the client,
   so a tampered request can't change what gets charged. */
router.post('/:id/enroll', requireAuth, (req, res) => {
  const course = COURSES.find((c) => c.id === Number(req.params.id));
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const { mode } = req.body; // 'UPI' | 'Online' | 'Cash'
  if (!['UPI', 'Online', 'Cash'].includes(mode)) {
    return res.status(400).json({ error: 'Invalid payment mode' });
  }

  const db = readDB();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (!user.enrolledCourses.includes(course.id)) {
    user.enrolledCourses.push(course.id);
  }

  const now = new Date();
  const payment = {
    id: 'TXN' + now.getTime(),
    userId: user.id,
    accountName: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
    email: user.email,
    courseId: course.id,
    course: course.title,
    amount: course.price,
    mode,
    date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    status: mode === 'Cash' ? 'Pending Confirmation' : 'Paid',
  };
  db.payments.unshift(payment);
  writeDB(db);

  res.json({ message: 'Enrolled successfully', payment, enrolledCourses: user.enrolledCourses });
});

module.exports = router;
