const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'admin',
  },
  ipAddress: {
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

module.exports = AuditLog;
