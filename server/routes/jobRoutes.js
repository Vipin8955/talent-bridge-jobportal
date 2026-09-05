const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getRecruiterJobs,
} = require('../controllers/jobController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validateJob } = require('../middleware/validator');

// Public search and browsing routes (supports optional auth to detect if applicant applied)
router.get('/', optionalAuth, getJobs);

// Recruiter specific routes
router.get('/recruiter/my', protect, authorize('recruiter'), getRecruiterJobs);
router.post('/', protect, authorize('recruiter'), validateJob, createJob);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);

// Single job details (supports optional auth to see if candidate already applied)
router.get('/:id', optionalAuth, getJobById);

module.exports = router;
