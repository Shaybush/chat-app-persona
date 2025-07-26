import { Router } from 'express';
import { healthCheck } from '../controllers/healthController';

const router: Router = Router();

router.get('/', healthCheck);

export default router; 