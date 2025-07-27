export * from './Persona';

// Message interface matching frontend
export interface Message {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: number;
    personaId?: string;
}

// Chat history interface matching frontend
export interface ChatHistory {
    [personaId: string]: Message[];
}

// Common request/response types
export interface ApiResponse<T> {
    data?: T;
    error?: {
        message: string;
        details?: unknown;
    };
    statusCode: number;
}

// Chat-specific request/response types
export interface SendMessageRequest {
    message: string;
    personaId: string;
    chatHistory?: Message[];
    model?: string;
}

export interface SendMessageResponse {
    message: Message;
    success: boolean;
    error?: string;
}

// Error types
export interface AppError extends Error {
    statusCode?: number;
    details?: unknown;
} 