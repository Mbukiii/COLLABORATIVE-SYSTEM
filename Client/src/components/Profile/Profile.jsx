import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faSave, 
  faMoon, 
  faListUl,
  faGrip 
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/UserPreferencesContext';
import './Profile.css';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { preferences, updatePreference } = usePreferences();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePreferenceChange = (key, value) => {
    updatePreference(key, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        return;
      }

      const updateData = {
        username: formData.username,
        email: formData.email
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      await updateProfile(updateData);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    }
  };

  return (
    <div className="profile-page">
      <header className="page-header">
        <h1>Profile Settings</h1>
      </header>

      <div className="profile-content">
        <section className="profile-section">
          <h2>Account Information</h2>
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="username">
                <FontAwesomeIcon icon={faUser} /> Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Required to change password"
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Leave blank to keep current password"
              />
            </div>

            <button type="submit" className="save-button">
              <FontAwesomeIcon icon={faSave} /> Save Changes
            </button>
          </form>
        </section>

        <section className="profile-section">
          <h2>Preferences</h2>
          <div className="preferences-form">
            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faMoon} /> Theme
              </label>
              <select
                value={preferences.theme}
                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faListUl} /> Default Task View
              </label>
              <select
                value={preferences.taskView}
                onChange={(e) => handlePreferenceChange('taskView', e.target.value)}
              >
                <option value="list">List</option>
                <option value="grid">Grid</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faGrip} /> Default Project View
              </label>
              <select
                value={preferences.projectView}
                onChange={(e) => handlePreferenceChange('projectView', e.target.value)}
              >
                <option value="list">List</option>
                <option value="grid">Grid</option>
              </select>
            </div>

            <div className="form-group">
              <label>Default Task Sort</label>
              <select
                value={preferences.defaultTaskSort}
                onChange={(e) => handlePreferenceChange('defaultTaskSort', e.target.value)}
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="createdAt">Created Date</option>
              </select>
            </div>

            <div className="form-group">
              <label>Default Project Sort</label>
              <select
                value={preferences.defaultProjectSort}
                onChange={(e) => handlePreferenceChange('defaultProjectSort', e.target.value)}
              >
                <option value="deadline">Deadline</option>
                <option value="status">Status</option>
                <option value="createdAt">Created Date</option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}