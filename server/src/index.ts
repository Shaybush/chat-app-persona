import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import chatRoutes from './routes/chat';
import healthRoutes from './routes/health';
import { logRequest } from './utils/logger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { env, logEnvStatus } from './config/env';
import logger from './utils/logger';

const app = express();
const port = env.PORT;

// Middlewares
app.use(helmet()); // Security headers
app.use(cors());
app.use(express.json());
app.use(logRequest); // Log all requests

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/health', healthRoutes);

// Error handling
app.use(notFoundHandler); // Handle 404s
app.use(errorHandler); // Handle all other errors

// Start server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`, {
    meta: {
      port,
      environment: env.NODE_ENV
    }
  });

  // Log environment status
  logEnvStatus();
});

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
