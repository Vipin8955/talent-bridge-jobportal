const Job = require('../models/Job');
const Application = require('../models/Application');
const { AppError } = require('../middleware/errorHandler');

// @desc    Get all active jobs with search, filtering, and pagination
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const {
      keyword,
      search,
      location,
      jobType,
      experienceLevel,
      skills,
      isRemote,
      minSalary,
      maxSalary,
      status,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    const query = {};

    // By default, only return active jobs for public queries
    query.status = status || 'active';

    // Keyword search across title, company, description, and skills
    const searchTerm = (keyword || search || '').trim();
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, 'i');
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { description: searchRegex },
        { skills: { $in: [searchRegex] } },
        { location: searchRegex },
      ];
    }

    // Location filter
    if (location && location.trim()) {
      query.location = new RegExp(location.trim(), 'i');
    }

    // Job Type filter
    if (jobType && jobType !== 'All') {
      if (Array.isArray(jobType)) {
        query.jobType = { $in: jobType };
      } else {
        query.jobType = jobType;
      }
    }

    // Experience Level filter
    if (experienceLevel && experienceLevel !== 'All') {
      if (Array.isArray(experienceLevel)) {
        query.experienceLevel = { $in: experienceLevel };
      } else {
        query.experienceLevel = experienceLevel;
      }
    }

    // Remote filter
    if (isRemote === 'true' || isRemote === true) {
      query.isRemote = true;
    }

    // Skills filter
    if (skills) {
      const skillArray = Array.isArray(skills)
        ? skills
        : skills.split(',').map((s) => s.trim().toLowerCase());
      query.skills = { $in: skillArray.map((s) => new RegExp(s, 'i')) };
    }

    // Salary filter
    if (minSalary || maxSalary) {
      query['salary.min'] = {};
      if (minSalary) query['salary.min'].$gte = Number(minSalary);
      if (maxSalary) query['salary.max'] = { $lte: Number(maxSalary) };
    }

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Sorting map
    let sortOption = '-createdAt';
    if (sort === 'newest' || sort === '-createdAt') sortOption = '-createdAt';
    if (sort === 'oldest' || sort === 'createdAt') sortOption = 'createdAt';
    if (sort === 'salary_high') sortOption = '-salary.max';
    if (sort === 'salary_low') sortOption = 'salary.min';
    if (sort === 'title') sortOption = 'title';

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('recruiter', 'name email company website avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum) || 1;

    // If authenticated user is an applicant, check which jobs they have already applied to
    let formattedJobs = jobs.map((j) => j.toObject());
    if (req.user && req.user.role === 'applicant') {
      const jobIds = jobs.map((j) => j._id);
      const userApplications = await Application.find({
        applicant: req.user.id,
        job: { $in: jobIds },
      });

      const appliedMap = {};
      userApplications.forEach((app) => {
        appliedMap[app.job.toString()] = {
          hasApplied: true,
          applicationStatus: app.status,
          applicationId: app._id,
        };
      });

      formattedJobs = formattedJobs.map((j) => ({
        ...j,
        hasApplied: !!appliedMap[j._id.toString()],
        applicationStatus: appliedMap[j._id.toString()]?.applicationStatus || null,
        applicationId: appliedMap[j._id.toString()]?.applicationId || null,
      }));
    }

    res.status(200).json({
      success: true,
      count: formattedJobs.length,
      total,
      page: pageNum,
      totalPages,
      hasMore: pageNum < totalPages,
      jobs: formattedJobs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public (Optional auth)
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'recruiter',
      'name email company companyDescription website avatar'
    );

    if (!job) {
      return next(new AppError('Job posting not found.', 404));
    }

    let hasApplied = false;
    let applicationDetails = null;

    // If user is authenticated and is an applicant, check if applied
    if (req.user && req.user.role === 'applicant') {
      const existingApplication = await Application.findOne({
        job: job._id,
        applicant: req.user.id,
      });

      if (existingApplication) {
        hasApplied = true;
        applicationDetails = {
          applicationId: existingApplication._id,
          status: existingApplication.status,
          appliedAt: existingApplication.appliedAt,
        };
      }
    }

    res.status(200).json({
      success: true,
      job,
      hasApplied,
      application: applicationDetails,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Recruiter only)
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      companyLogo,
      description,
      requirements,
      responsibilities,
      location,
      isRemote,
      jobType,
      experienceLevel,
      salary,
      skills,
      status,
    } = req.body;

    // Parse array fields if passed as strings
    const parsedSkills = Array.isArray(skills)
      ? skills.map((s) => s.trim().toLowerCase())
      : typeof skills === 'string'
      ? skills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
      : [];

    const parsedRequirements = Array.isArray(requirements)
      ? requirements
      : typeof requirements === 'string'
      ? requirements.split('\n').map((r) => r.trim()).filter(Boolean)
      : [];

    const parsedResponsibilities = Array.isArray(responsibilities)
      ? responsibilities
      : typeof responsibilities === 'string'
      ? responsibilities.split('\n').map((r) => r.trim()).filter(Boolean)
      : [];

    const job = await Job.create({
      title: title.trim(),
      company: company ? company.trim() : req.user.company || 'Tech Company',
      companyLogo: companyLogo || '',
      description: description.trim(),
      requirements: parsedRequirements,
      responsibilities: parsedResponsibilities,
      location: location.trim(),
      isRemote: Boolean(isRemote),
      jobType: jobType || 'Full-time',
      experienceLevel: experienceLevel || 'Mid Level',
      salary: salary || { min: 0, max: 0, currency: 'USD', period: 'yearly' },
      skills: parsedSkills,
      recruiter: req.user.id,
      status: status || 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully.',
      job,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a job posting
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter only - Job owner only)
const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError('Job posting not found.', 404));
    }

    // Verify ownership: Recruiter cannot edit another recruiter's job
    if (job.recruiter.toString() !== req.user.id) {
      return next(
        new AppError('Forbidden: You are not authorized to update this job posting.', 403)
      );
    }

    const {
      title,
      company,
      companyLogo,
      description,
      requirements,
      responsibilities,
      location,
      isRemote,
      jobType,
      experienceLevel,
      salary,
      skills,
      status,
    } = req.body;

    if (title) job.title = title.trim();
    if (company) job.company = company.trim();
    if (companyLogo !== undefined) job.companyLogo = companyLogo;
    if (description) job.description = description.trim();
    if (location) job.location = location.trim();
    if (isRemote !== undefined) job.isRemote = Boolean(isRemote);
    if (jobType) job.jobType = jobType;
    if (experienceLevel) job.experienceLevel = experienceLevel;
    if (salary) job.salary = salary;
    if (status) job.status = status;

    if (skills !== undefined) {
      job.skills = Array.isArray(skills)
        ? skills.map((s) => s.trim().toLowerCase())
        : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
        : [];
    }

    if (requirements !== undefined) {
      job.requirements = Array.isArray(requirements)
        ? requirements
        : typeof requirements === 'string'
        ? requirements.split('\n').map((r) => r.trim()).filter(Boolean)
        : [];
    }

    if (responsibilities !== undefined) {
      job.responsibilities = Array.isArray(responsibilities)
        ? responsibilities
        : typeof responsibilities === 'string'
        ? responsibilities.split('\n').map((r) => r.trim()).filter(Boolean)
        : [];
    }

    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job posting updated successfully.',
      job,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete or deactivate a job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter only - Job owner only)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new AppError('Job posting not found.', 404));
    }

    // Verify ownership
    if (job.recruiter.toString() !== req.user.id) {
      return next(
        new AppError('Forbidden: You are not authorized to delete this job posting.', 403)
      );
    }

    // Delete associated applications and job
    await Application.deleteMany({ job: job._id });
    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job posting and associated applications removed successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all jobs created by the logged-in recruiter
// @route   GET /api/jobs/recruiter/my
// @access  Private (Recruiter only)
const getRecruiterJobs = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = { recruiter: req.user.id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      query.title = new RegExp(search.trim(), 'i');
    }

    const jobs = await Job.find(query).sort('-createdAt');

    // Aggregate real-time application count per job
    const jobIds = jobs.map((j) => j._id);
    const appCounts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$job', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    appCounts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const jobsWithCounts = jobs.map((job) => {
      const jobObj = job.toObject();
      jobObj.applicationsCount = countMap[job._id.toString()] || 0;
      return jobObj;
    });

    res.status(200).json({
      success: true,
      count: jobsWithCounts.length,
      jobs: jobsWithCounts,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getRecruiterJobs,
};
