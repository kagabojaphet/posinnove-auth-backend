// routes/auth.js
import express from 'express';
import { body } from 'express-validator';
import { register, login, logout, refreshToken, me } from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Register validation
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  register
);

// Login validation + rate limiter
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  login
);

// Logout (revokes refresh token cookie)
router.post('/logout', logout);

// Refresh token - uses HTTPOnly cookie
router.post('/refresh', refreshToken);

// Protected route
router.get('/me', authMiddleware, me);

export default router;
