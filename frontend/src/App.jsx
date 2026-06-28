import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Student pages
import StudentDashboardOverview from './pages/dashboards/student/StudentDashboardOverview';
import StudentCourses from './pages/dashboards/student/StudentCourses';
import StudentResources from './pages/dashboards/student/StudentResources';
import StudentAITutor from './pages/dashboards/student/StudentAITutor';
import StudentMessages from './pages/dashboards/student/StudentMessages';
import StudentSettings from './pages/dashboards/student/StudentSettings';

// Mentor pages
import MentorDashboardOverview from './pages/dashboards/mentor/MentorDashboardOverview';
import MentorCourses from './pages/dashboards/mentor/MentorCourses';
import MentorResources from './pages/dashboards/mentor/MentorResources';
import MentorAITutor from './pages/dashboards/mentor/MentorAITutor';
import MentorMessages from './pages/dashboards/mentor/MentorMessages';
import MentorSettings from './pages/dashboards/mentor/MentorSettings';

// Admin pages
import AdminDashboardOverview from './pages/dashboards/admin/AdminDashboardOverview';
import AdminCourses from './pages/dashboards/admin/AdminCourses';
import AdminResources from './pages/dashboards/admin/AdminResources';
import AdminAITutor from './pages/dashboards/admin/AdminAITutor';
import AdminMessages from './pages/dashboards/admin/AdminMessages';
import AdminSettings from './pages/dashboards/admin/AdminSettings';
import AdminUsers from './pages/dashboards/admin/AdminUsers';

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Auth Routes group */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} /> 
                    <Route path="/forgot-password" element={<ForgotPassword />} /> 

                    {/* Student Protected Routes */}
                    <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboardOverview /></ProtectedRoute>} />
                    <Route path="/student/courses" element={<ProtectedRoute allowedRoles={['student']}><StudentCourses /></ProtectedRoute>} />
                    <Route path="/student/resources" element={<ProtectedRoute allowedRoles={['student']}><StudentResources /></ProtectedRoute>} />
                    <Route path="/student/ai-tutor" element={<ProtectedRoute allowedRoles={['student']}><StudentAITutor /></ProtectedRoute>} />
                    <Route path="/student/messages" element={<ProtectedRoute allowedRoles={['student']}><StudentMessages /></ProtectedRoute>} />
                    <Route path="/student/settings" element={<ProtectedRoute allowedRoles={['student']}><StudentSettings /></ProtectedRoute>} />

                    {/* Mentor Protected Routes */}
                    <Route path="/mentor/dashboard" element={<ProtectedRoute allowedRoles={['mentor']}><MentorDashboardOverview /></ProtectedRoute>} />
                    <Route path="/mentor/courses" element={<ProtectedRoute allowedRoles={['mentor']}><MentorCourses /></ProtectedRoute>} />
                    <Route path="/mentor/resources" element={<ProtectedRoute allowedRoles={['mentor']}><MentorResources /></ProtectedRoute>} />
                    <Route path="/mentor/ai-tutor" element={<ProtectedRoute allowedRoles={['mentor']}><MentorAITutor /></ProtectedRoute>} />
                    <Route path="/mentor/messages" element={<ProtectedRoute allowedRoles={['mentor']}><MentorMessages /></ProtectedRoute>} />
                    <Route path="/mentor/settings" element={<ProtectedRoute allowedRoles={['mentor']}><MentorSettings /></ProtectedRoute>} />

                    {/* Admin Protected Routes */}
                    <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardOverview /></ProtectedRoute>} />
                    <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={['admin']}><AdminCourses /></ProtectedRoute>} />
                    <Route path="/admin/resources" element={<ProtectedRoute allowedRoles={['admin']}><AdminResources /></ProtectedRoute>} />
                    <Route path="/admin/ai-tutor" element={<ProtectedRoute allowedRoles={['admin']}><AdminAITutor /></ProtectedRoute>} />
                    <Route path="/admin/messages" element={<ProtectedRoute allowedRoles={['admin']}><AdminMessages /></ProtectedRoute>} />
                    <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
                    <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />

                    {/* Redirects for legacy routes */}
                    <Route path="/student-dashboard" element={<Navigate to="/student/dashboard" replace />} />
                    <Route path="/mentor-dashboard" element={<Navigate to="/mentor/dashboard" replace />} />
                    <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />

                    {/* Default Fallback Redirect to login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}