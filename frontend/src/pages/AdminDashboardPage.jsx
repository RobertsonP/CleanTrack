// frontend/src/pages/AdminDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Calendar, 
  CheckCircle, 
  ClipboardList, 
  MapPin, 
  Users,
  ArrowRight,
  Activity,
  AlertTriangle,
  Settings,
  Trash,
  Edit
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Loading from '../components/common/Loading';
import Error from '../components/common/Error';
import submissionService from '../services/submissionService';
import locationService from '../services/locationService';
import authService from '../services/authService';
import { useLanguage } from '../contexts/LanguageContext';

const AdminDashboardPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    submissions: 0,
    averageCompletion: 0,
    locations: 0,
    users: 0
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [topLocations, setTopLocations] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch stats
        const statsData = await submissionService.getSubmissionStats();
        const locationsData = await locationService.getAllLocations();
        const usersData = await authService.getAllUsers();
        
        // Fetch recent submissions
        const submissionsData = await submissionService.getAllSubmissions({
          page: 1,
          page_size: 5,
          ordering: '-created_at'
        });
        
        // Calculate top locations based on submissions
        const locationsWithSubmissions = statsData.submissions_by_location || [];
        
        // Get active users
        const activeUsersData = usersData.filter(user => user.is_active).slice(0, 5);
        
        setStats({
          submissions: statsData.submission_count || 0,
          averageCompletion: statsData.avg_completion_rate || 0,
          locations: locationsData.count || 0,
          users: usersData.length || 0
        });
        
        setRecentSubmissions(submissionsData.results || []);
        setTopLocations(locationsWithSubmissions);
        setActiveUsers(activeUsersData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(t('errors.somethingWentWrong'));
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;
  if (error) return <DashboardLayout><Error message={error} /></DashboardLayout>;

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('dashboard.welcome', { name: user?.username || 'Admin' })}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-300">
          {t('dashboard.adminWelcome', 'Here\'s what\'s happening with your cleaning operations today.')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Submissions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('dashboard.stats.total')}
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.submissions}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <ClipboardList className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Average Completion Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('dashboard.stats.completionRate')}
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {Math.round(stats.averageCompletion)}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
              <Activity className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Locations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('dashboard.stats.locations')}
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.locations}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
              <MapPin className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('dashboard.stats.activeUsers')}
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.users}
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Top Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('dashboard.recentActivity')}
            </h2>
            <Link to="/submissions" className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
              {t('common.viewAll')} <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {recentSubmissions.length > 0 ? (
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <Link 
                  key={submission.id} 
                  to={`/submissions/${submission.id}`}
                  className="flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-4">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {submission.location_name || 'Unknown Location'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {submission.staff_username || 'Unknown User'} - {submission.completion_rate || 0}%
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {submission.date ? new Date(submission.date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      submission.completion_rate >= 80 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : submission.completion_rate >= 50
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {submission.completion_rate || 0}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mb-3" />
              <p>{t('dashboard.noRecentActivity')}</p>
            </div>
          )}
        </div>

        {/* Top Locations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('dashboard.topLocations', 'Top Locations')}
            </h2>
            <Link to="/locations" className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
              {t('common.viewAll')} <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {topLocations.length > 0 ? (
            <div className="space-y-4">
              {topLocations.map((location, index) => (
                <div key={index} className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mr-3">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {location.location__name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {location.count} submissions
                    </p>
                  </div>
                  <div className="ml-2">
                    <Link 
                      to={`/locations/${location.location__id}`}
                      className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    >
                      <Settings className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mb-3" />
              <p>{t('dashboard.noLocations')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Active Users */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('dashboard.activeStaff', 'Active Staff')}
          </h2>
          <Link to="/users" className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
            {t('common.viewAll')} <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {activeUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('users.user')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('users.role')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('users.email')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {activeUsers.map((activeUser) => (
                  <tr key={activeUser.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                          {activeUser.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{activeUser.username}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activeUser.first_name} {activeUser.last_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activeUser.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}>
                        {activeUser.role === 'admin' ? t('users.admin') : t('users.staff')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activeUser.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/users/edit/${activeUser.id}`} 
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button 
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        onClick={() => {/* Handle delete */}}
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-3" />
            <p>{t('users.noUsers')}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;