import React, { useState, useEffect } from 'react';
import './HistoryPanel.css';

const HistoryPanel = ({ article, selectedLanguage }) => {
  const [history, setHistory] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('articleHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (err) {
        console.error('Error parsing history:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (article && article.title) {
      // Add current article to history
      const historyItem = {
        id: Date.now(),
        title: article.title,
        language: selectedLanguage,
        timestamp: new Date().toISOString(),
        url: `https://${selectedLanguage}.wikipedia.org/wiki/${encodeURIComponent(article.title)}`
      };

      // Update history (keep only last 20 items)
      const updatedHistory = [historyItem, ...history.filter(item => 
        item.title !== article.title || item.language !== selectedLanguage
      )].slice(0, 20);

      setHistory(updatedHistory);
      localStorage.setItem('articleHistory', JSON.stringify(updatedHistory));
    }
  }, [article, selectedLanguage]);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('articleHistory');
  };

  const removeFromHistory = (id) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('articleHistory', JSON.stringify(updatedHistory));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="history-panel">
      <div className="history-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3 className="history-title">
          <span className="history-icon">📜</span>
          Reading History
          <span className="history-count">({history.length})</span>
        </h3>
        <button className="history-toggle">
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="history-content">
          {history.length === 0 ? (
            <div className="history-empty">
              <p>No articles viewed yet</p>
              <p className="history-empty-sub">Your reading history will appear here</p>
            </div>
          ) : (
            <>
              <div className="history-list">
                {history.map((item) => (
                  <div key={item.id} className="history-item">
                    <div className="history-item-content">
                      <h4 className="history-item-title">{item.title}</h4>
                      <div className="history-item-meta">
                        <span className="history-item-language">{item.language}</span>
                        <span className="history-item-time">{formatDate(item.timestamp)}</span>
                      </div>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="history-item-link"
                      >
                        View on Wikipedia ↗
                      </a>
                    </div>
                    <button 
                      className="history-item-remove"
                      onClick={() => removeFromHistory(item.id)}
                      title="Remove from history"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="history-actions">
                <button className="btn btn-secondary" onClick={clearHistory}>
                  Clear All History
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;