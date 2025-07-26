import { z } from 'zod';
import { SupportedModel } from '../services/llmService';

// Validate individual message in chat history
const messageSchema = z.object({
    id: z.string(),
    content: z.string(),
    isUser: z.boolean(),
    timestamp: z.number(),
    personaId: z.string().optional()
});

// Validate the chat message request to match frontend
export const chatMessageSchema = z.object({
    body: z.object({
        message: z.string().min(1, 'Message is required').max(4000, 'Message too long'),
        personaId: z.string().min(1, 'PersonaId is required'),
        chatHistory: z.array(messageSchema).optional().default([]),
        model: z.enum([
            'gpt-4o',
            'gpt-4o-mini',
            'gpt-4-turbo',
            'gpt-3.5-turbo',
            'claude-3-5-sonnet-20241022',
            'claude-3-5-haiku-20241022',
            'claude-3-opus-20240229',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'mistral-large-latest',
            'mistral-small-latest'
        ] as const).optional().default('gpt-3.5-turbo')
    })
});

// Export the message schema for reuse
export { messageSchema }; 