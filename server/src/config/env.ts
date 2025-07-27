import dotenv from 'dotenv';
import logger from '../utils/logger';

// Load environment variables from .env file
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
    'OPENAI_API_KEY',
    'DATABASE_URL',
    // Add other required env vars as needed
];

const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
    logger.warn(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Export environment variables with types
export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5001', 10),
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/chat_project',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
};

// Log environment status (without showing actual API keys)
export const logEnvStatus = (): void => {
    logger.info('Environment variables loaded', {
        meta: {
            NODE_ENV: env.NODE_ENV,
            PORT: env.PORT,
            DATABASE_URL: env.DATABASE_URL ? 'Set ✅' : 'Not set ❌',
            OPENAI_API_KEY: env.OPENAI_API_KEY ? 'Set ✅' : 'Not set ❌',
            ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY ? 'Set ✅' : 'Not set ❌',
            GOOGLE_API_KEY: env.GOOGLE_API_KEY ? 'Set ✅' : 'Not set ❌',
            MISTRAL_API_KEY: env.MISTRAL_API_KEY ? 'Set ✅' : 'Not set ❌',
        }
    });
}; 