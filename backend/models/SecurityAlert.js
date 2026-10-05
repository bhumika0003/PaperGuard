import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const SecurityAlert = sequelize.define('SecurityAlert', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  alertId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  paperId: {
    type: DataTypes.STRING
  },
  activity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    defaultValue: 'Medium'
  },
  status: {
    type: DataTypes.ENUM('Active', 'Investigating', 'Resolved'),
    defaultValue: 'Active'
  },
  detectedDate: {
    type: DataTypes.STRING,
    allowNull: false
  },
  detectedTime: {
    type: DataTypes.STRING,
    allowNull: false
  },
  details: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true
});
