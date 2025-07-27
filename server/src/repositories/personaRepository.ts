import { Persona } from '@prisma/client';
import { prisma } from '../config/database';
import { Persona as PersonaType } from '../types/Persona';
import logger from '../utils/logger';

export class PersonaRepository {

    /**
     * Get all personas
     */
    async findAll(): Promise<Persona[]> {
        try {
            return await prisma.persona.findMany({
                orderBy: [
                    { isCustom: 'asc' },
                    { createdAt: 'asc' }
                ]
            });
        } catch (error) {
            logger.error('Error fetching all personas', { error });
            throw new Error('Failed to fetch personas');
        }
    }

    /**
     * Get persona by ID
     */
    async findById(id: string): Promise<Persona | null> {
        try {
            return await prisma.persona.findUnique({
                where: { id }
            });
        } catch (error) {
            logger.error('Error fetching persona by ID', { id, error });
            throw new Error('Failed to fetch persona');
        }
    }

    /**
     * Create new persona
     */
    async create(data: Omit<PersonaType, 'createdAt' | 'updatedAt'>): Promise<Persona> {
        try {
            return await prisma.persona.create({
                data: {
                    id: data.id,
                    name: data.name,
                    description: data.description,
                    systemPrompt: data.systemPrompt,
                    avatarUrl: data.avatarUrl,
                    isCustom: data.isCustom || false,
                    createdById: data.createdById || null
                }
            });
        } catch (error) {
            logger.error('Error creating persona', { data, error });
            throw new Error('Failed to create persona');
        }
    }

    /**
     * Update existing persona
     */
    async update(id: string, data: Partial<Omit<PersonaType, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Persona> {
        try {
            return await prisma.persona.update({
                where: { id },
                data: {
                    ...(data.name && { name: data.name }),
                    ...(data.description && { description: data.description }),
                    ...(data.systemPrompt && { systemPrompt: data.systemPrompt }),
                    ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
                    ...(data.isCustom !== undefined && { isCustom: data.isCustom })
                }
            });
        } catch (error) {
            logger.error('Error updating persona', { id, data, error });
            throw new Error('Failed to update persona');
        }
    }

    /**
     * Delete persona by ID
     */
    async delete(id: string): Promise<Persona> {
        try {
            return await prisma.persona.delete({
                where: { id }
            });
        } catch (error) {
            logger.error('Error deleting persona', { id, error });
            throw new Error('Failed to delete persona');
        }
    }

    /**
     * Check if persona exists
     */
    async exists(id: string): Promise<boolean> {
        try {
            const count = await prisma.persona.count({
                where: { id }
            });
            return count > 0;
        } catch (error) {
            logger.error('Error checking persona existence', { id, error });
            throw new Error('Failed to check persona existence');
        }
    }

    /**
     * Get personas by creator
     */
    async findByCreator(createdById: string): Promise<Persona[]> {
        try {
            return await prisma.persona.findMany({
                where: { createdById },
                orderBy: { createdAt: 'desc' }
            });
        } catch (error) {
            logger.error('Error fetching personas by creator', { createdById, error });
            throw new Error('Failed to fetch personas by creator');
        }
    }

    /**
     * Get default (non-custom) personas
     */
    async findDefaults(): Promise<Persona[]> {
        try {
            return await prisma.persona.findMany({
                where: { isCustom: false },
                orderBy: { createdAt: 'asc' }
            });
        } catch (error) {
            logger.error('Error fetching default personas', { error });
            throw new Error('Failed to fetch default personas');
        }
    }
} 