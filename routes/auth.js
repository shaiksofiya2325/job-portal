const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        user = new User({ name, email, password, role });
        await user.save();
        
        req.session.userId = user._id;
        req.session.userRole = user.role;
        
        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(201).json(userResponse);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        req.session.userId = user._id;
        req.session.userRole = user.role;

        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(200).json(userResponse);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/auth/logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out, please try again' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

// GET /api/auth/me
// Checks if a user is currently logged in via session
router.get('/me', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    try {
        const user = await User.findById(req.session.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT /api/auth/profile
// Update the logged-in user's own profile
router.put('/profile', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    const { name, contact, bio, skills } = req.body;

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        user.name = name || user.name;
        user.contact = contact; // Allow setting to empty string
        user.bio = bio; // Allow setting to empty string
        
        // Skills are sent as a comma-separated string
        if (typeof skills === 'string') {
            user.skills = skills.split(',').map(skill => skill.trim()).filter(Boolean);
        }

        const updatedUser = await user.save();
        
        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        res.status(200).json(userResponse);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;