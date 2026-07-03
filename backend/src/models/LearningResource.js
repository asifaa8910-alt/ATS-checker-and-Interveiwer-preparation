const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LearningResource = sequelize.define('LearningResource', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  link: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
}, {
  timestamps: true,
});

module.exports = LearningResource;
