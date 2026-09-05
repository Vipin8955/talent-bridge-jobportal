import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Building,
  Globe,
  CheckCircle2,
  Share2,
  ArrowLeft,
  Users,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { jobsApi } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import ApplicationModal from '../../components/applications/ApplicationModal';

export const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isApplicant, isRecruiter } = useAuth();

  const [job, setJob] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const res = await jobsApi.getJobById(id);
      if (res.data.success) {
        setJob(res.data.job);
        setHasApplied(res.data.hasApplied);
        setApplication(res.data.application);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Job posting not found or unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const handleApplicationSuccess = (newApp) => {
    setHasApplied(true);
    setApplication(newApp);
    setToastMessage('Congratulations! Your application was submitted successfully.');
    setTimeout(() => setToastMessage(''), 6000);
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading job posting details..." />;
  }

  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Job Unavailable</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'This job does not exist.'}</p>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Jobs Catalog
        </Link>
      </div>
    );
  }

  const isJobOwner = isRecruiter && job.recruiter?._id === user?._id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {toastMessage}
          </span>
          <button onClick={() => setToastMessage('')} className="text-emerald-600">✕</button>
        </div>
      )}

      {/* Back Link */}
      <div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Job Openings
        </Link>
      </div>

      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 lg:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.company}
                className="h-16 w-16 rounded-2xl object-cover border border-slate-100 shadow-xs"
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-indigo-100">
                {job.company?.charAt(0).toUpperCase() || 'C'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-xs font-semibold text-slate-500">{job.company}</span>
                <span className="text-slate-300">•</span>
                <StatusBadge status={job.status} size="sm" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {job.location} {job.isRemote && '(Remote Option)'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  {job.jobType}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button Section */}
          <div className="flex flex-wrap items-center gap-3 lg:shrink-0">
            {isJobOwner ? (
              <div className="flex items-center gap-2">
                <Link
                  to={`/recruiter/jobs/edit/${job._id}`}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Edit Job
                </Link>
                <Link
                  to={`/recruiter/applications?jobId=${job._id}`}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all"
                >
                  View Applicants ({job.applicationsCount || 0})
                </Link>
              </div>
            ) : isApplicant ? (
              hasApplied ? (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                  <div className="text-left">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Your Application Status:
                    </p>
                    <div className="mt-1">
                      <StatusBadge status={application?.status || 'Applied'} size="md" />
                    </div>
                  </div>
                  <Link
                    to="/applicant/applications"
                    className="ml-2 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    View in My Applications
                  </Link>
                </div>
              ) : job.status === 'active' ? (
                <button
                  onClick={() => setApplyModalOpen(true)}
                  className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02]"
                >
                  Apply For This Position
                </button>
              ) : (
                <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold">
                  Applications Closed
                </span>
              )
            ) : !isAuthenticated ? (
              <Link
                to={`/login?redirect=/jobs/${job._id}`}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100"
              >
                Sign In to Apply
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Job Description & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 lg:p-8 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              About The Role
            </h2>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 lg:p-8 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Key Responsibilities
              </h2>
              <ul className="space-y-3">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 lg:p-8 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Requirements & Qualifications
              </h2>
              <ul className="space-y-3">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Overview & Company Info */}
        <div className="space-y-6">
          {/* Overview Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              Job Overview
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Employment Type</span>
                <span className="font-bold text-slate-800">{job.jobType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Experience Level</span>
                <span className="font-bold text-slate-800">{job.experienceLevel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Compensation</span>
                <span className="font-bold text-emerald-600">
                  {job.formattedSalary || 'Competitive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Location</span>
                <span className="font-bold text-slate-800">{job.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Remote Work</span>
                <span className="font-bold text-slate-800">{job.isRemote ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Applicants</span>
                <span className="font-bold text-slate-800">{job.applicationsCount || 0}</span>
              </div>
            </div>

            {/* Skills Tags */}
            {job.skills && job.skills.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recruiter / Company Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              About The Employer
            </h3>

            <div className="space-y-3">
              <h4 className="text-base font-bold text-slate-800">{job.company}</h4>
              {job.recruiter?.companyDescription && (
                <p className="text-xs text-slate-500 leading-relaxed">
                  {job.recruiter.companyDescription}
                </p>
              )}
              {job.recruiter?.website && (
                <a
                  href={job.recruiter.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Visit Company Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {applyModalOpen && (
        <ApplicationModal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          job={job}
          onApplicationSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
};

export default JobDetailsPage;
