import React, { useState, useEffect } from 'react';
import './HistoryPage.css';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('articleHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory);
      } catch (err) {
        console.error('Error parsing history:', err);
      }
    }
  }, []);

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      setHistory([]);
      localStorage.removeItem('articleHistory');
    }
  };

  const removeFromHistory = (id) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('articleHistory', JSON.stringify(updatedHistory));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      full: date.toISOString()
    };
  };

  const filterHistory = () => {
    const now = new Date();
    const filtered = history.filter(item => {
      const itemDate = new Date(item.timestamp);
      
      // Apply time filter
      if (filter === 'today') {
        const isToday = itemDate.toDateString() === now.toDateString();
        if (!isToday) return false;
      } else if (filter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (itemDate < weekAgo) return false;
      } else if (filter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (itemDate < monthAgo) return false;
      }
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return item.title.toLowerCase().includes(searchLower) || 
               item.language.toLowerCase().includes(searchLower);
      }
      
      return true;
    });
    
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const filteredHistory = filterHistory();

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

  return (
    <div className="history-page">
      <div className="history-page-header">
        <h1 className="history-page-title">Reading History</h1>
        <p className="history-page-subtitle">
          View and manage your recently read Wikipedia articles
        </p>
      </div>

      <div className="history-controls">
        <div className="history-filters">
          <div className="filter-group">
            <label className="filter-label">Time Period:</label>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Time
              </button>
              <button 
                className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
                onClick={() => setFilter('today')}
              >
                Today
              </button>
              <button 
                className={`filter-btn ${filter === 'week' ? 'active' : ''}`}
                onClick={() => setFilter('week')}
              >
                Last Week
              </button>
              <button 
                className={`filter-btn ${filter === 'month' ? 'active' : ''}`}
                onClick={() => setFilter('month')}
              >
                Last Month
              </button>
            </div>
          </div>

          <div className="search-group">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in history..."
              className="history-search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="history-stats">
          <div className="stat-item">
            <span className="stat-label">Total Articles:</span>
            <span className="stat-value">{history.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Showing:</span>
            <span className="stat-value">{filteredHistory.length}</span>
          </div>
          {history.length > 0 && (
            <button className="btn btn-danger" onClick={clearHistory}>
              Clear All History
            </button>
          )}
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="history-empty-state">
          <div className="empty-icon">📜</div>
          <h3>No History Found</h3>
          <p>
            {history.length === 0 
              ? "You haven't read any articles yet. Start searching for Wikipedia articles to build your reading history."
              : "No articles match your current filters. Try changing your search or time period."
            }
          </p>
        </div>
      ) : (
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Article Title</th>
                <th>Language</th>
                <th>Date Viewed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item) => {
                const formattedDate = formatDate(item.timestamp);
                return (
                  <tr key={item.id} className="history-row">
                    <td className="history-cell-title">
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="article-link"
                      >
                        {item.title}
                      </a>
                    </td>
                    <td className="history-cell-language">
                      <span className="language-tag">
                        {getLanguageDisplay(item.language)}
                      </span>
                    </td>
                    <td className="history-cell-date">
                      <div className="date-display">
                        <span className="date">{formattedDate.date}</span>
                        <span className="time">{formattedDate.time}</span>
                      </div>
                    </td>
                    <td className="history-cell-actions">
                      <div className="action-buttons">
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-view"
                          title="View on Wikipedia"
                        >
                          View ↗
                        </a>
                        <button 
                          className="btn-remove"
                          onClick={() => removeFromHistory(item.id)}
                          title="Remove from history"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;