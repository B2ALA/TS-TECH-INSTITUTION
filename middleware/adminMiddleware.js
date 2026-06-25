const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access Denied. Root privilege or administrative key validation required." });
    }
    next();
};

module.exports = adminMiddleware;
