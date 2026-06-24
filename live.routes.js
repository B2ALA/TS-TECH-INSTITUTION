const express = require('express');
const router = express.Router();

const { readDB } = require('../utils/db');

router.get('/:type', (req, res) => {
  const db = readDB();
  const list = db.live[req.params.type] || [];
  res.json({ sessions: list });
});

module.exports = router;
