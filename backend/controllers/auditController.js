import { AccessLog } from '../models/AccessLog.js';
import { User } from '../models/User.js';
import { resolveNetworkDetails } from '../utils/networkResolver.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';

const AUDIT_ROLES = ['Admin', 'Auditor', 'Principal'];
const HOD_VISIBLE_ROLES = ['Teacher', 'HOD'];
const MONITORED_ROLES = ['Teacher', 'HOD', 'Principal', 'Exam Controller'];

export const getAuditLogs = async (req, res) => {
  try {
    const { userId, role, action, paperId } = req.query;
    const whereClause = {};

    if (userId) whereClause.userId = userId;
    if (role) whereClause.role = role;
    if (action) whereClause.action = action;
    if (paperId) whereClause.paperId = paperId;

    // HOD Scope Enforcement: HOD can ONLY view audit logs of users in THEIR department (excluding Principal, Exam Controller, Admin, Auditor)
    if (req.user.role === 'HOD') {
      const deptUsers = await User.findAll({
        where: {
          department: req.user.department,
          role: { [Op.in]: HOD_VISIBLE_ROLES }
        },
        attributes: ['userId']
      });

      const deptUserIds = deptUsers.map(u => u.userId);

      if (userId && !deptUserIds.includes(userId)) {
        return res.json({ logs: [] });
      }

      whereClause.userId = userId ? userId : { [Op.in]: deptUserIds };
      whereClause.role = { [Op.in]: HOD_VISIBLE_ROLES };
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

    return res.json({ logs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return res.status(500).json({ message: 'Server error fetching audit logs.' });
  }
};

export const getUserActivityProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ where: { userId } });

    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    // HOD Scope Restriction: HOD can only view activity profiles of users in their department
    if (req.user.role === 'HOD') {
      if (user.department !== req.user.department || !HOD_VISIBLE_ROLES.includes(user.role)) {
        return res.status(403).json({
          message: 'Access denied: As HOD, you can only view activity profiles of permitted users in your department.'
        });
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

    return res.json({
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
    return res.status(500).json({ message: 'Server error fetching user activity profile.' });
  }
};

export const getRoleActivities = async (req, res) => {
  try {
    // Defense-in-depth permission verification
    if (!AUDIT_ROLES.includes(req.user?.role)) {
      return res.status(403).json({
        message: 'Access denied: Insufficient permissions to view role activities.'
      });
    }

    const { role, department, action, search } = req.query;
    const parsedLimit = Number.parseInt(req.query.limit, 10);
    const safeLimit = Number.isFinite(parsedLimit)
      ? Math.min(500, Math.max(1, parsedLimit))
      : 500;

    const whereClause = {};

    if (role && role !== 'All') {
      whereClause.role = role;
    }

    if (action && action !== 'All') {
      whereClause.action = { [Op.like]: `%${action}%` };
    }

    if (department && department !== 'All') {
      const departmentUsers = await User.findAll({
        attributes: ['userId'],
        where: { department }
      });

      const departmentUserIds = departmentUsers.map(u => u.userId);
      whereClause.userId = { [Op.in]: departmentUserIds };
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      const likeOp = sequelize.getDialect?.() === 'postgres' ? Op.iLike : Op.like;

      whereClause[Op.or] = [
        { userName: { [likeOp]: q } },
        { userId: { [likeOp]: q } },
        { action: { [likeOp]: q } },
        { paperId: { [likeOp]: q } },
        { paperTitle: { [likeOp]: q } },
        { ipAddress: { [likeOp]: q } },
        { macAddress: { [likeOp]: q } }
      ];
    }

    const dbLogs = await AccessLog.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: safeLimit
    });

    // Load user metadata for the returned log entries only
    const logUserIds = [...new Set(dbLogs.map(log => log.userId).filter(Boolean))];

    const users = logUserIds.length
      ? await User.findAll({
        where: { userId: { [Op.in]: logUserIds } },
        attributes: [
          'userId',
          'name',
          'email',
          'role',
          'department',
          'status',
          'avatar',
          'lastActivity',
          'lastLogin'
        ]
      })
      : [];

    const userMap = Object.fromEntries(
      users.map(u => {
        const uObj = u.toJSON ? u.toJSON() : u;
        return [uObj.userId, uObj];
      })
    );

    const todayDateStr = new Date().toISOString().split('T')[0];

    const enrichedLogs = dbLogs.map(log => {
      const logObj = log.toJSON ? log.toJSON() : { ...log };
      const net = resolveNetworkDetails(null, logObj.userId, logObj.role);

      if (!logObj.ipAddress || logObj.ipAddress === '::1' || logObj.ipAddress === '127.0.0.1') {
        logObj.ipAddress = net.ipAddress;
      }
      if (!logObj.macAddress || logObj.macAddress === '7A-2F-9D-11-4B-88' || logObj.macAddress === 'A4-83-E7-12-9F-3B') {
        logObj.macAddress = net.macAddress;
      }

      const userInfo = userMap[logObj.userId] || {};
      logObj.userDepartment = userInfo.department || 'General';
      logObj.userEmail = userInfo.email || '';
      logObj.userStatus = userInfo.status || 'Active';
      logObj.userAvatar = userInfo.avatar || null;

      return logObj;
    });

    // Compute comprehensive role statistics for Teacher, HOD, Principal, Exam Controller
    const roleStats = {
      Teacher: { total: 0, uploads: 0, views: 0, requests: 0, edits: 0, users: new Set() },
      HOD: { total: 0, verified: 0, views: 0, statusUpdates: 0, users: new Set() },
      Principal: { total: 0, approved: 0, rejected: 0, views: 0, users: new Set() },
      'Exam Controller': { total: 0, downloadRequests: 0, verifications: 0, views: 0, users: new Set() }
    };

    let todayCount = 0;
    let blockedCount = 0;

    enrichedLogs.forEach(log => {
      const r = log.role;
      const act = (log.action || '').toLowerCase();
      const resVal = (log.result || '').toLowerCase();

      if (log.date && (log.date.includes(todayDateStr) || log.createdAt?.toISOString?.().includes(todayDateStr))) {
        todayCount += 1;
      }

      if (resVal.includes('fail') || resVal.includes('denied') || resVal.includes('block') || resVal.includes('unauthorized')) {
        blockedCount += 1;
      }

      if (roleStats[r]) {
        roleStats[r].total += 1;
        if (log.userId) roleStats[r].users.add(log.userId);

        if (r === 'Teacher') {
          if (act.includes('upload')) roleStats.Teacher.uploads += 1;
          if (act.includes('view')) roleStats.Teacher.views += 1;
          if (act.includes('request')) roleStats.Teacher.requests += 1;
          if (act.includes('update') || act.includes('edit')) roleStats.Teacher.edits += 1;
        } else if (r === 'HOD') {
          if (act.includes('verify') || act.includes('verified')) roleStats.HOD.verified += 1;
          if (act.includes('status')) roleStats.HOD.statusUpdates += 1;
          if (act.includes('view')) roleStats.HOD.views += 1;
        } else if (r === 'Principal') {
          if (act.includes('approve')) roleStats.Principal.approved += 1;
          if (act.includes('reject')) roleStats.Principal.rejected += 1;
          if (act.includes('view')) roleStats.Principal.views += 1;
        } else if (r === 'Exam Controller') {
          if (act.includes('request')) roleStats['Exam Controller'].downloadRequests += 1;
          if (act.includes('verify') || act.includes('hash')) roleStats['Exam Controller'].verifications += 1;
          if (act.includes('view')) roleStats['Exam Controller'].views += 1;
        }
      }
    });

    const serializedRoleStats = {
      Teacher: { ...roleStats.Teacher, uniqueUsers: roleStats.Teacher.users.size, users: undefined },
      HOD: { ...roleStats.HOD, uniqueUsers: roleStats.HOD.users.size, users: undefined },
      Principal: { ...roleStats.Principal, uniqueUsers: roleStats.Principal.users.size, users: undefined },
      'Exam Controller': { ...roleStats['Exam Controller'], uniqueUsers: roleStats['Exam Controller'].users.size, users: undefined }
    };

    return res.json({
      logs: enrichedLogs,
      roleStats: serializedRoleStats,
      summary: {
        totalActivities: enrichedLogs.length,
        todayActivities: todayCount,
        blockedActivities: blockedCount,
        monitoredRoles: MONITORED_ROLES
      }
    });
  } catch (error) {
    console.error('Get role activities error:', error);
    return res.status(500).json({ message: 'Server error fetching role activities.' });
  }
};