const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ResumeAnalysis = sequelize.define('ResumeAnalysis', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  resumeId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  atsScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  formattingScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  skillsScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  experienceScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  projectsScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  educationScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  keywordsScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  grammarScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  achievementsScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  impactScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  techReadinessScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  summary: { type: DataTypes.TEXT, defaultValue: '' },
  positives: { type: DataTypes.JSON, defaultValue: [] },
  negatives: { type: DataTypes.JSON, defaultValue: [] },
  keywordMatches: { type: DataTypes.JSON, defaultValue: [] },
  keywordGaps: { type: DataTypes.JSON, defaultValue: [] },
  suggestions: { type: DataTypes.JSON, defaultValue: [] },
  educationMatches: { type: DataTypes.JSON, defaultValue: [] },
  certificationMatches: { type: DataTypes.JSON, defaultValue: [] },
  actionVerbsList: { type: DataTypes.JSON, defaultValue: [] },
  missingActionVerbs: { type: DataTypes.JSON, defaultValue: [] },
}, {
  timestamps: true,
});

module.exports = ResumeAnalysis;
