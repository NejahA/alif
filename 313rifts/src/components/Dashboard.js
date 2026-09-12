import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { userService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalArticlesRead: 0,
    totalFavorites: 0,
    favoriteLanguage: 'en',
    accountAge: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setUser(currentUser);
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch fresh user profile from backend
      try {
        const profileResponse = await authService.getProfile();
        if (profileResponse?.user) {
          setUser(profileResponse.user);
        }
      } catch (e) {
        console.warn('Could not fetch fresh profile:', e);
      }

      // Fetch user stats & history from backend
      try {
        const statsData = await userService.getStats();
        setStats({
          totalArticlesRead: statsData.readingStats?.totalArticlesRead || statsData.totalHistory || 0,
          totalFavorites: statsData.totalFavorites || 0,
          favoriteLanguage: statsData.readingStats?.favoriteLanguage || 'en',
          accountAge: statsData.accountAge || 0
        });
      } catch (e) {
        console.warn('Could not fetch backend stats, checking localStorage:', e);
      }

      try {
        const historyData = await userService.getHistory();
        setHistory(historyData.history || []);
      } catch (e) {
        // Fallback to localStorage history
        const savedHistory = localStorage.getItem('articleHistory');
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {user?.fullName || user?.username || 'Explorer'}!</h1>
          <p>Here is what's happening with your 313rifts account today.</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total-items">
            <i className="fas fa-book-open"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalArticlesRead}</h3>
            <p>Articles Read</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active-items">
            <i className="fas fa-heart"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalFavorites}</h3>
            <p>Saved Favorites</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon user-items">
            <i className="fas fa-globe"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.favoriteLanguage.toUpperCase()}</h3>
            <p>Top Language</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon user-role">
            <i className="fas fa-user-shield"></i>
          </div>
          <div className="stat-content">
            <h3>{user?.role ? user.role.toUpperCase() : 'USER'}</h3>
            <p>Role</p>
          </div>
        </div>
      </div>

      {/* Recent Reading History */}
      <div className="recent-items-section">
        <div className="section-header">
          <h2>Recent Articles Read</h2>
          <button onClick={() => navigate('/')} className="btn-create">
            <i className="fas fa-search"></i> Search Wikipedia
          </button>
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <h3>No articles read yet</h3>
            <p>Start searching and translating Wikipedia articles on 313rifts</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Explore Articles
            </button>
          </div>
        ) : (
          <div className="items-table">
            <table>
              <thead>
                <tr>
                  <th>Article Title</th>
                  <th>Language</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 5).map((item, idx) => (
                  <tr key={item.id || item.articleId || idx}>
                    <td>
                      <strong>{item.articleTitle || item.title}</strong>
                    </td>
                    <td>
                      <span className="status-badge status-active">
                        {(item.language || 'en').toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(item.timestamp || Date.now()).toLocaleDateString()}</td>
                    <td>
                      {item.url ? (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-view"
                        >
                          View ↗
                        </a>
                      ) : (
                        <button 
                          onClick={() => navigate('/')}
                          className="btn-view"
                        >
                          Search
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-card" onClick={() => navigate('/profile')}>
            <i className="fas fa-user-edit"></i>
            <span>Edit Profile</span>
          </button>
          <button className="action-card" onClick={() => navigate('/')}>
            <i className="fas fa-search"></i>
            <span>Search Articles</span>
          </button>
          <button className="action-card" onClick={() => navigate('/history')}>
            <i className="fas fa-history"></i>
            <span>View Full History</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;