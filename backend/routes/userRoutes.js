import express from 'express';
import {
  getAllUsers,
  updateUserProfile,
  createUser,
  toggleUserStatus,
  resetUserPassword,
  getSystemStatistics
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = express.Router();

router.put('/profile', authenticateToken, updateUserProfile);
router.get('/stats', authenticateToken, authorizeRoles('Admin', 'Auditor', 'Principal'), getSystemStatistics);
router.get('/', authenticateToken, authorizeRoles('Admin'), getAllUsers);
router.post('/', authenticateToken, authorizeRoles('Admin'), createUser);
router.patch('/:userId/status', authenticateToken, authorizeRoles('Admin'), toggleUserStatus);
router.post('/:userId/reset-password', authenticateToken, authorizeRoles('Admin'), resetUserPassword);

export default router;
