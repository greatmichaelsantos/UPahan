import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import SplashPage from './pages/splash/SplashPage';
import RoleSelectPage from './pages/auth/RoleSelectPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUnitList from './pages/admin/AdminUnitList';
import AdminRegisterUnit from './pages/admin/AdminRegisterUnit';
import AdminMaintenanceList from './pages/admin/AdminMaintenanceList';
import AdminMaintenanceDetail from './pages/admin/AdminMaintenanceDetail';
import AdminUnitDetail from './pages/admin/AdminUnitDetail';

import TenantDashboard from './pages/tenant/TenantDashboard';
import TenantMaintenanceRequest from './pages/tenant/TenantMaintenanceRequest';
import TenantMaintenanceHistory from './pages/tenant/TenantMaintenanceHistory';
import TenantPaymentHistory from './pages/tenant/TenantPaymentHistory';

import GuestUnits from './pages/guest/GuestUnits';
import GuestUnitDetail from './pages/guest/GuestUnitDetail';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/select-role" replace />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/tenant'} replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/select-role" element={<RoleSelectPage />} />
      <Route path="/login/:role" element={<LoginPage />} />
      <Route path="/register/:role" element={<RegisterPage />} />

      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/units" element={
        <ProtectedRoute requiredRole="admin"><AdminUnitList /></ProtectedRoute>
      } />
      <Route path="/admin/units/new" element={
        <ProtectedRoute requiredRole="admin"><AdminRegisterUnit /></ProtectedRoute>
      } />
      <Route path="/admin/units/:id" element={
        <ProtectedRoute requiredRole="admin"><AdminUnitDetail /></ProtectedRoute>
      } />
      <Route path="/admin/maintenance" element={
        <ProtectedRoute requiredRole="admin"><AdminMaintenanceList /></ProtectedRoute>
      } />
      <Route path="/admin/maintenance/:id" element={
        <ProtectedRoute requiredRole="admin"><AdminMaintenanceDetail /></ProtectedRoute>
      } />

      <Route path="/tenant" element={
        <ProtectedRoute requiredRole="tenant"><TenantDashboard /></ProtectedRoute>
      } />
      <Route path="/tenant/maintenance/new" element={
        <ProtectedRoute requiredRole="tenant"><TenantMaintenanceRequest /></ProtectedRoute>
      } />
      <Route path="/tenant/maintenance" element={
        <ProtectedRoute requiredRole="tenant"><TenantMaintenanceHistory /></ProtectedRoute>
      } />
      <Route path="/tenant/payments" element={
        <ProtectedRoute requiredRole="tenant"><TenantPaymentHistory /></ProtectedRoute>
      } />

      <Route path="/units" element={<GuestUnits />} />
      <Route path="/units/:id" element={<GuestUnitDetail />} />

      <Route path="*" element={
        user
          ? <Navigate to={user.role === 'admin' ? '/admin' : '/tenant'} replace />
          : <Navigate to="/" replace />
      } />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="max-w-md mx-auto min-h-screen bg-white relative overflow-x-hidden">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
