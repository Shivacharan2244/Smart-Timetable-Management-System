import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import FacultyLayout from './layouts/FacultyLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import TimetablePage from './pages/admin/TimetablePage';
import LiveClassesPage from './pages/admin/LiveClassesPage';
import FreeFacultyPage from './pages/admin/FreeFacultyPage';
import MeetingsPage from './pages/admin/MeetingsPage';
import UploadTimetablePage from './pages/admin/UploadTimetablePage';
import UploadHistoryPage from './pages/admin/UploadHistoryPage';
import ReportsPage from './pages/admin/ReportsPage';
import SystemAnalysisPage from './pages/admin/SystemAnalysisPage';
import EntityManagerPage from './pages/admin/EntityManagerPage';

// Shared Pages
import NotificationsPage from './pages/NotificationsPage';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyTimetablePage from './pages/faculty/FacultyTimetablePage';
import FacultyLiveClassesPage from './pages/faculty/FacultyLiveClassesPage';
import FacultyMeetingsPage from './pages/faculty/FacultyMeetingsPage';
import FacultyProfilePage from './pages/faculty/FacultyProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="timetable" element={<TimetablePage />} />
            <Route path="live-classes" element={<LiveClassesPage />} />
            <Route path="free-faculty" element={<FreeFacultyPage />} />
            <Route path="meetings" element={<MeetingsPage />} />
            <Route path="upload" element={<UploadTimetablePage />} />
            <Route path="upload-history" element={<UploadHistoryPage />} />
            <Route path="faculty" element={<EntityManagerPage type="faculty" />} />
            <Route path="subjects" element={<EntityManagerPage type="subjects" />} />
            <Route path="rooms" element={<EntityManagerPage type="rooms" />} />
            <Route path="sections" element={<EntityManagerPage type="sections" />} />
            <Route path="time-slots" element={<EntityManagerPage type="time-slots" />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="analysis" element={<SystemAnalysisPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<EntityManagerPage type="settings" />} />
          </Route>

          {/* Faculty Protected Routes */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute requiredRole="FACULTY">
                <FacultyLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/faculty/dashboard" replace />} />
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="timetable" element={<FacultyTimetablePage />} />
            <Route path="live-classes" element={<FacultyLiveClassesPage />} />
            <Route path="meetings" element={<FacultyMeetingsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<FacultyProfilePage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
