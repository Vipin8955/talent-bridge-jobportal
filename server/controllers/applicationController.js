const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

// @desc    Apply for a job posting
// @route   POST /api/applications
// @access  Private (Applicant only)
const applyForJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter, useDefaultResume } = req.body;

    if (!jobId) {
      return next(new AppError('Please provide a valid job ID.', 400));
    }

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return next(new AppError('Job posting not found.', 404));
    }

    if (job.status !== 'active') {
      return next(
        new AppError('This job posting is no longer accepting applications.', 400)
      );
    }

    // Check if applicant already applied
    const existingApplication = await Application.findOne({
      applicant: req.user.id,
      job: jobId,
    });

    if (existingApplication) {
      return next(
        new AppError('You have already submitted an application for this job posting.', 400)
      );
    }

    // Determine resume source
    let resumeData = null;

    if (req.file) {
      resumeData = {
        url: `/uploads/resumes/${req.file.filename}`,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      };

      // Also update applicant's default resume if they don't have one saved
      const user = await User.findById(req.user.id);
      if (!user.resume || !user.resume.url) {
        user.resume = {
          ...resumeData,
          uploadedAt: new Date(),
        };
        await user.save();
      }
    } else if (useDefaultResume === 'true' || useDefaultResume === true) {
      const user = await User.findById(req.user.id);
      if (user.resume && user.resume.url) {
        resumeData = {
          url: user.resume.url,
          originalName: user.resume.originalName || 'resume.pdf',
          size: user.resume.size || 0,
          mimeType: user.resume.mimeType || 'application/pdf',
        };
      }
    }

    if (!resumeData) {
      return next(
        new AppError(
          'Please upload a resume file (PDF, DOC, DOCX) or select your profile resume.',
          400
        )
      );
    }

    // Create application
    const application = await Application.create({
      applicant: req.user.id,
      job: job._id,
      recruiter: job.recruiter,
      resume: resumeData,
      coverLetter: coverLetter ? coverLetter.trim() : '',
      status: 'Applied',
      statusHistory: [
        {
          status: 'Applied',
          changedAt: new Date(),
          changedBy: req.user.id,
          notes: 'Application initially submitted by candidate.',
        },
      ],
    });

    // Increment job application count
    await Job.findByIdAndUpdate(job._id, { $inc: { applicationsCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      application,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all applications submitted by logged-in applicant
// @route   GET /api/applications/my
// @access  Private (Applicant only)
const getMyApplications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { applicant: req.user.id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate({
        path: 'job',
        select: 'title company companyLogo location jobType experienceLevel salary status isRemote',
        populate: {
          path: 'recruiter',
          select: 'name email company website',
        },
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all applications for a specific job (Recruiter only)
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter only - Job owner only)
const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { status, search } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return next(new AppError('Job posting not found.', 404));
    }

    // Authorization: Verify recruiter owns the job
    if (job.recruiter.toString() !== req.user.id) {
      return next(
        new AppError('Forbidden: You are not authorized to view candidates for this job.', 403)
      );
    }

    const query = { job: jobId };
    if (status && status !== 'all') {
      query.status = status;
    }

    let applications = await Application.find(query)
      .populate('applicant', 'name email phone bio location skills experience education avatar')
      .populate('job', 'title company location jobType')
      .sort('-createdAt');

    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      applications = applications.filter(
        (app) =>
          app.applicant?.name?.toLowerCase().includes(s) ||
          app.applicant?.email?.toLowerCase().includes(s) ||
          app.applicant?.skills?.some((sk) => sk.toLowerCase().includes(s))
      );
    }

    res.status(200).json({
      success: true,
      count: applications.length,
      job: {
        _id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        status: job.status,
      },
      applications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all candidates across all recruiter's jobs
// @route   GET /api/applications/recruiter/all
// @access  Private (Recruiter only)
const getAllRecruiterApplications = async (req, res, next) => {
  try {
    const { status, jobId, search } = req.query;
    const query = { recruiter: req.user.id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (jobId && jobId !== 'all') {
      query.job = jobId;
    }

    let applications = await Application.find(query)
      .populate('applicant', 'name email phone bio location skills experience education avatar')
      .populate('job', 'title company location jobType status')
      .sort('-createdAt');

    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      applications = applications.filter(
        (app) =>
          app.applicant?.name?.toLowerCase().includes(s) ||
          app.applicant?.email?.toLowerCase().includes(s) ||
          app.job?.title?.toLowerCase().includes(s) ||
          app.applicant?.skills?.some((sk) => sk.toLowerCase().includes(s))
      );
    }

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update candidate application status
// @route   PATCH /api/applications/:id/status
// @access  Private (Recruiter only - Job owner only)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const allowedStatuses = ['Applied', 'Reviewing', 'Shortlisted', 'Rejected', 'Hired'];
    if (!status || !allowedStatuses.includes(status)) {
      return next(
        new AppError(
          `Invalid status. Status must be one of: ${allowedStatuses.join(', ')}`,
          400
        )
      );
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return next(new AppError('Application not found.', 404));
    }

    // Security check: Verify recruiter owns the job/application
    if (application.recruiter.toString() !== req.user.id) {
      return next(
        new AppError(
          'Forbidden: You are not authorized to update applications for this job.',
          403
        )
      );
    }

    application.status = status;
    if (notes !== undefined) {
      application.notes = notes;
    }

    application.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user.id,
      notes: notes || `Status updated to ${status}`,
    });

    await application.save();

    const updatedApplication = await Application.findById(application._id)
      .populate('applicant', 'name email phone bio location skills experience education avatar')
      .populate('job', 'title company location jobType');

    res.status(200).json({
      success: true,
      message: `Candidate status updated to '${status}'.`,
      application: updatedApplication,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Download / view candidate resume
// @route   GET /api/applications/:id/resume
// @access  Private (Applicant owner or Recruiter owner)
const downloadApplicationResume = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return next(new AppError('Application not found.', 404));
    }

    // Check authorization: Must be the applicant who applied or the recruiter who received it
    const isApplicantOwner = application.applicant.toString() === req.user.id;
    const isRecruiterOwner = application.recruiter.toString() === req.user.id;

    if (!isApplicantOwner && !isRecruiterOwner) {
      return next(
        new AppError('Forbidden: You are not authorized to access this resume.', 403)
      );
    }

    const resumeUrl = application.resume?.url;
    if (!resumeUrl) {
      return next(new AppError('Resume file not found for this application.', 404));
    }

    // Filename in uploads/resumes/
    const filename = path.basename(resumeUrl);
    const filePath = path.join(__dirname, '..', 'uploads', 'resumes', filename);

    if (!fs.existsSync(filePath)) {
      return next(new AppError('Resume file does not exist on disk.', 404));
    }

    const originalName = application.resume?.originalName || 'resume.pdf';
    res.download(filePath, originalName);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  getAllRecruiterApplications,
  updateApplicationStatus,
  downloadApplicationResume,
};
