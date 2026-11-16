import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { list, upsert, remove } from '../controllers/budgetController.js';

const router = Router();
router.use(protect);

router.get('/', list);
router.post(
  '/',
  [
    body('category').trim().notEmpty().withMessage('Choose a category'),
    body('limit').isFloat({ gt: 0 }).withMessage('Limit must be greater than 0').toFloat(),
    body('month').matches(/^\d{4}-(0[1-9]|1[0-2])$/).withMessage('Month must be YYYY-MM'),
  ],
  validate,
  upsert
);
router.delete('/:id', remove);

export default router;
