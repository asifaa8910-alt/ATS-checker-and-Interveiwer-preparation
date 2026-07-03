const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const InterviewQuestion = sequelize.define('InterviewQuestion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  interviewId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  questionText: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  difficulty: {
    type: DataTypes.STRING,
    defaultValue: 'medium',
  },
  topic: {
    type: DataTypes.STRING,
    defaultValue: 'General',
  },
}, {
  timestamps: true,
});

module.exports = InterviewQuestion;
