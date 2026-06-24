const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', requireAuth, (req, res) => {
  // Demo feed — swap for a real notifications table keyed by user id.
  res.json({
    notifications: [
      { icon: 'fa-robot', title: 'AI Quiz Ready', body: 'A new quiz has been generated for you', time: '2 min ago', unread: true },
      { icon: 'fa-certificate', title: 'Certificate System Live', body: 'Complete a course to earn your first certificate', time: '1 hr ago', unread: true },
      { icon: 'fa-video', title: 'Live Class Today', body: "Check the Live page for today's sessions", time: '25 min ago', unread: false },
      { icon: 'fa-trophy', title: 'Gamification Enabled', body: 'Earn XP and badges as you learn', time: '3 hr ago', unread: false },
    ],
  });
});

module.exports = router;
