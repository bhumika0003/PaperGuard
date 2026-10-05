import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { QuestionPaper } from './models/QuestionPaper.js';
import { AccessLog } from './models/AccessLog.js';
import { DownloadRequest } from './models/DownloadRequest.js';
import { SecurityAlert } from './models/SecurityAlert.js';
import { ChatMessage } from './models/ChatMessage.js';

const showSimpleDatabase = async () => {
  try {
    await connectDB();
    console.log('\n========================================================================================');
    console.log('                 🎓 SECURESTACK - SIMPLE DATABASE OVERVIEW');
    console.log('========================================================================================\n');

    // 1. Users Table
    const users = await User.findAll({ order: [['createdAt', 'ASC']] });
    console.log(`📌 1. REGISTERED USER ACCOUNTS (${users.length} Total Users)`);
    console.log('----------------------------------------------------------------------------------------');
    users.forEach((u, i) => {
      console.log(`   [${i + 1}] ID: ${(u.userId || '').padEnd(10)} | Name: ${(u.name || '').padEnd(22)} | Role: ${(u.role || '').padEnd(16)} | Email: ${u.email}`);
    });

    // 2. Question Papers Table
    const papers = await QuestionPaper.findAll({ order: [['createdAt', 'ASC']] });
    console.log(`\n📌 2. EXAM QUESTION PAPERS (${papers.length} Total Papers)`);
    console.log('----------------------------------------------------------------------------------------');
    papers.forEach((p, i) => {
      const code = (p.subjectCode || p.paperId || '').padEnd(10);
      const subject = (p.subject || '').padEnd(42);
      const hash = p.hash || p.sha256Hash || 'N/A';
      console.log(`   [${i + 1}] Code: ${code} | Subject: ${subject} | Status: ${p.status}`);
      console.log(`       🔐 SHA-256 Digital Hash: ${hash}`);
    });

    // 3. Download Requests Table
    const requests = await DownloadRequest.findAll({ order: [['createdAt', 'ASC']] });
    console.log(`\n📌 3. DOWNLOAD PERMIT REQUESTS (${requests.length} Total Requests)`);
    console.log('----------------------------------------------------------------------------------------');
    if (requests.length === 0) {
      console.log('   (No download requests pending)');
    } else {
      requests.forEach((r, i) => {
        console.log(`   [${i + 1}] Request ID: ${r.requestId} | Requested By: ${r.requestedByName} | Status: ${r.status}`);
        console.log(`       Reason: "${r.reason}"`);
      });
    }

    // 4. Campus Live Chat Messages
    const chats = await ChatMessage.findAll({ order: [['createdAt', 'ASC']] });
    console.log(`\n📌 4. CAMPUS LIVE CHAT & ANNOUNCEMENTS (${chats.length} Total Messages)`);
    console.log('----------------------------------------------------------------------------------------');
    if (chats.length === 0) {
      console.log('   (No broadcast messages posted yet)');
    } else {
      chats.forEach((c, i) => {
        const noticeTag = c.isNotice ? ' [📢 OFFICIAL NOTICE]' : '';
        console.log(`   [${i + 1}] ${c.senderName} (${c.senderRole})${noticeTag}:`);
        console.log(`       "${c.message}"`);
      });
    }

    // 5. Access Logs Table
    const logs = await AccessLog.findAll({ limit: 5, order: [['createdAt', 'DESC']] });
    console.log(`\n📌 5. RECENT SECURITY ACCESS AUDIT LOGS (${logs.length} Recent Logs)`);
    console.log('----------------------------------------------------------------------------------------');
    if (logs.length === 0) {
      console.log('   (No audit logs recorded yet)');
    } else {
      logs.forEach((l, i) => {
        console.log(`   [${i + 1}] Date: ${l.date} ${l.time} | User: ${(l.userName || '').padEnd(20)} | Action: ${(l.action || '').padEnd(20)} | Result: ${l.result}`);
      });
    }

    console.log('\n========================================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('Database display error:', err);
    process.exit(1);
  }
};

showSimpleDatabase();
