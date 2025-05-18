// frontend/src/pages/TrackerPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Camera, 
  Star, 
  Calendar, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Loader
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Loading from '../components/common/Loading';
import Error from '../components/common/Error';
import locationService from '../services/locationService';
import trackerService from '../services/trackerService';
import submissionService from '../services/submissionService';

const TrackerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [location, setLocation] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState({});
  const [ratings, setRatings] = useState({});
  const [notes, setNotes] = useState({});
  const [photos, setPhotos] = useState({});
  const [photoNames, setPhotoNames] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const fileInputRefs = useRef({});

  useEffect(() => {
    const fetchTrackerData = async () => {
      try {
        setLoading(true);
        
        // Fetch location and tasks data
        const locationData = await locationService.getLocationById(id);
        const tasksData = await trackerService.getTasksByLocation(id);
        
        setLocation(locationData);
        setTasks(tasksData);
        
        // Initialize tracking states
        const initialCompletedTasks = {};
        const initialRatings = {};
        const initialNotes = {};
        const initialPhotos = {};
        const initialPhotoNames = {};
        const initialExpandedSections = {};
        
        tasksData.forEach((task) => {
          initialCompletedTasks[task.id] = false;
          initialRatings[task.id] = 5; // Default rating
          initialNotes[task.id] = '';
          initialPhotos[task.id] = null;
          initialPhotoNames[task.id] = '';
          initialExpandedSections[task.id] = false;
        });
        
        setCompletedTasks(initialCompletedTasks);
        setRatings(initialRatings);
        setNotes(initialNotes);
        setPhotos(initialPhotos);
        setPhotoNames(initialPhotoNames);
        setExpandedSections(initialExpandedSections);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tracker data:', error);
        setError(t('errors.somethingWentWrong'));
        setLoading(false);
      }
    };

    fetchTrackerData();
  }, [id, t]);
  
  const toggleSection = (taskId) => {
    setExpandedSections(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  const handleCheckTask = (taskId) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  const handleRatingChange = (taskId, rating) => {
    setRatings(prev => ({
      ...prev,
      [taskId]: rating
    }));
  };
  
  const handleNotesChange = (taskId, value) => {
    setNotes(prev => ({
      ...prev,
      [taskId]: value
    }));
  };
  
  const handlePhotoClick = (taskId) => {
    if (fileInputRefs.current[taskId]) {
      fileInputRefs.current[taskId].click();
    }
  };
  
  const handlePhotoChange = (taskId, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotos(prev => ({
          ...prev,
          [taskId]: event.target.result
        }));
        setPhotoNames(prev => ({
          ...prev,
          [taskId]: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Prepare submission data
      const submissionData = {
        location: id,
        user: user.id,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toISOString().split('T')[1].slice(0, 8),
        task_submissions: Object.keys(completedTasks).map(taskId => ({
          task: taskId,
          completed: completedTasks[taskId],
          rating: ratings[taskId],
          notes: notes[taskId],
          photo: photos[taskId]
        }))
      };
      
      // Send submission to API
      await submissionService.createSubmission(submissionData);
      
      setSubmitSuccess(true);
      
      // Reset form after 2 seconds and navigate back to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting tracker data:', error);
      setError(t('errors.submissionFailed'));
      setSubmitting(false);
    }
  };
  
  const calculateCompletionPercentage = () => {
    const totalTasks = tasks.length;
    if (totalTasks === 0) return 0;
    
    const completedCount = Object.values(completedTasks).filter(Boolean).length;
    return Math.round((completedCount / totalTasks) * 100);
  };

  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;
  if (error) return <DashboardLayout><Error message={error} /></DashboardLayout>;
  if (submitSuccess) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="p-4 rounded-full bg-green-100 text-green-600 mb-4">
            <CheckCircle className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('tracker.submissionSuccess')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {t('tracker.redirecting')}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {location?.name}
            </h1>
            <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-300">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {new Date().toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              <Clock className="h-4 w-4 ml-4 mr-1" />
              <span>
                {new Date().toLocaleTimeString(undefined, { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-4 w-32 sm:w-48 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full"
                style={{ width: `${calculateCompletionPercentage()}%` }}
              ></div>
            </div>
            <div className="mt-1 text-xs text-center text-gray-600 dark:text-gray-300">
              {calculateCompletionPercentage()}% {t('tracker.complete')}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4 mb-8">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            {/* Task Header */}
            <div 
              className="p-4 flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection(task.id)}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      completedTasks[task.id] 
                        ? "bg-green-100 border-green-500 text-green-600" 
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCheckTask(task.id);
                    }}
                  >
                    {completedTasks[task.id] && <CheckCircle className="h-5 w-5" />}
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-base font-medium text-gray-900 dark:text-white">
                    {task.name}
                  </h3>
                </div>
              </div>
              <div>
                {expandedSections[task.id] ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
            
            {/* Task Details */}
            {expandedSections[task.id] && (
              <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-700">
                {/* Rating */}
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('tracker.rating')}
                  </label>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 cursor-pointer ${
                          star <= ratings[task.id]
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                        onClick={() => handleRatingChange(task.id, star)}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Notes */}
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('tracker.notes')}
                  </label>
                  <textarea
                    value={notes[task.id]}
                    onChange={(e) => handleNotesChange(task.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows="3"
                    placeholder={t('tracker.notesPlaceholder')}
                  ></textarea>
                </div>
                
                {/* Photo Upload */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('tracker.photo')}
                  </label>
                  <input
                    type="file"
                    ref={(el) => (fileInputRefs.current[task.id] = el)}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoChange(task.id, e)}
                  />
                  
                  {photos[task.id] ? (
                    <div className="relative">
                      <img 
                        src={photos[task.id]} 
                        alt={t('tracker.uploadedPhoto')} 
                        className="w-full h-40 object-cover rounded-lg" 
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setPhotos(prev => ({...prev, [task.id]: null}));
                          setPhotoNames(prev => ({...prev, [task.id]: ''}));
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePhotoClick(task.id)}
                      className="w-full flex items-center justify-center px-4 py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Camera className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {t('tracker.uploadPhoto')}
                      </span>
                    </button>
                  )}
                  
                  {photoNames[task.id] && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {photoNames[task.id]}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 md:relative md:bg-transparent md:dark:bg-transparent md:border-0">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? (
            <>
              <Loader className="animate-spin h-5 w-5 mr-2" />
              {t('tracker.submitting')}
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              {t('tracker.submit')}
            </>
          )}
        </button>
      </div>
    </DashboardLayout>
  );
};

export default TrackerPage;