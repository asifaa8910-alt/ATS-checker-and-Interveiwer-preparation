const Profile = require('../models/Profile');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ where: { userId: req.user.id } });
    
    if (!profile) {
      profile = await Profile.create({
        userId: req.user.id,
        skills: [],
        experience: [],
        projects: [],
      });
    }

    // Map _id to id for React frontend compatibility
    const data = profile.toJSON();
    data._id = data.id;

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const { phone, college, university, skills, experience, projects, linkedin, github, portfolio } = req.body;

    let profile = await Profile.findOne({ where: { userId: req.user.id } });
    
    if (!profile) {
      profile = await Profile.create({ userId: req.user.id });
    }

    // Assign properties
    if (phone !== undefined) profile.phone = phone;
    if (college !== undefined) profile.college = college;
    if (university !== undefined) profile.university = university;
    if (linkedin !== undefined) profile.linkedin = linkedin;
    if (github !== undefined) profile.github = github;
    if (portfolio !== undefined) profile.portfolio = portfolio;
    
    if (skills !== undefined) {
      profile.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    
    if (experience !== undefined) {
      profile.experience = Array.isArray(experience) ? experience : [];
    }

    if (projects !== undefined) {
      profile.projects = Array.isArray(projects) ? projects : [];
    }

    await profile.save();

    const data = profile.toJSON();
    data._id = data.id;

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};
