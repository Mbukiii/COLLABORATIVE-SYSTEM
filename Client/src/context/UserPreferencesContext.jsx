import { createContext, useContext, useState, useEffect } from 'react';

const UserPreferencesContext = createContext();

const defaultPreferences = {
  theme: 'system', // 'light', 'dark', or 'system'
  taskView: 'list', // 'list' or 'grid'
  projectView: 'list', // 'list' or 'grid'
  defaultTaskSort: 'dueDate', // 'dueDate', 'priority', 'createdAt'
  defaultProjectSort: 'createdAt', // 'createdAt', 'deadline', 'status'
  sidebarCollapsed: false,
};

export const UserPreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(() => {
    const savedPrefs = localStorage.getItem('userPreferences');
    return savedPrefs ? JSON.parse(savedPrefs) : defaultPreferences;
  });

  // Monitor system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e) => {
      if (preferences.theme === 'system') {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleThemeChange);
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, [preferences.theme]);

  // Apply theme changes
  useEffect(() => {
    let theme = preferences.theme;
    if (theme === 'system') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
  }, [preferences.theme]);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }, [preferences]);

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleTheme = () => {
    const themeOrder = ['light', 'dark', 'system'];
    const currentIndex = themeOrder.indexOf(preferences.theme);
    const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
    updatePreference('theme', nextTheme);
  };

  const toggleView = (type) => {
    if (type === 'task') {
      updatePreference('taskView', preferences.taskView === 'list' ? 'grid' : 'list');
    } else if (type === 'project') {
      updatePreference('projectView', preferences.projectView === 'list' ? 'grid' : 'list');
    }
  };

  const toggleSidebar = () => {
    updatePreference('sidebarCollapsed', !preferences.sidebarCollapsed);
  };

  const updateSort = (type, value) => {
    if (type === 'task') {
      updatePreference('defaultTaskSort', value);
    } else if (type === 'project') {
      updatePreference('defaultProjectSort', value);
    }
  };

  const value = {
    preferences,
    updatePreference,
    toggleTheme,
    toggleView,
    toggleSidebar,
    updateSort
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a UserPreferencesProvider');
  }
  return context;
};