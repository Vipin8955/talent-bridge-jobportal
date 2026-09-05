import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { jobsApi } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import JobCard from '../../components/jobs/JobCard';
import JobFilters from '../../components/jobs/JobFilters';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ApplicationModal from '../../components/applications/ApplicationModal';

export const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isApplicant } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Extract filters from URL params
  const filters = {
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    jobType: searchParams.get('jobType') || 'All',
    experienceLevel: searchParams.get('experienceLevel') || 'All',
    isRemote: searchParams.get('isRemote') === 'true',
    sort: searchParams.get('sort') || '-createdAt',
    page: parseInt(searchParams.get('page') || '1', 10),
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        keyword: filters.keyword || undefined,
        location: filters.location || undefined,
        jobType: filters.jobType !== 'All' ? filters.jobType : undefined,
        experienceLevel:
          filters.experienceLevel !== 'All' ? filters.experienceLevel : undefined,
        isRemote: filters.isRemote ? true : undefined,
        sort: filters.sort,
        page: filters.page,
        limit: 9,
      };

      const res = await jobsApi.getJobs(params);
      if (res.data.success) {
        setJobs(res.data.jobs);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === '' || value === 'All' || value === false || value === null) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    // Reset page to 1 when changing filters other than page
    if (key !== 'page') {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleApplyClick = (job) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/jobs/${job._id}`);
      return;
    }
    if (!isApplicant) {
      alert('Only applicants can apply for jobs. Please register or switch to an applicant account.');
      return;
    }
    setSelectedJobForApply(job);
    setApplyModalOpen(true);
  };

  const handleApplicationSuccess = () => {
    setSuccessToast('Your application was submitted successfully!');
    setTimeout(() => setSuccessToast(''), 5000);
    fetchJobs();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <span>{successToast}</span>
          <button onClick={() => setSuccessToast('')} className="text-emerald-600 hover:text-emerald-800">
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Job Openings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Discover verified roles across top tech companies and startups.
        </p>
      </div>

      {/* Filter Toolbar */}
      <JobFilters
        filters={filters}
        onFilterChange={updateFilters}
        onResetFilters={handleResetFilters}
        totalJobs={total}
      />

      {/* Jobs Catalog */}
      {loading ? (
        <LoadingSpinner message="Searching available jobs..." />
      ) : jobs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onApplyClick={isApplicant ? handleApplyClick : null}
              />
            ))}
          </div>

          <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
            onPageChange={(page) => updateFilters('page', page)}
          />
        </>
      ) : (
        <EmptyState
          title="No jobs matched your search"
          description="Try adjusting your keywords, job type, or location filters to find more opportunities."
          actionText="Reset All Filters"
          onAction={handleResetFilters}
        />
      )}

      {/* Application Modal */}
      {selectedJobForApply && (
        <ApplicationModal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          job={selectedJobForApply}
          onApplicationSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
};

export default JobsPage;
