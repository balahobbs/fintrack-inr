import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { register, login, me } from '../controllers/authController.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Enter your name'),
    body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  register
);
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Enter your password'),
  ],
  validate,
  login
);
router.get('/me', protect, me);

export default router;
