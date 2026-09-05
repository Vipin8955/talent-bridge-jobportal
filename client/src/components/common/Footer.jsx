import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Shield, Award, Users } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Job<span className="text-indigo-400">Portal</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              The premier career marketplace connecting ambitious engineers, designers, and leaders with top tech companies.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-indigo-400" /> Secure JWT
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-indigo-400" /> RBAC Enabled
              </span>
            </div>
          </div>

          {/* For Candidates */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              For Candidates
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/jobs" className="hover:text-white transition-colors">
                  Explore Openings
                </Link>
              </li>
              <li>
                <Link to="/jobs?isRemote=true" className="hover:text-white transition-colors">
                  Remote Jobs
                </Link>
              </li>
              <li>
                <Link to="/register?role=applicant" className="hover:text-white transition-colors">
                  Candidate Registration
                </Link>
              </li>
              <li>
                <Link to="/applicant/applications" className="hover:text-white transition-colors">
                  Track Applications
                </Link>
              </li>
            </ul>
          </div>

          {/* For Recruiters */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              For Employers
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/register?role=recruiter" className="hover:text-white transition-colors">
                  Recruiter Sign Up
                </Link>
              </li>
              <li>
                <Link to="/recruiter/jobs/create" className="hover:text-white transition-colors">
                  Post a Position
                </Link>
              </li>
              <li>
                <Link to="/recruiter/applications" className="hover:text-white transition-colors">
                  Candidate Pipeline
                </Link>
              </li>
              <li>
                <Link to="/recruiter/dashboard" className="hover:text-white transition-colors">
                  Hiring Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture / Portfolio Notes */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Technology Stack
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p>Frontend: React 18, Vite, Tailwind CSS</p>
              <p>Backend: Node.js, Express, REST APIs</p>
              <p>Database: MongoDB, Mongoose ODM</p>
              <p>Auth: JWT Bearer & bcryptjs</p>
              <p>Storage: Multer File Handlers</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} JobPortal Full-Stack Application. All rights reserved.</p>
          <p className="text-slate-500">
            Enterprise Recruitment and Career Platform.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
