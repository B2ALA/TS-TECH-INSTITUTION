const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Access denied. Security authentication token missing." });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch active platform profile context from database mapping logic
        const userProfile = await User.findById(decoded.id);
        if (!userProfile) {
            return res.status(404).json({ error: "Authenticated profile instance does not exist." });
        }

        if (userProfile.status === 'blocked') {
            return res.status(403).json({ error: "This terminal profile has been locked by administration control." });
        }

        // Attach verified user contexts to request pipeline
        req.user = userProfile;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Session validation failed. Token is expired or invalid." });
    }
};

module.exports = authMiddleware;
