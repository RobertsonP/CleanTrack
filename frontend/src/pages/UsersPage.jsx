// frontend/src/pages/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Plus, 
  Edit, 
  Trash, 
  Search,
  AlertTriangle,
  CheckCircle,
  Loader,
  X,
  Users as UsersIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Loading from '../components/common/Loading';
import Error from '../components/common/Error';
import authService from '../services/authService';

const UsersPage = () => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formAction, setFormAction] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    role: 'staff',
    phone: '',
    first_name: '',
    last_name: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const response = await authService.getAllUsers();
      setUsers(response.users || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(t('errors.somethingWentWrong'));
      setLoading(false);
    }
  };
  
  // Form handlers
  const openCreateModal = () => {
    setFormAction('create');
    setFormData({
      username: '',
      email: '',
      password: '',
      password2: '',
      role: 'staff',
      phone: '',
      first_name: '',
      last_name: ''
    });
    setFormErrors({});
    setFormSuccess(false);
    setIsModalOpen(true);
  };
  
  const openEditModal = (user) => {
    setFormAction('edit');
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      password2: '',
      role: user.role,
      phone: user.phone || '',
      first_name: user.first_name || '',
      last_name: user.last_name || ''
    });
    setFormErrors({});
    setFormSuccess(false);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      errors.username = t('validation.required');
    }
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = t('validation.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('validation.invalidEmail');
    }
    
    // Password validation (only required for new users)
    if (formAction === 'create') {
      if (!formData.password) {
        errors.password = t('validation.required');
      } else if (formData.password.length < 8) {
        errors.password = t('validation.passwordLength');
      }
      
      if (!formData.password2) {
        errors.password2 = t('validation.required');
      } else if (formData.password !== formData.password2) {
        errors.password2 = t('validation.passwordMatch');
      }
    } else if (formData.password || formData.password2) {
      // If password is provided for edit, validate it
      if (formData.password.length < 8) {
        errors.password = t('validation.passwordLength');
      }
      
      if (formData.password !== formData.password2) {
        errors.password2 = t('validation.passwordMatch');
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setFormLoading(true);
      
      if (formAction === 'create') {
        const result = await authService.register(formData);
        if (result.success) {
          setFormSuccess(true);
          fetchUsers();
        } else {
          setFormErrors(result.error || { non_field_errors: t('errors.somethingWentWrong') });
        }
      } else {
        // Prepare update data (remove empty password fields)
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
          delete updateData.password2;
        }
        
        const result = await authService.updateUser(selectedUser.id, updateData);
        if (result.success) {
          setFormSuccess(true);
          fetchUsers();
        } else {
          setFormErrors(result.error || { non_field_errors: t('errors.somethingWentWrong') });
        }
      }
      
      setFormLoading(false);
      
      // Close modal after success (with slight delay to show success message)
      if (formSuccess) {
        setTimeout(closeModal, 1500);
      }
      
    } catch (error) {
      console.error('Error submitting user form:', error);
      
      setFormErrors({ 
        non_field_errors: t('errors.somethingWentWrong') 
      });
      
      setFormLoading(false);
    }
  };
  
  // Delete handlers
  const openDeleteConfirmation = (user) => {
    setDeleteConfirmation(user);
  };
  
  const closeDeleteConfirmation = () => {
    setDeleteConfirmation(null);
  };
  
  const handleDeleteUser = async () => {
    if (!deleteConfirmation) return;
    
    try {
      setDeleteLoading(true);
      
      const result = await authService.deleteUser(deleteConfirmation.id);
      
      if (result.success) {
        // Remove user from list
        setUsers(users.filter(u => u.id !== deleteConfirmation.id));
        closeDeleteConfirmation();
      } else {
        setError(result.error || t('errors.deleteFailed'));
      }
      
      setDeleteLoading(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(t('errors.somethingWentWrong'));
      setDeleteLoading(false);
    }
  };
  
  if (loading) return <DashboardLayout><Loading /></DashboardLayout>;
  if (error) return <DashboardLayout><Error message={error} /></DashboardLayout>;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('users.title')}
        </h1>
        <button
          onClick={openCreateModal}
          className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t('users.addNew')}
        </button>
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('users.user')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('users.email')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('users.role')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('users.phone')}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-600 dark:bg-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}>
                        {user.role === 'admin' ? t('users.admin') : t('users.staff')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{user.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteConfirmation(user)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        disabled={user.id === currentUser.id}
                      >
                        <Trash className={`h-5 w-5 ${user.id === currentUser.id ? 'opacity-50 cursor-not-allowed' : ''}`} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {t('users.noUsers')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={closeModal}>
              <div className="absolute inset-0 bg-black opacity-50"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {formAction === 'create' ? t('users.addUser') : t('users.editUser')}
                </h3>
                
                {formErrors.non_field_errors && (
                  <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700 dark:text-red-400">
                          {formErrors.non_field_errors}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {formSuccess && (
                  <div className="mb-4 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700 dark:text-green-400">
                          {formAction === 'create'
                            ? t('users.createSuccess')
                            : t('users.updateSuccess')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleFormSubmit}>
                  {/* Username */}
                  <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('users.username')} *
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleFormChange}
                      className={`block w-full px-3 py-2 border ${
                        formErrors.username
                          ? 'border-red-300 dark:border-red-600'
                          : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    />
                    {formErrors.username && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.username}</p>
                    )}
                  </div>
                  
                  {/* Email */}
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('users.email')} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className={`block w-full px-3 py-2 border ${
                        formErrors.email
                          ? 'border-red-300 dark:border-red-600'
                          : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
                    )}
                  </div>
                  
                  {/* Password */}
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('users.password')} {formAction === 'create' ? '*' : ''}
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      className={`block w-full px-3 py-2 border ${
                        formErrors.password
                          ? 'border-red-300 dark:border-red-600'
                          : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      required={formAction === 'create'}
                    />
                    {formAction === 'edit' && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t('users.passwordLeaveEmpty')}
                      </p>
                    )}
                    {formErrors.password && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.password}</p>
                    )}
                  </div>
                  
                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label htmlFor="password2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('users.confirmPassword')} {formAction === 'create' ? '*' : ''}
                    </label>
                    <input
                      type="password"
                      id="password2"
                      name="password2"
                      value={formData.password2}
                      onChange={handleFormChange}
                      className={`block w-full px-3 py-2 border ${
                        formErrors.password2
                          ? 'border-red-300 dark:border-red-600'
                          : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                      required={formAction === 'create'}
                    />
                    {formErrors.password2 && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.password2}</p>
                    )}
                  </div>
                  
                  {/* Role */}
                  <div className="mb-4">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('users.role')} *
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleFormChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="admin">{t('users.admin')}</option>
                      <option value="staff">{t('users.staff')}</option>
                    </select>
                  </div>
                  
                  {/* First Name */}
                  <div className="mb-4">
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('users.firstName')}
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleFormChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  {/* Last Name */}
                  <div className="mb-4">
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('users.lastName')}
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleFormChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  {/* Phone */}
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('users.phone')}
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  {/* Form Actions */}
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading || formSuccess}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {formLoading ? (
                        <Loader className="animate-spin h-5 w-5" />
                      ) : (
                        formAction === 'create' ? t('common.create') : t('common.update')
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={closeDeleteConfirmation}>
              <div className="absolute inset-0 bg-black opacity-50"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {t('users.deleteConfirmation')}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('users.deleteWarning', { 
                          name: deleteConfirmation.username,
                          role: deleteConfirmation.role === 'admin' ? t('users.admin') : t('users.staff')
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={deleteLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? (
                    <Loader className="animate-spin h-5 w-5" />
                  ) : (
                    t('common.delete')
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeDeleteConfirmation}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UsersPage;