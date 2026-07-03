const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    defaultValue: 'Guest',
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'guest',
  },
  ipAddress: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  browser: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  device: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'success',
  },
}, {
  timestamps: true,
});

module.exports = ActivityLog;
