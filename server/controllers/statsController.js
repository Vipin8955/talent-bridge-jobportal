const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get metrics and statistics for applicant dashboard
// @route   GET /api/stats/applicant
// @access  Private (Applicant only)
const getApplicantStats = async (req, res, next) => {
  try {
    const applicantId = req.user.id;

    const [total, reviewing, shortlisted, hired, rejected, recentApplications] =
      await Promise.all([
        Application.countDocuments({ applicant: applicantId }),
        Application.countDocuments({ applicant: applicantId, status: 'Reviewing' }),
        Application.countDocuments({ applicant: applicantId, status: 'Shortlisted' }),
        Application.countDocuments({ applicant: applicantId, status: 'Hired' }),
        Application.countDocuments({ applicant: applicantId, status: 'Rejected' }),
        Application.find({ applicant: applicantId })
          .populate('job', 'title company location jobType salary status')
          .sort('-createdAt')
          .limit(5),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        applied: total - (reviewing + shortlisted + hired + rejected),
        reviewing,
        shortlisted,
        hired,
        rejected,
      },
      recentApplications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get metrics and statistics for recruiter dashboard
// @route   GET /api/stats/recruiter
// @access  Private (Recruiter only)
const getRecruiterStats = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;

    const [
      activeJobs,
      totalJobs,
      totalApplications,
      reviewingApplications,
      shortlistedApplications,
      hiredApplications,
      rejectedApplications,
      recentJobs,
      recentApplications,
    ] = await Promise.all([
      Job.countDocuments({ recruiter: recruiterId, status: 'active' }),
      Job.countDocuments({ recruiter: recruiterId }),
      Application.countDocuments({ recruiter: recruiterId }),
      Application.countDocuments({ recruiter: recruiterId, status: 'Reviewing' }),
      Application.countDocuments({ recruiter: recruiterId, status: 'Shortlisted' }),
      Application.countDocuments({ recruiter: recruiterId, status: 'Hired' }),
      Application.countDocuments({ recruiter: recruiterId, status: 'Rejected' }),
      Job.find({ recruiter: recruiterId }).sort('-createdAt').limit(5),
      Application.find({ recruiter: recruiterId })
        .populate('applicant', 'name email avatar skills')
        .populate('job', 'title company')
        .sort('-createdAt')
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        activeJobs,
        totalJobs,
        totalApplications,
        reviewing: reviewingApplications,
        shortlisted: shortlistedApplications,
        hired: hiredApplications,
        rejected: rejectedApplications,
      },
      recentJobs,
      recentApplications,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getApplicantStats,
  getRecruiterStats,
};
