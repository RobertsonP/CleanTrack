// frontend/src/components/layout/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Globe, 
  LogOut, 
  LayoutDashboard, 
  MapPin, 
  ClipboardList, 
  Users,
  Moon,
  Sun,
  ChevronDown,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import locationService from '../../services/locationService';

const DashboardLayout = ({ children }) => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { language, languages, changeLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );
  const [locations, setLocations] = useState([]);

  // Fetch locations for the dropdown
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await locationService.getAllLocations();
        setLocations(response.results || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLocations([]);
      }
    };
    
    fetchLocations();
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Apply dark mode on component mount
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Navigation items
  const navItems = [
    {
      path: '/dashboard',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
      requireAdmin: false
    },
    {
      path: '/locations',
      label: t('nav.locations'),
      icon: MapPin,
      requireAdmin: true
    },
    {
      path: '/submissions',
      label: t('nav.submissions'),
      icon: ClipboardList,
      requireAdmin: false
    },
    {
      path: '/users',
      label: t('nav.users'),
      icon: Users,
      requireAdmin: true
    }
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(
    item => !item.requireAdmin || (user && user.role === 'admin')
  );

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and mobile menu button */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="font-bold text-xl text-blue-600 dark:text-blue-400">
                  {t('app.name')}
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === item.path
                        ? 'border-blue-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-1" />
                    {item.label}
                  </Link>
                ))}

                {/* Create Dropdown */}
                <div className="relative inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-gray-300 cursor-pointer group">
                  <div 
                    className="flex items-center"
                    onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t('nav.create')}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </div>
                  
                  {/* Dropdown Menu */}
                  {locationDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-56 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        {user?.role === 'admin' && (
                          <Link
                            to="/locations/new"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                            role="menuitem"
                            onClick={() => setLocationDropdownOpen(false)}
                          >
                            <MapPin className="h-4 w-4 inline mr-2" />
                            {t('locations.addNew')}
                          </Link>
                        )}
                        
                        {/* Divider if both options are visible */}
                        {user?.role === 'admin' && (
                          <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>
                        )}

                        <div className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                          {t('submissions.createNew')}
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto">
                          {locations && locations.length > 0 ? (
                            locations.map(loc => (
                              <Link
                                key={loc.id}
                                to={`/tracker/${loc.id}`}
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 pl-8"
                                role="menuitem"
                                onClick={() => setLocationDropdownOpen(false)}
                              >
                                {loc.name}
                              </Link>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 pl-8">
                              {user?.role === 'admin' ? (
                                <Link 
                                  to="/locations/new"
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
                                  onClick={() => setLocationDropdownOpen(false)}
                                >
                                  {t('locations.createFirst')}
                                </Link>
                              ) : (
                                <Link 
                                  to="/submissions/create"
                                  className="text-gray-500 dark:text-gray-400"
                                  onClick={() => setLocationDropdownOpen(false)}
                                >
                                  {t('submissions.noLocations')}
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden flex items-center">
              <button
                type="button"
                className="bg-white dark:bg-gray-800 p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Right navigation items */}
            <div className="hidden sm:flex sm:items-center sm:ml-6 space-x-4">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* Language Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                >
                  <Globe className="h-5 w-5 mr-1" />
                  <span>{languages[language]}</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                
                {/* Language dropdown menu */}
                {langDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                      {Object.entries(languages).map(([code, name]) => (
                        <button
                          key={code}
                          className={`w-full text-left block px-4 py-2 text-sm ${
                            language === code
                              ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white'
                              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                          onClick={() => {
                            changeLanguage(code);
                            setLangDropdownOpen(false);
                          }}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {user?.username?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                  <span className="ml-2">{user?.username || 'User'}</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                
                {/* User dropdown menu */}
                {userDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                      <div className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">
                        <div className="font-medium">{user?.username || 'User'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user?.role === 'admin' ? t('users.admin') : t('users.staff')}
                        </div>
                      </div>
                      <button
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-600"
                        onClick={handleLogout}
                      >
                        <div className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2" />
                          {t('auth.logout')}
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    location.pathname === item.path
                      ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gray-700'
                      : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.label}
                  </div>
                </Link>
              ))}
              
              {/* Mobile create new submission */}
              <div className="block pl-3 pr-4 py-2 border-l-4 border-transparent">
                <div className="flex items-center justify-between">
                  <div className="text-gray-600 dark:text-gray-300 flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    {t('nav.create')}
                  </div>
                  <button 
                    onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                    className="p-1"
                  >
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${locationDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                {locationDropdownOpen && (
                  <div className="mt-2 space-y-1 pl-7">
                    {user?.role === 'admin' && (
                      <Link
                        to="/locations/new"
                        className="block py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        onClick={() => {
                          setLocationDropdownOpen(false);
                          setMobileMenuOpen(false);
                        }}
                      >
                        {t('locations.addNew')}
                      </Link>
                    )}
                    
                    <div className="py-1 text-gray-600 dark:text-gray-300">
                      {t('submissions.createNew')}:
                    </div>
                    
                    <div className="max-h-40 overflow-y-auto">
                      {locations && locations.length > 0 ? (
                        locations.map(loc => (
                          <Link
                            key={loc.id}
                            to={`/tracker/${loc.id}`}
                            className="block py-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white pl-4"
                            onClick={() => {
                              setLocationDropdownOpen(false);
                              setMobileMenuOpen(false);
                            }}
                          >
                            {loc.name}
                          </Link>
                        ))
                      ) : (
                        <div className="pl-4 py-1 text-gray-500 dark:text-gray-400 italic">
                          {user?.role === 'admin' ? (
                            <Link 
                              to="/locations/new"
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
                              onClick={() => {
                                setLocationDropdownOpen(false);
                                setMobileMenuOpen(false);
                              }}
                            >
                              {t('locations.createFirst')}
                            </Link>
                          ) : (
                            t('submissions.noLocations')
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Mobile language selector */}
              <div className="pl-3 pr-4 py-2 border-l-4 border-transparent">
                <div className="flex justify-between items-center">
                  <div className="text-gray-600 dark:text-gray-300 flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    {t('common.language')}
                  </div>
                  <select
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm px-2 py-1"
                  >
                    {Object.entries(languages).map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Mobile theme toggle */}
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 dark:text-gray-300"
              >
                <div className="flex items-center">
                  {darkMode ? (
                    <Sun className="h-5 w-5 mr-2" />
                  ) : (
                    <Moon className="h-5 w-5 mr-2" />
                  )}
                  {darkMode ? t('common.lightMode') : t('common.darkMode')}
                </div>
                <div className={`w-10 h-5 rounded-full relative ${darkMode ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </button>
              
              {/* Mobile logout button */}
              <button
                className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={handleLogout}
              >
                <div className="flex items-center">
                  <LogOut className="h-5 w-5 mr-2" />
                  {t('auth.logout')}
                </div>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} {t('app.name')}. {t('common.allRightsReserved')}
          </div>
          <div className="mt-2 sm:mt-0 text-sm text-gray-500 dark:text-gray-400">
            {t('app.tagline')}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;