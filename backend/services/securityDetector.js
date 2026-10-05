import { SecurityAlert } from '../models/SecurityAlert.js';
import { AccessLog } from '../models/AccessLog.js';

/**
 * Evaluates access pattern and logs security alert if anomalies are detected
 */
export const inspectSecurityAnomaly = async ({ userId, userName, paperId, action, result, ipAddress, deviceInfo }) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });

    // Scenario 1: Forbidden API / Unauthorized Access Attempt
    if (result === 'Forbidden') {
      await SecurityAlert.create({
        alertId: `ALT-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
        userId,
        userName,
        paperId: paperId || 'N/A',
        activity: 'Unauthorized API Access Attempt',
        severity: 'High',
        status: 'Active',
        detectedDate: todayStr,
        detectedTime: timeStr,
        details: `User ${userName} (${userId}) attempted unauthorized action '${action}' on paper ${paperId || 'N/A'}.`
      });
      return;
    }

    // Scenario 2: Multiple Failed Logins
    if (action === 'Login' && result === 'Failed') {
      const recentFailedCount = await AccessLog.count({
        where: {
          userId,
          action: 'Login',
          result: 'Failed'
        }
      });

      if (recentFailedCount >= 3) {
        await SecurityAlert.create({
          alertId: `ALT-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
          userId,
          userName,
          paperId: 'N/A',
          activity: 'Multiple Failed Login Attempts',
          severity: recentFailedCount >= 5 ? 'Critical' : 'Medium',
          status: 'Active',
          detectedDate: todayStr,
          detectedTime: timeStr,
          details: `Detected ${recentFailedCount + 1} consecutive failed login attempts for account ${userId}.`
        });
      }
      return;
    }

    // Scenario 3: Rapid consecutive paper views (potential bulk scraping / unauthorized viewing)
    if (action === 'Viewed' && paperId) {
      const viewCount = await AccessLog.count({
        where: {
          userId,
          paperId,
          action: 'Viewed'
        }
      });

      if (viewCount >= 6) {
        await SecurityAlert.create({
          alertId: `ALT-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
          userId,
          userName,
          paperId,
          activity: 'Unusual Paper View Frequency',
          severity: 'High',
          status: 'Active',
          detectedDate: todayStr,
          detectedTime: timeStr,
          details: `User ${userName} viewed paper ${paperId} ${viewCount + 1} times in a short window.`
        });
      }
    }

    // Scenario 4: Repeated Download Requests
    if (action === 'Requested Download' && paperId) {
      const reqCount = await AccessLog.count({
        where: {
          userId,
          paperId,
          action: 'Requested Download'
        }
      });

      if (reqCount >= 3) {
        await SecurityAlert.create({
          alertId: `ALT-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
          userId,
          userName,
          paperId,
          activity: 'Repeated Download Requests',
          severity: 'Medium',
          status: 'Active',
          detectedDate: todayStr,
          detectedTime: timeStr,
          details: `Multiple download requests submitted for ${paperId} by user ${userName}.`
        });
      }
    }
  } catch (err) {
    console.error('Error running security detection rules:', err.message);
  }
};
