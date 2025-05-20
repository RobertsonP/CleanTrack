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
  
  // Checklist item operations
  createChecklistItem: async (itemData) => {
    const response = await api.post('/cleanings/checklist-items/', itemData);
    return response.data;
  },
  
  updateChecklistItem: async (id, itemData) => {
    const response = await api.put(`/cleanings/checklist-items/${id}/`, itemData);
    return response.data;
  },
  
  deleteChecklistItem: async (id) => {
    await api.delete(`/cleanings/checklist-items/${id}/`);
    return { success: true };
  },
  
  // Get checklist items by location
  getChecklistItems: async (locationId) => {
    const response = await api.get('/cleanings/checklist-items/', { 
      params: { location: locationId } 
    });
    return response.data;
  },
  
  // Get location statistics
  getLocationStats: async (id, days = 30) => {
    const response = await api.get(`/cleanings/locations/${id}/stats/?days=${days}`);
    return response.data;
  }
};

export default locationService;