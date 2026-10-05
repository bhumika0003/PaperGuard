import express from 'express';
import {
  createDownloadRequest,
  getDownloadRequests,
  approveDownloadRequest,
  rejectDownloadRequest
} from '../controllers/requestController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = express.Router();

router.post('/', authenticateToken, createDownloadRequest);
router.get('/', authenticateToken, getDownloadRequests);
router.patch('/:requestId/approve', authenticateToken, authorizeRoles('Principal'), approveDownloadRequest);
router.patch('/:requestId/reject', authenticateToken, authorizeRoles('Principal'), rejectDownloadRequest);

export default router;
