import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Clock,
  Award,
  CheckCircle,
  PlusCircle,
  ArrowRight,
  Building,
  Eye,
  FileText,
} from 'lucide-react';
import { statsApi } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusUpdateModal from '../../components/applications/StatusUpdateModal';

export const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppForStatus, setSelectedAppForStatus] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await statsApi.getRecruiterStats();
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentJobs(res.data.recentJobs);
        setRecentApplications(res.data.recentApplications);
      }
    } catch (err) {
      console.error('Error loading recruiter stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage message="Loading recruitment pipeline analytics..." />;
  }

  const statCards = [
    {
      title: 'Active Job Postings',
      value: stats?.activeJobs || 0,
      icon: Briefcase,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Total Candidates',
      value: stats?.totalApplications || 0,
      icon: Users,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      title: 'Under Review',
      value: stats?.reviewing || 0,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      title: 'Shortlisted & Hired',
      value: (stats?.shortlisted || 0) + (stats?.hired || 0),
      icon: Award,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Recruiter Hub
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs font-semibold text-slate-300">
              {user?.company || 'Company'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hiring Dashboard — {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Review candidate pipeline, manage active postings, and move applicants through your hiring stages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/recruiter/applications"
            className="px-4 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-xs font-semibold transition-all flex items-center gap-2"
          >
            <Users className="w-4 h-4" /> All Candidates
          </Link>
          <Link
            to="/recruiter/jobs/create"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Post a Job
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{card.title}</span>
                <div className={`p-2 rounded-xl border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Pipeline Grid: Recent Candidates & Postings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Candidates */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Candidates</h2>
              <p className="text-xs text-slate-500">Applicants who recently submitted resumes</p>
            </div>
            <Link
              to="/recruiter/applications"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {recentApplications.length > 0 ? (
              recentApplications.map((app) => (
                <div
                  key={app._id}
                  className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {app.applicant?.name || 'Applicant'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      Applied for <span className="font-semibold text-slate-700">{app.job?.title}</span>
                    </p>
                    <div className="pt-1">
                      <StatusBadge status={app.status} size="sm" />
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedAppForStatus(app)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all shrink-0"
                  >
                    Update Status
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No candidate applications received yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Job Postings */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">My Job Postings</h2>
              <p className="text-xs text-slate-500">Active and recent listings</p>
            </div>
            <Link
              to="/recruiter/jobs"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Manage ({stats?.totalJobs || 0}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <div
                  key={job._id}
                  className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <Link
                      to={`/jobs/${job._id}`}
                      className="text-xs font-bold text-slate-900 hover:text-indigo-600 truncate block"
                    >
                      {job.title}
                    </Link>
                    <p className="text-[11px] text-slate-500">
                      {job.jobType} • {job.location}
                    </p>
                    <div className="pt-1">
                      <StatusBadge status={job.status} size="sm" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/recruiter/applications?jobId=${job._id}`}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-all"
                    >
                      Candidates
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                You haven't posted any jobs yet. Click "Post a Job" to get started.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {selectedAppForStatus && (
        <StatusUpdateModal
          isOpen={!!selectedAppForStatus}
          onClose={() => setSelectedAppForStatus(null)}
          application={selectedAppForStatus}
          onStatusUpdated={() => {
            fetchDashboard();
            setSelectedAppForStatus(null);
          }}
        />
      )}
    </div>
  );
};

export default RecruiterDashboard;
