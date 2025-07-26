import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface ErrorWithStatus extends Error {
    status?: number;
    statusCode?: number;
}

export const errorHandler = (
    err: ErrorWithStatus,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Determine status code
    const statusCode = err.status || err.statusCode || 500;

    // Log error
    logger.error(`Error: ${err.message}`, {
        meta: {
            method: req.method,
            url: req.originalUrl,
            statusCode,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
            error: err.message
        }
    });

    // Send response
    res.status(statusCode).json({
        error: {
            message: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

// Handle 404 errors
export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const error: ErrorWithStatus = new Error(`Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
}; 