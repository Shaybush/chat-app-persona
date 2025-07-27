import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import chatRoutes from './routes/chat';
import healthRoutes from './routes/health';
import personaRoutes from './routes/personas';
import { logRequest } from './utils/logger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { env, logEnvStatus } from './config/env';
import { handleDatabaseDisconnect, checkDatabaseConnection } from './config/database';
import logger from './utils/logger';

const app: express.Application = express();
const port = env.PORT;

// Middlewares
app.use(helmet()); // Security headers
app.use(cors());
app.use(express.json());
app.use(logRequest); // Log all requests

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/personas', personaRoutes);

// Error handling
app.use(notFoundHandler); // Handle 404s
app.use(errorHandler); // Handle all other errors

// Start server with database connection check
const startServer = async () => {
  try {
    // Check database connection
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database. Server not started.');
      process.exit(1);
    }

    const server = app.listen(port, () => {
      logger.info(`🚀 Server is running on port ${port}`, {
        meta: {
          port,
          environment: env.NODE_ENV,
          database: 'Connected ✅'
        }
      });

      // Log environment status
      logEnvStatus();
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed.');

        // Disconnect from database
        await handleDatabaseDisconnect();

        logger.info('Graceful shutdown completed.');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Listen for shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    meta: {
      error: error.message,
      stack: error.stack
    }
  });

  // Exit with error
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    meta: {
      reason,
      promise
    }
  });
});

export default app;
