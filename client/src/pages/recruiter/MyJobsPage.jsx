import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Users,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  ExternalLink,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { jobsApi } from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export const MyJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Delete dialog state
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchMyJobs = async () => {
    setLoading(true);
    try {
      const res = await jobsApi.getRecruiterJobs({
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      if (res.data.success) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      console.error('Failed to load recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMyJobs();
  };

  const handleToggleStatus = async (job) => {
    const nextStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      const res = await jobsApi.updateJob(job._id, { status: nextStatus });
      if (res.data.success) {
        setToastMessage(`Job status updated to '${nextStatus}'.`);
        setTimeout(() => setToastMessage(''), 4000);
        fetchMyJobs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update job status.');
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await jobsApi.deleteJob(jobToDelete._id);
      if (res.data.success) {
        setToastMessage('Job posting removed successfully.');
        setTimeout(() => setToastMessage(''), 4000);
        setJobToDelete(null);
        fetchMyJobs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete job.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-emerald-600">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage Job Postings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, update, deactivate, and review candidates for your open positions.
          </p>
        </div>

        <Link
          to="/recruiter/jobs/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Post New Position
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'active', 'closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Job List Table */}
      {loading ? (
        <LoadingSpinner message="Loading your job postings..." />
      ) : jobs.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Position</th>
                  <th className="py-4 px-6">Location & Type</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Applicants</th>
                  <th className="py-4 px-6">Created</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5"
                      >
                        {job.title}
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                        {job.formattedSalary || 'Competitive'}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-600">
                      <div>{job.location}</div>
                      <div className="text-[11px] text-slate-400">{job.jobType}</div>
                    </td>

                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleStatus(job)}
                        title="Click to toggle active/closed"
                        className="cursor-pointer"
                      >
                        <StatusBadge status={job.status} size="sm" />
                      </button>
                    </td>

                    <td className="py-4 px-6">
                      <Link
                        to={`/recruiter/applications?jobId=${job._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition-all"
                      >
                        <Users className="w-3.5 h-3.5" />
                        {job.applicationsCount || 0} Candidates
                      </Link>
                    </td>

                    <td className="py-4 px-6 text-slate-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/recruiter/jobs/edit/${job._id}`}
                          className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                          title="Edit Posting"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setJobToDelete(job)}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                          title="Delete Posting"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No job postings found"
          description="Create your first job listing to start receiving candidate applications."
          actionText="Create New Job"
          actionLink="/recruiter/jobs/create"
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        onConfirm={handleDeleteJob}
        title="Delete Job Posting?"
        message={`Are you sure you want to delete "${jobToDelete?.title}"? This will also remove all associated applicant records for this job.`}
        confirmText="Delete Job"
        isDanger={true}
        loading={deleteLoading}
      />
    </div>
  );
};

export default MyJobsPage;
