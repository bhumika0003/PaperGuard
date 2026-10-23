import { SecurityAlert } from '../models/SecurityAlert.js';

export const getSecurityAlerts = async (req, res) => {
  try {
    const alerts = await SecurityAlert.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({ alerts });
  } catch (error) {
    console.error('Get security alerts error:', error);
    res.status(500).json({ message: 'Server error fetching security alerts.' });
  }
};

export const updateAlertStatus = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { status } = req.body;

    const alert = await SecurityAlert.findOne({ where: { alertId } });
    if (!alert) {
      return res.status(404).json({ message: 'Security alert record not found.' });
    }

    if (status) alert.status = status;
    await alert.save();

    res.json({ message: 'Security alert status updated successfully.', alert });
  } catch (error) {
    console.error('Update alert status error:', error);
    res.status(500).json({ message: 'Server error updating alert status.' });
  }
};

export const simulateSuspiciousActivity = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const scenarios = [
      {
        activity: 'Unauthorized API Access Attempt',
        severity: 'High',
        details: 'User attempted to access restricted Question Paper master decryption key without clearance.',
        userId: 'TCH-102',
        userName: 'Vikram Sharma',
        paperId: 'QP-CS-101'
      },
      {
        activity: 'Multiple Failed Login Attempts (Brute Force)',
        severity: 'Critical',
        details: 'Detected 5 consecutive failed login attempts with invalid credentials from unauthorized IP 192.168.1.105.',
        userId: 'TCH-104',
        userName: 'Sneha Patil',
        paperId: 'N/A'
      },
      {
        activity: 'Unusual Paper View Frequency / Rapid Scraping',
        severity: 'High',
        details: 'Rapid consecutive access requests (8 views within 60 seconds) detected on confidential examination paper.',
        userId: 'HOD-201',
        userName: 'Dr. Ramesh Kulkarni',
        paperId: 'QP-IT-302'
      },
      {
        activity: 'Forbidden Verification / Role Bypass Attempt',
        severity: 'Critical',
        details: 'Attempted to bypass digital SHA-256 hash verification and tamper with paper approval state.',
        userId: 'TCH-103',
        userName: 'Amit Deshmukh',
        paperId: 'QP-ME-204'
      }
    ];

    const pick = scenarios[Math.floor(Math.random() * scenarios.length)];
    const alertId = `ALT-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

    const newAlert = await SecurityAlert.create({
      alertId,
      userId: req.body?.userId || pick.userId,
      userName: req.body?.userName || pick.userName,
      paperId: req.body?.paperId || pick.paperId,
      activity: req.body?.activity || pick.activity,
      severity: req.body?.severity || pick.severity,
      status: 'Active',
      detectedDate: todayStr,
      detectedTime: timeStr,
      details: req.body?.details || pick.details
    });

    res.status(201).json({
      message: 'Suspicious activity detected and logged.',
      alert: newAlert
    });
  } catch (error) {
    console.error('Simulate security alert error:', error);
    res.status(500).json({ message: 'Server error creating simulated alert.' });
  }
};
