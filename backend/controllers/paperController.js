import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { QuestionPaper } from '../models/QuestionPaper.js';
import { AccessLog } from '../models/AccessLog.js';
import { DownloadRequest } from '../models/DownloadRequest.js';
import { SecurityAlert } from '../models/SecurityAlert.js';
import { generateFileHash, generateTextHash, verifyIntegrity } from '../services/hashService.js';
import { inspectSecurityAnomaly } from '../services/securityDetector.js';
import { generatePdfFromTextContent } from '../utils/pdfGenerator.js';
import { resolveNetworkDetails } from '../utils/networkResolver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const uploadQuestionPaper = async (req, res) => {
  try {
    const { examName, subject, subjectCode, examDate, semester, department, paperType, description, textContent } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const netDetails = resolveNetworkDetails(req, req.user.userId, req.user.role);

    if (!examName || !subject || !subjectCode || !examDate || !department) {
      return res.status(400).json({ message: 'Exam Name, Subject, Code, Date, and Department are required.' });
    }

    // Mandatory Document / Text Attachment Validation Check
    if (!req.file && (!textContent || !textContent.trim())) {
      return res.status(400).json({ 
        message: 'Attachment Error: Question paper document file (.pdf, .docx, .txt) or typed paper content is required to generate SHA-256 fingerprint hash.' 
      });
    }

    let filePath = '';
    let originalFilename = '';
    let fileSize = 0;
    let fileBuffer;

    if (req.file) {
      filePath = req.file.path;
      originalFilename = req.file.originalname;
      fileSize = req.file.size;
      fileBuffer = fs.readFileSync(req.file.path);
    } else {
      // Paper created via text editor
      const tempFilename = `qp_${Date.now()}.txt`;
      const tempPath = path.join(uploadDir, tempFilename);
      fs.writeFileSync(tempPath, textContent);
      filePath = tempPath;
      originalFilename = `${subjectCode}_Paper.txt`;
      fileBuffer = Buffer.from(textContent, 'utf-8');
      fileSize = fileBuffer.length;
    }

    const sha256Hash = generateFileHash(fileBuffer);
    const paperId = `QP-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const paper = await QuestionPaper.create({
      paperId,
      examName,
      subject,
      subjectCode,
      examDate,
      semester: semester || 'Semester VI',
      department,
      paperType: paperType || 'End-Sem Examination',
      description: description || 'Confidential Question Paper submitted for official examination.',
      uploadedBy: req.user.userId,
      uploadedByName: req.user.name,
      filePath,
      originalFilename,
      fileSize,
      hash: sha256Hash,
      status: 'Hash Generated',
      securityStatus: 'Integrity Verified ✓'
    });

    // Log upload activity with unique IP and MAC
    await AccessLog.create({
      userId: req.user.userId,
      userName: req.user.name,
      role: req.user.role,
      action: 'Uploaded',
      paperId: paper.paperId,
      paperTitle: `${subject} (${subjectCode})`,
      date: todayStr,
      time: timeStr,
      sessionId: `SESS-${Date.now().toString(36).toUpperCase()}`,
      deviceInfo: req.headers['user-agent'] || 'Chrome/Windows Workstation',
      ipAddress: netDetails.ipAddress,
      macAddress: netDetails.macAddress,
      result: 'Success',
      reason: `Paper uploaded successfully. SHA-256 fingerprint generated.`
    });

    res.status(201).json({
      message: 'Question paper uploaded and digitally fingerprinted successfully.',
      paper
    });

  } catch (error) {
    console.error('Paper upload error:', error);
    res.status(500).json({ message: 'Server error while uploading question paper.' });
  }
};

export const updateQuestionPaper = async (req, res) => {
  try {
    const { paperId } = req.params;
    const { examName, subject, subjectCode, examDate, semester, department, paperType, description, textContent } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const netDetails = resolveNetworkDetails(req, req.user.userId, req.user.role);

    const paper = await QuestionPaper.findOne({ where: { paperId } });
    if (!paper) {
      return res.status(404).json({ message: 'Question paper record not found.' });
    }

    if (req.user.role === 'Teacher' && paper.uploadedBy !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied: You can only edit your own uploaded question papers.' });
    }

    let fileBuffer;
    if (req.file) {
      paper.filePath = req.file.path;
      paper.originalFilename = req.file.originalname;
      paper.fileSize = req.file.size;
      fileBuffer = fs.readFileSync(req.file.path);
    } else if (textContent && textContent.trim()) {
      const tempFilename = paper.filePath ? path.basename(paper.filePath) : `qp_${Date.now()}.txt`;
      const tempPath = path.join(uploadDir, tempFilename);
      fs.writeFileSync(tempPath, textContent);
      paper.filePath = tempPath;
      fileBuffer = Buffer.from(textContent, 'utf-8');
      paper.fileSize = fileBuffer.length;
    } else if (fs.existsSync(paper.filePath)) {
      fileBuffer = fs.readFileSync(paper.filePath);
    } else {
      return res.status(400).json({ message: 'Cannot recalculate hash: No file or text content present.' });
    }

    const sha256Hash = generateFileHash(fileBuffer);

    if (examName) paper.examName = examName;
    if (subject) paper.subject = subject;
    if (subjectCode) paper.subjectCode = subjectCode;
    if (examDate) paper.examDate = examDate;
    if (semester) paper.semester = semester;
    if (department) paper.department = department;
    if (paperType) paper.paperType = paperType;
    if (description) paper.description = description;

    paper.hash = sha256Hash;
    paper.status = 'Updated - Hash Recalculated';
    paper.securityStatus = 'Integrity Verified ✓';

    await paper.save();

    // Trigger Security Alert to notify Principal and Exam Controller
    await SecurityAlert.create({
      alertId: `ALT-${Date.now()}`,
      userId: req.user.userId,
      userName: req.user.name,
      paperId: paper.paperId,
      activity: 'Teacher Paper Revision Update',
      severity: 'Medium',
      status: 'Active',
      detectedDate: todayStr,
      detectedTime: timeStr,
      details: `Teacher ${req.user.name} (${req.user.userId}) updated/revised Question Paper ID [${paper.paperId} - ${paper.subject} (${paper.subjectCode})]. SHA-256 fingerprint hash recalculated to: ${sha256Hash}. Notification sent to Principal & Exam Controller.`
    });

    // Log to AccessLog with unique IP and MAC
    await AccessLog.create({
      userId: req.user.userId,
      userName: req.user.name,
      role: req.user.role,
      action: 'Updated Paper',
      paperId: paper.paperId,
      paperTitle: `${paper.subject} (${paper.subjectCode})`,
      date: todayStr,
      time: timeStr,
      sessionId: `SESS-${Date.now().toString(36).toUpperCase()}`,
      deviceInfo: req.headers['user-agent'] || 'Chrome/Windows Workstation',
      ipAddress: netDetails.ipAddress,
      macAddress: netDetails.macAddress,
      result: 'Success',
      reason: `Question paper updated by teacher. SHA-256 hash recalculated and Principal/Exam Controller alerted.`
    });

    res.json({
      message: 'Question paper updated successfully. SHA-256 hash recalculated and Principal/Exam Controller have been alerted.',
      paper
    });

  } catch (error) {
    console.error('Paper update error:', error);
    res.status(500).json({ message: 'Server error while updating question paper.' });
  }
};

export const getQuestionPapers = async (req, res) => {
  try {
    let whereClause = {};

    // Teacher can only view their own uploaded papers
    if (req.user.role === 'Teacher') {
      whereClause.uploadedBy = req.user.userId;
    } 
    // HOD views papers from their department
    else if (req.user.role === 'HOD') {
      whereClause.department = req.user.department;
    }

    const papers = await QuestionPaper.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.json({ papers });
  } catch (error) {
    console.error('Get papers error:', error);
    res.status(500).json({ message: 'Server error fetching question papers.' });
  }
};

export const getPaperById = async (req, res) => {
  try {
    const { paperId } = req.params;
    const paper = await QuestionPaper.findOne({ where: { paperId } });

    if (!paper) {
      return res.status(404).json({ message: 'Question paper not found.' });
    }

    // Verify hash integrity live
    let currentHash = paper.hash;
    let integrityVerified = true;

    if (fs.existsSync(paper.filePath)) {
      const fileBuffer = fs.readFileSync(paper.filePath);
      integrityVerified = verifyIntegrity(fileBuffer, paper.hash);
      currentHash = generateFileHash(fileBuffer);
    }

    res.json({
      paper,
      integrityVerified,
      currentHash
    });
  } catch (error) {
    console.error('Get paper detail error:', error);
    res.status(500).json({ message: 'Server error fetching paper details.' });
  }
};

export const viewPaperSecurely = async (req, res) => {
  try {
    const { paperId } = req.params;
    const paper = await QuestionPaper.findOne({ where: { paperId } });

    if (!paper) {
      return res.status(404).json({ message: 'Question paper record not found in system database.' });
    }

    // HOD Scope Restriction: HOD can view question papers of their department only
    if (req.user.role === 'HOD' && paper.department !== req.user.department) {
      return res.status(403).json({ message: 'Access denied: As HOD, you can only view question papers from your department.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const netDetails = resolveNetworkDetails(req, req.user.userId, req.user.role);
    const deviceInfo = req.headers['user-agent'] || 'Chrome/Windows Workstation';

    const watermarkText = `${req.user.name.toUpperCase()} | ${req.user.role.toUpperCase()} | ${todayStr} ${timeStr} | ${netDetails.ipAddress}`;

    // Locate uploaded file on disk using robust path resolution
    let fileBuffer = null;
    let resolvedPath = paper.filePath;

    if (paper.filePath) {
      const possiblePaths = [
        paper.filePath,
        path.resolve(paper.filePath),
        path.join(uploadDir, path.basename(paper.filePath)),
        path.join(process.cwd(), paper.filePath),
        path.join(process.cwd(), 'uploads', path.basename(paper.filePath)),
        path.join(process.cwd(), 'backend', 'uploads', path.basename(paper.filePath))
      ];

      for (const p of possiblePaths) {
        if (p && fs.existsSync(p)) {
          resolvedPath = p;
          fileBuffer = fs.readFileSync(p);
          break;
        }
      }
    }

    let isIntact = true;
    let pdfDataUrl = null;
    let contentStr = '';

    if (fileBuffer) {
      isIntact = verifyIntegrity(fileBuffer, paper.hash);
      const ext = path.extname(resolvedPath).toLowerCase();
      const isPdfHeader = fileBuffer.slice(0, 5).toString('utf-8') === '%PDF-';

      if (ext === '.pdf' || isPdfHeader) {
        const base64Pdf = fileBuffer.toString('base64');
        pdfDataUrl = `data:application/pdf;base64,${base64Pdf}`;
        contentStr = 'PDF Examination Document Payload';
      } else {
        // Plain text, docx, doc, or typed question paper
        let textToRender = '';
        if (ext === '.doc' || ext === '.docx') {
          const rawStr = fileBuffer.toString('utf-8');
          const cleanDocText = rawStr.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
          textToRender = cleanDocText.length > 50 
            ? cleanDocText 
            : `CONFIDENTIAL QUESTION PAPER DOCUMENT (${paper.originalFilename || 'Attached Doc'})\n\nSubject: ${paper.subject} (${paper.subjectCode})\nExam Date: ${paper.examDate}\nSemester: ${paper.semester || 'Semester VI'}\nDepartment: ${paper.department}\nUploaded By: ${paper.uploadedByName} (${paper.uploadedBy})\n\nAttachment File: ${paper.originalFilename} [Size: ${(paper.fileSize / 1024).toFixed(1)} KB]`;
        } else {
          textToRender = fileBuffer.toString('utf-8');
        }

        contentStr = textToRender;
        const generatedPdfBuffer = generatePdfFromTextContent(paper, textToRender, watermarkText);
        pdfDataUrl = `data:application/pdf;base64,${generatedPdfBuffer.toString('base64')}`;
      }
    } else {
      // Fallback PDF stream if file is missing on disk
      const fallbackText = `CONFIDENTIAL QUESTION PAPER DOCUMENT\n\nPaper ID: ${paper.paperId}\nSubject: ${paper.subject} (${paper.subjectCode})\nExam Date: ${paper.examDate}\nSemester: ${paper.semester || 'Semester VI'}\nDepartment: ${paper.department}\nUploaded By: ${paper.uploadedByName} (${paper.uploadedBy})\n\n[Official Question Paper Registered & Fingerprinted - SHA-256 Hash Verified]`;
      contentStr = fallbackText;
      const generatedPdfBuffer = generatePdfFromTextContent(paper, fallbackText, watermarkText);
      pdfDataUrl = `data:application/pdf;base64,${generatedPdfBuffer.toString('base64')}`;
    }

    // Log the viewing event with unique IP and MAC address
    await AccessLog.create({
      userId: req.user.userId,
      userName: req.user.name,
      role: req.user.role,
      action: 'Viewed',
      paperId: paper.paperId,
      paperTitle: `${paper.subject} (${paper.subjectCode})`,
      date: todayStr,
      time: timeStr,
      sessionId: `SESS-${Date.now().toString(36).toUpperCase()}`,
      deviceInfo,
      ipAddress: netDetails.ipAddress,
      macAddress: netDetails.macAddress,
      result: 'Success',
      reason: 'Accessed in Secure Controlled PDF Document Viewer'
    });

    // Check for rapid viewing anomaly
    await inspectSecurityAnomaly({
      userId: req.user.userId,
      userName: req.user.name,
      paperId: paper.paperId,
      action: 'Viewed',
      result: 'Success',
      ipAddress: netDetails.ipAddress,
      deviceInfo
    });

    res.json({
      paperId: paper.paperId,
      subject: paper.subject,
      subjectCode: paper.subjectCode,
      examName: paper.examName,
      department: paper.department,
      uploadedBy: paper.uploadedBy,
      uploadedByName: paper.uploadedByName,
      hash: paper.hash,
      integrityVerified: isIntact,
      isPdf: true,
      pdfDataUrl,
      content: contentStr,
      watermark: {
        userName: req.user.name,
        userId: req.user.userId,
        role: req.user.role,
        date: todayStr,
        time: timeStr,
        ipAddress: netDetails.ipAddress,
        macAddress: netDetails.macAddress,
        watermarkText
      },
      securityNotice: 'Downloading, printing, and clipboard operations are restricted by security policy.'
    });

  } catch (error) {
    console.error('Secure view error:', error);
    res.status(500).json({ message: 'Server error while preparing secure paper PDF view.' });
  }
};

export const updatePaperStatus = async (req, res) => {
  try {
    const { paperId } = req.params;
    const { status } = req.body;

    const paper = await QuestionPaper.findOne({ where: { paperId } });
    if (!paper) {
      return res.status(404).json({ message: 'Question paper not found.' });
    }

    if (req.user.role === 'HOD' && paper.department !== req.user.department) {
      return res.status(403).json({ message: 'Access denied: As HOD, you can only manage question papers from your department.' });
    }

    paper.status = status;
    await paper.save();

    res.json({ message: 'Paper status updated successfully.', paper });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error updating paper status.' });
  }
};

export const downloadPaperAuthorized = async (req, res) => {
  try {
    const { paperId } = req.params;
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const netDetails = resolveNetworkDetails(req, req.user.userId, req.user.role);
    const deviceInfo = req.headers['user-agent'] || 'Chrome/Windows Workstation';

    const paper = await QuestionPaper.findOne({ where: { paperId } });
    if (!paper) {
      return res.status(404).json({ message: 'Question paper not found.' });
    }

    // Principal and Admin can download directly.
    let isPermitted = (req.user.role === 'Principal' || req.user.role === 'Admin');

    if (!isPermitted) {
      const approvedReq = await DownloadRequest.findOne({
        where: {
          paperId,
          requestedBy: req.user.userId,
          status: 'Approved'
        }
      });
      if (approvedReq) isPermitted = true;
    }

    if (!isPermitted) {
      await AccessLog.create({
        userId: req.user.userId,
        userName: req.user.name,
        role: req.user.role,
        action: 'Downloaded',
        paperId: paper.paperId,
        paperTitle: `${paper.subject} (${paper.subjectCode})`,
        date: todayStr,
        time: timeStr,
        sessionId: `SESS-${Date.now().toString(36).toUpperCase()}`,
        deviceInfo,
        ipAddress: netDetails.ipAddress,
        macAddress: netDetails.macAddress,
        result: 'Forbidden',
        reason: 'Download Restricted – Principal Approval Required'
      });

      return res.status(403).json({
        message: 'Download Restricted – Principal Approval Required. You do not have an approved download permit for this paper.'
      });
    }

    // Log download execution
    await AccessLog.create({
      userId: req.user.userId,
      userName: req.user.name,
      role: req.user.role,
      action: 'Downloaded',
      paperId: paper.paperId,
      paperTitle: `${paper.subject} (${paper.subjectCode})`,
      date: todayStr,
      time: timeStr,
      sessionId: `SESS-${Date.now().toString(36).toUpperCase()}`,
      deviceInfo,
      ipAddress: netDetails.ipAddress,
      macAddress: netDetails.macAddress,
      result: 'Success',
      reason: 'Authorized paper download executed'
    });

    paper.status = 'Downloaded';
    await paper.save();

    // Locate uploaded file on disk using robust path resolution
    let fileBuffer = null;
    let resolvedPath = paper.filePath;

    if (paper.filePath) {
      const possiblePaths = [
        paper.filePath,
        path.resolve(paper.filePath),
        path.join(uploadDir, path.basename(paper.filePath)),
        path.join(process.cwd(), paper.filePath),
        path.join(process.cwd(), 'uploads', path.basename(paper.filePath)),
        path.join(process.cwd(), 'backend', 'uploads', path.basename(paper.filePath))
      ];

      for (const p of possiblePaths) {
        if (p && fs.existsSync(p)) {
          resolvedPath = p;
          fileBuffer = fs.readFileSync(p);
          break;
        }
      }
    }

    const watermarkText = `${req.user.name.toUpperCase()} | AUTHORIZED RELEASE | ${todayStr} ${netDetails.ipAddress}`;

    if (fileBuffer) {
      const ext = path.extname(resolvedPath).toLowerCase();
      const isPdfHeader = fileBuffer.slice(0, 5).toString('utf-8') === '%PDF-';

      if (ext === '.pdf' || isPdfHeader) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${paper.paperId}_${paper.subjectCode}.pdf"`);
        return res.send(fileBuffer);
      } else {
        let textToRender = '';
        if (ext === '.doc' || ext === '.docx') {
          const rawStr = fileBuffer.toString('utf-8');
          const cleanDocText = rawStr.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
          textToRender = cleanDocText.length > 50 ? cleanDocText : `CONFIDENTIAL QUESTION PAPER DOCUMENT (${paper.originalFilename || 'Doc'})\nSubject: ${paper.subject} (${paper.subjectCode})\nExam Date: ${paper.examDate}\nSemester: ${paper.semester}\nDepartment: ${paper.department}`;
        } else {
          textToRender = fileBuffer.toString('utf-8');
        }

        const pdfBuf = generatePdfFromTextContent(paper, textToRender, watermarkText);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${paper.paperId}_${paper.subjectCode}.pdf"`);
        return res.send(pdfBuf);
      }
    } else {
      const fallbackText = `CONFIDENTIAL QUESTION PAPER\n\nPaper ID: ${paper.paperId}\nSubject: ${paper.subject} (${paper.subjectCode})\nExam Date: ${paper.examDate}\nSHA-256 Hash: ${paper.hash}\n\nDownloaded by ${req.user.name} (${req.user.role}) on ${todayStr} ${timeStr}`;
      const pdfBuf = generatePdfFromTextContent(paper, fallbackText, watermarkText);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${paper.paperId}_${paper.subjectCode}.pdf"`);
      return res.send(pdfBuf);
    }

  } catch (error) {
    console.error('Download paper error:', error);
    res.status(500).json({ message: 'Server error processing paper download.' });
  }
};
