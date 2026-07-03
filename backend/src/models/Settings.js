const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  theme: {
    type: DataTypes.STRING,
    defaultValue: 'light',
  },
  speechEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  difficultyPref: {
    type: DataTypes.STRING,
    defaultValue: 'medium',
  },
}, {
  timestamps: true,
});

module.exports = Settings;
