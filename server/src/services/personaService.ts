import { PersonaRepository } from '../repositories/personaRepository';
import { Persona } from '../types/Persona';
import logger from '../utils/logger';
import { randomUUID } from 'crypto';

export class PersonaService {
    private personaRepository: PersonaRepository;

    constructor() {
        this.personaRepository = new PersonaRepository();
    }

    /**
     * Get all personas with default ones first
     */
    async getAllPersonas(): Promise<Persona[]> {
        try {
            const personas = await this.personaRepository.findAll();

            // Ensure we have default personas, if not create them
            if (personas.length === 0) {
                await this.seedDefaultPersonas();
                return await this.personaRepository.findAll();
            }

            return personas;
        } catch (error) {
            logger.error('Error in PersonaService.getAllPersonas', { error });
            throw error;
        }
    }

    /**
     * Get persona by ID
     */
    async getPersonaById(id: string): Promise<Persona | null> {
        try {
            return await this.personaRepository.findById(id);
        } catch (error) {
            logger.error('Error in PersonaService.getPersonaById', { id, error });
            throw error;
        }
    }

    /**
     * Create new persona
     */
    async createPersona(data: {
        name: string;
        description: string;
        systemPrompt: string;
        avatarUrl?: string;
        createdById?: string;
    }): Promise<Persona> {
        try {
            // Generate unique ID using crypto.randomUUID() for custom personas
            const id = randomUUID();

            const personaData: Persona = {
                id,
                name: data.name.trim(),
                description: data.description.trim(),
                systemPrompt: data.systemPrompt.trim(),
                avatarUrl: data.avatarUrl,
                isCustom: true,
                createdById: data.createdById
            };

            return await this.personaRepository.create(personaData);
        } catch (error) {
            logger.error('Error in PersonaService.createPersona', { data, error });
            throw error;
        }
    }

    /**
     * Update existing persona
     */
    async updatePersona(id: string, data: Partial<{
        name: string;
        description: string;
        systemPrompt: string;
        avatarUrl: string;
    }>): Promise<Persona> {
        try {
            // Check if persona exists
            const existingPersona = await this.personaRepository.findById(id);
            if (!existingPersona) {
                throw new Error('Persona not found');
            }

            // Prevent updating default personas
            if (!existingPersona.isCustom) {
                throw new Error('Cannot modify default personas');
            }

            // Validate required fields aren't being cleared
            if (data.name === '' || data.description === '' || data.systemPrompt === '') {
                throw new Error('Name, description, and system prompt cannot be empty');
            }

            return await this.personaRepository.update(id, data);
        } catch (error) {
            logger.error('Error in PersonaService.updatePersona', { id, data, error });
            throw error;
        }
    }

    /**
     * Delete persona
     */
    async deletePersona(id: string): Promise<void> {
        try {
            // Check if persona exists
            const existingPersona = await this.personaRepository.findById(id);
            if (!existingPersona) {
                throw new Error('Persona not found');
            }

            // Prevent deleting default personas
            if (!existingPersona.isCustom) {
                throw new Error('Cannot delete default personas');
            }

            await this.personaRepository.delete(id);
        } catch (error) {
            logger.error('Error in PersonaService.deletePersona', { id, error });
            throw error;
        }
    }

    /**
     * Seed default personas if they don't exist
     */
    private async seedDefaultPersonas(): Promise<void> {
        const defaultPersonas: Persona[] = [
            {
                id: "yoda",
                name: "Yoda",
                description: "Wise Jedi Master from Star Wars",
                systemPrompt: 'You are Yoda, the wise and powerful Jedi Master from Star Wars. Speak in Yoda\'s distinctive speech pattern, with wisdom and knowledge of the Force. Use phrases like "Hmm", "Much to learn you have", and "Do or do not, there is no try". Be encouraging but also mysterious and profound.',
                avatarUrl: '/personas/yoda.jpg',
                isCustom: false
            },
            {
                id: "steve-jobs",
                name: "Steve Jobs",
                description: "Visionary entrepreneur and Apple co-founder",
                systemPrompt: 'You are Steve Jobs, the co-founder and former CEO of Apple. You are passionate about innovation, design, and creating products that change the world. Speak with conviction, vision, and attention to detail. Use phrases like "Think different", "Stay hungry, stay foolish", and focus on simplicity and excellence.',
                avatarUrl: '/personas/steve-jobs.jpg',
                isCustom: false
            },
            {
                id: "grandma",
                name: "Grandma",
                description: "Your loving, wise grandmother",
                systemPrompt: 'You are a loving, caring grandmother who is always looking out for your grandchildren. You give warm advice, share stories from your past, worry about their wellbeing, and always offer to feed them. Use endearing terms like "sweetie", "dear", "honey", and share wisdom with gentle humor.',
                avatarUrl: '/personas/grandma.jpg',
                isCustom: false
            }
        ];

        try {
            for (const persona of defaultPersonas) {
                const existing = await this.personaRepository.findById(persona.id);
                if (!existing) {
                    await this.personaRepository.create(persona);
                    logger.info('Created default persona', { id: persona.id, name: persona.name });
                }
            }
        } catch (error) {
            logger.error('Error seeding default personas', { error });
            throw error;
        }
    }
} 