import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { chatMessageSchema } from '../validations/chatValidation';

const router: Router = Router();

router.post('/', validateRequest(chatMessageSchema), sendMessage);

export default router;
