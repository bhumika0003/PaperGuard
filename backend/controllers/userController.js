import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { User } from '../models/User.js';
import { QuestionPaper } from '../models/QuestionPaper.js';
import { AccessLog } from '../models/AccessLog.js';
import { DownloadRequest } from '../models/DownloadRequest.js';
import { SecurityAlert } from '../models/SecurityAlert.js';
import { validateEmail } from '../utils/emailValidator.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['passwordHash'] },
      order: [['createdAt', 'DESC']]
    });
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching user list.' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findOne({ where: { userId: req.user.userId } });

    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully.',
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
        avatar: user.avatar,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile details.' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, userId, password, role, department } = req.body;

    if (!name || !email || !userId || !password || !role) {
      return res.status(400).json({ message: 'Name, email, userId, password, and role are required.' });
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      return res.status(400).json({ message: emailCheck.error });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { userId }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or User ID already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      userId,
      passwordHash,
      role,
      department: department || 'Computer Science',
      status: 'Active'
    });

    res.status(201).json({
      message: 'User created successfully.',
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error creating new user.' });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ where: { userId } });

    if (!user) {
      return res.status(404).json({ message: 'User record not found.' });
    }

    user.status = user.status === 'Active' ? 'Disabled' : 'Active';
    await user.save();

    res.json({ message: `User status changed to '${user.status}'.`, user });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ message: 'Server error updating user account status.' });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required.' });
    }

    const user = await User.findOne({ where: { userId } });
    if (!user) {
      return res.status(404).json({ message: 'User record not found.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: `Password for user ${user.userId} reset successfully.` });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error resetting user password.' });
  }
};

export const getSystemStatistics = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: 'Active' } });
    const totalPapers = await QuestionPaper.count();
    const accessAttempts = await AccessLog.count();
    const downloadRequests = await DownloadRequest.count();
    const approvedDownloads = await DownloadRequest.count({ where: { status: 'Approved' } });
    const suspiciousActivities = await SecurityAlert.count({ where: { status: 'Active' } });

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalPapers,
        accessAttempts,
        downloadRequests,
        approvedDownloads,
        suspiciousActivities
      }
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: 'Server error retrieving system metrics.' });
  }
};
