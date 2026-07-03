const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const InterviewResult = sequelize.define('InterviewResult', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  interviewId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  questionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  answerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  score: { type: DataTypes.INTEGER, defaultValue: 0 },
  feedback: { type: DataTypes.TEXT, defaultValue: '' },
  sampleAnswer: { type: DataTypes.TEXT, defaultValue: '' },
  accuracyScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  confidenceScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  technicalDepthScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  communicationScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  grammarScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  fluencyScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  relevanceScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  completenessScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  strengths: { type: DataTypes.JSON, defaultValue: [] },
  weaknesses: { type: DataTypes.JSON, defaultValue: [] },
  missingConcepts: { type: DataTypes.JSON, defaultValue: [] },
  suggestedImprovements: { type: DataTypes.JSON, defaultValue: [] },
  betterExplanation: { type: DataTypes.TEXT, defaultValue: '' },
  interviewTip: { type: DataTypes.TEXT, defaultValue: '' },
}, {
  timestamps: true,
});

module.exports = InterviewResult;
