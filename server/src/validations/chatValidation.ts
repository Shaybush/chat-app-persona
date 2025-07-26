import { z } from 'zod';
import { SupportedModel } from '../services/llmService';

// Validate the persona object
const personaSchema = z.object({
    name: z.string().min(1),
    systemPrompt: z.string().min(1),
    description: z.string().optional(),
    avatarUrl: z.string().optional()
});

// Validate the chat message request
export const chatMessageSchema = z.object({
    body: z.object({
        message: z.string().min(1, 'Message is required'),
        persona: personaSchema,
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
        ] as const).optional()
    })
});

// Export the persona schema for reuse
export { personaSchema }; 