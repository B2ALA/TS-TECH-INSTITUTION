const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../config/supabaseAdmin');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// All routes below require a verified admin session.
// NOTE: pair this with the OTP flow in routes/otp.js on the frontend —
// i.e. only let the admin UI call these AFTER /api/otp/verify succeeds.
router.use(requireAuth, requireRole('admin'));

/** Dashboard summary numbers */
router.get('/stats', async (req, res) => {
  try {
    const [{ count: totalUsers }, { count: students }, { count: instructors },
           { count: courses }, { count: enrollments }, { data: payments }] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'instructor'),
      supabaseAdmin.from('courses').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('enrollments').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('payments').select('amount'),
    ]);

    const totalRevenue = (payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);

    res.json({ totalUsers, students, instructors, courses, enrollments,
      totalPayments: (payments || []).length, totalRevenue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

/** Signups per day, last 14 days — for the "new users per day" chart */
router.get('/signups-per-day', async (req, res) => {
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabaseAdmin
    .from('profiles').select('created_at').gte('created_at', since);
  if (error) return res.status(500).json({ error: error.message });

  const byDay = {};
  (data || []).forEach(p => {
    const day = p.created_at.slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
  });
  res.json(byDay);
});

/** List students or instructors with name + email, optional search */
router.get('/users', async (req, res) => {
  const { role = '', search = '' } = req.query;
  let q = supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false });
  if (role) q = q.eq('role', role);
  if (search) q = q.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

/** Block / unblock any student or instructor account */
router.patch('/users/:id/block', async (req, res) => {
  const { blocked } = req.body; // true | false
  const { error } = await supabaseAdmin
    .from('profiles').update({ is_blocked: !!blocked }).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });

  await supabaseAdmin.from('activity_log').insert({
    actor_id: req.profile.id,
    action: blocked ? 'suspend_user' : 'unsuspend_user',
    meta: { target: req.params.id },
  });
  res.json({ ok: true });
});

/** Approve a pending instructor registration */
router.patch('/users/:id/approve', async (req, res) => {
  const { error } = await supabaseAdmin
    .from('profiles').update({ is_approved: true }).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

/** Post a live class link (Zoom / Google Meet / YouTube live) */
router.post('/live-classes', async (req, res) => {
  const { title, meeting_url, status, scheduled_at } = req.body;
  if (!title || !meeting_url) return res.status(400).json({ error: 'title and meeting_url required' });
  const { data, error } = await supabaseAdmin.from('live_classes').insert({
    title, meeting_url, status: status || 'upcoming', scheduled_at,
    instructor_id: req.profile.id,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

/** Recent activity feed */
router.get('/activity', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('activity_log').select('*').order('created_at', { ascending: false }).limit(30);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
