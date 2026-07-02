import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import Navbar from './components/Navbar';
import NetworkBanner from './components/NetworkBanner';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManageAccess from './pages/ManageAccess';
import InputDiagnosis from './pages/InputDiagnosis';
import MedicalHistory from './pages/MedicalHistory';

function App() {
  return (
    <Web3Provider>
      <Router>
        <Navbar />
        <NetworkBanner />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard/patient" element={
            <ProtectedRoute requiredRole="patient"><PatientDashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/doctor" element={
            <ProtectedRoute requiredRole="doctor"><DoctorDashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/admin" element={
            <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/manage-access" element={
            <ProtectedRoute requiredRole="patient"><ManageAccess /></ProtectedRoute>
          } />
          <Route path="/input-diagnosis" element={
            <ProtectedRoute requiredRole="doctor"><InputDiagnosis /></ProtectedRoute>
          } />
          <Route path="/medical-history" element={
            <ProtectedRoute><MedicalHistory /></ProtectedRoute>
          } />
        </Routes>
      </Router>
    </Web3Provider>
  );
}

export default App;