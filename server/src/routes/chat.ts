import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { chatMessageSchema } from '../validations/chatValidation';
import { sendMessage, getChatHistory, clearChatHistory } from '../controllers/chatController';

const router: Router = Router();

// Send a chat message
router.post('/', validateRequest(chatMessageSchema), sendMessage);

// Get chat history for a persona (optional - currently client-side storage)
router.get('/history/:personaId', getChatHistory);

// Clear chat history for a persona (optional - currently client-side storage)
router.delete('/history/:personaId', clearChatHistory);

export default router;
