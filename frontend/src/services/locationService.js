// Path: frontend/src/services/locationService.js
import apiClient from './apiClient';

const locationService = {
  // Get all locations with pagination
  getAllLocations: async (params = {}) => {
    const response = await apiClient.get('/cleanings/locations/', { params });
    return response.data;
  },
  
  // Get a location by ID
  getLocationById: async (id) => {
    const response = await apiClient.get(`/cleanings/locations/${id}/`);
    return response.data;
  },
  
  // Create a new location
  createLocation: async (locationData) => {
    const response = await apiClient.post('/cleanings/locations/', locationData);
    return response.data;
  },
  
  // Update an existing location
  updateLocation: async (id, locationData) => {
    const response = await apiClient.put(`/cleanings/locations/${id}/`, locationData);
    return response.data;
  },
  
  // Delete a location
  deleteLocation: async (id) => {
    await apiClient.delete(`/cleanings/locations/${id}/`);
    return { success: true };
  },
  
  // Get checklist items for a location
  getChecklistItems: async (locationId) => {
    const response = await apiClient.get('/cleanings/checklist-items/', {
      params: { location: locationId }
    });
    return response.data;
  },
  
  // Create a checklist item
  createChecklistItem: async (itemData) => {
    const response = await apiClient.post('/cleanings/checklist-items/', itemData);
    return response.data;
  },
  
  // Update a checklist item
  updateChecklistItem: async (id, itemData) => {
    const response = await apiClient.put(`/cleanings/checklist-items/${id}/`, itemData);
    return response.data;
  },
  
  // Delete a checklist item
  deleteChecklistItem: async (id) => {
    await apiClient.delete(`/cleanings/checklist-items/${id}/`);
    return { success: true };
  },
  
  // Get location statistics
  getLocationStats: async (id, days = 30) => {
    const response = await apiClient.get(`/cleanings/locations/${id}/stats/?days=${days}`);
    return response.data;
  }
};

export default locationService;