const express = require('express');
const router = express.Router();
const User = require('../models/User');
const supabase = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

/**
 * @route   GET /api/admin/profiles
 * @desc    List all registration contexts configured inside the application core
 * @access  Private (Admin Role Enforced)
 */
router.get('/profiles', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return res.status(200).json({ profiles: data });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   PATCH /api/admin/profile/:id/status
 * @desc    Modify identity security flags (e.g., clear pending instructor approval tags)
 * @access  Private (Admin Role Enforced)
 */
router.patch('/profile/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const targetProfileId = req.params.id;
        const { status } = req.body;

        if (!['active', 'blocked', 'pending_approval'].includes(status)) {
            return res.status(400).json({ error: "Target state parameters violate compliance rule declarations." });
        }

        const modifiedProfile = await User.updateStatus(targetProfileId, status);
        return res.status(200).json({
            message: `User identity configuration status successfully shifted to [${status}].`,
            profile: modifiedProfile
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
