
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

import { connectDB, sequelize } from './config/db.js';

import { User } from './models/User.js';
import { QuestionPaper } from './models/QuestionPaper.js';
import { AccessLog } from './models/AccessLog.js';
import { DownloadRequest } from './models/DownloadRequest.js';
import { SecurityAlert } from './models/SecurityAlert.js';
import { ChatMessage } from './models/ChatMessage.js';

import { generateTextHash } from './services/hashService.js';

import authRoutes from './routes/authRoutes.js';
import paperRoutes from './routes/paperRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

// ======================================================
// BASIC CONFIGURATION
// ======================================================

const PORT = Number(process.env.PORT) || 7000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

// ======================================================
// DIRECTORIES
// ======================================================

const uploadDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true
  });
}

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, {
    recursive: true
  });
}

// ======================================================
// API ROUTES
// ======================================================

app.use('/api/auth', authRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

// ======================================================
// ROOT ROUTE
// ======================================================

app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Secure Question Paper Management & Paper Leak Prevention System',
    message: 'Secure Question Paper Server is running',
    timestamp: new Date().toISOString()
  });
});

// ======================================================
// HEALTH CHECK
// ======================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    database: 'PostgreSQL',
    system: 'Secure Question Paper Management & Paper Leak Prevention System',
    timestamp: new Date().toISOString()
  });
});

// ======================================================
// DATABASE INITIALIZATION & SEED DATA
// ======================================================

const initializeDatabaseAndSeeds = async () => {

  try {

    // --------------------------------------------------
    // CONNECT TO POSTGRESQL / AWS RDS
    // --------------------------------------------------

    await connectDB();

    console.log('🔄 Synchronizing database models...');

    // Do NOT use alter:true for AWS production database
    await sequelize.sync();

    console.log('✅ Database models synchronized successfully.');

    // ==================================================
    // ADMIN USER
    // ==================================================

    const bhumikaUser = await User.findOne({
      where: {
        email: 'bhumika@03gmail.com'
      }
    });

    if (!bhumikaUser) {

      const bhumikaHash = await bcrypt.hash(
        'password123',
        10
      );

      await User.create({
        userId: 'USR-701',
        name: 'Bhumika Mhaskar',
        email: 'bhumika@03gmail.com',
        passwordHash: bhumikaHash,
        role: 'Admin',
        department: 'Cyber Security & Audit',
        status: 'Active',
        lastActivity: 'Active'
      });

      console.log(
        '✅ Created system administrator account.'
      );

    } else {

      console.log(
        'ℹ️ Administrator account already exists.'
      );

    }

    // ==================================================
    // SEED QUESTION PAPER - CS
    // ==================================================

    const paperCount = await QuestionPaper.count();

    if (paperCount === 0) {

      await QuestionPaper.create({

        paperId: 'PAP-2026-CS101',

        examName: 'End-Sem Examination 2026',

        subject: 'Advanced Cryptography & System Security',

        subjectCode: 'CS-801',

        examDate: '2026-10-15',

        semester: 'Semester VIII',

        department: 'Computer Science',

        paperType: 'End-Sem Examination',

        description:
          'Confidential paper covering AES-256, RSA, and SHA-256 digital fingerprinting.',

        uploadedBy: 'TCH-101',

        uploadedByName: 'Prof. Alan Turing',

        filePath: 'uploads/sample_paper_cs801.pdf',

        originalFilename: 'CS801_Cryptography_Final.pdf',

        fileType: 'pdf',

        fileSize: 1048576,

        textContent:
          'CONFIDENTIAL QUESTION PAPER CS-801',

        hash:
          'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',

        status: 'Hash Generated',

        securityStatus: 'Integrity Verified ✓'
      });

      console.log(
        '✅ Created initial CS question paper.'
      );

    }

    // ==================================================
    // SEED QUESTION PAPER - IT
    // ==================================================

    const itPaperExists = await QuestionPaper.findOne({
      where: {
        paperId: 'PAP-2026-IT602'
      }
    });

    if (!itPaperExists) {

      await QuestionPaper.create({

        paperId: 'PAP-2026-IT602',

        examName: 'End-Sem Examination 2026',

        subject:
          'Cloud Security & Microservice Architecture',

        subjectCode: 'IT-602',

        examDate: '2026-10-18',

        semester: 'Semester VI',

        department: 'Information Technology',

        paperType: 'End-Sem Examination',

        description:
          'Confidential examination paper covering Docker, Kubernetes security, and microservice architecture.',

        uploadedBy: 'TCH-201',

        uploadedByName: 'Prof. Dennis Ritchie',

        filePath:
          'uploads/sample_paper_it602.pdf',

        originalFilename:
          'IT602_Cloud_Security.pdf',

        fileType: 'pdf',

        fileSize: 1204856,

        textContent:
          'CONFIDENTIAL QUESTION PAPER IT-602',

        hash:
          'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',

        status: 'Hash Generated',

        securityStatus:
          'Integrity Verified ✓'
      });

      console.log(
        '✅ Created IT department sample paper.'
      );

    }

    // ==================================================
    // SEED QUESTION PAPER - ET
    // ==================================================

    const etPaperExists = await QuestionPaper.findOne({
      where: {
        paperId: 'PAP-2026-ET501'
      }
    });

    if (!etPaperExists) {

      await QuestionPaper.create({

        paperId: 'PAP-2026-ET501',

        examName: 'End-Sem Examination 2026',

        subject:
          'Digital Signal Processing & Wireless Networks',

        subjectCode: 'ET-501',

        examDate: '2026-10-20',

        semester: 'Semester V',

        department: 'Electronics & Telecom',

        paperType: 'End-Sem Examination',

        description:
          'Confidential paper covering DSP algorithms, FFT transforms, and cellular protocol security.',

        uploadedBy: 'TCH-301',

        uploadedByName: 'Prof. Claude Shannon',

        filePath:
          'uploads/sample_paper_et501.pdf',

        originalFilename:
          'ET501_DSP_Final.pdf',

        fileType: 'pdf',

        fileSize: 984576,

        textContent:
          'CONFIDENTIAL QUESTION PAPER ET-501',

        hash:
          'f9e8d7c6b5a43210987654321fedcba0987654321fedcba0987654321fedcba0',

        status: 'Hash Generated',

        securityStatus:
          'Integrity Verified ✓'
      });

      console.log(
        '✅ Created ET department sample question paper.'
      );

    }

    // ==================================================
    // SEED DOWNLOAD REQUEST
    // ==================================================

    const requestCount =
      await DownloadRequest.count();

    if (requestCount === 0) {

      await DownloadRequest.create({

        requestId: 'REQ-2026-8801',

        paperId: 'PAP-2026-CS101',

        paperTitle:
          'Advanced Cryptography & System Security (CS-801)',

        targetTeacherId: 'TCH-101',

        targetTeacherName:
          'Prof. Alan Turing',

        requestedBy: 'TCH-102',

        requestedByName:
          'Prof. Sarah Connor',

        role: 'Teacher',

        department:
          'Computer Science & Engineering',

        reason:
          'Authorized print request for End-Sem Exam Hall setup in Room 402.',

        requestedDate: '2026-10-04',

        requestedTime: '11:30:00',

        deviceInfo:
          'Chrome 128 / Windows 11',

        ipAddress:
          '192.168.1.105',

        status: 'Pending'
      });

      console.log(
        '✅ Created initial sample download request.'
      );

    }

    console.log(
      '✅ Database initialization completed successfully.'
    );

  } catch (error) {

    console.error(
      '❌ Error initializing database:'
    );

    console.error(error);

    throw error;
  }
};

// ======================================================
// START SERVER
// ======================================================

const startServer = async () => {

  try {

    console.log('🔄 Starting Secure Question Paper Server...');

    // --------------------------------------------------
    // DATABASE MUST CONNECT FIRST
    // --------------------------------------------------

    await initializeDatabaseAndSeeds();

    // --------------------------------------------------
    // START EXPRESS SERVER
    // --------------------------------------------------

    app.listen(PORT, '0.0.0.0', () => {

      console.log('');
      console.log(
        '================================================'
      );

      console.log(
        `🚀 Secure Question Paper Server running on port ${PORT}`
      );

      console.log(
        `🌐 Server: http://0.0.0.0:${PORT}`
      );

      console.log(
        `❤️ Health: http://0.0.0.0:${PORT}/api/health`
      );

      console.log(
        '🗄️ Database: PostgreSQL / AWS RDS'
      );

      console.log(
        '================================================'
      );

    });

  } catch (error) {

    console.error('');
    console.error(
      '❌ SERVER STARTUP FAILED'
    );

    console.error(
      '❌ Please check your PostgreSQL/RDS connection.'
    );

    console.error(
      '❌ Server was NOT started.'
    );

    process.exit(1);
  }
};

startServer();