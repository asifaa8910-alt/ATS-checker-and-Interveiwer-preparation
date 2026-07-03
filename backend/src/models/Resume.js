const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Resume = sequelize.define('Resume', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  extractedText: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  atsScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  latestAnalysisId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = Resume;
