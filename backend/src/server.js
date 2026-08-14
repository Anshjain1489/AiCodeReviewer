const app = require('./app');
const { validateEnv, env } = require('./config/env');
const { connectDatabase } = require('./config/database');
const logger = require('./config/logger');

async function startServer() {
  try {
    // 1. Validate required environment variables (Fails fast if DB/JWT missing)
    validateEnv();

    // 2. Connect to PostgreSQL database via Prisma
    await connectDatabase();

    // 3. Start Express server on process.env.PORT
    const PORT = env.PORT || 5000;
    const server = app.listen(PORT, () => {
      logger.info(`AI Code Reviewer API server running on port ${PORT} [Mode: ${env.NODE_ENV}] [AI Provider: ${env.AI_PROVIDER}]`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
