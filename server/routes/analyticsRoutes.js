import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { summary } from '../controllers/analyticsController.js';

const router = Router();
router.get('/summary', protect, summary);

export default router;
