import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const JobCard = ({ job, onApplyClick }) => {
  if (!job) return null;

  // Format salary
  const formatSalary = () => {
    if (job.formattedSalary) return job.formattedSalary;
    if (job.salary?.negotiable) return 'Competitive';
    if (!job.salary?.min && !job.salary?.max) return 'Not Specified';
    const period = job.salary?.period || 'LPA';
    const sym = job.salary?.currency === 'USD' ? '$' : '₹';
    if (period === 'LPA') {
      const min = job.salary.min >= 100000 ? job.salary.min / 100000 : job.salary.min;
      const max = job.salary.max >= 100000 ? job.salary.max / 100000 : job.salary.max;
      if (min && max) return `${sym}${min} - ${sym}${max} LPA`;
      if (min) return `From ${sym}${min} LPA`;
      return `${sym}${max} LPA`;
    }
    const suffix = period === 'monthly' ? '/mo' : period === 'hourly' ? '/hr' : '/yr';
    if (job.salary.min && job.salary.max) {
      return `${sym}${job.salary.min.toLocaleString()} - ${sym}${job.salary.max.toLocaleString()}${suffix}`;
    }
    if (job.salary.min) return `From ${sym}${job.salary.min.toLocaleString()}${suffix}`;
    return 'Competitive';
  };

  // Format relative date
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-card hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header: Company + Title + Type */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3.5">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.company}
                className="h-12 w-12 rounded-xl object-cover border border-slate-100 shadow-xs"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 text-slate-700 flex items-center justify-center font-bold text-base border border-slate-200/60 shadow-xs">
                {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
              </div>
            )}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {job.company}
              </h4>
              <Link
                to={`/jobs/${job._id}`}
                className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mt-0.5"
              >
                {job.title}
              </Link>
            </div>
          </div>

          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            {job.jobType}
          </span>
        </div>

        {/* Details Row: Location, Experience, Salary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{job.location}</span>
            {job.isRemote && (
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                Remote
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{job.experienceLevel || 'All Experience'}</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 truncate">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{formatSalary()}</span>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {job.description}
        </p>

        {/* Skills Tags */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-slate-100/90 text-slate-700 rounded-md text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md text-[11px] font-medium">
                +{job.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs mt-auto">
        <div className="flex items-center gap-1 text-slate-400 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDate(job.createdAt)}</span>
        </div>

        <div className="flex items-center gap-2">
          {job.hasApplied ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Applied {job.applicationStatus ? `(${job.applicationStatus})` : ''}
            </span>
          ) : onApplyClick ? (
            <button
              onClick={() => onApplyClick(job)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              Apply Now
            </button>
          ) : null}
          <Link
            to={`/jobs/${job._id}`}
            className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            View Details
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
