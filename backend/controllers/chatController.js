import { ChatMessage } from '../models/ChatMessage.js';
import { AccessLog } from '../models/AccessLog.js';

export const getChatMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.findAll({
      order: [['createdAt', 'ASC']],
      limit: 100
    });
    res.json({ messages });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Server error fetching chat messages.' });
  }
};

export const sendChatMessage = async (req, res) => {
  try {
    const { message, isNotice } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message content cannot be empty.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const ip = req.ip || '127.0.0.1';
    const deviceInfo = req.headers['user-agent'] || 'Chrome/Windows';

    const newMessage = await ChatMessage.create({
      senderId: req.user.userId,
      senderName: req.user.name,
      senderRole: req.user.role,
      department: req.user.department || 'Computer Science',
      message: message.trim(),
      isNotice: isNotice || req.user.role === 'Principal'
    });

    // Log broadcast action if notice or sent by leadership
    if (req.user.role === 'Principal' || req.user.role === 'HOD' || isNotice) {
      await AccessLog.create({
        userId: req.user.userId,
        userName: req.user.name,
        role: req.user.role,
        action: 'Broadcasted Chat Announcement',
        date: todayStr,
        time: timeStr,
        deviceInfo,
        ipAddress: ip,
        result: 'Success',
        reason: `Campus broadcast posted: "${message.trim().substring(0, 40)}..."`
      });
    }

    res.status(201).json({
      message: 'Message sent successfully.',
      chatMessage: newMessage
    });

  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({ message: 'Server error sending message.' });
  }
};
