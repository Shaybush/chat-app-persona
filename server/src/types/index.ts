export * from './Persona';

// Common request/response types
export interface ApiResponse<T> {
    data?: T;
    error?: {
        message: string;
        details?: unknown;
    };
    statusCode: number;
}

// Error types
export interface AppError extends Error {
    statusCode?: number;
    details?: unknown;
} 