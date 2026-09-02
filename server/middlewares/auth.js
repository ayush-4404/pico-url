const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function authMiddleware(req, res, next) {
    try {
        // 1. get token from header
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // 2. header format is "Bearer <token>" — extract just the token
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Invalid token format' });
        }

        // 3. verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. check user still exists in DB
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ error: 'User no longer exists' });
        }

        // 5. attach user to request — available in all controllers as req.user
        req.user = user;

        next();  // move to the actual route handler

    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired, please login again' });
        }
        return res.status(500).json({ error: 'Server error' });
    }
}

module.exports = authMiddleware;