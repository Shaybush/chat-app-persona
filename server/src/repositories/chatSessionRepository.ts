import { ChatSession, Message } from '@prisma/client';
import { prisma } from '../config/database';
import logger from '../utils/logger';

export class ChatSessionRepository {

    /**
     * Create new chat session
     */
    async create(data: {
        personaId: string;
        userId?: string;
        title?: string;
    }): Promise<ChatSession> {
        try {
            return await prisma.chatSession.create({
                data: {
                    personaId: data.personaId,
                    userId: data.userId,
                    title: data.title
                }
            });
        } catch (error) {
            logger.error('Error creating chat session', { data, error });
            throw new Error('Failed to create chat session');
        }
    }

    /**
     * Get chat session by ID with messages
     */
    async findByIdWithMessages(id: string): Promise<(ChatSession & { messages: Message[] }) | null> {
        try {
            return await prisma.chatSession.findUnique({
                where: { id },
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' }
                    }
                }
            });
        } catch (error) {
            logger.error('Error fetching chat session with messages', { id, error });
            throw new Error('Failed to fetch chat session');
        }
    }

    /**
     * Get chat sessions by persona
     */
    async findByPersona(personaId: string, userId?: string): Promise<ChatSession[]> {
        try {
            return await prisma.chatSession.findMany({
                where: {
                    personaId,
                    ...(userId && { userId })
                },
                orderBy: { updatedAt: 'desc' },
                include: {
                    messages: {
                        take: 1,
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });
        } catch (error) {
            logger.error('Error fetching chat sessions by persona', { personaId, userId, error });
            throw new Error('Failed to fetch chat sessions');
        }
    }

    /**
     * Get chat sessions by user
     */
    async findByUser(userId: string): Promise<ChatSession[]> {
        try {
            return await prisma.chatSession.findMany({
                where: { userId },
                orderBy: { updatedAt: 'desc' },
                include: {
                    persona: true,
                    messages: {
                        take: 1,
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });
        } catch (error) {
            logger.error('Error fetching chat sessions by user', { userId, error });
            throw new Error('Failed to fetch chat sessions');
        }
    }

    /**
     * Update chat session
     */
    async update(id: string, data: Partial<{ title: string }>): Promise<ChatSession> {
        try {
            return await prisma.chatSession.update({
                where: { id },
                data
            });
        } catch (error) {
            logger.error('Error updating chat session', { id, data, error });
            throw new Error('Failed to update chat session');
        }
    }

    /**
     * Delete chat session
     */
    async delete(id: string): Promise<ChatSession> {
        try {
            return await prisma.chatSession.delete({
                where: { id }
            });
        } catch (error) {
            logger.error('Error deleting chat session', { id, error });
            throw new Error('Failed to delete chat session');
        }
    }

    /**
     * Get or create chat session for persona
     */
    async getOrCreateForPersona(personaId: string, userId?: string): Promise<ChatSession> {
        try {
            // Try to find existing session
            const existingSession = await prisma.chatSession.findFirst({
                where: {
                    personaId,
                    userId: userId || null
                },
                orderBy: { updatedAt: 'desc' }
            });

            if (existingSession) {
                return existingSession;
            }

            // Create new session if none exists
            return await this.create({
                personaId,
                userId,
                title: `Chat with ${personaId}`
            });
        } catch (error) {
            logger.error('Error getting or creating chat session', { personaId, userId, error });
            throw new Error('Failed to get or create chat session');
        }
    }

    /**
     * Touch session (update updatedAt timestamp)
     */
    async touch(id: string): Promise<ChatSession> {
        try {
            return await prisma.chatSession.update({
                where: { id },
                data: { updatedAt: new Date() }
            });
        } catch (error) {
            logger.error('Error touching chat session', { id, error });
            throw new Error('Failed to update chat session timestamp');
        }
    }
} 