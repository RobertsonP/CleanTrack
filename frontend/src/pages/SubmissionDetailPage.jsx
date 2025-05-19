// Path: frontend/src/pages/SubmissionDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  MapPin, 
  Clock, 
  CheckCircle,
  XCircle,
  Trash,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Loading from '../components/common/Loading';
import Error from '../components/common/Error';
import submissionService from '../services/submissionService';
import { useLanguage } from '../contexts/LanguageContext';

const SubmissionDetailPage = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        
        const data = await submissionService.getSubmissionById(id);
        setSubmission(data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching submission:', error);
        setError(t('errors.submissionNotFound'));
        setLoading(false);
      }
    };
    
    fetchSubmission();
  }, [id, t]);
  
  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    
    try {
      setDeleting(true);
      
      await submissionService.deleteSubmission(id);
      
      // Redirect back to submissions list
      navigate('/submissions');
      
    } catch (error) {
      console.error('Error deleting submission:', error);
      setError(t('errors.deleteFailed'));
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };
  
  // For getting the right language version of a task title
  const getTaskTitle = (task) => {
    if (language === 'am' && task.checklist_item_title_am) {
      return task.checklist_item_title_am;
    }
    if (language === 'ru' && task.checklist_item_title_ru) {
      return task.checklist_item_title_ru;
    }
    return task.checklist_item_title;
  };
  
  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;
  if (error) return <DashboardLayout><Error message={error} /></DashboardLayout>;
  if (!submission) return <DashboardLayout><Error message={t('errors.submissionNotFound')} /></DashboardLayout>;

  return (
    <DashboardLayout>
      {/* Header with submission info */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/submissions')}
            className="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {submission.location_name}
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('submissions.date')}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(submission.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('submissions.staff')}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {submission.staff_username}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-purple-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('submissions.location')}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {submission.location_name}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-orange-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('submissions.submittedAt')}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(submission.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Completion Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('submissions.completionRate')}
            </h3>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
            <div 
              className="bg-green-500 h-4 rounded-full"
              style={{ width: `${submission.completion_rate}%` }}
            ></div>
          </div>
          
          <div className="text-right text-lg font-semibold text-green-600 dark:text-green-400">
            {submission.completion_rate}%
          </div>
        </div>
      </div>
      
      {/* Task Ratings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('submissions.taskRatings')}
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {submission.task_ratings && submission.task_ratings.length > 0 ? (
            submission.task_ratings.map((task) => (
              <div key={task.id} className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {getTaskTitle(task)}
                </h3>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                      {t('submissions.rating')}:
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded text-blue-800 dark:text-blue-300 font-medium">
                      {task.rating}/10
                    </div>
                  </div>
                </div>
                
                {task.notes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('submissions.notes')}:
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                      {task.notes}
                    </p>
                  </div>
                )}
                
                {/* Photos */}
                {task.photos && task.photos.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('submissions.photos')}:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {task.photos.map((photo) => (
                        <a 
                          key={photo.id} 
                          href={photo.image} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img 
                            src={photo.image} 
                            alt={t('submissions.taskPhoto')} 
                            className="w-full h-24 object-cover rounded-md border border-gray-200 dark:border-gray-700 hover:opacity-90"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              {t('submissions.noTaskRatings')}
            </div>
          )}
        </div>
      </div>
      
      {/* Actions */}
      {(user.role === 'admin' || user.id === submission.staff) && (
        <div className="flex justify-end mb-12">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`inline-flex items-center px-4 py-2 rounded-md ${
              deleteConfirm
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            } font-medium disabled:opacity-50`}
          >
            {deleting ? (
              <span className="animate-spin mr-2">⟳</span>
            ) : (
              <Trash className="h-5 w-5 mr-2" />
            )}
            {deleteConfirm ? t('common.confirmDelete') : t('common.delete')}
          </button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SubmissionDetailPage;