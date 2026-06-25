const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Access Denied: Missing Authorization Token.' });

    const token = authHeader.split(' ')[1];
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      if (!allowedRoles.includes(verified.role)) {
        return res.status(403).json({ error: 'Access Forbidden: Insufficient clearance tokens.' });
      }
      req.user = verified;
      next();
    } catch (err) {
      res.status(400).json({ error: 'Invalid Session Handshake Token.' });
    }
  };
};

module.exports = { verifyRole };
