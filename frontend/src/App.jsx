// Path: frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LocationsPage from './pages/LocationsPage';
import LocationDetailPage from './pages/LocationDetailPage';
import SubmissionsPage from './pages/SubmissionsPage';
import SubmissionDetailPage from './pages/SubmissionDetailPage';
import UsersPage from './pages/UsersPage';
import TrackerPage from './pages/TrackerPage';
import NotFoundPage from './pages/NotFoundPage';
import Loading from './components/common/Loading';

// Private route wrapper
const PrivateRoute = ({ element, requireAdmin = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  // Not authenticated -> redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Requires admin but user is not admin -> redirect to dashboard
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  // All checks passed -> render the requested page
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
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route
          path="/dashboard"
          element={<PrivateRoute element={<DashboardPage />} />}
        />
        <Route
          path="/locations"
          element={<PrivateRoute element={<LocationsPage />} requireAdmin={true} />}
        />
        <Route
          path="/locations/:id"
          element={<PrivateRoute element={<LocationDetailPage />} requireAdmin={true} />}
        />
        <Route
          path="/submissions"
          element={<PrivateRoute element={<SubmissionsPage />} />}
        />
        <Route
          path="/submissions/:id"
          element={<PrivateRoute element={<SubmissionDetailPage />} />}
        />
        <Route
          path="/users"
          element={<PrivateRoute element={<UsersPage />} requireAdmin={true} />}
        />
        <Route
          path="/tracker/:id"
          element={<PrivateRoute element={<TrackerPage />} />}
        />

        {/* 404 route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;