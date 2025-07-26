import { z } from 'zod'

const envSchema = z.object({
    // OpenAI API Configuration
    OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required').optional(),
    OPENAI_MODEL: z.string().default('gpt-3.5-turbo'),

    // Application Configuration
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // API Configuration
    API_URL: z.string().url().optional(),
    API_TIMEOUT: z.string().transform(Number).default('10000'),

    // Rate Limiting
    RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
    RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes

    // Chat Configuration
    MAX_MESSAGE_LENGTH: z.string().transform(Number).default('2000'),
    MAX_CHAT_HISTORY: z.string().transform(Number).default('50'),
})

const processEnv = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_URL: process.env.API_URL,
    API_TIMEOUT: process.env.API_TIMEOUT || '10000',
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || '100',
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || '900000',
    MAX_MESSAGE_LENGTH: process.env.MAX_MESSAGE_LENGTH || '2000',
    MAX_CHAT_HISTORY: process.env.MAX_CHAT_HISTORY || '50',
}

let env: z.infer<typeof envSchema>

try {
    env = envSchema.parse(processEnv)
} catch (error) {
    if (error instanceof z.ZodError) {
        console.error('❌ Invalid environment variables:', error.flatten().fieldErrors)
        throw new Error('Invalid environment variables')
    }
    throw error
}

export { env }

// Helper functions
export const isProduction = () => env.NODE_ENV === 'production'
export const isDevelopment = () => env.NODE_ENV === 'development'
export const isTest = () => env.NODE_ENV === 'test'

// Configuration constants
export const CONFIG = {
    api: {
        timeout: env.API_TIMEOUT,
        baseUrl: env.API_URL || '/api',
    },
    chat: {
        maxMessageLength: env.MAX_MESSAGE_LENGTH,
        maxHistoryLength: env.MAX_CHAT_HISTORY,
    },
    rateLimit: {
        maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
        windowMs: env.RATE_LIMIT_WINDOW_MS,
    },
    openai: {
        apiKey: env.OPENAI_API_KEY,
        model: env.OPENAI_MODEL,
    },
} as const 