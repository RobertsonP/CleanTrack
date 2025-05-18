// frontend/src/pages/LocationsPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash, 
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Loader,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Loading from '../components/common/Loading';
import Error from '../components/common/Error';
import locationService from '../services/locationService';

const LocationsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formAction, setFormAction] = useState('create'); // 'create' or 'edit'
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  useEffect(() => {
    fetchLocations();
  }, [currentPage]);
  
  const fetchLocations = async () => {
    try {
      setLoading(true);
      
      // Prepare query parameters
      const params = {
        page: currentPage,
        page_size: 10
      };
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      const response = await locationService.getAllLocations(params);
      
      setLocations(response.results || []);
      setTotalPages(Math.ceil(response.count / 10));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError(t('errors.somethingWentWrong'));
      setLoading(false);
    }
  };
  
  // Search handlers
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLocations();
  };
  
  // Pagination handlers
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
  
  // Form handlers
  const openCreateModal = () => {
    setFormAction('create');
    setFormData({
      name: '',
      description: '',
      is_active: true
    });
    setFormErrors({});
    setFormSuccess(false);
    setIsModalOpen(true);
  };
  
  const openEditModal = (location) => {
    setFormAction('edit');
    setSelectedLocation(location);
    setFormData({
      name: location.name,
      description: location.description || '',
      is_active: location.is_active
    });
    setFormErrors({});
    setFormSuccess(false);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = t('validation.required');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setFormLoading(true);
      
      if (formAction === 'create') {
        await locationService.createLocation(formData);
      } else {
        await locationService.updateLocation(selectedLocation.id, formData);
      }
      
      setFormSuccess(true);
      
      // Refresh locations after short delay
      setTimeout(() => {
        fetchLocations();
        closeModal();
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting location form:', error);
      
      // Handle validation errors from API
      if (error.response && error.response.data) {
        setFormErrors(error.response.data);
      } else {
        setFormErrors({ 
          non_field_errors: t('errors.somethingWentWrong') 
        });
      }
      
      setFormLoading(false);
    }
  };
  
  // Delete handlers
  const openDeleteConfirmation = (location) => {
    setDeleteConfirmation(location);
  };
  
  const closeDeleteConfirmation = () => {
    setDeleteConfirmation(null);
  };
  
  const handleDeleteLocation = async () => {
    if (!deleteConfirmation) return;
    
    try {
      setDeleteLoading(true);
      
      await locationService.deleteLocation(deleteConfirmation.id);
      
      // Remove from list and close confirmation
      setLocations(locations.filter(loc => loc.id !== deleteConfirmation.id));
      closeDeleteConfirmation();
      
    } catch (error) {
      console.error('Error deleting location:', error);
      setDeleteLoading(false);
    }
  };
  
  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;
  if (error) return <DashboardLayout><Error message={error} /></DashboardLayout>;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('locations.title')}
        </h1>
        <button
          onClick={openCreateModal}
          className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t('locations.addNew')}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <form onSubmit={handleSearch} className="flex items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={t('common.search')}
            />
          </div>
          <button
            type="submit"
            className="ml-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            {t('common.search')}
          </button>
        </form>
      </div>

      {/* Locations List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('locations.name')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('locations.description')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('locations.status')}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {locations.length > 0 ? (
                locations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mr-3">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {location.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-xs">
                        {location.description || t('common.noDescription')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        location.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {location.is_active ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(location)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteConfirmation(location)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery
                      ? t('locations.noSearchResults', { query: searchQuery })
                      : t('locations.noLocations')}
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
                {t('common.previous')}
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${
                  currentPage === totalPages
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-50'
                }`}
              >
                {t('common.next')}
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t('common.pagination', {
                    from: (currentPage - 1) * 10 + 1,
                    to: Math.min(currentPage * 10, locations.length),
                    total: locations.length
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
                    <span className="sr-only">{t('common.previous')}</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {/* Page numbers would go here */}
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
                    <span className="sr-only">{t('common.next')}</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={closeModal}>
              <div className="absolute inset-0 bg-black opacity-50"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {formAction === 'create' ? t('locations.addLocation') : t('locations.editLocation')}
                </h3>
                
                {formErrors.non_field_errors && (
                  <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700 dark:text-red-400">
                          {formErrors.non_field_errors}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {formSuccess && (
                  <div className="mb-4 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700 dark:text-green-400">
                          {formAction === 'create'
                            ? t('locations.createSuccess')
                            : t('locations.updateSuccess')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleFormSubmit}>
                  {/* Name */}
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('locations.name')} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className={`block w-full px-3 py-2 border ${
                        formErrors.name
                          ? 'border-red-300 dark:border-red-600'
                          : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                    )}
                  </div>
                  
                  {/* Description */}
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('locations.description')}
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows="3"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    ></textarea>
                  </div>
                  
                  {/* Active Status */}
                  <div className="mb-4 flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      {t('locations.isActive')}
                    </label>
                  </div>
                  
                  {/* Form Actions */}
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading || formSuccess}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {formLoading ? (
                        <Loader className="animate-spin h-5 w-5" />
                      ) : (
                        formAction === 'create' ? t('common.create') : t('common.update')
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={closeDeleteConfirmation}>
              <div className="absolute inset-0 bg-black opacity-50"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {t('locations.deleteConfirmation')}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('locations.deleteWarning', { name: deleteConfirmation.name })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteLocation}
                  disabled={deleteLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? (
                    <Loader className="animate-spin h-5 w-5" />
                  ) : (
                    t('common.delete')
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeDeleteConfirmation}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LocationsPage;