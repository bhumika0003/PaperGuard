import express from 'express';
import { getSecurityAlerts, updateAlertStatus } from '../controllers/alertController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = express.Router();

router.get('/', authenticateToken, authorizeRoles('Admin', 'Auditor', 'Principal'), getSecurityAlerts);
router.patch('/:alertId/status', authenticateToken, authorizeRoles('Admin', 'Auditor'), updateAlertStatus);

export default router;
