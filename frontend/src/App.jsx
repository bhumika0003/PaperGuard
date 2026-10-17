import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';

import { TeacherDashboard } from './pages/Dashboards/TeacherDashboard';
import { HodDashboard } from './pages/Dashboards/HodDashboard';
import { PrincipalDashboard } from './pages/Dashboards/PrincipalDashboard';
import { AdminDashboard } from './pages/Dashboards/AdminDashboard';
import { ExamControllerDashboard } from './pages/Dashboards/ExamControllerDashboard';
import { AuditorDashboard } from './pages/Dashboards/AuditorDashboard';

import { QuestionPapersPage } from './pages/QuestionPapersPage';
import { DownloadRequestsPage } from './pages/DownloadRequestsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { UserProfileAuditPage } from './pages/UserProfileAuditPage';
import { SecurityAlertsPage } from './pages/SecurityAlertsPage';
import { SecurityInfoPage } from './pages/SecurityInfoPage';
import { LiveChatPage } from './pages/LiveChatPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminRoleActivitiesPage } from './pages/AdminRoleActivitiesPage';

// Role Dashboard Dispatcher Component
const RoleDashboardDispatcher = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'Teacher':
      return <TeacherDashboard />;
    case 'HOD':
      return <HodDashboard />;
    case 'Principal':
      return <PrincipalDashboard />;
    case 'Admin':
      return <AdminDashboard />;
    case 'Exam Controller':
      return <ExamControllerDashboard />;
    case 'Auditor':
      return <AuditorDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/security-info" element={<SecurityInfoPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleDashboardDispatcher />
                </ProtectedRoute>
              }
            />
            <Route
              path="/papers"
              element={
                <ProtectedRoute>
                  <QuestionPapersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests"
              element={
                <ProtectedRoute>
                  <DownloadRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedRoute allowedRoles={['HOD', 'Principal', 'Admin', 'Exam Controller', 'Auditor']}>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit/user/:userId"
              element={
                <ProtectedRoute allowedRoles={['Principal', 'Admin', 'Auditor']}>
                  <UserProfileAuditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute allowedRoles={['Principal', 'Admin', 'Auditor']}>
                  <SecurityAlertsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <LiveChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/activities"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminRoleActivitiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activities"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminRoleActivitiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher-exam-activity"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminRoleActivitiesPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
