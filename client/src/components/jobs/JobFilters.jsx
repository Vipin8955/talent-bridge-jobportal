import React from 'react';
import { Search, MapPin, Filter, X, RotateCcw, SlidersHorizontal } from 'lucide-react';

export const JobFilters = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalJobs = 0,
}) => {
  const jobTypes = ['All', 'Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'];
  const experienceLevels = [
    'All',
    'Entry Level',
    'Mid Level',
    'Senior Level',
    'Lead / Principal',
    'Internship',
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5">
      {/* Top Search & Location Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Keyword / Role search */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by job title, company, skills..."
            value={filters.keyword || ''}
            onChange={(e) => onFilterChange('keyword', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-all"
          />
          {filters.keyword && (
            <button
              onClick={() => onFilterChange('keyword', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Location input */}
        <div className="md:col-span-4 relative">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Location (e.g. San Francisco, Remote)"
            value={filters.location || ''}
            onChange={(e) => onFilterChange('location', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-all"
          />
          {filters.location && (
            <button
              onClick={() => onFilterChange('location', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="md:col-span-2">
          <select
            value={filters.sort || '-createdAt'}
            onChange={(e) => onFilterChange('sort', e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="-createdAt">Newest First</option>
            <option value="salary_high">Highest Salary</option>
            <option value="salary_low">Lowest Salary</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Filter Row: Job Types Pills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Job Type
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={filters.isRemote || false}
              onChange={(e) => onFilterChange('isRemote', e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            Remote Only
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {jobTypes.map((type) => {
            const isSelected = (filters.jobType || 'All') === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onFilterChange('jobType', type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Experience Level & Reset Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Experience:</span>
          <select
            value={filters.experienceLevel || 'All'}
            onChange={(e) => onFilterChange('experienceLevel', e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {experienceLevels.map((exp) => (
              <option key={exp} value={exp}>
                {exp === 'All' ? 'All Experience Levels' : exp}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">
            <span className="text-indigo-600 font-bold">{totalJobs}</span> jobs found
          </span>
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobFilters;
