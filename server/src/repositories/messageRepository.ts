import { Message } from '@prisma/client';
import { prisma } from '../config/database';
import { Message as MessageType } from '../types';
import logger from '../utils/logger';

export class MessageRepository {

    /**
     * Create new message
     */
    async create(data: {
        content: string;
        isUser: boolean;
        sessionId: string;
        personaId: string;
        model?: string;
        metadata?: any;
    }): Promise<Message> {
        try {
            return await prisma.message.create({
                data: {
                    content: data.content,
                    isUser: data.isUser,
                    sessionId: data.sessionId,
                    personaId: data.personaId,
                    model: data.model,
                    metadata: data.metadata
                }
            });
        } catch (error) {
            logger.error('Error creating message', { data, error });
            throw new Error('Failed to create message');
        }
    }

    /**
     * Get messages by session ID
     */
    async findBySessionId(sessionId: string, limit?: number): Promise<Message[]> {
        try {
            return await prisma.message.findMany({
                where: { sessionId },
                orderBy: { createdAt: 'asc' },
                ...(limit && { take: limit })
            });
        } catch (error) {
            logger.error('Error fetching messages by session ID', { sessionId, error });
            throw new Error('Failed to fetch messages');
        }
    }

    /**
     * Get recent messages by persona
     */
    async findRecentByPersona(personaId: string, limit: number = 20): Promise<Message[]> {
        try {
            return await prisma.message.findMany({
                where: { personaId },
                orderBy: { createdAt: 'desc' },
                take: limit
            });
        } catch (error) {
            logger.error('Error fetching recent messages by persona', { personaId, error });
            throw new Error('Failed to fetch recent messages');
        }
    }

    /**
     * Convert database messages to frontend format
     */
    convertToFrontendFormat(messages: Message[]): MessageType[] {
        return messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            isUser: msg.isUser,
            timestamp: msg.createdAt.getTime(),
            personaId: msg.personaId
        }));
    }

    /**
     * Get conversation history for LLM (formatted for context)
     */
    async getConversationHistory(sessionId: string, maxMessages: number = 20): Promise<MessageType[]> {
        try {
            const messages = await prisma.message.findMany({
                where: { sessionId },
                orderBy: { createdAt: 'desc' },
                take: maxMessages
            });

            // Reverse to get chronological order and convert format
            return this.convertToFrontendFormat(messages.reverse());
        } catch (error) {
            logger.error('Error fetching conversation history', { sessionId, error });
            throw new Error('Failed to fetch conversation history');
        }
    }

    /**
     * Delete messages by session ID
     */
    async deleteBySessionId(sessionId: string): Promise<{ count: number }> {
        try {
            return await prisma.message.deleteMany({
                where: { sessionId }
            });
        } catch (error) {
            logger.error('Error deleting messages by session ID', { sessionId, error });
            throw new Error('Failed to delete messages');
        }
    }

    /**
     * Get message count by persona
     */
    async countByPersona(personaId: string): Promise<number> {
        try {
            return await prisma.message.count({
                where: { personaId }
            });
        } catch (error) {
            logger.error('Error counting messages by persona', { personaId, error });
            throw new Error('Failed to count messages');
        }
    }

    /**
     * Get last message in session
     */
    async getLastInSession(sessionId: string): Promise<Message | null> {
        try {
            return await prisma.message.findFirst({
                where: { sessionId },
                orderBy: { createdAt: 'desc' }
            });
        } catch (error) {
            logger.error('Error fetching last message in session', { sessionId, error });
            throw new Error('Failed to fetch last message');
        }
    }
} 