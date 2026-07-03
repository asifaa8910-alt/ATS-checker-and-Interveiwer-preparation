const User = require('./User');
const Profile = require('./Profile');
const Resume = require('./Resume');
const ResumeAnalysis = require('./ResumeAnalysis');
const Interview = require('./Interview');
const InterviewQuestion = require('./InterviewQuestion');
const InterviewAnswer = require('./InterviewAnswer');
const InterviewResult = require('./InterviewResult');
const Settings = require('./Settings');
const ChatHistory = require('./ChatHistory');
const Notification = require('./Notification');
const ActivityLog = require('./ActivityLog');
const AuditLog = require('./AuditLog');
const Company = require('./Company');
const LearningResource = require('./LearningResource');

// Establish Relationships (Associations)

// User <-> Profile
User.hasOne(Profile, { foreignKey: 'userId', as: 'profile', onDelete: 'CASCADE' });
Profile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Resume
User.hasMany(Resume, { foreignKey: 'userId', as: 'resumes', onDelete: 'CASCADE' });
Resume.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> ResumeAnalysis
User.hasMany(ResumeAnalysis, { foreignKey: 'userId', as: 'analyses', onDelete: 'CASCADE' });
ResumeAnalysis.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Resume <-> ResumeAnalysis
Resume.hasMany(ResumeAnalysis, { foreignKey: 'resumeId', as: 'analyses', onDelete: 'CASCADE' });
ResumeAnalysis.belongsTo(Resume, { foreignKey: 'resumeId', as: 'resume' });

// Resume latestAnalysis reference
Resume.belongsTo(ResumeAnalysis, { foreignKey: 'latestAnalysisId', as: 'latestAnalysis', constraints: false });

// User <-> Interview
User.hasMany(Interview, { foreignKey: 'userId', as: 'interviews', onDelete: 'CASCADE' });
Interview.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Interview <-> InterviewQuestion
Interview.hasMany(InterviewQuestion, { foreignKey: 'interviewId', as: 'questions', onDelete: 'CASCADE' });
InterviewQuestion.belongsTo(Interview, { foreignKey: 'interviewId', as: 'interview' });

// Interview <-> InterviewAnswer
Interview.hasMany(InterviewAnswer, { foreignKey: 'interviewId', as: 'answers', onDelete: 'CASCADE' });
InterviewAnswer.belongsTo(Interview, { foreignKey: 'interviewId', as: 'interview' });

// Interview <-> InterviewResult
Interview.hasMany(InterviewResult, { foreignKey: 'interviewId', as: 'results', onDelete: 'CASCADE' });
InterviewResult.belongsTo(Interview, { foreignKey: 'interviewId', as: 'interview' });

// User <-> Settings
User.hasOne(Settings, { foreignKey: 'userId', as: 'settings', onDelete: 'CASCADE' });
Settings.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> ChatHistory
User.hasOne(ChatHistory, { foreignKey: 'userId', as: 'chatHistory', onDelete: 'CASCADE' });
ChatHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> ActivityLog
User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'activityLogs', onDelete: 'SET NULL' });
ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> AuditLog
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs', onDelete: 'SET NULL' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Profile,
  Resume,
  ResumeAnalysis,
  Interview,
  InterviewQuestion,
  InterviewAnswer,
  InterviewResult,
  Settings,
  ChatHistory,
  Notification,
  ActivityLog,
  AuditLog,
  Company,
  LearningResource
};
