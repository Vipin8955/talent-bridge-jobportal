const { AppError } = require('./errorHandler');

const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Full name is required.');
  }

  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (!role || !['applicant', 'recruiter'].includes(role)) {
    errors.push('Role must be specified as either "applicant" or "recruiter".');
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join(' '), 400));
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || email.trim().length === 0) {
    errors.push('Email address is required.');
  }

  if (!password || password.length === 0) {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join(' '), 400));
  }

  next();
};

const validateJob = (req, res, next) => {
  const { title, company, description, location, jobType } = req.body;
  const errors = [];

  if (!title || title.trim().length === 0) errors.push('Job title is required.');
  if (!company || company.trim().length === 0) errors.push('Company name is required.');
  if (!description || description.trim().length === 0) errors.push('Job description is required.');
  if (!location || location.trim().length === 0) errors.push('Job location is required.');

  if (jobType && !['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'].includes(jobType)) {
    errors.push('Invalid job type.');
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join(' '), 400));
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateJob,
};
