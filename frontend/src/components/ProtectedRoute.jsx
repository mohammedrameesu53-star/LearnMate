import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  // Retrieve token and user details stored during login execution
  const token = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('userRole'); 

  if (!token) {
    // Drop user back to login if unauthorized
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Fallback route if a student tries to navigate to an admin route
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
