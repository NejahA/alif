import { useState } from 'react';
import type { User } from '../types';

interface UserProfileProps {
  user: User;
  onLogout: () => void;
  onUpdateProfile: (updates: Partial<User>) => void;
}

const UserProfile = ({ user, onLogout, onUpdateProfile }: UserProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const handleSave = () => {
    onUpdateProfile({ name, email });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(user.name);
    setEmail(user.email);
    setIsEditing(false);
  };

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <div className="avatar-placeholder">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="profile-edit-form">
            <div className="form-group">
              <label htmlFor="profile-name">Name</label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="profile-actions">
              <button className="btn-primary btn-sm" onClick={handleSave}>
                Save
              </button>
              <button className="btn-secondary btn-sm" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-info">
            <h3 className="profile-name">{user.name}</h3>
            <p className="profile-email">{user.email}</p>
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="stat-value">12</span>
                <span className="stat-label">Tasks</span>
              </div>
              <div className="profile-stat">
                <span className="stat-value">8</span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="profile-stat">
                <span className="stat-value">85%</span>
                <span className="stat-label">Efficiency</span>
              </div>
            </div>
            <div className="profile-actions">
              <button 
                className="btn-secondary btn-sm" 
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
              <button 
                className="btn-secondary btn-sm" 
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="profile-details">
        <div className="detail-section">
          <h4 className="detail-title">Recent Activity</h4>
          <ul className="activity-list">
            <li className="activity-item">
              <span className="activity-text">Completed task "Design System"</span>
              <span className="activity-time">2 hours ago</span>
            </li>
            <li className="activity-item">
              <span className="activity-text">Added comment to "Task Components"</span>
              <span className="activity-time">Yesterday</span>
            </li>
            <li className="activity-item">
              <span className="activity-text">Moved "State Management" to In Progress</span>
              <span className="activity-time">2 days ago</span>
            </li>
          </ul>
        </div>
        
        <div className="detail-section">
          <h4 className="detail-title">Preferences</h4>
          <div className="preferences">
            <div className="preference">
              <span className="preference-label">Email Notifications</span>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="preference">
              <span className="preference-label">Dark Mode</span>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="preference">
              <span className="preference-label">Keyboard Shortcuts</span>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;