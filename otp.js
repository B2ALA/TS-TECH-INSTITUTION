const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../config/supabaseAdmin');
const { sendMail } = require('../config/mailer');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

function genCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

/**
 * STEP 1 of admin login: after normal email/password login succeeds (Supabase Auth),
 * the frontend calls this to trigger a 6-digit code sent ONLY to SUPER_ADMIN_EMAIL.
 * Requires a valid Supabase session token from a profile with role='admin'.
 */
router.post('/request', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const code = genCode();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min
    const targetEmail = process.env.SUPER_ADMIN_EMAIL;

    await supabaseAdmin.from('admin_otp_codes').insert({
      email: targetEmail,
      code,
      expires_at,
    });

    await sendMail({
      to: targetEmail,
      subject: 'TS Tech Park Admin — Your Verification Code',
      html: `<p>Your admin verification code is:</p><h2>${code}</h2><p>Expires in 10 minutes. If you did not request this, secure your account immediately.</p>`,
    });

    res.json({ message: `Verification code sent to ${targetEmail}` });
  } catch (err) {
    console.error('OTP request error:', err);
    res.status(500).json({ error: 'Could not send verification code' });
  }
});

/** STEP 2: verify the code the admin typed in */
router.post('/verify', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code required' });

    const { data: rows, error } = await supabaseAdmin
      .from('admin_otp_codes')
      .select('*')
      .eq('email', process.env.SUPER_ADMIN_EMAIL)
      .eq('code', code)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !rows?.length) return res.status(400).json({ error: 'Invalid code' });
    const otp = rows[0];
    if (new Date(otp.expires_at) < new Date()) return res.status(400).json({ error: 'Code expired' });

    await supabaseAdmin.from('admin_otp_codes').update({ used: true }).eq('id', otp.id);

    res.json({ verified: true });
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;
