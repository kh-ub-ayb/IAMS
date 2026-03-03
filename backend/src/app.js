const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const config = require('./config/env');
const logger = require('./utils/logger');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

// ─── Route Imports ────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth.route');
const testRoutes = require('./routes/test.route');
const academicRoutes = require('./routes/academic.route');
const userRoutes = require('./routes/user.route');
const attendanceRoutes = require('./routes/attendance.route');
const feeRoutes = require('./routes/fee.route');
const announcementRoutes = require('./routes/announcement.route');
const aiRoutes = require('./routes/ai.route');


const app = express();

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Security & Utility Middleware ───────────────────────────────────────────
app.use(helmet());           // Sets secure HTTP headers
app.use(cors());             // Enable CORS (configure origins in production)
app.use(express.json());     // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// HTTP request logger (skip in test environment)
if (config.env !== 'test') {
    app.use(
        morgan('dev', {
            stream: { write: (message) => logger.debug(message.trim()) },
        })
    );
}

// ─── Routes ──────────────────────────────────────────────────────────────────
// Health route — inline here so it shows live DB status
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.status(200).json({
        success: true,
        message: 'IAMS API is operational.',
        environment: config.env,
        database: dbState[dbStatus] || 'unknown',
        timestamp: new Date().toISOString(),
    });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/test', testRoutes);
app.use('/api/v1/academic', academicRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/fees', feeRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/ai', aiRoutes);


app.all('*', (req, res, next) => {
    next(new AppError(`Route ${req.originalUrl} not found.`, 404));
});

// ─── Centralized Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
