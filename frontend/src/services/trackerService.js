// Path: frontend/src/services/trackerService.js
import api from './api';

const trackerService = {
  // Get all tasks
  getAllTasks: async (params = {}) => {
    const response = await api.get('/cleanings/checklist-items/', { params });
    return response.data;
  },

  // Get tasks by location
  getTasksByLocation: async (locationId) => {
    const response = await api.get(`/cleanings/checklist-items/`, { 
      params: { location: locationId } 
    });
    return response.data.results || [];
  },

  // Get task by ID
  getTaskById: async (id) => {
    const response = await api.get(`/cleanings/checklist-items/${id}/`);
    return response.data;
  },

  // Create new task
  createTask: async (taskData) => {
    const response = await api.post('/cleanings/checklist-items/', taskData);
    return response.data;
  },

  // Update task
  updateTask: async (id, taskData) => {
    const response = await api.put(`/cleanings/checklist-items/${id}/`, taskData);
    return response.data;
  },

  // Delete task
  deleteTask: async (id) => {
    const response = await api.delete(`/cleanings/checklist-items/${id}/`);
    return response.data;
  },
};

export default trackerService;