const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  getAllRecruiterApplications,
  updateApplicationStatus,
  downloadApplicationResume,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');

// Applicant routes
router.post(
  '/',
  protect,
  authorize('applicant'),
  uploadResume.single('resume'),
  applyForJob
);
router.get('/my', protect, authorize('applicant'), getMyApplications);

// Recruiter routes
router.get(
  '/recruiter/all',
  protect,
  authorize('recruiter'),
  getAllRecruiterApplications
);
router.get(
  '/job/:jobId',
  protect,
  authorize('recruiter'),
  getJobApplications
);
router.patch(
  '/:id/status',
  protect,
  authorize('recruiter'),
  updateApplicationStatus
);

// Shared route (Applicant owner or Recruiter owner)
router.get('/:id/resume', protect, downloadApplicationResume);

module.exports = router;
