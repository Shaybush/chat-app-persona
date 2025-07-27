import { Request, Response } from 'express';
import { PersonaService } from '../services/personaService';
import logger from '../utils/logger';

const personaService = new PersonaService();

/**
 * Get all personas
 */
export async function getPersonas(req: Request, res: Response): Promise<void> {
    try {
        const personas = await personaService.getAllPersonas();

        logger.info('Fetching all personas', {
            count: personas.length
        });

        res.status(200).json({
            success: true,
            data: personas
        });

    } catch (error) {
        logger.error('Error in getPersonas controller', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Create a new persona
 */
export async function createPersona(req: Request, res: Response): Promise<void> {
    try {
        const { name, description, systemPrompt } = req.body;

        // Validate required fields
        if (!name || !name.trim()) {
            res.status(400).json({
                success: false,
                error: 'Name is required'
            });
            return;
        }

        if (!description || !description.trim()) {
            res.status(400).json({
                success: false,
                error: 'Description is required'
            });
            return;
        }

        if (!systemPrompt || !systemPrompt.trim()) {
            res.status(400).json({
                success: false,
                error: 'System prompt is required'
            });
            return;
        }

        const newPersona = await personaService.createPersona({
            name: name.trim(),
            description: description.trim(),
            systemPrompt: systemPrompt.trim()
        });

        logger.info('Created new persona', {
            id: newPersona.id,
            name: newPersona.name
        });

        res.status(201).json({
            success: true,
            data: newPersona
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        logger.error('Error in createPersona controller', {
            error: errorMessage,
            body: req.body
        });

        // Handle specific error cases
        if (errorMessage.includes('already exists')) {
            res.status(409).json({
                success: false,
                error: errorMessage
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Update an existing persona
 */
export async function updatePersona(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!id) {
            res.status(400).json({
                success: false,
                error: 'Persona ID is required'
            });
            return;
        }

        // Validate that we're not clearing required fields
        if (updates.name === '') {
            res.status(400).json({
                success: false,
                error: 'Name cannot be empty'
            });
            return;
        }

        if (updates.description === '') {
            res.status(400).json({
                success: false,
                error: 'Description cannot be empty'
            });
            return;
        }

        if (updates.systemPrompt === '') {
            res.status(400).json({
                success: false,
                error: 'System prompt cannot be empty'
            });
            return;
        }

        const updatedPersona = await personaService.updatePersona(id, updates);

        logger.info('Updated persona', {
            id,
            updates: Object.keys(updates)
        });

        res.status(200).json({
            success: true,
            data: updatedPersona
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        logger.error('Error in updatePersona controller', {
            error: errorMessage,
            personaId: req.params.id,
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

        if (errorMessage.includes('Cannot modify default personas')) {
            res.status(403).json({
                success: false,
                error: errorMessage
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Delete a persona
 */
export async function deletePersona(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                error: 'Persona ID is required'
            });
            return;
        }

        await personaService.deletePersona(id);

        logger.info('Deleted persona', {
            id
        });

        res.status(200).json({
            success: true,
            message: 'Persona deleted successfully'
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        logger.error('Error in deletePersona controller', {
            error: errorMessage,
            personaId: req.params.id
        });

        // Handle specific error cases
        if (errorMessage.includes('not found')) {
            res.status(404).json({
                success: false,
                error: errorMessage
            });
            return;
        }

        if (errorMessage.includes('Cannot delete default personas')) {
            res.status(403).json({
                success: false,
                error: errorMessage
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
} 