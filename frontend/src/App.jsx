// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LocationsPage from './pages/LocationsPage';
import LocationFormPage from './pages/LocationFormPage';
import SubmissionsPage from './pages/SubmissionsPage';
import SubmissionDetailPage from './pages/SubmissionDetailPage';
import TrackerPage from './pages/TrackerPage';
import NotFoundPage from './pages/NotFoundPage';
import Loading from './components/common/Loading';

// Private route wrapper
const PrivateRoute = ({ element, requireAdmin = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return element;
};

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Private routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<PrivateRoute element={<DashboardPage />} />} />
        
        {/* Location routes */}
        <Route path="/locations" element={<PrivateRoute element={<LocationsPage />} />} />
        <Route path="/locations/new" element={<PrivateRoute element={<LocationFormPage />} requireAdmin={true} />} />
        
        {/* Submissions routes */}
        <Route path="/submissions" element={<PrivateRoute element={<SubmissionsPage />} />} />
        <Route path="/submissions/:id" element={<PrivateRoute element={<SubmissionDetailPage />} />} />
        
        {/* Tracker route for creating submissions */}
        <Route path="/tracker/:id" element={<PrivateRoute element={<TrackerPage />} />} />

        {/* 404 route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;