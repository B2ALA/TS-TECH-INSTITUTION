const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

/**
 * @route   POST /api/auth/register-student
 * @desc    Onboard new candidate profiles and trigger secure email verification routines
 */
router.post('/register-student', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
                // Enforces verification loop handshakes before system baseline access
                emailRedirectTo: 'https://your-lms-domain.vercel.app/dashboard'
            }
        });

        if (error) return res.status(400).json({ error: error.message });

        return res.status(201).json({
            message: "Profile registration successful. A secure verification link has been transmitted to your email address.",
            user: data.user
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
