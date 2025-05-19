// Path: frontend/src/services/locationService.js
import api from './api';

const locationService = {
  getAllLocations: async (params = {}) => {
    const response = await api.get('/cleanings/locations/', { params });
    return response.data;
  },
  
  getLocationById: async (id) => {
    const response = await api.get(`/cleanings/locations/${id}/`);
    return response.data;
  },
  
  createLocation: async (locationData) => {
    const response = await api.post('/cleanings/locations/', locationData);
    return response.data;
  },
  
  updateLocation: async (id, locationData) => {
    const response = await api.put(`/cleanings/locations/${id}/`, locationData);
    return response.data;
  },
  
  deleteLocation: async (id) => {
    await api.delete(`/cleanings/locations/${id}/`);
    return { success: true };
  },
  
  // Add this new method for creating checklist items
  createChecklistItem: async (itemData) => {
    const response = await api.post('/cleanings/checklist-items/', itemData);
    return response.data;
  },
  
  // Get checklist items by location
  getChecklistItems: async (locationId) => {
    const response = await api.get('/cleanings/checklist-items/', { 
      params: { location: locationId } 
    });
    return response.data;
  },
};

export default locationService;