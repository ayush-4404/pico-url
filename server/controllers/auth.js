const jwt  = require('jsonwebtoken');
const User = require('../models/user');
const validatePassword = require('../utils/passwordValidator');

// POST /auth/register
async function handleRegister(req, res) {
    const { name, email, password } = req.body;

    // validate fields
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const validator = typeof validatePassword === 'function' ? validatePassword : validatePassword.default;
    const { isValid, errors } = validator(password);
    if (!isValid) {
        return res.status(400).json({
            error: 'Password does not meet the requirements',
            requirements: errors
        });
    }

    try {
        // check if email already exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // create user — password gets hashed automatically via pre('save') hook
        const user = await User.create({ name, email, password });

        // generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            message: 'Account created successfully',
            token,
            user: {
                id:    user._id,
                name:  user.name,
                email: user.email,
            }
        });

    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
}

// POST /auth/login
async function handleLogin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // compare password using model method
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id:    user._id,
                name:  user.name,
                email: user.email,
            }
        });

    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
}

// GET /auth/me — get current user info
async function handleGetMe(req, res) {
    try {
        // req.user already set by auth middleware — no DB call needed
        return res.json({
            id:        req.user._id,
            name:      req.user.name,
            email:     req.user.email,
            createdAt: req.user.createdAt,
        });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
}

module.exports = { handleRegister, handleLogin, handleGetMe };