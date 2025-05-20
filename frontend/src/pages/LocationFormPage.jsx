// frontend/src/pages/LocationFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Plus, 
  Minus, 
  AlertTriangle,
  Loader,
  ChevronLeft,
  Save
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import locationService from '../services/locationService';
import { useLanguage } from '../contexts/LanguageContext';

const LocationFormPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams(); // Get location ID from URL if editing
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    status: 'active',
    description: ''
  });
  const [checklistItems, setChecklistItems] = useState([
    { title_en: '', title_am: '', title_ru: '' }
  ]);
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState(false);
  
  // Load location data if in edit mode
  useEffect(() => {
    const fetchLocationData = async () => {
      if (isEditMode) {
        try {
          setInitialLoading(true);
          
          // Fetch location details
          const locationData = await locationService.getLocationById(id);
          setFormData({
            name: locationData.name || '',
            status: locationData.status || 'active',
            description: locationData.description || ''
          });
          
          // Fetch checklist items for this location
          const checklistData = await locationService.getChecklistItems(id);
          if (checklistData.results && checklistData.results.length > 0) {
            setChecklistItems(checklistData.results.map(item => ({
              id: item.id,
              title_en: item.title_en || '',
              title_am: item.title_am || '',
              title_ru: item.title_ru || ''
            })));
          }
          
          setInitialLoading(false);
        } catch (error) {
          console.error('Error fetching location data:', error);
          setError('Failed to load location data. Please try again.');
          setInitialLoading(false);
        }
      }
    };
    
    fetchLocationData();
  }, [id, isEditMode]);
  
  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleChecklistItemChange = (index, field, value) => {
    const newItems = [...checklistItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setChecklistItems(newItems);
    
    // Clear checklist errors
    if (formErrors.checklistItems) {
      setFormErrors(prev => ({ ...prev, checklistItems: null }));
    }
  };
  
  const addChecklistItem = () => {
    setChecklistItems([...checklistItems, { title_en: '', title_am: '', title_ru: '' }]);
  };
  
  const removeChecklistItem = (index) => {
    if (checklistItems.length <= 1) return;
    const newItems = [...checklistItems];
    newItems.splice(index, 1);
    setChecklistItems(newItems);
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Location name is required';
    }
    
    const hasEmptyItems = checklistItems.some(item => !item.title_en.trim());
    if (hasEmptyItems) {
      errors.checklistItems = 'All checklist items must have an English title';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (isEditMode) {
        // Update existing location
        await locationService.updateLocation(id, formData);
        
        // Update checklist items
        for (const item of checklistItems) {
          if (item.id) {
            // Update existing item
            await locationService.updateChecklistItem(item.id, {
              ...item,
              location: id
            });
          } else {
            // Create new item
            await locationService.createChecklistItem({
              ...item,
              location: id
            });
          }
        }
        
        setSuccess(true);
        setTimeout(() => {
          navigate('/locations');
        }, 1500);
      } else {
        // Create new location
        const locationResponse = await locationService.createLocation(formData);
        
        // Create checklist items for this location
        const locationId = locationResponse.id;
        
        // Create all checklist items
        await Promise.all(
          checklistItems.map(item => 
            locationService.createChecklistItem({
              ...item,
              location: locationId
            })
          )
        );
        
        setSuccess(true);
        setTimeout(() => {
          navigate('/locations');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving location:', error);
      
      if (error.response && error.response.data) {
        setFormErrors(error.response.data);
      } else {
        setError('Failed to save location. Please try again.');
      }
      
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/locations')}
            className="mr-4 flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Locations
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Location' : 'Create New Location'}
          </h1>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
              <span className="text-red-800 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex">
              <Save className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
              <span className="text-green-800 dark:text-green-300">
                Location {isEditMode ? 'updated' : 'created'} successfully! Redirecting...
              </span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Location Information
            </h2>
            
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleLocationChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.name ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                placeholder="e.g. Departure Hall"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleLocationChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter a description of this location"
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleLocationChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Checklist Items
              </h2>
              <button
                type="button"
                onClick={addChecklistItem}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>
            
            {formErrors.checklistItems && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{formErrors.checklistItems}</p>
              </div>
            )}
            
            {checklistItems.map((item, index) => (
              <div key={index} className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
                    Item #{index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeChecklistItem(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    disabled={checklistItems.length <= 1}
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title (English)*
                    </label>
                    <input
                      type="text"
                      value={item.title_en}
                      onChange={(e) => handleChecklistItemChange(index, 'title_en', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g. Clean the windows"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title (Armenian)
                    </label>
                    <input
                      type="text"
                      value={item.title_am}
                      onChange={(e) => handleChecklistItemChange(index, 'title_am', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Armenian translation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title (Russian)
                    </label>
                    <input
                      type="text"
                      value={item.title_ru}
                      onChange={(e) => handleChecklistItemChange(index, 'title_ru', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Russian translation"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/locations')}
              className="mr-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Update Location' : 'Create Location'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default LocationFormPage;