const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Profile = sequelize.define('Profile', {
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
  phone: { type: DataTypes.STRING, defaultValue: '' },
  college: { type: DataTypes.STRING, defaultValue: '' },
  university: { type: DataTypes.STRING, defaultValue: '' },
  skills: { type: DataTypes.JSON, defaultValue: [] },
  experience: { type: DataTypes.JSON, defaultValue: [] },
  projects: { type: DataTypes.JSON, defaultValue: [] },
  linkedin: { type: DataTypes.STRING, defaultValue: '' },
  github: { type: DataTypes.STRING, defaultValue: '' },
  portfolio: { type: DataTypes.STRING, defaultValue: '' },
  profilePicture: { type: DataTypes.STRING, defaultValue: '' },
}, {
  timestamps: true,
});

module.exports = Profile;
