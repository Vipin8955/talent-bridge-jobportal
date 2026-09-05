import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  ExternalLink,
  ChevronDown,
  Briefcase,
  GraduationCap,
  MessageSquare,
} from 'lucide-react';
import { applicationsApi, jobsApi } from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusUpdateModal from '../../components/applications/StatusUpdateModal';

export const JobApplicationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJobId = searchParams.get('jobId') || 'all';

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppForStatus, setSelectedAppForStatus] = useState(null);
  const [expandedCandidateId, setExpandedCandidateId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Load recruiter jobs for dropdown filter
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await jobsApi.getRecruiterJobs();
        if (res.data.success) {
          setJobs(res.data.jobs);
        }
      } catch (err) {
        console.error('Failed to load recruiter jobs:', err);
      }
    };
    fetchJobs();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationsApi.getAllRecruiterApplications({
        jobId: selectedJobId !== 'all' ? selectedJobId : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined,
      });
      if (res.data.success) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error('Failed to load candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [selectedJobId, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleJobFilterChange = (jobId) => {
    const newParams = new URLSearchParams(searchParams);
    if (jobId === 'all') {
      newParams.delete('jobId');
    } else {
      newParams.set('jobId', jobId);
    }
    setSearchParams(newParams);
  };

  const handleDownloadResume = async (applicationId, filename) => {
    try {
      const res = await applicationsApi.downloadResume(applicationId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'candidate_resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Unable to download resume file.');
    }
  };

  const handleStatusUpdated = (updatedApp) => {
    setToastMessage(`Status updated to '${updatedApp.status}' for ${updatedApp.applicant?.name}`);
    setTimeout(() => setToastMessage(''), 4000);
    fetchApplications();
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
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Candidate Pipeline & Applications
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review candidate resumes, evaluate qualifications, and update hiring statuses.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search input */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate by name, email, or skills..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 hover:bg-white"
            />
          </form>

          {/* Job select dropdown */}
          <div className="md:col-span-6">
            <select
              value={selectedJobId}
              onChange={(e) => handleJobFilterChange(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 hover:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Job Postings ({jobs.length} roles)</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title} ({job.applicationsCount || 0} candidates)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Status:
          </span>
          {['all', 'Applied', 'Reviewing', 'Shortlisted', 'Hired', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Candidates' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Candidate Cards List */}
      {loading ? (
        <LoadingSpinner message="Loading candidate applications..." />
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => {
            const isExpanded = expandedCandidateId === app._id;
            return (
              <div
                key={app._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-card transition-all space-y-4"
              >
                {/* Top Row: Candidate details + Status + Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
                      {app.applicant?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">
                          {app.applicant?.name || 'Applicant'}
                        </h3>
                        <StatusBadge status={app.status} size="sm" />
                      </div>

                      <p className="text-xs font-medium text-slate-600">
                        Applied for{' '}
                        <Link
                          to={`/jobs/${app.job?._id}`}
                          className="font-bold text-indigo-600 hover:underline"
                        >
                          {app.job?.title || 'Position'}
                        </Link>
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {app.applicant?.email}
                        </span>
                        {app.applicant?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {app.applicant?.phone}
                          </span>
                        )}
                        {app.applicant?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {app.applicant?.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Applied {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
                    <button
                      onClick={() =>
                        handleDownloadResume(app._id, app.resume?.originalName)
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-all shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Resume
                    </button>

                    <button
                      onClick={() => setSelectedAppForStatus(app)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all ${
                        app.status === 'Rejected'
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          : app.status === 'Hired'
                          ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {app.status === 'Rejected'
                        ? 'Re-evaluate / Change Status'
                        : app.status === 'Hired'
                        ? 'Manage Status'
                        : 'Update Status'}
                    </button>

                    <button
                      onClick={() =>
                        setExpandedCandidateId(isExpanded ? null : app._id)
                      }
                      className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all text-xs font-semibold"
                    >
                      {isExpanded ? 'Less Info ▲' : 'More Info ▼'}
                    </button>
                  </div>
                </div>

                {/* Candidate Skills Tags */}
                {app.applicant?.skills && app.applicant?.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {app.applicant.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Recruiter Notes / Rejection Feedback if provided */}
                {app.notes && (
                  <div
                    className={`p-3 rounded-2xl text-xs border ${
                      app.status === 'Rejected'
                        ? 'bg-rose-50/70 border-rose-200/70 text-rose-900'
                        : app.status === 'Hired'
                        ? 'bg-emerald-50/70 border-emerald-200/70 text-emerald-900'
                        : 'bg-indigo-50/70 border-indigo-200/70 text-indigo-900'
                    }`}
                  >
                    <p className="font-bold flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                      {app.status === 'Rejected'
                        ? 'Rejection Feedback Given:'
                        : 'Recruiter Notes / Review:'}
                    </p>
                    <p className="mt-0.5 leading-relaxed text-slate-700">{app.notes}</p>
                  </div>
                )}

                {/* Cover Letter Box */}
                {app.coverLetter && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                    <p className="font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                      Candidate Cover Letter:
                    </p>
                    <p className="leading-relaxed whitespace-pre-line">{app.coverLetter}</p>
                  </div>
                )}

                {/* Expanded Details: Bio, Work History, Education, Timeline */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in">
                    {app.applicant?.bio && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Candidate Bio
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {app.applicant.bio}
                        </p>
                      </div>
                    )}

                    {app.applicant?.experience && app.applicant.experience.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-indigo-600" /> Work History
                        </h4>
                        <div className="space-y-2">
                          {app.applicant.experience.map((exp, expIdx) => (
                            <div
                              key={expIdx}
                              className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
                            >
                              <p className="font-bold text-slate-800">
                                {exp.title} • <span className="font-medium text-slate-600">{exp.company}</span>
                              </p>
                              {exp.years && <p className="text-[11px] text-slate-400">{exp.years}</p>}
                              {exp.description && (
                                <p className="text-slate-600 mt-1">{exp.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {app.applicant?.education && app.applicant.education.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-600" /> Education
                        </h4>
                        <div className="space-y-2">
                          {app.applicant.education.map((edu, eduIdx) => (
                            <div
                              key={eduIdx}
                              className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
                            >
                              <p className="font-bold text-slate-800">{edu.degree}</p>
                              <p className="text-slate-600">{edu.institution} {edu.year && `(${edu.year})`}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status history timeline */}
                    {app.statusHistory && app.statusHistory.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Status History & Recruiter Notes
                        </h4>
                        <div className="space-y-1.5">
                          {app.statusHistory.map((step, sIdx) => (
                            <div
                              key={sIdx}
                              className="text-xs text-slate-600 flex items-center gap-2"
                            >
                              <span className="font-semibold text-slate-800">{step.status}</span>
                              <span className="text-slate-400 text-[11px]">
                                ({new Date(step.changedAt).toLocaleString()})
                              </span>
                              {step.notes && <span className="text-slate-500 italic">— "{step.notes}"</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No candidates found"
          description="There are currently no candidate applications matching your search or filters."
          actionText="View All Jobs"
          actionLink="/recruiter/jobs"
        />
      )}

      {/* Status Update Modal */}
      {selectedAppForStatus && (
        <StatusUpdateModal
          isOpen={!!selectedAppForStatus}
          onClose={() => setSelectedAppForStatus(null)}
          application={selectedAppForStatus}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
};

export default JobApplicationsPage;
