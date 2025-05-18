// Path: frontend/src/services/submissionService.js
import api from './api';

const submissionService = {
  getAllSubmissions: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const response = await api.get(`/cleanings/submissions/?${queryParams.toString()}`);
    return response.data;
  },
  
  getSubmissionById: async (id) => {
    const response = await api.get(`/cleanings/submissions/${id}/`);
    return response.data;
  },
  
  getTodaySubmissions: async () => {
    const response = await api.get('/cleanings/submissions/today/');
    return response.data;
  },
  
  getSubmissionStats: async (days = 30) => {
    const response = await api.get(`/cleanings/submissions/stats/?days=${days}`);
    return response.data;
  },
  
  createSubmission: async (submissionData) => {
    // Handle form data for image uploads
    const formData = new FormData();
    
    // Add basic submission data
    formData.append('location', submissionData.location);
    formData.append('date', submissionData.date);
    
    // Add task ratings data as a JSON string
    const taskRatingsData = submissionData.task_ratings_data.map(taskRating => {
      // Extract and remove images from each task rating for separate handling
      const { uploaded_images, ...taskRatingData } = taskRating;
      return taskRatingData;
    });
    
    formData.append('task_ratings_data', JSON.stringify(taskRatingsData));
    
    // Add all images to form data with special keys that the backend can parse
    submissionData.task_ratings_data.forEach((taskRating, taskIndex) => {
      if (taskRating.uploaded_images) {
        taskRating.uploaded_images.forEach((image, imageIndex) => {
          formData.append(
            `task_ratings_data[${taskIndex}].uploaded_images[${imageIndex}]`, 
            image,
            image.name
          );
        });
      }
    });
    
    const response = await api.post('/cleanings/submissions/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  updateSubmission: async (id, submissionData) => {
    // Similar to createSubmission but using PUT
    const formData = new FormData();
    
    // Add basic submission data
    if (submissionData.location) formData.append('location', submissionData.location);
    if (submissionData.date) formData.append('date', submissionData.date);
    
    // Add task ratings data as a JSON string
    if (submissionData.task_ratings_data) {
      const taskRatingsData = submissionData.task_ratings_data.map(taskRating => {
        // Extract and remove images from each task rating for separate handling
        const { uploaded_images, ...taskRatingData } = taskRating;
        return taskRatingData;
      });
      
      formData.append('task_ratings_data', JSON.stringify(taskRatingsData));
      
      // Add all images to form data with special keys that the backend can parse
      submissionData.task_ratings_data.forEach((taskRating, taskIndex) => {
        if (taskRating.uploaded_images) {
          taskRating.uploaded_images.forEach((image, imageIndex) => {
            formData.append(
              `task_ratings_data[${taskIndex}].uploaded_images[${imageIndex}]`, 
              image,
              image.name
            );
          });
        }
      });
    }
    
    const response = await api.put(`/cleanings/submissions/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  deleteSubmission: async (id) => {
    await api.delete(`/cleanings/submissions/${id}/`);
    return { success: true };
  }
};

export default submissionService;