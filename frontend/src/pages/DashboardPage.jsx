// Path: frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Calendar, 
  CheckCircle, 
  ClipboardList, 
  Clock, 
  MapPin, 
  UserCheck, 
  ArrowRight,
  Activity,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Loading from '../components/common/Loading';
import Error from '../components/common/Error';
import submissionService from '../services/submissionService';
import locationService from '../services/locationService';
import { useLanguage } from '../contexts/LanguageContext';

const DashboardPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [todaySubmissions, setTodaySubmissions] = useState([]);
  const [stats, setStats] = useState({
    submission_count: 0,
    avg_completion_rate: 0,
    active_users: 0,
    submissions_by_location: []
  });
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Default empty values for stats
        let todayData = [];
        let statsData = {
          submission_count: 0,
          avg_completion_rate: 0,
          active_users: 0,
          submissions_by_location: []
        };
        let locationsData = [];
        
        // Use Promise.allSettled to handle errors for individual requests
        const [todaySubmissionsResult, statsResult, locationsResult] = await Promise.allSettled([
          submissionService.getTodaySubmissions(),
          submissionService.getSubmissionStats(),
          locationService.getAllLocations()
        ]);
        
        // Extract data from results, handling errors gracefully
        if (todaySubmissionsResult.status === 'fulfilled') {
          todayData = todaySubmissionsResult.value;
        }
        
        if (statsResult.status === 'fulfilled') {
          statsData = statsResult.value;
        }
        
        if (locationsResult.status === 'fulfilled') {
          locationsData = locationsResult.value.results || [];
        }
        
        setTodaySubmissions(todayData);
        setStats(statsData);
        setLocations(locationsData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(t('errors.somethingWentWrong', 'Something went wrong. Please try again.'));
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
          {t('dashboard.welcome', { name: user?.username || 'User' })}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-300">
          {new Date().toLocaleDateString(undefined, { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Submissions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
        <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('dashboard.stats.total', 'Total Submissions')}
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.submission_count || 0}
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
                {t('dashboard.stats.completionRate', 'Avg. Completion Rate')}
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.avg_completion_rate ? Math.round(stats.avg_completion_rate) : 0}%
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
                {t('dashboard.stats.locations', 'Locations')}
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {locations.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
              <MapPin className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('dashboard.stats.activeUsers', 'Active Users')}
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.active_users || 0}
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
              <UserCheck className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('dashboard.recentActivity', 'Recent Activity')}
            </h2>
            <Link to="/submissions" className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
              {t('common.viewAll', 'View All')} <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {todaySubmissions && todaySubmissions.length > 0 ? (
            <div className="space-y-4">
              {todaySubmissions.slice(0, 5).map((submission) => (
                <div key={submission.id} className="flex items-start p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
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
                 </div>
                 <div className="text-right text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                   <Clock className="inline-block h-3 w-3 mr-1" />
                   {submission.created_at ? new Date(submission.created_at).toLocaleTimeString([], { 
                     hour: '2-digit', 
                     minute: '2-digit' 
                   }) : 'N/A'}
                 </div>
               </div>
             ))}
           </div>
         ) : (
           <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
             <AlertTriangle className="h-12 w-12 text-yellow-500 mb-3" />
             <p>{t('dashboard.noRecentActivity', 'No recent activity to display')}</p>
           </div>
         )}
       </div>

       {/* Locations */}
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
         <div className="flex justify-between items-center mb-6">
           <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
             {t('dashboard.locations', 'Locations')}
           </h2>
           <div className="flex space-x-2">
             {user?.role === 'admin' && (
               <Link 
                 to="/locations/new" 
                 className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 rounded"
               >
                 <Plus className="h-5 w-5" />
               </Link>
             )}
             <Link 
               to="/locations" 
               className="text-sm text-blue-600 dark:text-blue-400 flex items-center"
             >
               {t('common.viewAll', 'View All')} <ArrowRight className="h-4 w-4 ml-1" />
             </Link>
           </div>
         </div>

         {locations.length > 0 ? (
           <div className="space-y-3">
             {locations.slice(0, 6).map((location) => (
               <Link 
                 key={location.id} 
                 to={`/tracker/${location.id}`}
                 className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
               >
                 <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mr-3">
                   <MapPin className="h-4 w-4" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                     {location.name}
                   </p>
                 </div>
                 <ArrowRight className="h-4 w-4 text-gray-400" />
               </Link>
             ))}
           </div>
         ) : (
           <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
             <AlertTriangle className="h-12 w-12 text-yellow-500 mb-3" />
             <p>{t('dashboard.noLocations', 'No locations available')}</p>
             {user?.role === 'admin' && (
               <Link 
                 to="/locations/new"
                 className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
               >
                 <Plus className="h-4 w-4 mr-2" />
                 {t('locations.addNew', 'Add Location')}
               </Link>
             )}
           </div>
         )}
       </div>
     </div>
   </DashboardLayout>
 );
};

export default DashboardPage;