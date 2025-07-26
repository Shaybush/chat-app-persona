import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import logger from '../utils/logger';

export const validateRequest = (schema: z.ZodType<any, any, any>) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                logger.warn('Validation error', {
                    meta: {
                        method: req.method,
                        url: req.originalUrl,
                        errors: error.issues,
                        statusCode: 400
                    }
                });

                res.status(400).json({
                    error: {
                        message: 'Validation failed',
                        details: error.issues
                    }
                });
            } else {
                next(error);
            }
        }
    };
}; 