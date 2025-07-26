import { User } from '@prisma/client';
import { prisma } from '../config/database';
import logger from '../utils/logger';

export class UserRepository {

    /**
     * Create new user
     */
    async create(data: {
        email?: string;
        name?: string;
    }): Promise<User> {
        try {
            return await prisma.user.create({
                data: {
                    email: data.email,
                    name: data.name
                }
            });
        } catch (error) {
            logger.error('Error creating user', { data, error });
            throw new Error('Failed to create user');
        }
    }

    /**
     * Get user by ID
     */
    async findById(id: string): Promise<User | null> {
        try {
            return await prisma.user.findUnique({
                where: { id }
            });
        } catch (error) {
            logger.error('Error fetching user by ID', { id, error });
            throw new Error('Failed to fetch user');
        }
    }

    /**
     * Get user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        try {
            return await prisma.user.findUnique({
                where: { email }
            });
        } catch (error) {
            logger.error('Error fetching user by email', { email, error });
            throw new Error('Failed to fetch user');
        }
    }

    /**
     * Update user
     */
    async update(id: string, data: Partial<{
        email: string;
        name: string;
    }>): Promise<User> {
        try {
            return await prisma.user.update({
                where: { id },
                data
            });
        } catch (error) {
            logger.error('Error updating user', { id, data, error });
            throw new Error('Failed to update user');
        }
    }

    /**
     * Delete user
     */
    async delete(id: string): Promise<User> {
        try {
            return await prisma.user.delete({
                where: { id }
            });
        } catch (error) {
            logger.error('Error deleting user', { id, error });
            throw new Error('Failed to delete user');
        }
    }

    /**
     * Check if user exists
     */
    async exists(id: string): Promise<boolean> {
        try {
            const count = await prisma.user.count({
                where: { id }
            });
            return count > 0;
        } catch (error) {
            logger.error('Error checking user existence', { id, error });
            throw new Error('Failed to check user existence');
        }
    }

    /**
     * Get user with personas
     */
    async findByIdWithPersonas(id: string): Promise<User & { personas: any[] } | null> {
        try {
            return await prisma.user.findUnique({
                where: { id },
                include: {
                    personas: true
                }
            });
        } catch (error) {
            logger.error('Error fetching user with personas', { id, error });
            throw new Error('Failed to fetch user with personas');
        }
    }

    /**
     * Get user with chat sessions
     */
    async findByIdWithChatSessions(id: string): Promise<User & { chatSessions: any[] } | null> {
        try {
            return await prisma.user.findUnique({
                where: { id },
                include: {
                    chatSessions: {
                        include: {
                            persona: true,
                            messages: {
                                take: 1,
                                orderBy: { createdAt: 'desc' }
                            }
                        },
                        orderBy: { updatedAt: 'desc' }
                    }
                }
            });
        } catch (error) {
            logger.error('Error fetching user with chat sessions', { id, error });
            throw new Error('Failed to fetch user with chat sessions');
        }
    }
} 