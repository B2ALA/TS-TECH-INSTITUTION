const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

/**
 * @route   POST /api/payments/record
 * @desc    Log a newly finalized transaction (UPI, Online, Cash, Bank Transfer)
 * @access  Private (Authenticated Students / Admins)
 */
router.post('/record', authMiddleware, async (req, res) => {
    try {
        const { transactionHash, accountName, courseId, courseName, paymentMode, grossAmount } = req.body;
        
        if (!transactionHash || !accountName || !courseId || !courseName || !paymentMode || !grossAmount) {
            return res.status(400).json({ error: "Missing required properties inside transaction log payload." });
        }

        const newRecord = await Payment.createRecord({
            transactionHash,
            userId: req.user.id,
            accountName,
            courseId,
            courseName,
            paymentMode,
            grossAmount
        });

        return res.status(201).json({
            message: "Payment ledger row successfully recorded.",
            record: newRecord
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/payments/my-ledger
 * @desc    Fetch transactional rows tied strictly to the requesting user identity
 * @access  Private (Student Candidate Token)
 */
router.get('/my-ledger', authMiddleware, async (req, res) => {
    try {
        const records = await Payment.fetchUserLedger(req.user.id);
        return res.status(200).json({ records });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/payments/global-audit
 * @desc    Retrieve centralized accounting spreadsheets across all student rows
 * @access  Private (Super Admin Key Guarded Only)
 */
router.get('/global-audit', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const records = await Payment.fetchGlobalAuditRegistry();
        return res.status(200).json({ records });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
