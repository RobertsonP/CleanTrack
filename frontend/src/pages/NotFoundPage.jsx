// frontend/src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center px-4 py-12">
      <div className="text-center">
        <div className="flex justify-center">
          <AlertTriangle className="h-24 w-24 text-red-500 dark:text-red-400 mb-6" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          404
        </h1>
        
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {t('errors.pageNotFound')}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-8">
          {t('errors.pageNotFoundDescription')}
        </p>
        
        <Link 
          to="/dashboard" 
          className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Home className="h-5 w-5 mr-2" />
          {t('common.backToDashboard')}
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;