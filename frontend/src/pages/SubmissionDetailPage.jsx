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
  AlertTriangle,
  Loader
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Loading from '../components/common/Loading';
import Error from '../components/common/Error';
import submissionService from '../services/submissionService';

const SubmissionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const data = await submissionService.getSubmissionById(id);
        setSubmission(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching submission:', error);
        setError('Submission not found or error loading data');
        setLoading(false);
      }
    };

    if (id) {
      fetchSubmission();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this submission?')) {
      return;
    }
    
    try {
      setDeleteLoading(true);
      await submissionService.deleteSubmission(id);
      navigate('/submissions');
    } catch (error) {
      console.error('Error deleting submission:', error);
      setError('Failed to delete submission');
      setDeleteLoading(false);
    }
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center space-x-3 mb-4">
          <button 
            onClick={() => navigate('/submissions')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Submission Details
          </h1>
        </div>
        <Loading />
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center space-x-3 mb-4">
          <button 
            onClick={() => navigate('/submissions')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Submission Details
          </h1>
        </div>
        <Error message={error} />
      </DashboardLayout>
    );
  }

  if (!submission) {
    return (
      <DashboardLayout>
        <div className="flex items-center space-x-3 mb-4">
          <button 
            onClick={() => navigate('/submissions')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Submission Details
          </h1>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
            <p className="text-yellow-700 dark:text-yellow-400">
              No data available for this submission.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/submissions')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {submission.location_name || 'Submission Details'}
          </h1>
        </div>
        {(user.role === 'admin' || submission.staff === user.id) && (
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteLoading ? (
                <Loader className="animate-spin h-5 w-5 mr-2" />
              ) : (
                'Delete'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Submission Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
              <p className="font-medium">
                {submission.date ? new Date(submission.date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Staff</p>
              <p className="font-medium">{submission.staff_username || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
              <p className="font-medium">{submission.location_name || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Submitted At</p>
              <p className="font-medium">
                {submission.created_at ? new Date(submission.created_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit'
                }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold">Completion Rate</h3>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div 
              className="bg-green-500 h-4 rounded-full" 
              style={{ width: `${submission.completion_rate || 0}%` }}
            ></div>
          </div>
          <p className="mt-1 text-right font-medium">{submission.completion_rate || 0}%</p>
        </div>
      </div>

      {/* Task Ratings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Task Ratings
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {submission.task_ratings && submission.task_ratings.length > 0 ? (
            submission.task_ratings.map((task, index) => (
              <div key={task.id || index} className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {task.checklist_item_title || `Task ${index + 1}`}
                    </h3>
                    
                    <div className="flex items-center mb-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.rating >= 8 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : task.rating >= 5
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        Rating: {task.rating || 0}/10
                      </span>
                    </div>
                    
                    {task.notes && (
                      <div className="mt-2 mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Notes
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">
                          {task.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No task ratings available for this submission.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubmissionDetailPage;