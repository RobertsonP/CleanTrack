// frontend/src/pages/LocationFormPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../services/api';

const LocationFormPage = () => {
  const navigate = useNavigate();
  
  const [location, setLocation] = useState({
    name: '',
    status: 'active'
  });
  
  const [checklistItems, setChecklistItems] = useState([
    { title_en: '', title_am: '', title_ru: '' }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocation(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleChecklistItemChange = (index, field, value) => {
    const newItems = [...checklistItems];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setChecklistItems(newItems);
  };
  
  const addChecklistItem = () => {
    setChecklistItems([
      ...checklistItems,
      { title_en: '', title_am: '', title_ru: '' }
    ]);
  };
  
  const removeChecklistItem = (index) => {
    if (checklistItems.length <= 1) {
      return; // Keep at least one item
    }
    
    const newItems = [...checklistItems];
    newItems.splice(index, 1);
    setChecklistItems(newItems);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!location.name.trim()) {
      setError("Location name is required");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create location
      const locationResponse = await api.post('/cleanings/locations/', location);
      const newLocationId = locationResponse.data.id;
      
      // Create checklist items
      for (const item of checklistItems) {
        if (item.title_en.trim()) {
          await api.post('/cleanings/checklist-items/', {
            location: newLocationId,
            title_en: item.title_en,
            title_am: item.title_am,
            title_ru: item.title_ru
          });
        }
      }
      
      // Redirect back to locations list
      navigate('/locations');
      
    } catch (error) {
      console.error('Error creating location:', error);
      setError("Failed to create location. Please try again.");
      setLoading(false);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            type="button"
            onClick={() => navigate('/locations')}
            className="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Location
          </h1>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-md text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Location Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Location Details
            </h2>
            
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={location.name}
                onChange={handleLocationChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Departure Hall"
                required
              />
            </div>
            
            <div className="mb-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={location.status}
                onChange={handleLocationChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          {/* Checklist Items Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Checklist Items
              </h2>
              <button
                type="button"
                onClick={addChecklistItem}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>
            
            {checklistItems.map((item, index) => (
              <div 
                key={index} 
                className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:mb-0 last:pb-0"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
                    Item #{index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeChecklistItem(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                    disabled={checklistItems.length <= 1}
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* English Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title (English) *
                    </label>
                    <input
                      type="text"
                      value={item.title_en}
                      onChange={(e) => handleChecklistItemChange(index, 'title_en', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Clean the windows"
                      required
                    />
                  </div>
                  
                  {/* Armenian Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title (Armenian)
                    </label>
                    <input
                      type="text"
                      value={item.title_am}
                      onChange={(e) => handleChecklistItemChange(index, 'title_am', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Armenian translation"
                    />
                  </div>
                  
                  {/* Russian Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title (Russian)
                    </label>
                    <input
                      type="text"
                      value={item.title_ru}
                      onChange={(e) => handleChecklistItemChange(index, 'title_ru', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Russian translation"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Form Buttons */}
          <div className="flex justify-end space-x-4 mb-12">
            <button
              type="button"
              onClick={() => navigate('/locations')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Location'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default LocationFormPage;