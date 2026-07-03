const ActivityLog = require('../models/ActivityLog');
const AuditLog = require('../models/AuditLog');

const logActivity = async (req, action, status, details) => {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    
    // Parse browser
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // Parse device
    let device = 'Desktop';
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      device = 'Mobile';
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      device = 'Tablet';
    }

    const logData = {
      userId: req.user ? req.user.id : null,
      name: req.user ? req.user.name : 'Guest',
      role: req.user ? req.user.role : 'guest',
      ipAddress,
      browser,
      device,
      action,
      details,
      status
    };

    await ActivityLog.create(logData);
  } catch (error) {
    console.error('Error logging user activity:', error);
  }
};

const logAudit = async (req, action, details, status = 'success') => {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    
    const auditData = {
      userId: req.user ? req.user.id : null,
      role: req.user ? req.user.role : 'admin',
      ipAddress,
      action,
      details,
      status
    };

    await AuditLog.create(auditData);
  } catch (error) {
    console.error('Error logging audit record:', error);
  }
};

module.exports = {
  logActivity,
  logAudit
};
