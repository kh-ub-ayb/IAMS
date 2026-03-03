const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');

const PORT = config.port;

const server = app.listen(PORT, () => {
    logger.info(`IAMS server started`);
    logger.info(`Environment : ${config.env}`);
    logger.info(`Port        : ${PORT}`);
    logger.info(`Health URL  : http://localhost:${PORT}/health`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const shutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
    });

    // Force quit if still running after 10s
    setTimeout(() => {
        logger.error('Forced shutdown after timeout.');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection:', err);
    shutdown('unhandledRejection');
});

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
