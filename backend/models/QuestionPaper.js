import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const QuestionPaper = sequelize.define('QuestionPaper', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  paperId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  examName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subjectCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  examDate: {
    type: DataTypes.STRING,
    allowNull: false
  },
  semester: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  paperType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'End-Sem Examination'
  },
  description: {
    type: DataTypes.TEXT
  },
  uploadedBy: {
    type: DataTypes.STRING,
    allowNull: false
  },
  uploadedByName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalFilename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileType: {
    type: DataTypes.STRING,
    defaultValue: 'pdf'
  },
  fileSize: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  textContent: {
    type: DataTypes.TEXT
  },
  hash: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Hash Generated'
  },
  securityStatus: {
    type: DataTypes.STRING,
    defaultValue: 'Integrity Verified ✓'
  }
}, {
  timestamps: true
});
