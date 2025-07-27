import { Router } from 'express';
import {
    getPersonas,
    createPersona,
    updatePersona,
    deletePersona
} from '../controllers/personaController';

const router: Router = Router();

// Get all personas
router.get('/', getPersonas);

// Create a new persona
router.post('/', createPersona);

// Update a persona
router.put('/:id', updatePersona);

// Delete a persona
router.delete('/:id', deletePersona);

export default router; 