import { ChatSessionRepository } from '../repositories/chatSessionRepository';
import { MessageRepository } from '../repositories/messageRepository';
import { PersonaRepository } from '../repositories/personaRepository';
import { getPersonaReplyWithHistory, createMessage, SupportedModel } from './llmService';
import { Message } from '../types';
import logger from '../utils/logger';

export class ChatService {
    private chatSessionRepository: ChatSessionRepository;
    private messageRepository: MessageRepository;
    private personaRepository: PersonaRepository;

    constructor() {
        this.chatSessionRepository = new ChatSessionRepository();
        this.messageRepository = new MessageRepository();
        this.personaRepository = new PersonaRepository();
    }

    /**
     * Send a message and get AI response
     */
    async sendMessage(data: {
        message: string;
        personaId: string;
        userId?: string;
        model?: SupportedModel;
        chatHistory?: Message[];
    }): Promise<{
        message: Message;
        sessionId: string;
    }> {
        try {
            console.log('ChatService.sendMessage: Starting with data:', { personaId: data.personaId, message: data.message });

            // Validate persona exists
            console.log('ChatService.sendMessage: Looking for persona:', data.personaId);
            const persona = await this.personaRepository.findById(data.personaId);
            console.log('ChatService.sendMessage: Found persona:', persona ? persona.name : 'NOT FOUND');

            if (!persona) {
                throw new Error(`Persona '${data.personaId}' not found`);
            }

            // Get or create chat session
            console.log('ChatService.sendMessage: Getting or creating session for persona:', data.personaId);
            const session = await this.chatSessionRepository.getOrCreateForPersona(
                data.personaId,
                data.userId
            );
            console.log('ChatService.sendMessage: Got session:', session.id);

            // Get conversation history from database if not provided
            let conversationHistory = data.chatHistory;
            if (!conversationHistory) {
                conversationHistory = await this.messageRepository.getConversationHistory(session.id);
            }

            // Save user message to database
            const userMessage = await this.messageRepository.create({
                content: data.message,
                isUser: true,
                sessionId: session.id,
                personaId: data.personaId
            });

            // Get AI response
            const aiResponseContent = await getPersonaReplyWithHistory(
                data.message,
                persona.systemPrompt,
                conversationHistory,
                data.model || 'gpt-3.5-turbo'
            );

            // Save AI message to database
            const aiMessage = await this.messageRepository.create({
                content: aiResponseContent,
                isUser: false,
                sessionId: session.id,
                personaId: data.personaId,
                model: data.model
            });

            // Touch session to update timestamp
            await this.chatSessionRepository.touch(session.id);

            // Convert AI message to frontend format
            const formattedAiMessage: Message = {
                id: aiMessage.id,
                content: aiMessage.content,
                isUser: false,
                timestamp: aiMessage.createdAt.getTime(),
                personaId: aiMessage.personaId
            };

            return {
                message: formattedAiMessage,
                sessionId: session.id
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;

            logger.error('Error in ChatService.sendMessage', {
                data,
                error: errorMessage,
                stack: errorStack,
                step: 'Unknown step'
            });

            console.error('ChatService.sendMessage detailed error:', {
                message: errorMessage,
                stack: errorStack,
                personaId: data.personaId,
                messageContent: data.message
            });

            throw error;
        }
    }

    /**
     * Get chat history for a persona
     */
    async getChatHistory(personaId: string, userId?: string): Promise<Message[]> {
        try {
            // Get the most recent session for this persona
            const sessions = await this.chatSessionRepository.findByPersona(personaId, userId);

            if (sessions.length === 0) {
                return [];
            }

            // Get messages from the most recent session
            const messages = await this.messageRepository.getConversationHistory(sessions[0].id);

            return messages;
        } catch (error) {
            logger.error('Error in ChatService.getChatHistory', { personaId, userId, error });
            throw error;
        }
    }

    /**
     * Clear chat history for a persona
     */
    async clearChatHistory(personaId: string, userId?: string): Promise<void> {
        try {
            // Get sessions for this persona
            const sessions = await this.chatSessionRepository.findByPersona(personaId, userId);

            // Delete all messages from these sessions
            for (const session of sessions) {
                await this.messageRepository.deleteBySessionId(session.id);
            }

            // Delete the sessions
            for (const session of sessions) {
                await this.chatSessionRepository.delete(session.id);
            }

        } catch (error) {
            logger.error('Error in ChatService.clearChatHistory', { personaId, userId, error });
            throw error;
        }
    }

    /**
     * Get all chat sessions for a user
     */
    async getUserChatSessions(userId: string): Promise<any[]> {
        try {
            return await this.chatSessionRepository.findByUser(userId);
        } catch (error) {
            logger.error('Error in ChatService.getUserChatSessions', { userId, error });
            throw error;
        }
    }

    /**
     * Get messages for a specific session
     */
    async getSessionMessages(sessionId: string): Promise<Message[]> {
        try {
            return await this.messageRepository.getConversationHistory(sessionId);
        } catch (error) {
            logger.error('Error in ChatService.getSessionMessages', { sessionId, error });
            throw error;
        }
    }

    /**
     * Update session title
     */
    async updateSessionTitle(sessionId: string, title: string): Promise<void> {
        try {
            await this.chatSessionRepository.update(sessionId, { title });
        } catch (error) {
            logger.error('Error in ChatService.updateSessionTitle', { sessionId, title, error });
            throw error;
        }
    }
} 