import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');

    // Not logged in? Boot back to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Role unauthorized? Boot to login or error
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

