import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { User } from '../models/User.js';
import { AccessLog } from '../models/AccessLog.js';
import { inspectSecurityAnomaly } from '../services/securityDetector.js';
import { validateEmail } from '../utils/emailValidator.js';
import { resolveNetworkDetails } from '../utils/networkResolver.js';

export const registerUser = async (req, res) => {
  const { name, email, phone, password, role, department, customUserId } = req.body;
  const todayStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
  const ip = req.ip || '127.0.0.1';
  const deviceInfo = req.headers['user-agent'] || 'Chrome/Windows Workstation';

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required.' });
    }

    // Backend Email Validation Check
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      return res.status(400).json({ message: emailCheck.error });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { userId: email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email address already exists. Please log in.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Role-specific Unique Institutional ID Prefix
    let prefix = 'TCH';
    if (role === 'HOD') prefix = 'HOD';
    if (role === 'Principal') prefix = 'PRN';
    if (role === 'Exam Controller') prefix = 'EXC';
    if (role === 'Admin') prefix = 'ADM';
    if (role === 'Auditor') prefix = 'AUD';

    const userId = customUserId && customUserId.trim() ? customUserId.trim() : `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    const userName = name || email.split('@')[0];

    const newUser = await User.create({
      userId,
      name: userName,
      email,
      phone: phone || null,
      passwordHash,
      role,
      department: department || 'Computer Science',
      status: 'Active',
      lastLogin: new Date(),
      lastActivity: 'Registered & LoggedIn'
    });

    const token = jwt.sign(
      { userId: newUser.userId, role: newUser.role, name: newUser.name },
      process.env.JWT_SECRET || 'secure_question_paper_secret_key_2026_devops',
      { expiresIn: '8h' }
    );

    const netDetails = resolveNetworkDetails(req, newUser.userId, newUser.role);

    await AccessLog.create({
      userId: newUser.userId,
      userName: newUser.name,
      role: newUser.role,
      action: 'Registered Account',
      date: todayStr,
      time: timeStr,
      sessionId: `SESS-${Date.now().toString(36).toUpperCase()}`,
      deviceInfo,
      ipAddress: netDetails.ipAddress,
      macAddress: netDetails.macAddress,
      result: 'Success',
      reason: 'New user registered and authenticated successfully'
    });

    res.status(201).json({
      token,
      user: {
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        status: newUser.status,
        lastLogin: newUser.lastLogin
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during account registration.' });
  }
};

export const loginUser = async (req, res) => {
  const { emailOrUserId, password, role } = req.body;
  const todayStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
  const ip = req.ip || '127.0.0.1';
  const deviceInfo = req.headers['user-agent'] || 'Chrome/Windows Workstation';

  try {
    if (!emailOrUserId || !password) {
      return res.status(400).json({ message: 'Email/Username and password are required.' });
    }

    if (emailOrUserId.includes('@')) {
      const emailCheck = validateEmail(emailOrUserId);
      if (!emailCheck.isValid) {
        return res.status(400).json({ message: `Invalid email address format: ${emailCheck.error}` });
      }
    }

    let user = await User.findOne({
      where: {
        [Op.or]: [
          { email: emailOrUserId },
          { userId: emailOrUserId }
        ]
      }
    });

	const effectiveRole = user ? user.role : 'Unknown';
    const netDetails = resolveNetworkDetails(req, user ? user.userId : emailOrUserId, effectiveRole);

    if (!user) {
      await AccessLog.create({
        userId: emailOrUserId || 'UNKNOWN',
        userName: emailOrUserId || 'Unknown User',
        role: effectiveRole || 'Unknown',
        action: 'Login',
        date: todayStr,
        time: timeStr,
        deviceInfo,
        ipAddress: netDetails.ipAddress,
        macAddress: netDetails.macAddress,
        result: 'Failed',
        reason: 'User account not found'
      });
      return res.status(401).json({ message: 'Account not found: Please create a new account / sign up before logging in.' });
    }

    if (user.status === 'Disabled') {
      await AccessLog.create({
        userId: user.userId,
        userName: user.name,
        role: user.role,
        action: 'Login',
        date: todayStr,
        time: timeStr,
        deviceInfo,
        ipAddress: netDetails.ipAddress,
        macAddress: netDetails.macAddress,
        result: 'Failed',
        reason: 'Account is currently disabled'
      });
      return res.status(403).json({ message: 'Account is disabled. Contact system administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await AccessLog.create({
        userId: user.userId,
        userName: user.name,
        role: user.role,
        action: 'Login',
        date: todayStr,
        time: timeStr,
        deviceInfo,
        ipAddress: netDetails.ipAddress,
        macAddress: netDetails.macAddress,
        result: 'Failed',
        reason: 'Invalid password'
      });
      await inspectSecurityAnomaly({ userId: user.userId, userName: user.name, action: 'Login', result: 'Failed', ipAddress: netDetails.ipAddress, deviceInfo });
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    // Update login status
    user.lastLogin = new Date();
    user.lastActivity = 'LoggedIn';
    await user.save();

    // Create JWT Token
    const token = jwt.sign(
      { userId: user.userId, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'secure_question_paper_secret_key_2026_devops',
      { expiresIn: '8h' }
    );

    await AccessLog.create({
      userId: user.userId,
      userName: user.name,
      role: user.role,
      action: 'Login',
      date: todayStr,
      time: timeStr,
      sessionId: `SESS-${Date.now().toString(36).toUpperCase()}`,
      deviceInfo,
      ipAddress: netDetails.ipAddress,
      macAddress: netDetails.macAddress,
      result: 'Success',
      reason: 'Authenticated successfully'
    });

    res.json({
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login authentication.' });
  }
};

export const getCurrentUser = async (req, res) => {
  res.json({ user: req.user });
};

export const resetPassword = async (req, res) => {
  const { emailOrUserId, phone, newPassword } = req.body;
  const todayStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
  const deviceInfo = req.headers['user-agent'] || 'Chrome/Windows Workstation';

  try {
    if (!emailOrUserId && !phone) {
      return res.status(400).json({ message: 'Email address or phone number is required.' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    // Step 1: Find User in Database
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: emailOrUserId },
          { userId: emailOrUserId },
          ...(phone ? [{ phone: phone }] : [])
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User account not found. Please check your email or User ID.' });
    }

    const netDetails = resolveNetworkDetails(req, user.userId, user.role);

    // Step 2: Hash New Password & Update User
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.lastActivity = 'Password Reset Completed';
    await user.save();

    // Step 3: Access Log Security Audit
    await AccessLog.create({
      userId: user.userId,
      userName: user.name,
      role: user.role,
      action: 'Password Reset',
      date: todayStr,
      time: timeStr,
      sessionId: `SESS-${Date.now().toString(36).toUpperCase()}`,
      deviceInfo,
      ipAddress: netDetails.ipAddress,
      macAddress: netDetails.macAddress,
      result: 'Success',
      reason: 'Password reset completed successfully'
    });

    // Create JWT Token for instant login
    const token = jwt.sign(
      { userId: user.userId, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'secure_question_paper_secret_key_2026_devops',
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      message: 'Password reset successfully. You are now logged in.',
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error during password reset.' });
  }
};

