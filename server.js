require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected successfully.'))
.catch(err => console.error('MongoDB connection error:', err));

// --- Middleware ---
const FRONTEND_URL = 'https://job-portal-1-lxe1.onrender.com';

// CORS: Allow ONLY your live frontend to make requests
app.use(cors({
    origin: FRONTEND_URL, 
    credentials: true // Allow cookies to be sent
}));

// Body Parsers (same as before)
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Production Session Configuration
app.set('trust proxy', 1); // Trust the Render proxy
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
        httpOnly: true,
        secure: true, // REQUIRES HTTPS
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        sameSite: 'none' // REQUIRED for cross-origin cookies
    }
}));

// Serve static frontend files (HTML, CSS, JS)
app.use(express.static('public'));

// --- API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/users', require('./routes/users')); // For public profiles

// --- Frontend Catch-all ---
app.get('*', (req, res) => {
    // This will result in a 404 if the file isn't found
    // by the express.static middleware
    res.status(404).json({ message: 'Not Found' });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});