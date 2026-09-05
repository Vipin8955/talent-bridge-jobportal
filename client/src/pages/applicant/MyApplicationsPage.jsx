import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Building,
  MapPin,
  Calendar,
  Download,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { applicationsApi } from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchApplications = async (status = 'all') => {
    setLoading(true);
    try {
      const res = await applicationsApi.getMyApplications({
        status: status !== 'all' ? status : undefined,
      });
      if (res.data.success) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(activeTab);
  }, [activeTab]);

  const tabs = [
    { id: 'all', label: 'All Applications' },
    { id: 'Applied', label: 'Applied' },
    { id: 'Reviewing', label: 'Under Review' },
    { id: 'Shortlisted', label: 'Shortlisted' },
    { id: 'Hired', label: 'Hired' },
    { id: 'Rejected', label: 'Rejected' },
  ];

  const handleDownloadResume = async (applicationId, filename) => {
    try {
      const res = await applicationsApi.downloadResume(applicationId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Unable to download resume file.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          My Applications
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review the status of your submitted job applications and candidate history.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {loading ? (
        <LoadingSpinner message="Loading your submitted applications..." />
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-card transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-semibold text-slate-500">
                      {app.job?.company || 'Company'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <StatusBadge status={app.status} size="sm" />
                  </div>
                  <Link
                    to={`/jobs/${app.job?._id}`}
                    className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5"
                  >
                    {app.job?.title || 'Position'}
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {app.job?.location || 'Location'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Applied on {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:shrink-0">
                  <button
                    onClick={() =>
                      handleDownloadResume(app._id, app.resume?.originalName)
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    Download Resume
                  </button>
                  <Link
                    to={`/jobs/${app.job?._id}`}
                    className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all"
                  >
                    View Job
                  </Link>
                </div>
              </div>

              {/* Cover letter snippet */}
              {app.coverLetter && (
                <div className="pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Your Cover Letter: </span>
                  <span className="italic line-clamp-2">"{app.coverLetter}"</span>
                </div>
              )}

              {/* Recruiter Review & Feedback */}
              {app.notes && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs ${
                    app.status === 'Rejected'
                      ? 'bg-rose-50/70 border-rose-200/80 text-rose-900'
                      : app.status === 'Hired'
                      ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
                      : 'bg-indigo-50/70 border-indigo-200/80 text-indigo-900'
                  }`}
                >
                  <p className="font-bold mb-1 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    {app.status === 'Rejected'
                      ? 'Recruiter Rejection Feedback:'
                      : 'Recruiter Review / Feedback:'}
                  </p>
                  <p className="leading-relaxed whitespace-pre-line text-slate-700">
                    {app.notes}
                  </p>
                </div>
              )}

              {/* Status Timeline History */}
              {app.statusHistory && app.statusHistory.length > 0 && (
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Timeline:
                  </span>
                  {app.statusHistory.map((step, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      <span className="font-medium text-slate-700">{step.status}</span>
                      <span className="text-slate-400 text-[10px]">
                        ({new Date(step.changedAt).toLocaleDateString()})
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No applications in this status"
          description="You haven't submitted any applications under this category yet."
          actionText="Find More Jobs"
          actionLink="/jobs"
        />
      )}
    </div>
  );
};

export default MyApplicationsPage;
