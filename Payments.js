const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../config/supabaseAdmin');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * DUMMY CHECKOUT — no real payment gateway is called.
 * Records a fake "successful" transaction for display/demo purposes
 * (history table, invoices, admin revenue stats) and auto-enrolls the student.
 */
router.post('/checkout', requireAuth, async (req, res) => {
  try {
    const { course_id, amount, method } = req.body;
    if (!course_id || amount == null || !method) {
      return res.status(400).json({ error: 'course_id, amount and method required' });
    }

    const reference_id = 'TS-DUMMY-' + Date.now().toString(36).toUpperCase();

    const { data: payment, error: payErr } = await supabaseAdmin.from('payments').insert({
      student_id: req.profile.id,
      course_id,
      amount,
      method,                 // 'upi' | 'card' | 'netbanking' | 'cash' | 'dummy'
      status: 'success',
      reference_id,
    }).select().single();
    if (payErr) return res.status(500).json({ error: payErr.message });

    await supabaseAdmin.from('enrollments').upsert({
      student_id: req.profile.id,
      course_id,
    }, { onConflict: 'student_id,course_id' });

    res.json({ ok: true, payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Dummy checkout failed' });
  }
});

/** Logged-in student's own payment history, newest first, with course title joined in */
router.get('/history', requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*, courses(title)')
    .eq('student_id', req.profile.id)
    .order('paid_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
