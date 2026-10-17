import express from 'express';
import { getAuditLogs, getUserActivityProfile, getRoleActivities } from '../controllers/auditController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = express.Router();

router.get('/role-activities', authenticateToken, authorizeRoles('Admin', 'Auditor', 'Principal'), getRoleActivities);
router.get('/', authenticateToken, authorizeRoles('Admin', 'Auditor', 'Principal', 'HOD', 'Exam Controller'), getAuditLogs);
router.get('/user/:userId', authenticateToken, authorizeRoles('Admin', 'Auditor', 'Principal'), getUserActivityProfile);

export default router;
