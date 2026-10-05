import express from 'express';
import multer from 'multer';
import path from 'path';
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
const router = express.Router();

router.post('/upload', authenticateToken, authorizeRoles('Teacher'), upload.single('paperFile'), uploadQuestionPaper);
router.put('/:paperId', authenticateToken, authorizeRoles('Teacher', 'Admin'), upload.single('paperFile'), updateQuestionPaper);
router.get('/', authenticateToken, getQuestionPapers);
router.get('/:paperId', authenticateToken, getPaperById);
router.get('/:paperId/view', authenticateToken, authorizeRoles('Teacher', 'HOD', 'Principal', 'Exam Controller', 'Auditor'), viewPaperSecurely);
router.patch('/:paperId/status', authenticateToken, authorizeRoles('HOD', 'Principal'), updatePaperStatus);
router.get('/:paperId/download', authenticateToken, downloadPaperAuthorized);

export default router;
