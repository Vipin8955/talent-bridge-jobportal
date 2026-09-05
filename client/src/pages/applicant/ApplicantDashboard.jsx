import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  Award,
  XCircle,
  Briefcase,
  ArrowRight,
  TrendingUp,
  Building,
  User,
} from 'lucide-react';
import { statsApi } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export const ApplicantDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await statsApi.getApplicantStats();
        if (res.data.success) {
          setStats(res.data.stats);
          setRecentApplications(res.data.recentApplications);
        }
      } catch (err) {
        console.error('Error loading applicant dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage message="Loading your career dashboard..." />;
  }

  const statCards = [
    {
      title: 'Total Applications',
      value: stats?.total || 0,
      icon: FileText,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Under Review',
      value: stats?.reviewing || 0,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      title: 'Shortlisted',
      value: stats?.shortlisted || 0,
      icon: Award,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
    {
      title: 'Offers / Hired',
      value: stats?.hired || 0,
      icon: CheckCircle,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            Applicant Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Track your submitted job applications, interview progress, and profile status in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/applicant/profile"
            className="px-4 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-xs font-semibold transition-all flex items-center gap-2"
          >
            <User className="w-4 h-4" /> Edit Profile
          </Link>
          <Link
            to="/jobs"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4" /> Browse Jobs
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

      {/* Recent Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Your latest submitted job applications and current interview statuses
            </p>
          </div>
          <Link
            to="/applicant/applications"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View All ({stats?.total || 0}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Job Title & Role</th>
                  <th className="py-3.5 px-6">Company</th>
                  <th className="py-3.5 px-6">Date Applied</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {recentApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <Link
                        to={`/jobs/${app.job?._id}`}
                        className="hover:text-indigo-600 transition-colors"
                      >
                        {app.job?.title || 'Position'}
                      </Link>
                      <div className="text-[11px] font-normal text-slate-400 mt-0.5">
                        {app.job?.jobType} • {app.job?.location}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-700">
                      {app.job?.company || 'Company'}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to="/applicant/applications"
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              title="No applications submitted yet"
              description="Start exploring open tech roles and submit your resume to top hiring companies."
              actionText="Search Available Jobs"
              actionLink="/jobs"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantDashboard;
