import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  uploadQuestionPaper,
  updateQuestionPaper,
  getQuestionPapers,
  getPaperById,
  viewPaperSecurely,
  updatePaperStatus,
  downloadPaperAuthorized
} from '../controllers/paperController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file?.originalname || '') || '.pdf';
    cb(null, (file?.fieldname || 'paperFile') + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });
const router = express.Router();

router.post('/upload', authenticateToken, authorizeRoles('Teacher', 'Admin'), upload.single('paperFile'), uploadQuestionPaper);
router.put('/:paperId', authenticateToken, authorizeRoles('Teacher', 'Admin'), upload.single('paperFile'), updateQuestionPaper);
router.get('/', authenticateToken, getQuestionPapers);
router.get('/:paperId', authenticateToken, getPaperById);
router.get('/:paperId/view', authenticateToken, authorizeRoles('Teacher', 'HOD', 'Principal', 'Exam Controller', 'Auditor'), viewPaperSecurely);
router.patch('/:paperId/status', authenticateToken, authorizeRoles('HOD', 'Principal'), updatePaperStatus);
router.get('/:paperId/download', authenticateToken, downloadPaperAuthorized);

export default router;
