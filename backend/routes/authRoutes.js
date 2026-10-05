import express from 'express';
import { loginUser, registerUser, resetPassword, getCurrentUser } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/reset-password', resetPassword);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
