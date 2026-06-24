const express = require('express');
const router = express.Router();

const { readDB } = require('../utils/db');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/me', requireAuth, (req, res) => {
  const db = readDB();
  const payments = db.payments.filter((p) => p.userId === req.user.id);
  res.json({ payments });
});

module.exports = router;
