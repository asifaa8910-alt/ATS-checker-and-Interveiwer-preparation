const { Op } = require('sequelize');
const { 
  User, Resume, Interview, ResumeAnalysis, 
  ActivityLog, AuditLog, Company, LearningResource 
} = require('../models/index');
const { logAudit } = require('../utils/activityLogger');
const fs = require('fs');
const path = require('path');

// @desc    Get aggregated platform stats for admin overview
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: 'active' } });
    const newRegistrations = await User.count({
      where: {
        createdAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    });

    const totalInterviews = await Interview.count({ where: { status: 'completed' } });
    const totalResumes = await Resume.count();
    const totalATSScans = await ResumeAnalysis.count();

    // Simulated AI API Metrics & System Resource Health
    const aiUsage = {
      tokensUsed: 125000 + Math.floor(Math.random() * 50000),
      responseTime: '420ms',
      failedRequests: 2,
      totalCosts: '$2.50',
    };

    const systemHealth = {
      cpuUsage: `${10 + Math.floor(Math.random() * 20)}%`,
      memoryUsage: `${40 + Math.floor(Math.random() * 15)}%`,
      serverStatus: 'online',
      dbStatus: 'connected',
      dockerStatus: '3 active containers',
    };

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        newRegistrations,
        totalInterviews,
        totalResumes,
        totalATSScans,
        aiUsage,
        systemHealth
      }
    });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving system overview metrics' });
  }
};

// @desc    Get all users with search/filter
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const query = {};

    if (search) {
      query[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const users = await User.findAll({
      where: query,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    // Map id to _id for frontend compatibility
    const mappedUsers = users.map(u => {
      const data = u.toJSON();
      data._id = data.id;
      return data;
    });

    res.status(200).json({ success: true, count: mappedUsers.length, data: mappedUsers });
  } catch (error) {
    console.error('Error listing user accounts:', error);
    res.status(500).json({ success: false, message: 'Server error listing account directories' });
  }
};

// @desc    Update user details (Role, Status, Password)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { name, email, role, status, password } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) {
      user.role = role;
      await logAudit(req, 'Role Changed', `Changed role of user ${user.email} to ${role}`);
    }
    if (status) {
      user.status = status;
      await logAudit(req, status === 'suspended' ? 'User Suspended' : 'User Activated', `Updated status of user ${user.email} to ${status}`);
    }
    if (password) {
      user.password = password; // pre-save hooks will encrypt password
      await logAudit(req, 'Password Reset By Admin', `Reset password for user ${user.email}`);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account details updated successfully',
      data: { _id: user.id, id: user.id, name: user.name, email: user.email, role: user.role, status: user.status }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ success: false, message: 'Server error updating account configs' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await logAudit(req, 'User Deleted', `Deleted user account: ${user.email}`);
    await user.destroy();

    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error removing user account:', error);
    res.status(500).json({ success: false, message: 'Server error removing account records' });
  }
};

// @desc    Get all resumes
// @route   GET /api/admin/resumes
// @access  Private/Admin
const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.findAll({
      include: [
        { model: User, as: 'user', attributes: ['name', 'email'] },
        { model: ResumeAnalysis, as: 'latestAnalysis' }
      ],
      order: [['createdAt', 'DESC']]
    });

    const mappedResumes = resumes.map(r => {
      const data = r.toJSON();
      data._id = data.id;
      if (data.user) data.user._id = data.user.id;
      if (data.latestAnalysis) data.latestAnalysis._id = data.latestAnalysis.id;
      return data;
    });

    res.status(200).json({ success: true, count: mappedResumes.length, data: mappedResumes });
  } catch (error) {
    console.error('Error loading resume registers:', error);
    res.status(500).json({ success: false, message: 'Server error loading uploads registry' });
  }
};

// @desc    Delete resume file
// @route   DELETE /api/admin/resumes/:id
// @access  Private/Admin
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findByPk(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume record not found' });
    }

    // Try deleting physical file
    const absolutePath = path.join(__dirname, '..', resume.filePath);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (fileErr) {
        console.error('File cleanup error:', fileErr);
      }
    }

    await ResumeAnalysis.destroy({ where: { resumeId: resume.id } });
    await logAudit(req, 'Resume Deleted By Admin', `Deleted resume file: ${resume.fileName}`);
    await resume.destroy();

    res.status(200).json({ success: true, message: 'Resume scan cleaned successfully' });
  } catch (error) {
    console.error('Error deleting upload scan:', error);
    res.status(500).json({ success: false, message: 'Server error cleaning scanned files' });
  }
};

// @desc    Get all mock interview sessions
// @route   GET /api/admin/interviews
// @access  Private/Admin
const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.findAll({
      include: [
        { model: User, as: 'user', attributes: ['name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const mappedInterviews = interviews.map(i => {
      const data = i.toJSON();
      data._id = data.id;
      if (data.user) data.user._id = data.user.id;
      return data;
    });

    res.status(200).json({ success: true, count: mappedInterviews.length, data: mappedInterviews });
  } catch (error) {
    console.error('Error fetching mock registry:', error);
    res.status(500).json({ success: false, message: 'Server error loading mock interview logs' });
  }
};

// @desc    Delete mock interview
// @route   DELETE /api/admin/interviews/:id
// @access  Private/Admin
const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findByPk(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session record not found' });
    }

    await logAudit(req, 'Interview Session Deleted', `Deleted interview session for ${interview.candidateName || 'Candidate'}`);
    await interview.destroy();

    res.status(200).json({ success: true, message: 'Session logs deleted successfully' });
  } catch (error) {
    console.error('Error deleting mock session logs:', error);
    res.status(500).json({ success: false, message: 'Server error deleting session records' });
  }
};

// @desc    Get activity and audit logs
// @route   GET /api/admin/logs
// @access  Private/Admin
const getLogs = async (req, res) => {
  try {
    const { type, action } = req.query;
    const query = {};

    if (action) {
      query.action = { [Op.like]: `%${action}%` };
    }

    let logs;
    if (type === 'audit') {
      logs = await AuditLog.findAll({
        where: query,
        include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
        order: [['createdAt', 'DESC']],
        limit: 100
      });
    } else {
      logs = await ActivityLog.findAll({
        where: query,
        include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
        order: [['createdAt', 'DESC']],
        limit: 100
      });
    }

    const mappedLogs = logs.map(l => {
      const data = l.toJSON();
      data._id = data.id;
      if (data.user) data.user._id = data.user.id;
      return data;
    });

    res.status(200).json({ success: true, count: mappedLogs.length, data: mappedLogs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ success: false, message: 'Server error loading system logs database' });
  }
};

// @desc    CRUD Companies
// @route   GET/POST/DELETE /api/admin/companies
// @access  Private/Admin
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({ order: [['name', 'ASC']] });
    const mapped = companies.map(c => {
      const data = c.toJSON();
      data._id = data.id;
      return data;
    });
    res.status(200).json({ success: true, data: mapped });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error loading companies' });
  }
};

const createCompany = async (req, res) => {
  try {
    const { name, industry, website, description } = req.body;
    const company = await Company.create({ name, industry, website, description });
    await logAudit(req, 'Company Created', `Added new company context: ${name}`);
    res.status(201).json({ success: true, data: company });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error adding company record' });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    await logAudit(req, 'Company Deleted', `Removed company context: ${company.name}`);
    await company.destroy();
    res.status(200).json({ success: true, message: 'Company deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error removing company context' });
  }
};

// @desc    CRUD Learning Resources
// @route   GET/POST/DELETE /api/admin/learning
// @access  Private/Admin
const getLearningResources = async (req, res) => {
  try {
    const resources = await LearningResource.findAll({ order: [['category', 'ASC'], ['title', 'ASC']] });
    const mapped = resources.map(r => {
      const data = r.toJSON();
      data._id = data.id;
      return data;
    });
    res.status(200).json({ success: true, data: mapped });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error loading resources' });
  }
};

const createLearningResource = async (req, res) => {
  try {
    const { title, category, description, link } = req.body;
    const resource = await LearningResource.create({ title, category, description, link });
    await logAudit(req, 'Learning Resource Created', `Added new roadmap resource: ${title}`);
    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error adding resource catalog' });
  }
};

const deleteLearningResource = async (req, res) => {
  try {
    const resource = await LearningResource.findByPk(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    await logAudit(req, 'Learning Resource Deleted', `Removed roadmap resource: ${resource.title}`);
    await resource.destroy();
    res.status(200).json({ success: true, message: 'Resource deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error removing resource catalog' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter all fields' });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      status: status || 'active'
    });

    await logAudit(req, 'User Created By Admin', `Created new user account: ${user.email} with role: ${user.role}`);

    res.status(201).json({
      success: true,
      message: 'User account created successfully',
      data: {
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Error creating user account:', error);
    res.status(500).json({ success: false, message: 'Server error creating user account' });
  }
};

const pruneLogs = async (req, res) => {
  try {
    const { type } = req.body;
    if (type === 'audit') {
      await AuditLog.destroy({ where: {} });
      await logAudit(req, 'Audit Logs Pruned', 'All audit logs were deleted by admin');
    } else {
      await ActivityLog.destroy({ where: {} });
      await logAudit(req, 'Activity Logs Pruned', 'All activity logs were deleted by admin');
    }
    res.status(200).json({ success: true, message: `${type === 'audit' ? 'Audit' : 'Activity'} logs pruned successfully` });
  } catch (error) {
    console.error('Error pruning logs:', error);
    res.status(500).json({ success: false, message: 'Server error pruning system logs' });
  }
};

module.exports = {
  getStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getResumes,
  deleteResume,
  getInterviews,
  deleteInterview,
  getLogs,
  pruneLogs,
  getCompanies,
  createCompany,
  deleteCompany,
  getLearningResources,
  createLearningResource,
  deleteLearningResource
};

