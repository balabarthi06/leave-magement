import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LeaveProvider } from './context/LeaveContext';
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Employee Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { ApplyLeavePage } from './pages/employee/ApplyLeavePage';
import { MyLeavesPage } from './pages/employee/MyLeavesPage';
import { EmployeeProfilePage } from './pages/employee/EmployeeProfilePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLeavesPage } from './pages/admin/AdminLeavesPage';
import { AdminEmployeesPage } from './pages/admin/AdminEmployeesPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';

// Common Pages
import { NotFoundPage } from './pages/common/NotFoundPage';
import { UnauthorizedPage } from './pages/common/UnauthorizedPage';

// Root Redirect Component based on Auth
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'Admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/employee/dashboard" replace />;
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <LeaveProvider>
              <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Default Root Redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Employee Routes */}
            <Route
              path="/employee/dashboard"
              element={
                <ProtectedRoute allowedRole="Employee">
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/apply-leave"
              element={
                <ProtectedRoute allowedRole="Employee">
                  <ApplyLeavePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/my-leaves"
              element={
                <ProtectedRoute allowedRole="Employee">
                  <MyLeavesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/profile"
              element={
                <ProtectedRoute allowedRole="Employee">
                  <EmployeeProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRole="Admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/leaves"
              element={
                <ProtectedRoute allowedRole="Admin">
                  <AdminLeavesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/employees"
              element={
                <ProtectedRoute allowedRole="Admin">
                  <AdminEmployeesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute allowedRole="Admin">
                  <AdminProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Error Pages */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </LeaveProvider>
      </NotificationProvider>
    </AuthProvider>
  </ThemeProvider>
</BrowserRouter>
);
}
