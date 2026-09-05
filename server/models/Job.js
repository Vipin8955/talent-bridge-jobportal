const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
      maxlength: [150, 'Job title cannot exceed 150 characters'],
    },
    company: {
      type: String,
      required: [true, 'Please provide a company name'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    companyLogo: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description'],
    },
    requirements: {
      type: [String],
      default: [],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      required: [true, 'Please provide a job location'],
      trim: true,
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
    jobType: {
      type: String,
      enum: {
        values: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'],
        message: 'Job type must be Full-time, Part-time, Internship, Contract, or Remote',
      },
      required: [true, 'Please specify job type'],
      default: 'Full-time',
    },
    experienceLevel: {
      type: String,
      enum: {
        values: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead / Principal', 'Internship'],
        message: 'Experience level must be Entry Level, Mid Level, Senior Level, Lead / Principal, or Internship',
      },
      default: 'Mid Level',
    },
    salary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      period: {
        type: String,
        enum: ['LPA', 'CTC', 'yearly', 'monthly', 'hourly'],
        default: 'LPA',
      },
      negotiable: { type: Boolean, default: false },
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Job must belong to a recruiter'],
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
      index: true,
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted salary string (supports LPA, CTC, INR, and International formats)
JobSchema.virtual('formattedSalary').get(function () {
  if (this.salary?.negotiable) return 'Competitive / Negotiable';
  if (!this.salary?.min && !this.salary?.max) return 'Not Specified';

  const currencyMap = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  const sym = currencyMap[this.salary?.currency] || (this.salary?.currency === 'USD' ? '$' : '₹');
  const period = this.salary?.period || 'LPA';

  const formatNumber = (num) => {
    if (!num) return '0';
    if (period === 'LPA' || period === 'CTC') {
      // If entered as 800000, convert to 8. If entered as 8, keep 8.
      if (num >= 100000) {
        return (num / 100000).toLocaleString();
      }
      return num.toLocaleString();
    }
    return num.toLocaleString();
  };

  const minStr = formatNumber(this.salary.min);
  const maxStr = formatNumber(this.salary.max);

  if (period === 'LPA') {
    if (this.salary.min && this.salary.max) return `${sym}${minStr} - ${sym}${maxStr} LPA`;
    if (this.salary.min) return `From ${sym}${minStr} LPA`;
    if (this.salary.max) return `Up to ${sym}${maxStr} LPA`;
  }

  if (period === 'CTC') {
    if (this.salary.min && this.salary.max) return `${sym}${minStr} - ${sym}${maxStr} Lakhs CTC`;
    if (this.salary.min) return `From ${sym}${minStr} Lakhs CTC`;
    if (this.salary.max) return `Up to ${sym}${maxStr} Lakhs CTC`;
  }

  const suffix = period === 'monthly' ? '/mo' : period === 'hourly' ? '/hr' : '/yr';
  if (this.salary.min && this.salary.max) {
    return `${sym}${this.salary.min.toLocaleString()} - ${sym}${this.salary.max.toLocaleString()}${suffix}`;
  }
  if (this.salary.min) return `From ${sym}${this.salary.min.toLocaleString()}${suffix}`;
  if (this.salary.max) return `Up to ${sym}${this.salary.max.toLocaleString()}${suffix}`;

  return 'Competitive';
});

// Indexes for high-performance searching
JobSchema.index({
  title: 'text',
  company: 'text',
  description: 'text',
  skills: 'text',
});

JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ status: 1, jobType: 1, location: 1 });
JobSchema.index({ recruiter: 1, createdAt: -1 });

module.exports = mongoose.model('Job', JobSchema);
