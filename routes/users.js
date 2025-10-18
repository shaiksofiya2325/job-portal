const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users/:id/profile
// Fetches a user's public profile (for employers to view)
router.get('/:id/profile', async (req, res) => {
    try {
        // Find the user by their ID
        // We use .select() to *exclude* sensitive data
        const user = await User.findById(req.params.id)
            .select('-password -__v'); // Exclude password, etc.

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Only return profiles for job seekers
        if (user.role !== 'job_seeker') {
            return res.status(403).json({ message: 'This user does not have a public profile.' });
        }

        res.status(200).json(user);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;