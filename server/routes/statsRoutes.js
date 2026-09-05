const express = require('express');
const router = express.Router();
const {
  getPublicStats,
  getApplicantStats,
  getRecruiterStats,
} = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/auth');

// Public platform overview stats
router.get('/public', getPublicStats);

// Protected dashboard stats
router.get('/applicant', protect, authorize('applicant'), getApplicantStats);
router.get('/recruiter', protect, authorize('recruiter'), getRecruiterStats);

module.exports = router;
