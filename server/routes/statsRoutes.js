const express = require('express');
const router = express.Router();
const {
  getApplicantStats,
  getRecruiterStats,
} = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/applicant', protect, authorize('applicant'), getApplicantStats);
router.get('/recruiter', protect, authorize('recruiter'), getRecruiterStats);

module.exports = router;
