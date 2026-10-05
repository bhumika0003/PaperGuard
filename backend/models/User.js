import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('Teacher', 'HOD', 'Principal', 'Admin', 'Exam Controller', 'Auditor'),
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Computer Science'
  },
  avatar: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Active', 'Disabled'),
    defaultValue: 'Active'
  },
  lastLogin: {
    type: DataTypes.DATE
  },
  lastActivity: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true
});
