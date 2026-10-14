import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/AppLayout';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CourseCatalogPage } from './pages/CourseCatalogPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { MyLearningPage } from './pages/MyLearningPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { AssessmentResultPage } from './pages/AssessmentResultPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { CertificateViewPage } from './pages/CertificateViewPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLayout } from './components/AdminLayout';
import { VerifyPage } from './pages/VerifyPage';

const RedirectToAssessment = () => {
  const { courseId } = useParams();
  return <Navigate to={`/assessments/${courseId}`} replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          
          {/* Public Certificate Verification (No Login Needed) */}
          <Route path="/verify/:certificateId" element={<VerifyPage />} />

          {/* Dedicated Course Assessment views (Bypassing learning/video flow) */}
          <Route path="/learn/:courseId" element={<RedirectToAssessment />} />
          <Route path="/assessments/:courseId" element={<AssessmentPage />} />
          <Route path="/assessment-result" element={<AssessmentResultPage />} />
          <Route path="/certificates/:certificateId" element={<CertificateViewPage />} />

          {/* Protected Student Application Layout with Student Sidebar */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<CourseCatalogPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/my-learning" element={<MyLearningPage />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Protected Dedicated Admin Application Layout with Admin Sidebar */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
