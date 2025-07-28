import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { useAuthStore } from './stores/authStore';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotFoundPage, ErrorPage, OfflinePage } from './pages/ErrorPages';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

// Import all dashboard components
import { DoctorHome } from './components/dashboard/doctor/DoctorHome';
import { DoctorPatients } from './components/dashboard/doctor/DoctorPatients';
import { DoctorReminders } from './components/dashboard/doctor/DoctorReminders';
import { DoctorSettings } from './components/dashboard/doctor/DoctorSettings';
import { AdminHome } from './components/dashboard/admin/AdminHome';
import { AdminManagement } from './components/dashboard/admin/AdminManagement';
import { DoctorManagement } from './components/dashboard/admin/DoctorManagement';
import { FeedbackManagement } from './components/dashboard/admin/FeedbackManagement';
import { LogsManagement } from './components/dashboard/admin/LogsManagement';
import { AdminSettings } from './components/dashboard/admin/AdminSettings';

const ProtectedRoute = ({ children, requiredRole }) => {
  const isLoading = useAuthStore(state => state.isLoading);
  const isAuthLoading = useAuthStore(state => state.isAuthLoading);
  const user = useAuthStore(state => state.user);
  const { t } = useLanguage();

  // Show loading spinner while checking authentication
  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">{t('common.loading')}</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/doctor'} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, isAuthLoading, initializeAuth } = useAuthStore();
  const { t } = useLanguage();

  useEffect(() => {
    // Initialize authentication on app start
    initializeAuth();
  }, [initializeAuth]);

  // Show loading spinner while checking initial authentication
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === 'admin' ? '/admin' : '/doctor'} replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/doctor"
        element={
          <ProtectedRoute requiredRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<DoctorHome />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="reminders" element={<DoctorReminders />} />
        <Route path="settings" element={<DoctorSettings />} />
      </Route>
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<AdminHome />} />
        <Route path="admin-management" element={<AdminManagement />} />
        <Route path="doctor-management" element={<DoctorManagement />} />
        <Route path="feedback" element={<FeedbackManagement />} />
        <Route path="logs" element={<LogsManagement />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      <Route path="/error" element={<ErrorPage />} />
      <Route path="/offline" element={<OfflinePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <AppRoutes />
            </div>
          </Router>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
