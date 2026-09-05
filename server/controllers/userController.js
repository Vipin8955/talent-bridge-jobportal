const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const path = require('path');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return next(new AppError('User profile not found.', 404));
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    const {
      name,
      phone,
      bio,
      location,
      skills,
      experience,
      education,
      company,
      companyDescription,
      website,
      avatar,
    } = req.body;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (location !== undefined) user.location = location.trim();
    if (avatar !== undefined) user.avatar = avatar;

    if (user.role === 'applicant') {
      if (skills !== undefined) {
        user.skills = Array.isArray(skills)
          ? skills.map((s) => s.trim()).filter(Boolean)
          : typeof skills === 'string'
          ? skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [];
      }
      if (experience !== undefined) user.experience = experience;
      if (education !== undefined) user.education = education;
    }

    if (user.role === 'recruiter') {
      if (company !== undefined) user.company = company.trim();
      if (companyDescription !== undefined) user.companyDescription = companyDescription.trim();
      if (website !== undefined) user.website = website.trim();
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload applicant default resume
// @route   POST /api/users/resume
// @access  Private (Applicant only)
const uploadDefaultResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please select a resume file to upload.', 400));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    user.resume = {
      url: resumeUrl,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date(),
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully.',
      resume: user.resume,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadDefaultResume,
};
