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
