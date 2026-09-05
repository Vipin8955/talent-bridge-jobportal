import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage message="Authorizing access..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    // Redirect to the user's appropriate home dashboard
    const fallbackPath =
      user?.role === 'recruiter' ? '/recruiter/dashboard' : '/applicant/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default RoleRoute;
