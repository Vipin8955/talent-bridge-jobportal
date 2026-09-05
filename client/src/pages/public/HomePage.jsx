import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  TrendingUp,
  Users,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { jobsApi } from '../../api/axios';
import JobCard from '../../components/jobs/JobCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const HomePage = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await jobsApi.getJobs({ limit: 6, sort: '-createdAt' });
        if (res.data.success) {
          setFeaturedJobs(res.data.jobs);
        }
      } catch (err) {
        console.error('Error fetching featured jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('keyword', keyword.trim());
    if (location.trim()) params.append('location', location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  const categories = [
    { title: 'Software Engineering', count: '120+ Openings', icon: Zap, query: 'Software' },
    { title: 'Frontend & React', count: '85+ Openings', icon: Briefcase, query: 'React' },
    { title: 'Cloud & DevOps', count: '45+ Openings', icon: TrendingUp, query: 'DevOps' },
    { title: 'UI/UX Design', count: '60+ Openings', icon: Users, query: 'Design' },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100/80 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            Verified Tech Careers & Talent
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            Find Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Dream Career</span> With Confidence
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect directly with verified tech employers, apply with one-click resume matching, and manage your entire application pipeline in real-time.
          </p>

          {/* Quick Search Form */}
          <form
            onSubmit={handleSearch}
            className="max-w-3xl mx-auto bg-white p-3 rounded-2xl shadow-xl shadow-indigo-100/50 border border-slate-200/80 flex flex-col md:flex-row gap-2"
          >
            <div className="flex-1 relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Job title, skills, or company..."
                className="w-full pl-11 pr-4 py-3 text-sm focus:outline-none rounded-xl text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="h-px md:h-auto md:w-px bg-slate-200" />

            <div className="flex-1 relative flex items-center">
              <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (e.g. San Francisco, Remote)"
                className="w-full pl-11 pr-4 py-3 text-sm focus:outline-none rounded-xl text-slate-800 placeholder-slate-400"
              />
            </div>

            <button
              type="submit"
              className="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              Search Jobs
            </button>
          </form>

          {/* Popular Tag Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Popular Searches:</span>
            {['React', 'Node.js', 'Remote', 'Full-time', 'DevOps', 'UI/UX'].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/jobs?keyword=${tag}`)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-2xs"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl bg-slate-900 text-white shadow-xl">
          <div className="text-center space-y-1">
            <p className="text-3xl lg:text-4xl font-extrabold text-indigo-400">1,500+</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Jobs</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl lg:text-4xl font-extrabold text-indigo-400">450+</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Verified Recruiters</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl lg:text-4xl font-extrabold text-indigo-400">25,000+</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Candidate Resumes</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl lg:text-4xl font-extrabold text-indigo-400">96%</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Hiring Match Rate</p>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Explore by Category</h2>
            <p className="text-sm text-slate-500 mt-1">Discover opportunities in high-growth domains</p>
          </div>
          <Link
            to="/jobs"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            All Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(`/jobs?keyword=${cat.query}`)}
                className="group p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-card cursor-pointer transition-all duration-200"
              >
                <div className="h-12 w-12 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center mb-4 transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-500">{cat.count}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Latest Job Openings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Latest Job Openings</h2>
            <p className="text-sm text-slate-500 mt-1">Recently posted engineering and design roles</p>
          </div>
          <Link
            to="/jobs"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View All Jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading latest opportunities..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* Role-Specific CTA Banner Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* For Candidates */}
          <div className="p-8 lg:p-10 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10 space-y-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                For Job Seekers
              </span>
              <h3 className="text-2xl lg:text-3xl font-bold">
                Accelerate Your Tech Career Today
              </h3>
              <p className="text-xs lg:text-sm text-slate-300 leading-relaxed max-w-md">
                Create a candidate profile, upload your resume once, and track your interview stages with complete transparency.
              </p>
              <div className="pt-2">
                <Link
                  to="/register?role=applicant"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Create Candidate Profile
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* For Employers */}
          <div className="p-8 lg:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-card space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              For Hiring Teams
            </span>
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-900">
              Hire Exceptional Talent Faster
            </h3>
            <p className="text-xs lg:text-sm text-slate-600 leading-relaxed max-w-md">
              Publish targeted job openings, review candidate resumes, and manage applicant status workflows in one seamless recruiter hub.
            </p>
            <div className="pt-2">
              <Link
                to="/register?role=recruiter"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md"
              >
                Register as Recruiter
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
