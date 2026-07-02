import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isLoggedIn, role, isRegistered, statusChecked } = useWeb3();

  if (!statusChecked) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <p className="text-mist text-sm">Memuat...</p>
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (!isRegistered) return <Navigate to="/register" replace />;

  if (requiredRole && role !== requiredRole) {
    if (role === 'patient') return <Navigate to="/dashboard/patient" replace />;
    if (role === 'doctor') return <Navigate to="/dashboard/doctor" replace />;
    if (role === 'admin') return <Navigate to="/dashboard/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;