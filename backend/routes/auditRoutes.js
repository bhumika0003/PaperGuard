import express from 'express';
import { getAuditLogs, getUserActivityProfile } from '../controllers/auditController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = express.Router();

router.get('/', authenticateToken, authorizeRoles('Admin', 'Auditor', 'Principal', 'HOD', 'Exam Controller'), getAuditLogs);
router.get('/user/:userId', authenticateToken, authorizeRoles('Admin', 'Auditor', 'Principal'), getUserActivityProfile);

export default router;
