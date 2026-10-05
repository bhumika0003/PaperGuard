import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const DownloadRequest = sequelize.define('DownloadRequest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  requestId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  paperId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  paperTitle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  targetTeacherId: {
    type: DataTypes.STRING
  },
  targetTeacherName: {
    type: DataTypes.STRING
  },
  requestedBy: {
    type: DataTypes.STRING,
    allowNull: false
  },
  requestedByName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    defaultValue: 'Computer Science'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  requestedDate: {
    type: DataTypes.STRING,
    allowNull: false
  },
  requestedTime: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deviceInfo: {
    type: DataTypes.STRING,
    defaultValue: 'Chrome 128 / Windows 11'
  },
  ipAddress: {
    type: DataTypes.STRING,
    defaultValue: '192.168.1.45'
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
    defaultValue: 'Pending'
  },
  approvedBy: {
    type: DataTypes.STRING
  },
  approvedByName: {
    type: DataTypes.STRING
  },
  approvedAt: {
    type: DataTypes.STRING
  },
  rejectionReason: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true
});
