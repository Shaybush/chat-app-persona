import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { env } from './env';

// Singleton pattern for Prisma Client
declare global {
    var __prisma: PrismaClient | undefined;
}

// Create Prisma Client instance
class DatabaseConnection {
    private static instance: PrismaClient;

    private constructor() { }

    public static getInstance(): PrismaClient {
        if (!DatabaseConnection.instance) {
            // Use global variable in development to prevent multiple instances
            if (env.NODE_ENV === 'development' && global.__prisma) {
                DatabaseConnection.instance = global.__prisma;
            } else {
                DatabaseConnection.instance = new PrismaClient({
                    log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
                    errorFormat: 'pretty',
                });

                if (env.NODE_ENV === 'development') {
                    global.__prisma = DatabaseConnection.instance;
                }
            }

            logger.info('Database connection established', {
                environment: env.NODE_ENV,
                databaseUrl: env.DATABASE_URL ? 'Set ✅' : 'Not set ❌'
            });
        }

        return DatabaseConnection.instance;
    }

    public static async disconnect(): Promise<void> {
        if (DatabaseConnection.instance) {
            await DatabaseConnection.instance.$disconnect();
            logger.info('Database connection closed');
        }
    }
}

// Export singleton instance
export const prisma = DatabaseConnection.getInstance();

// Graceful shutdown handler
export const handleDatabaseDisconnect = async (): Promise<void> => {
    await DatabaseConnection.disconnect();
};

// Connection health check
export const checkDatabaseConnection = async (): Promise<boolean> => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (error) {
        logger.error('Database connection check failed', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return false;
    }
}; 