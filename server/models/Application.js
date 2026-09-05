const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Application must have an applicant'],
      index: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Application must be linked to a job'],
      index: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Application must be linked to a recruiter'],
      index: true,
    },
    resume: {
      url: {
        type: String,
        required: [true, 'Please provide a resume for the application'],
      },
      originalName: {
        type: String,
        default: 'resume.pdf',
      },
      size: {
        type: Number,
        default: 0,
      },
      mimeType: {
        type: String,
        default: 'application/pdf',
      },
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: [3000, 'Cover letter cannot exceed 3000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['Applied', 'Reviewing', 'Shortlisted', 'Rejected', 'Hired'],
        message: 'Status must be Applied, Reviewing, Shortlisted, Rejected, or Hired',
      },
      default: 'Applied',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['Applied', 'Reviewing', 'Shortlisted', 'Rejected', 'Hired'],
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        notes: {
          type: String,
        },
      },
    ],
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate application: 1 applicant per job
ApplicationSchema.index({ applicant: 1, job: 1 }, { unique: true });

// Compound indexes for recruiter application querying
ApplicationSchema.index({ recruiter: 1, status: 1, createdAt: -1 });
ApplicationSchema.index({ job: 1, status: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
