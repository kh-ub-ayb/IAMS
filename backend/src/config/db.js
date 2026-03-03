const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongoUri);

        logger.info(`MongoDB Connected: ${conn.connection.host}`);
        logger.info(`Database Name   : ${conn.connection.name}`);
    } catch (error) {
        logger.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

// Mongoose global event listeners
mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB error: ${err.message}`);
});

module.exports = connectDB;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
