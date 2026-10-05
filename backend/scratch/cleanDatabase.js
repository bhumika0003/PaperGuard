import { connectDB, sequelize } from '../config/db.js';
import { User } from '../models/User.js';
import { QuestionPaper } from '../models/QuestionPaper.js';
import { AccessLog } from '../models/AccessLog.js';
import { DownloadRequest } from '../models/DownloadRequest.js';
import { SecurityAlert } from '../models/SecurityAlert.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { Op } from 'sequelize';

const runCleanup = async () => {
  try {
    await connectDB();
    console.log('🔍 Checking existing users in database...');
    
    const allUsers = await User.findAll();
    console.log('Current Users:', allUsers.map(u => ({ id: u.userId, name: u.name, email: u.email, role: u.role })));

    // Patterns/emails to keep
    const keepCondition = {
      [Op.or]: [
        { email: { [Op.like]: '%rutuja%' } },
        { name: { [Op.like]: '%rutuja%' } },
        { email: { [Op.like]: '%madhavi%' } },
        { name: { [Op.like]: '%madhavi%' } },
        { email: { [Op.like]: '%pandit%' } },
        { name: { [Op.like]: '%pandit%' } },
        { email: { [Op.like]: '%abc%' } },
        { email: { [Op.like]: '%bhumika%' } }
      ]
    };

    const usersToKeep = await User.findAll({ where: keepCondition });
    const keepUserIds = usersToKeep.map(u => u.userId);
    console.log('✅ Users to KEEP:', usersToKeep.map(u => `${u.name} (${u.email} - ${u.userId})`));

    // Delete users not in keep list
    const deletedUsers = await User.destroy({
      where: {
        userId: { [Op.notIn]: keepUserIds }
      }
    });
    console.log(`🗑️ Removed ${deletedUsers} demo user accounts.`);

    // Delete Question Papers not uploaded by kept users
    const deletedPapers = await QuestionPaper.destroy({
      where: {
        uploadedBy: { [Op.notIn]: keepUserIds }
      }
    });
    console.log(`🗑️ Removed ${deletedPapers} demo question papers.`);

    // Delete Access Logs not belonging to kept users
    const deletedLogs = await AccessLog.destroy({
      where: {
        userId: { [Op.notIn]: keepUserIds }
      }
    });
    console.log(`🗑️ Removed ${deletedLogs} demo access logs.`);

    // Delete Download Requests not requested by kept users
    const deletedReqs = await DownloadRequest.destroy({
      where: {
        requestedBy: { [Op.notIn]: keepUserIds }
      }
    });
    console.log(`🗑️ Removed ${deletedReqs} demo download requests.`);

    // Delete Security Alerts not belonging to kept users
    const deletedAlerts = await SecurityAlert.destroy({
      where: {
        userId: { [Op.notIn]: keepUserIds }
      }
    });
    console.log(`🗑️ Removed ${deletedAlerts} demo security alerts.`);

    // Delete demo chat messages
    const deletedChats = await ChatMessage.destroy({
      where: {
        senderId: { [Op.notIn]: keepUserIds }
      }
    });
    console.log(`🗑️ Removed ${deletedChats} demo chat messages.`);

    console.log('✨ DATABASE CLEANUP COMPLETE! Only requested user data remains.');
    process.exit(0);

  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
};

runCleanup();
