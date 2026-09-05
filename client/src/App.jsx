import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import JobsPage from './pages/public/JobsPage';
import JobDetailsPage from './pages/public/JobDetailsPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Applicant Pages
import ApplicantDashboard from './pages/applicant/ApplicantDashboard';
import MyApplicationsPage from './pages/applicant/MyApplicationsPage';
import ApplicantProfilePage from './pages/applicant/ApplicantProfilePage';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import MyJobsPage from './pages/recruiter/MyJobsPage';
import CreateJobPage from './pages/recruiter/CreateJobPage';
import EditJobPage from './pages/recruiter/EditJobPage';
import JobApplicationsPage from './pages/recruiter/JobApplicationsPage';
import RecruiterProfilePage from './pages/recruiter/RecruiterProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Applicant Protected Routes */}
              <Route
                path="/applicant/dashboard"
                element={
                  <RoleRoute allowedRoles={['applicant']}>
                    <ApplicantDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/applicant/applications"
                element={
                  <RoleRoute allowedRoles={['applicant']}>
                    <MyApplicationsPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/applicant/profile"
                element={
                  <RoleRoute allowedRoles={['applicant']}>
                    <ApplicantProfilePage />
                  </RoleRoute>
                }
              />

              {/* Recruiter Protected Routes */}
              <Route
                path="/recruiter/dashboard"
                element={
                  <RoleRoute allowedRoles={['recruiter']}>
                    <RecruiterDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/recruiter/jobs"
                element={
                  <RoleRoute allowedRoles={['recruiter']}>
                    <MyJobsPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/recruiter/jobs/create"
                element={
                  <RoleRoute allowedRoles={['recruiter']}>
                    <CreateJobPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/recruiter/jobs/edit/:id"
                element={
                  <RoleRoute allowedRoles={['recruiter']}>
                    <EditJobPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/recruiter/applications"
                element={
                  <RoleRoute allowedRoles={['recruiter']}>
                    <JobApplicationsPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/recruiter/profile"
                element={
                  <RoleRoute allowedRoles={['recruiter']}>
                    <RecruiterProfilePage />
                  </RoleRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
