const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadDefaultResume,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post(
  '/resume',
  protect,
  authorize('applicant'),
  uploadResume.single('resume'),
  uploadDefaultResume
);

module.exports = router;
