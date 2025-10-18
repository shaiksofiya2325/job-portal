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

// CORS: Allow frontend (running on the same origin) to send credentials
app.use(cors({
    origin: `http://localhost:${PORT}`, // Allow requests from our own frontend
    credentials: true // Allow cookies to be sent
}));

// Body Parsers: To read req.body
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
        httpOnly: true, // Prevent client-side JS from reading the cookie
        secure: false, // Set to true in production (when using HTTPS)
        maxAge: 1000 * 60 * 60 * 24 // 1 day
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