import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { list, create, update, remove } from '../controllers/transactionController.js';

const router = Router();
router.use(protect);

const rules = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0').toFloat(),
  body('category').trim().notEmpty().withMessage('Choose a category'),
  body('date').isISO8601().withMessage('Enter a valid date'),
  body('description').optional({ values: 'falsy' }).trim().isLength({ max: 200 }).withMessage('Description is too long'),
];

router.route('/').get(list).post(rules, validate, create);
router.route('/:id').put(rules, validate, update).delete(remove);

export default router;
