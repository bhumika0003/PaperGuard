import { AccessLog } from '../models/AccessLog.js';
import { inspectSecurityAnomaly } from '../services/securityDetector.js';

/**
 * Middleware to restrict route to specific roles
 * @param {Array<string>} allowedRoles 
 */
export const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User context missing.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      const todayStr = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
      const paperId = req.params.paperId || req.params.id || req.body.paperId || null;

      // Log unauthorized attempt
      await AccessLog.create({
        userId: req.user.userId,
        userName: req.user.name,
        role: req.user.role,
        action: `Unauthorized API Call [${req.method} ${req.originalUrl}]`,
        paperId,
        date: todayStr,
        time: timeStr,
        sessionId: req.headers['x-session-id'] || 'SESS-UNAUTH',
        deviceInfo: req.headers['user-agent'] || 'Unknown Agent',
        ipAddress: req.ip || '127.0.0.1',
        result: 'Forbidden',
        reason: `Role '${req.user.role}' lacks permission. Required: [${allowedRoles.join(', ')}]`
      });

      // Trigger anomaly check
      await inspectSecurityAnomaly({
        userId: req.user.userId,
        userName: req.user.name,
        paperId,
        action: `Access ${req.originalUrl}`,
        result: 'Forbidden',
        ipAddress: req.ip,
        deviceInfo: req.headers['user-agent']
      });

      return res.status(403).json({
        message: `403 Forbidden: Your role '${req.user.role}' is not authorized to perform this operation. Required: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};
