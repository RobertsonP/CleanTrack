// frontend/src/pages/TrackerPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, ChevronDown, ChevronUp, ArrowLeft, Send, Loader } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import locationService from '../services/locationService';
import submissionService from '../services/submissionService';
import { useLanguage } from '../contexts/LanguageContext';
import Loading from '../components/common/Loading';
import Error from '../components/common/Error';

const TrackerPage = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [location, setLocation] = useState(null);
  const [checklistItems, setChecklistItems] = useState([]);
  const [ratings, setRatings] = useState({});
  const [notes, setNotes] = useState({});
  const [photos, setPhotos] = useState({});
  const [photoFiles, setPhotoFiles] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const fileInputRefs = useRef({});
  
  // Fetch location and checklist items
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get location details
        const locationData = await locationService.getLocationById(id);
        setLocation(locationData);
        
        // Get checklist items for this location
        const checklistResponse = await locationService.getChecklistItems(id);
        
        const items = checklistResponse.results || [];
        setChecklistItems(items);
        
        // Initialize state for each item
        const initialRatings = {};
        const initialNotes = {};
        const initialPhotos = {};
        const initialPhotoFiles = {};
        const initialExpanded = {};
        
        items.forEach(item => {
          initialRatings[item.id] = 5; // Default rating
          initialNotes[item.id] = '';
          initialPhotos[item.id] = [];
          initialPhotoFiles[item.id] = [];
          initialExpanded[item.id] = false;
        });
        
        setRatings(initialRatings);
        setNotes(initialNotes);
        setPhotos(initialPhotos);
        setPhotoFiles(initialPhotoFiles);
        setExpandedItems(initialExpanded);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError("Failed to load location data. Please try again.");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Toggle item expansion
  const toggleItem = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };
  
  // Handle rating change
  const handleRatingChange = (itemId, rating) => {
    setRatings(prev => ({
      ...prev,
      [itemId]: rating
    }));
  };
  
  // Handle notes change
  const handleNotesChange = (itemId, event) => {
    setNotes(prev => ({
      ...prev,
      [itemId]: event.target.value
    }));
  };
  
  // Handle photo upload
  const handlePhotoClick = (itemId) => {
    if (fileInputRefs.current[itemId]) {
      fileInputRefs.current[itemId].click();
    }
  };
  
  const handlePhotoChange = (itemId, event) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      
      // Update photo previews
      const previews = files.map(file => URL.createObjectURL(file));
      setPhotos(prev => ({
        ...prev,
        [itemId]: [...(prev[itemId] || []), ...previews]
      }));
      
      // Store the actual files for upload
      setPhotoFiles(prev => ({
        ...prev,
        [itemId]: [...(prev[itemId] || []), ...files]
      }));
    }
  };
  
  // Calculate completion percentage
  const getCompletionPercentage = () => {
    if (!checklistItems || checklistItems.length === 0) return 0;
    
    const totalItems = checklistItems.length * 10; // Maximum possible points
    const totalRatings = Object.values(ratings).reduce((sum, rating) => sum + rating, 0);
    
    return Math.round((totalRatings / totalItems) * 100);
  };
  
  // Submit the form
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Prepare the submission data structure
      const submissionData = {
        location: id,
        date: new Date().toISOString().split('T')[0],
        task_ratings_data: checklistItems.map(item => ({
          checklist_item: item.id,
          rating: ratings[item.id] || 0,
          notes: notes[item.id] || '',
          uploaded_images: photoFiles[item.id] || []
        }))
      };
      
      // Submit the form
      await submissionService.createSubmission(submissionData);
      
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/submissions');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setError("Failed to submit. Please try again.");
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <DashboardLayout><Loading /></DashboardLayout>;
  }
  
  if (error && !success) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-700 dark:text-red-400 mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate('/submissions')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Submissions
        </button>
      </DashboardLayout>
    );
  }
  
  if (success) {
    return (
      <DashboardLayout>
        <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-md text-center">
          <div className="text-green-600 dark:text-green-400 text-3xl mb-4">✓</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('tracker.submissionSuccess', 'Submission Successful!')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t('tracker.successMessage', 'Your cleaning report has been submitted.')}
          </p>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {t('tracker.redirecting', 'Redirecting...')}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={() => navigate('/submissions')}
          className="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {location?.name || 'Create Submission'}
        </h1>
      </div>
      
      {/* Completion Indicator */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="text-gray-700 dark:text-gray-300 font-medium">
            {t('tracker.completion', 'Completion')}: {getCompletionPercentage()}%
          </div>
          <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Checklist Items */}
      <div className="space-y-4 mb-20">
        {checklistItems.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            {/* Item Header */}
            <div 
              className="p-4 cursor-pointer"
              onClick={() => toggleItem(item.id)}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {item.title_en}
                </h3>
                {expandedItems[item.id] ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                )}
              </div>
            </div>
            
            {/* Item Details (when expanded) */}
            {expandedItems[item.id] && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                {/* Rating Stars */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('tracker.rating', 'Rating')}
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(item.id, star)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          ratings[item.id] >= star
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('tracker.notes', 'Notes')}
                  </label>
                  <textarea
                    value={notes[item.id] || ''}
                    onChange={(e) => handleNotesChange(item.id, e)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder={t('tracker.notesPlaceholder', 'Add notes here...')}
                    rows="3"
                  ></textarea>
                </div>
                
                {/* Photos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('tracker.photo', 'Photo')}
                  </label>
                  
                  <input
                    type="file"
                    ref={el => fileInputRefs.current[item.id] = el}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={(e) => handlePhotoChange(item.id, e)}
                  />
                  
                  <button
                    type="button"
                    onClick={() => handlePhotoClick(item.id)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center mb-2"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    {t('tracker.uploadPhoto', 'Upload Photo')}
                  </button>
                  
                  {photos[item.id] && photos[item.id].length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {photos[item.id].map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="h-20 w-full object-cover rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Submit Button (Fixed at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center">
                <Loader className="animate-spin h-5 w-5 mr-2" />
                <span>{t('tracker.submitting', 'Submitting...')}</span>
              </div>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                {t('tracker.submit', 'Submit Tracker')}
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrackerPage;