// Path: frontend/src/contexts/LanguageContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the language context
const LanguageContext = createContext();

// This simple mock i18n function acts like a translation function
// In a real app, you'd use a proper i18n library like i18next
const translate = (key, language, params = {}) => {
 // Basic translations based on HTML templates
 const translations = {
   en: {
     'app.name': 'CleanTrack',
     'app.tagline': 'Airport Cleaning Quality Management',
     'auth.login': 'Login',
     'auth.username': 'Username',
     'auth.password': 'Password',
     'auth.loginButton': 'Sign in',
     'auth.rememberMe': 'Remember me',
     'auth.loginFailed': 'Invalid username or password',
     'auth.demoCredentials': 'Demo Credentials',
     'auth.adminCredentials': 'Admin',
     'auth.staffCredentials': 'Staff',
     'auth.logout': 'Sign out',
     'common.loading': 'Loading...',
     'common.viewAll': 'View all',
     'common.view': 'View',
     'common.edit': 'Edit',
     'common.delete': 'Delete',
     'common.cancel': 'Cancel',
     'common.save': 'Save',
     'common.create': 'Create',
     'common.update': 'Update',
     'common.search': 'Search',
     'common.actions': 'Actions',
     'common.previous': 'Previous',
     'common.next': 'Next',
     'common.allRightsReserved': 'All rights reserved',
     'common.language': 'Language',
     'common.darkMode': 'Dark Mode',
     'common.lightMode': 'Light Mode',
     'common.active': 'Active',
     'common.inactive': 'Inactive',
     'common.backToDashboard': 'Back to Dashboard',
     'dashboard.welcome': `Welcome, ${params.name || 'User'}`,
     'dashboard.stats.total': 'Total Submissions',
     'dashboard.stats.completionRate': 'Avg. Completion Rate',
     'dashboard.stats.locations': 'Locations',
     'dashboard.stats.activeUsers': 'Active Users',
     'dashboard.recentActivity': 'Recent Activity',
     'dashboard.noRecentActivity': 'No recent activity to display',
     'dashboard.locations': 'Locations',
     'dashboard.noLocations': 'No locations available',
     'locations.title': 'Locations',
     'locations.name': 'Name',
     'locations.description': 'Description',
     'locations.status': 'Status',
     'locations.addLocation': 'Add Location',
     'locations.editLocation': 'Edit Location',
     'locations.isActive': 'Active',
     'locations.addNew': 'Add New Location',
     'locations.noLocations': 'No locations available',
     'submissions.title': 'Submissions',
     'submissions.location': 'Location',
     'submissions.staff': 'Staff',
     'submissions.date': 'Date',
     'submissions.completion': 'Completion',
     'submissions.taskRatings': 'Task Ratings',
     'submissions.rating': 'Rating',
     'submissions.notes': 'Notes',
     'submissions.photos': 'Photos',
     'submissions.noSubmissions': 'No submissions found',
     'submissions.noSubmissionsForDate': 'No submissions found for this date',
     'submissions.completionRate': 'Completion Rate',
     'submissions.submittedAt': 'Submitted At',
     'users.title': 'Users',
     'users.user': 'User',
     'users.email': 'Email',
     'users.role': 'Role',
     'users.phone': 'Phone',
     'users.admin': 'Administrator',
     'users.staff': 'Staff Member',
     'users.addNew': 'Add New User',
     'users.addUser': 'Add User',
     'users.editUser': 'Edit User',
     'users.username': 'Username',
     'users.password': 'Password',
     'users.confirmPassword': 'Confirm Password',
     'users.firstName': 'First Name',
     'users.lastName': 'Last Name',
     'users.passwordLeaveEmpty': 'Leave empty to keep current password',
     'users.noUsers': 'No users found',
     'tracker.rating': 'Rating',
     'tracker.notes': 'Notes',
     'tracker.photo': 'Photo',
     'tracker.uploadPhoto': 'Upload Photo',
     'tracker.notesPlaceholder': 'Add any notes or observations here...',
     'tracker.submit': 'Submit',
     'tracker.submitting': 'Submitting...',
     'tracker.complete': 'Complete',
     'tracker.submissionSuccess': 'Submission Successful!',
     'tracker.redirecting': 'Redirecting to dashboard...',
     'nav.dashboard': 'Dashboard',
     'nav.locations': 'Locations',
     'nav.submissions': 'Submissions',
     'nav.users': 'Users',
     'errors.somethingWentWrong': 'Something went wrong. Please try again.',
     'errors.required': 'This field is required',
     'errors.pageNotFound': 'Page Not Found',
     'errors.pageNotFoundDescription': 'Sorry, the page you are looking for does not exist or has been moved.',
     'validation.required': 'This field is required',
     'validation.invalidEmail': 'Please enter a valid email address',
     'validation.passwordLength': 'Password must be at least 8 characters long',
     'validation.passwordMatch': 'Passwords do not match'
   },
   am: {
     'app.name': 'CleanTrack',
     'app.tagline': 'Օդանավակայանի մաքրման որակի կառավարում',
     'auth.login': 'Մուտք',
     'auth.username': 'Օգտանուն',
     'auth.password': 'Գաղտնաբառ',
     'auth.loginButton': 'Մուտք գործել',
     'auth.rememberMe': 'Հիշել ինձ',
     'auth.loginFailed': 'Անվավեր օգտանուն կամ գաղտնաբառ',
     'common.loading': 'Բեռնվում է...',
     'dashboard.welcome': `Բարի գալուստ, ${params.name || 'Օգտատեր'}`,
     'locations.title': 'Վայրեր',
     'submissions.title': 'Ներկայացումներ',
     'users.title': 'Օգտատերեր'
   },
   ru: {
     'app.name': 'CleanTrack',
     'app.tagline': 'Управление качеством уборки аэропорта',
     'auth.login': 'Вход',
     'auth.username': 'Имя пользователя',
     'auth.password': 'Пароль',
     'auth.loginButton': 'Войти',
     'auth.rememberMe': 'Запомнить меня',
     'auth.loginFailed': 'Неверное имя пользователя или пароль',
     'common.loading': 'Загрузка...',
     'dashboard.welcome': `Добро пожаловать, ${params.name || 'Пользователь'}`,
     'locations.title': 'Локации',
     'submissions.title': 'Отчеты',
     'users.title': 'Пользователи'
   }
 };

 // Get translations for the current language
 const langTranslations = translations[language] || translations.en;
 
 // Return translation or key if not found
 return langTranslations[key] || translations.en[key] || key;
};

export const LanguageProvider = ({ children }) => {
 // Get language from localStorage or use English as default
 const [language, setLanguage] = useState(
   localStorage.getItem('language') || 'en'
 );

 // Languages available in the application
 const languages = {
   en: 'English',
   am: 'Հայերեն',
   ru: 'Русский'
 };

 // Update language in localStorage when it changes
 useEffect(() => {
   localStorage.setItem('language', language);
   
   // Update document language attribute
   document.documentElement.lang = language;
 }, [language]);

 // Change language
 const changeLanguage = (lang) => {
   if (languages[lang]) {
     setLanguage(lang);
   }
 };

 // Translation function
 const t = (key, params = {}) => {
   return translate(key, language, params);
 };

 // Value object to be provided by the context
 const value = {
   language,
   languages,
   changeLanguage,
   t
 };

 return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

// Custom hook to use the language context
export const useLanguage = () => {
 const context = useContext(LanguageContext);
 if (!context) {
   throw new Error('useLanguage must be used within a LanguageProvider');
 }
 return context;
};

// Compatibility with react-i18next
export const useTranslation = () => {
 const { t, language, changeLanguage } = useLanguage();
 return { t, i18n: { language, changeLanguage } };
};

export default LanguageContext;