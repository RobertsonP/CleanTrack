// frontend/src/pages/SubmissionsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Search,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Loading from '../components/common/Loading';
import Error from '../components/common/Error';
import submissionService from '../services/submissionService';
import locationService from '../services/locationService';
import { useLanguage } from '../contexts/LanguageContext';

const SubmissionsPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [submissions, setSubmissions] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    fetchData();
    fetchSubmissions();
  }, []);
  
  useEffect(() => {
    fetchSubmissions();
  }, [dateFilter, locationFilter, currentPage]);
  
  const fetchData = async () => {
    try {
      setLocationsLoading(true);
      // Fetch locations for filter and create options
      const locationsResponse = await locationService.getAllLocations();
      setLocations(locationsResponse.results || []);
      setLocationsLoading(false);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocationsLoading(false);
    }
  };
  
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        page: currentPage
      };
      
      if (dateFilter) {
        filters.date = dateFilter;
      }
      
      if (locationFilter) {
        filters.location = locationFilter;
      }
      
      const response = await submissionService.getAllSubmissions(filters);
      
      setSubmissions(response.results || []);
      setTotalPages(Math.ceil((response.count || 0) / 10));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError(t('errors.somethingWentWrong', 'Something went wrong. Please try again.'));
      setLoading(false);
    }
  };
  
  const handleDateChange = (e) => {
    setDateFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  const handleLocationChange = (e) => {
    setLocationFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  const clearFilters = () => {
    setDateFilter('');
    setLocationFilter('');
    setCurrentPage(1);
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  // SIMPLE DIRECT FUNCTION FOR ADDING SUBMISSIONS
  const handleAddSubmission = () => {
    if (locations.length > 0) {
      // If locations exist, navigate to the first one's tracker
      navigate(`/tracker/${locations[0].id}`);
    } else {
      // If no locations, navigate to create location page
      navigate('/locations/new');
    }
  };

  if (loading && locationsLoading) return <DashboardLayout><Loading /></DashboardLayout>;
  if (error) return <DashboardLayout><Error message={error} /></DashboardLayout>;

  return (
    <DashboardLayout>
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('submissions.title', 'Submissions')}
        </h1>
        <button
          onClick={handleAddSubmission}
          className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Submission
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('submissions.date', 'Date')}
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={dateFilter}
                onChange={handleDateChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          {locations.length > 0 && (
            <div className="w-full sm:w-auto">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('submissions.location', 'Location')}
              </label>
              <select
                value={locationFilter}
                onChange={handleLocationChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t('common.all', 'All')}</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {t('common.clearFilters', 'Clear Filters')}
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('submissions.location', 'Location')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('submissions.staff', 'Staff')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('submissions.date', 'Date')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('submissions.completion', 'Completion')}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('common.actions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {submissions.length > 0 ? (
                submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {submission.location_name || 'Unknown Location'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {submission.staff_username || 'Unknown Staff'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {submission.date ? new Date(submission.date).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2 max-w-24">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${submission.completion_rate || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {submission.completion_rate || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/submissions/${submission.id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {t('common.view', 'View')}
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangle className="h-12 w-12 text-yellow-500 mb-3" />
                      <p>
                        {dateFilter || locationFilter
                          ? t('submissions.noSubmissionsFiltered', 'No submissions found for the selected filters')
                          : t('submissions.noSubmissions', 'No submissions found')}
                      </p>
                      
                      <div className="mt-4">
                        <button
                          onClick={handleAddSubmission}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Add Submission
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${
                  currentPage === 1
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-50'
                }`}
              >
                {t('common.previous', 'Previous')}
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${
                  currentPage === totalPages
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-50'}`}
              >
                {t('common.next', 'Next')}
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t('common.pagination', {
                    from: (currentPage - 1) * 10 + 1,
                    to: Math.min(currentPage * 10, submissions.length),
                    total: submissions.length
                  })}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 ${
                      currentPage === 1
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="sr-only">{t('common.previous', 'Previous')}</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {currentPage} / {totalPages}
                  </span>
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 ${
                      currentPage === totalPages
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="sr-only">{t('common.next', 'Next')}</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubmissionsPage;