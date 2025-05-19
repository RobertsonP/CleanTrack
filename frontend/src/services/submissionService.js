// Path: frontend/src/services/submissionService.js
import api from './api';

const submissionService = {
  // Get all submissions with filters
  getAllSubmissions: async (filters = {}) => {
    try {
      const response = await api.get('/cleanings/submissions/', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return { results: [], count: 0 };
    }
  },
  
  // Get a submission by ID
  getSubmissionById: async (id) => {
    try {
      const response = await api.get(`/cleanings/submissions/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching submission:', error);
      throw error;
    }
  },
  
  // Get today's submissions
  getTodaySubmissions: async () => {
    try {
      const response = await api.get('/cleanings/submissions/today/');
      return response.data;
    } catch (error) {
      console.error('Error fetching today\'s submissions:', error);
      return [];
    }
  },
  
  // Get submission statistics
  getSubmissionStats: async (days = 30) => {
    try {
      const response = await api.get(`/cleanings/submissions/stats/?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching submission stats:', error);
      // Return default empty stats object instead of throwing error
      return {
        submission_count: 0,
        avg_completion_rate: 0,
        active_users: 0,
        submissions_by_location: []
      };
    }
  },
  
  // Create a new submission with photos
  createSubmission: async (submissionData) => {
    try {
      // Handle form data for file uploads
      const formData = new FormData();
      
      // Add location and date
      formData.append('location', submissionData.location);
      formData.append('date', submissionData.date);
      
      // Convert task_ratings_data to JSON, excluding file objects
      const taskRatingsData = submissionData.task_ratings_data.map(task => {
        // Extract uploaded_images to handle separately
        const { uploaded_images, ...taskData } = task;
        return taskData;
      });
      
      // Add task ratings as JSON
      formData.append('task_ratings_data', JSON.stringify(taskRatingsData));
      
      // Add images to form data with special naming pattern for backend
      submissionData.task_ratings_data.forEach((task, taskIndex) => {
        if (task.uploaded_images && task.uploaded_images.length > 0) {
          task.uploaded_images.forEach((image, imageIndex) => {
            formData.append(`task_ratings_data[${taskIndex}].uploaded_images[${imageIndex}]`, image);
          });
        }
      });
      
      const response = await api.post('/cleanings/submissions/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  },
  
  // Update an existing submission
  updateSubmission: async (id, submissionData) => {
    try {
      // Similar to create, but uses PUT
      const formData = new FormData();
      
      if (submissionData.location) formData.append('location', submissionData.location);
      if (submissionData.date) formData.append('date', submissionData.date);
      
      if (submissionData.task_ratings_data) {
        const taskRatingsData = submissionData.task_ratings_data.map(task => {
          const { uploaded_images, ...taskData } = task;
          return taskData;
        });
        
        formData.append('task_ratings_data', JSON.stringify(taskRatingsData));
        
        submissionData.task_ratings_data.forEach((task, taskIndex) => {
          if (task.uploaded_images && task.uploaded_images.length > 0) {
            task.uploaded_images.forEach((image, imageIndex) => {
              formData.append(`task_ratings_data[${taskIndex}].uploaded_images[${imageIndex}]`, image);
            });
          }
        });
      }
      
      const response = await api.put(`/cleanings/submissions/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  },
  
  // Delete a submission
  deleteSubmission: async (id) => {
    try {
      await api.delete(`/cleanings/submissions/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw error;
    }
  }
};

export default submissionService;