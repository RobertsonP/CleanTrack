// frontend/src/pages/NoLocationsPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, AlertTriangle, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const NoLocationsPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-500">
            <AlertTriangle className="h-8 w-8" />
          </div>
        </div>
        
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t('submissions.noLocationsTitle', 'No Locations Available')}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {user?.role === 'admin' 
            ? t('submissions.noLocationsAdminMessage', 'You need to create at least one location before you can start submitting cleaning reports.')
            : t('submissions.noLocationsStaffMessage', 'There are no locations available for submissions. Please contact an administrator to set up locations.')}
        </p>
        
        {user?.role === 'admin' ? (
          <Link 
            to="/locations/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            <MapPin className="h-4 w-4 mr-2" />
            {t('locations.createFirst', 'Create your first location')}
          </Link>
        ) : (
          <Link 
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.backToDashboard', 'Back to Dashboard')}
          </Link>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NoLocationsPage;