import express from 'express';
import { getChatMessages, sendChatMessage } from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getChatMessages);
router.post('/', sendChatMessage);

export default router;
