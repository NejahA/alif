import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { userService } from '../services/api';
import './Profile.css';

const Profile = ({ user: initialUser }) => {
  const [user, setUser] = useState(initialUser || authService.getCurrentUser());
  const [profileStats, setProfileStats] = useState({
    totalArticlesRead: 0,
    favoriteLanguage: 'en',
    readingTime: '0 min',
    lastActive: new Date().toISOString(),
    joinedDate: new Date().toISOString()
  });

  const [readingHistory, setReadingHistory] = useState([]);

  useEffect(() => {
    // Fetch fresh profile and stats from backend
    const fetchBackendData = async () => {
      try {
        const profileData = await authService.getProfile();
        if (profileData?.user) {
          setUser(profileData.user);
          if (profileData.user.createdAt) {
            setProfileStats(prev => ({ ...prev, joinedDate: profileData.user.createdAt }));
          }
        }
      } catch (e) {
        console.warn('Could not fetch fresh profile in Profile component:', e);
      }

      try {
        const statsData = await userService.getStats();
        if (statsData) {
          setProfileStats(prev => ({
            ...prev,
            totalArticlesRead: statsData.readingStats?.totalArticlesRead || statsData.totalHistory || prev.totalArticlesRead,
            favoriteLanguage: statsData.readingStats?.favoriteLanguage || prev.favoriteLanguage,
            readingTime: `${statsData.readingStats?.totalReadingTime || 0} min`
          }));
        }
      } catch (e) {
        console.warn('Could not fetch stats in Profile component:', e);
      }
    };

    fetchBackendData();

    // Load user stats from localStorage as fallback
    const savedStats = localStorage.getItem('userProfileStats');
    const savedHistory = localStorage.getItem('articleHistory');

    if (savedStats) {
      try {
        setProfileStats(prev => ({ ...prev, ...JSON.parse(savedStats) }));
      } catch (err) {
        console.error('Error parsing profile stats:', err);
      }
    }

    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setReadingHistory(history.slice(0, 10)); // Show only recent 10
        calculateStatsFromHistory(history);
      } catch (err) {
        console.error('Error parsing history:', err);
      }
    }
  }, []);

  const calculateStatsFromHistory = (history) => {
    if (history.length === 0) return;

    // Calculate favorite language
    const languageCounts = {};
    history.forEach(item => {
      languageCounts[item.language] = (languageCounts[item.language] || 0) + 1;
    });

    let favoriteLanguage = 'en';
    let maxCount = 0;
    Object.entries(languageCounts).forEach(([lang, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteLanguage = lang;
      }
    });

    // Estimate reading time (assuming 3 minutes per article)
    const estimatedReadingTime = Math.round(history.length * 3);

    // Calculate last active date
    const lastActive = history.length > 0 ? history[0].timestamp : new Date().toISOString();

    setProfileStats(prev => ({
      ...prev,
      totalArticlesRead: history.length,
      favoriteLanguage,
      readingTime: `${estimatedReadingTime} min`,
      lastActive
    }));
  };

  const updateStatsInStorage = () => {
    localStorage.setItem('userProfileStats', JSON.stringify(profileStats));
  };

  const getLanguageDisplay = (langCode) => {
    const languageNames = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ru': 'Russian',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'pt': 'Portuguese'
    };
    return languageNames[langCode] || langCode.toUpperCase();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
        <div className="profile-info">
          <h1 className="profile-name">
            {user?.fullName || user?.username || 'User Profile'}
          </h1>
          <p className="profile-email">
            {user?.email || 'wikipedia.translator@example.com'}
          </p>
          <div className="profile-badges">
            <span className="badge">Wikipedia Explorer</span>
            <span className="badge">Polyglot Reader</span>
            <span className="badge">Knowledge Seeker</span>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="stats-section">
          <h2 className="section-title">Your Reading Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <h3 className="stat-title">Articles Read</h3>
                <p className="stat-value">{profileStats.totalArticlesRead}</p>
                <p className="stat-description">Total Wikipedia articles explored</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🌍</div>
              <div className="stat-content">
                <h3 className="stat-title">Favorite Language</h3>
                <p className="stat-value">{getLanguageDisplay(profileStats.favoriteLanguage)}</p>
                <p className="stat-description">Most frequently read in</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <h3 className="stat-title">Reading Time</h3>
                <p className="stat-value">{profileStats.readingTime}</p>
                <p className="stat-description">Estimated total reading time</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3 className="stat-title">Last Active</h3>
                <p className="stat-value">{formatDate(profileStats.lastActive)}</p>
                <p className="stat-description">Last article read</p>
              </div>
            </div>
          </div>
        </div>

        <div className="history-section">
          <div className="section-header">
            <h2 className="section-title">Recent Reading History</h2>
            <a href="/history" className="view-all-link">
              View All →
            </a>
          </div>
          
          {readingHistory.length === 0 ? (
            <div className="empty-history">
              <div className="empty-icon">📜</div>
              <h3>No Recent Articles</h3>
              <p>Start reading Wikipedia articles to build your history</p>
            </div>
          ) : (
            <div className="history-cards">
              {readingHistory.map((item, index) => (
                <div key={item.id} className="history-card">
                  <div className="history-card-header">
                    <h3 className="article-title">{item.title}</h3>
                    <span className="article-language">{item.language.toUpperCase()}</span>
                  </div>
                  <div className="history-card-content">
                    <div className="article-meta">
                      <span className="meta-item">
                        <span className="meta-icon">📅</span>
                        {formatDate(item.timestamp)}
                      </span>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="view-link"
                      >
                        View Article ↗
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="settings-section">
          <h2 className="section-title">Profile Settings</h2>
          <div className="settings-cards">
            <div className="settings-card">
              <h3 className="settings-title">Reading Preferences</h3>
              <div className="settings-content">
                <div className="setting-item">
                  <span className="setting-label">Default Language:</span>
                  <span className="setting-value">Auto-detect</span>
                </div>
                <div className="setting-item">
                  <span className="setting-label">Articles per page:</span>
                  <span className="setting-value">20</span>
                </div>
                <div className="setting-item">
                  <span className="setting-label">Auto-save history:</span>
                  <span className="setting-value">Enabled</span>
                </div>
              </div>
            </div>

            <div className="settings-card">
              <h3 className="settings-title">Account Information</h3>
              <div className="settings-content">
                <div className="setting-item">
                  <span className="setting-label">Member since:</span>
                  <span className="setting-value">{formatDate(profileStats.joinedDate)}</span>
                </div>
                <div className="setting-item">
                  <span className="setting-label">Account type:</span>
                  <span className="setting-value">Free</span>
                </div>
                <div className="setting-item">
                  <span className="setting-label">Data export:</span>
                  <button className="export-btn">Export History</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;