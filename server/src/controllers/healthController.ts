import { Request, Response } from 'express';
import logger from '../utils/logger';

export const healthCheck = (req: Request, res: Response): void => {
    const healthData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
    };

    logger.info('Health check performed', {
        meta: {
            status: 'ok',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        }
    });

    res.status(200).json(healthData);
}; 