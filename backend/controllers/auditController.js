import { AccessLog } from '../models/AccessLog.js';
import { User } from '../models/User.js';
import { resolveNetworkDetails } from '../utils/networkResolver.js';
import { Op } from 'sequelize';

export const getAuditLogs = async (req, res) => {
  try {
    const { userId, role, action, paperId } = req.query;
    let whereClause = {};

    if (userId) whereClause.userId = userId;
    if (role) whereClause.role = role;
    if (action) whereClause.action = action;
    if (paperId) whereClause.paperId = paperId;

    // HOD Scope Enforcement: HOD can ONLY view audit logs of users in THEIR department (excluding Principal, Exam Controller, Admin, Auditor)
    if (req.user.role === 'HOD') {
      const deptUsers = await User.findAll({
        where: {
          department: req.user.department,
          role: { [Op.in]: ['Teacher', 'HOD'] }
        },
        attributes: ['userId']
      });
      const deptUserIds = deptUsers.map(u => u.userId);

      whereClause.role = {
        [Op.notIn]: ['Principal', 'Exam Controller', 'Admin', 'Auditor']
      };

      if (userId) {
        if (!deptUserIds.includes(userId)) {
          return res.json({ logs: [] });
        }
        whereClause.userId = userId;
      } else {
        whereClause.userId = { [Op.in]: deptUserIds };
      }
    }

    const dbLogs = await AccessLog.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: 200
    });

    const logs = dbLogs.map(log => {
      const logObj = log.toJSON ? log.toJSON() : { ...log };
      const net = resolveNetworkDetails(null, logObj.userId, logObj.role);
      
      if (!logObj.ipAddress || logObj.ipAddress === '::1' || logObj.ipAddress === '127.0.0.1') {
        logObj.ipAddress = net.ipAddress;
      }
      if (!logObj.macAddress || logObj.macAddress === '7A-2F-9D-11-4B-88' || logObj.macAddress === 'A4-83-E7-12-9F-3B') {
        logObj.macAddress = net.macAddress;
      }
      return logObj;
    });

    res.json({ logs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Server error fetching audit logs.' });
  }
};

export const getUserActivityProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ where: { userId } });

    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    // HOD Scope Restriction: HOD can only view activity profiles of users in their department (excluding Principal, Exam Controller, Admin, Auditor)
    if (req.user.role === 'HOD') {
      if (user.department !== req.user.department || ['Principal', 'Exam Controller', 'Admin', 'Auditor'].includes(user.role)) {
        return res.status(403).json({ message: 'Access denied: As HOD, you can only view activity profiles of users in your department.' });
      }
    }

    const activityLogs = await AccessLog.findAll({
      where: { userId },
      order: [['createdAt', 'ASC']]
    });

    const timeline = activityLogs.map(log => ({
      id: log.id,
      timestamp: `${log.date} ${log.time}`,
      timeDisplay: log.time,
      dateDisplay: log.date,
      action: log.action,
      paperId: log.paperId,
      paperTitle: log.paperTitle,
      result: log.result,
      reason: log.reason,
      deviceInfo: log.deviceInfo
    }));

    res.json({
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
        lastLogin: user.lastLogin,
        lastActivity: user.lastActivity,
        createdAt: user.createdAt
      },
      timeline
    });
  } catch (error) {
    console.error('Get user activity profile error:', error);
    res.status(500).json({ message: 'Server error fetching user activity profile.' });
  }
};
