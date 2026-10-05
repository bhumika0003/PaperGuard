import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const AccessLog = sequelize.define('AccessLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  paperId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paperTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sessionId: {
    type: DataTypes.STRING
  },
  deviceInfo: {
    type: DataTypes.STRING,
    defaultValue: 'Chrome/Windows (Workstation)'
  },
  ipAddress: {
    type: DataTypes.STRING,
    defaultValue: '127.0.0.1'
  },
  macAddress: {
    type: DataTypes.STRING,
    defaultValue: 'A4-83-E7-12-9F-3B'
  },
  result: {
    type: DataTypes.STRING,
    defaultValue: 'Success'
  },
  reason: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true
});
