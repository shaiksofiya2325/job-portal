const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['job_seeker', 'employer'],
        required: true
    },

    // --- PROFILE FIELDS ---
    contact: { 
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: 'No biography provided.'
    },
    skills: {
        type: [String], // An array of strings
        default: []
    },
    education: {
        type: [{
            school: String,
            degree: String,
            year: String
        }],
        default: []
    },
    workHistory: {
        type: [{
            company: String,
            title: String,
            years: String
        }],
        default: []
    }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);