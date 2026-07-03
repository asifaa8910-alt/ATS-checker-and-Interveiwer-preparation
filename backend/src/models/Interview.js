const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Interview = sequelize.define('Interview', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  candidateName: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetRole: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  difficulty: {
    type: DataTypes.STRING,
    defaultValue: 'medium',
  },
  experienceLevel: {
    type: DataTypes.STRING,
    defaultValue: 'Fresher (0-1 Years)',
  },
  experienceYears: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  programmingLanguage: {
    type: DataTypes.STRING,
    defaultValue: 'none',
  },
  companyType: {
    type: DataTypes.STRING,
    defaultValue: 'Product Based',
  },
  durationLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
  },
  topic: {
    type: DataTypes.STRING,
    defaultValue: 'General',
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  overallScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  technicalScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  communicationScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  confidenceScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  problemSolvingScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  behaviorScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  grammarScore: { type: DataTypes.INTEGER, defaultValue: 0 },
  hiringRecommendation: {
    type: DataTypes.STRING,
    defaultValue: 'Average',
  },
  overallFeedback: { type: DataTypes.TEXT, defaultValue: '' },
  strongAreas: { type: DataTypes.JSON, defaultValue: [] },
  weakAreas: { type: DataTypes.JSON, defaultValue: [] },
  recommendationTopics: { type: DataTypes.JSON, defaultValue: [] },
  recommendationDSA: { type: DataTypes.JSON, defaultValue: [] },
  recommendationProjects: { type: DataTypes.JSON, defaultValue: [] },
  recommendationTips: { type: DataTypes.JSON, defaultValue: [] },
  recommendationResources: { type: DataTypes.JSON, defaultValue: [] },
}, {
  timestamps: true,
});

module.exports = Interview;
