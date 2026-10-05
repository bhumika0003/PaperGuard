import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { QuestionPaper } from './models/QuestionPaper.js';
import { AccessLog } from './models/AccessLog.js';
import { DownloadRequest } from './models/DownloadRequest.js';
import { SecurityAlert } from './models/SecurityAlert.js';
import { ChatMessage } from './models/ChatMessage.js';

const inspect = async () => {
  try {
    await connectDB();
    console.log('\n======================================================');
    console.log('   📊 SECURESTACK DATABASE INSPECTION SUMMARY');
    console.log('======================================================\n');

    try {
      const users = await User.findAll({ attributes: ['userId', 'name', 'email', 'role', 'department', 'status'] });
      console.log(`👤 USERS TABLE (${users.length} Records):`);
      console.table(users.map(u => u.toJSON()));
    } catch (e) { console.error('Error reading Users:', e.message); }

    try {
      const papers = await QuestionPaper.findAll();
      console.log(`\n📄 QUESTION PAPERS TABLE (${papers.length} Records):`);
      console.table(papers.map(p => {
        const item = p.toJSON();
        delete item.fileData; // Don't print full file blob text
        return item;
      }));
    } catch (e) { console.error('Error reading QuestionPapers:', e.message); }

    try {
      const requests = await DownloadRequest.findAll({ attributes: ['requestId', 'paperId', 'requestedByName', 'status', 'reason'] });
      console.log(`\n📋 DOWNLOAD REQUESTS TABLE (${requests.length} Records):`);
      console.table(requests.map(r => r.toJSON()));
    } catch (e) { console.error('Error reading DownloadRequests:', e.message); }

    try {
      const chats = await ChatMessage.findAll({ attributes: ['id', 'senderName', 'senderRole', 'message', 'isNotice'] });
      console.log(`\n💬 CHAT MESSAGES TABLE (${chats.length} Records):`);
      console.table(chats.map(c => c.toJSON()));
    } catch (e) { console.error('Error reading ChatMessages:', e.message); }

    try {
      const logs = await AccessLog.findAll({ limit: 5, order: [['createdAt', 'DESC']], attributes: ['userId', 'userName', 'action', 'result', 'ipAddress', 'date', 'time'] });
      console.log(`\n🛡️ ACCESS LOGS TABLE (Latest ${logs.length} Records):`);
      console.table(logs.map(l => l.toJSON()));
    } catch (e) { console.error('Error reading AccessLogs:', e.message); }

    console.log('\n======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('Inspection error:', err);
    process.exit(1);
  }
};

inspect();
