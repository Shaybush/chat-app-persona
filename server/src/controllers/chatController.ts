import { Request, Response } from 'express';
import { ChatService } from '../services/chatService';
import type { SendMessageRequest, SendMessageResponse } from '../types';
import { SupportedModel } from '../services/llmService';
import logger from '../utils/logger';

const chatService = new ChatService();

/**
 * Send a chat message and get AI response
 */
export async function sendMessage(req: Request, res: Response): Promise<void> {
    try {
        const { message, personaId, chatHistory = [], model = 'gpt-4o' }: SendMessageRequest = req.body;

        // Validate required fields
        if (!message || !message.trim()) {
            res.status(400).json({
                success: false,
                error: 'Message is required and cannot be empty'
            });
            return;
        }

        if (!personaId || !personaId.trim()) {
            res.status(400).json({
                success: false,
                error: 'PersonaId is required'
            });
            return;
        }

        // Validate message length (optional: add to config)
        const MAX_MESSAGE_LENGTH = 4000;
        if (message.length > MAX_MESSAGE_LENGTH) {
            res.status(400).json({
                success: false,
                error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`
            });
            return;
        }

        // Validate model if provided
        const supportedModels: SupportedModel[] = [
            'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo',
            'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229',
            'gemini-1.5-pro', 'gemini-1.5-flash',
            'mistral-large-latest', 'mistral-small-latest'
        ];

        if (model && !supportedModels.includes(model as SupportedModel)) {
            res.status(400).json({
                success: false,
                error: `Unsupported model: ${model}. Supported models: ${supportedModels.join(', ')}`
            });
            return;
        }

        // Log the request for debugging
        logger.info('Chat request received', {
            personaId,
            model,
            messageLength: message.length,
            historyLength: chatHistory.length
        });

        // Send message using chat service
        const result = await chatService.sendMessage({
            message: message.trim(),
            personaId,
            model: model as SupportedModel,
            chatHistory
        });

        // Log successful response
        logger.info('Chat response generated', {
            personaId,
            model,
            responseLength: result.message.content.length,
            responseId: result.message.id,
            sessionId: result.sessionId
        });

        // Return in standard API response format
        res.status(200).json({
            success: true,
            data: {
                message: result.message,
                success: true
            }
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Log the error
        logger.error('Error in sendMessage controller', {
            error: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            body: req.body
        });

        // Handle specific error cases
        if (errorMessage.includes('not found')) {
            res.status(404).json({
                success: false,
                error: errorMessage
            });
            return;
        }

        // Send error response
        res.status(500).json({
            success: false,
            error: 'Internal server error. Please try again later.',
            message: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
}

/**
 * Get chat history for a persona
 */
export async function getChatHistory(req: Request, res: Response): Promise<void> {
    try {
        const { personaId } = req.params;

        if (!personaId) {
            res.status(400).json({
                success: false,
                error: 'PersonaId is required'
            });
            return;
        }

        // Get chat history from database
        const history = await chatService.getChatHistory(personaId);

        res.status(200).json({
            success: true,
            data: history
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        logger.error('Error in getChatHistory controller', {
            error: errorMessage,
            personaId: req.params.personaId
        });

        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Clear chat history for a persona
 */
export async function clearChatHistory(req: Request, res: Response): Promise<void> {
    try {
        const { personaId } = req.params;

        if (!personaId) {
            res.status(400).json({
                success: false,
                error: 'PersonaId is required'
            });
            return;
        }

        // Clear chat history in database
        await chatService.clearChatHistory(personaId);

        res.status(200).json({
            success: true,
            message: 'Chat history cleared successfully'
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        logger.error('Error in clearChatHistory controller', {
            error: errorMessage,
            personaId: req.params.personaId
        });

        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
} 