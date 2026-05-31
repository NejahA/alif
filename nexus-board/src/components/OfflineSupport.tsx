import { useState, useEffect } from 'react';

interface OfflineSupportProps {
  onSync: () => void;
  onRetry: () => void;
}

const OfflineSupport = ({ onSync, onRetry }: OfflineSupportProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [pendingChanges, setPendingChanges] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineModal(false);
      
      // Auto-sync when coming back online
      if (pendingChanges > 0) {
        handleSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineModal(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    // Simulate pending changes
    const interval = setInterval(() => {
      if (!isOnline && Math.random() > 0.7) {
        setPendingChanges(prev => prev + 1);
      }
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline, pendingChanges]);

  const handleSync = () => {
    setSyncStatus('syncing');
    
    // Simulate sync process
    setTimeout(() => {
      if (Math.random() > 0.1) { // 90% success rate
        setSyncStatus('success');
        setPendingChanges(0);
        setLastSync(new Date());
        onSync();
        
        // Reset success status after 3 seconds
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('error');
        
        // Auto-retry after 5 seconds
        setTimeout(() => {
          if (isOnline) {
            handleSync();
          }
        }, 5000);
      }
    }, 1500);
  };

  const handleRetry = () => {
    setSyncStatus('idle');
    onRetry();
  };

  const formatLastSync = () => {
    if (!lastSync) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return lastSync.toLocaleDateString();
  };

  const getSyncStatusMessage = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing changes...';
      case 'success':
        return 'Changes synced successfully!';
      case 'error':
        return 'Sync failed. Retrying...';
      default:
        return isOnline ? 'Online' : 'Offline';
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return 'var(--accent-danger)';
    if (syncStatus === 'syncing') return 'var(--accent-warning)';
    if (syncStatus === 'success') return 'var(--accent-success)';
    if (syncStatus === 'error') return 'var(--accent-danger)';
    return 'var(--accent-success)';
  };

  return (
    <>
      <div className="offline-status" style={{ color: getStatusColor() }}>
        <div className="status-indicator">
          <div 
            className="status-dot" 
            style={{ backgroundColor: getStatusColor() }}
          ></div>
          <span className="status-text">{getSyncStatusMessage()}</span>
        </div>
        
        {pendingChanges > 0 && (
          <div className="pending-changes">
            <span className="pending-count">{pendingChanges}</span>
            <span className="pending-label">pending</span>
          </div>
        )}
        
        {isOnline && pendingChanges > 0 && syncStatus === 'idle' && (
          <button 
            className="btn-primary btn-sm"
            onClick={handleSync}
            disabled={syncStatus === 'syncing'}
          >
            Sync Now
          </button>
        )}
        
        {syncStatus === 'error' && (
          <button 
            className="btn-secondary btn-sm"
            onClick={handleRetry}
          >
            Retry
          </button>
        )}
      </div>

      {showOfflineModal && (
        <div className="modal-overlay" onClick={() => setShowOfflineModal(false)}>
          <div className="modal-content offline-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <span className="offline-icon">📶</span>
                Offline Mode
              </h2>
              <button className="btn-icon" onClick={() => setShowOfflineModal(false)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="offline-content">
              <div className="offline-status-card">
                <div className="status-icon offline">
                  <svg width="48" height="48" viewBox="0 0 20 20" fill="none">
                    <path d="M2 2L18 18M8 14H12M14 8H8M10 19C14.9706 19 19 14.9706 19 10C19 5.02944 14.9706 1 10 1C5.02944 1 1 5.02944 1 10C1 14.9706 5.02944 19 10 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3>You're Offline</h3>
                <p>Your changes will be saved locally and synced when you're back online.</p>
              </div>

              <div className="offline-features">
                <h4>Available Offline Features:</h4>
                <ul className="features-list">
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Create and edit tasks</span>
                  </li>
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Move tasks between columns</span>
                  </li>
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Add comments and labels</span>
                  </li>
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Filter and search tasks</span>
                  </li>
                  <li className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>View statistics and analytics</span>
                  </li>
                </ul>
              </div>

              <div className="offline-stats">
                <div className="offline-stat">
                  <span className="stat-value">{pendingChanges}</span>
                  <span className="stat-label">Pending Changes</span>
                </div>
                <div className="offline-stat">
                  <span className="stat-value">{formatLastSync()}</span>
                  <span className="stat-label">Last Sync</span>
                </div>
                <div className="offline-stat">
                  <span className="stat-value">Local</span>
                  <span className="stat-label">Storage</span>
                </div>
              </div>

              <div className="offline-tips">
                <h4>Offline Tips:</h4>
                <div className="tips-list">
                  <div className="tip-item">
                    <span className="tip-icon">💾</span>
                    <div className="tip-content">
                      <h5>Auto-save</h5>
                      <p>All changes are automatically saved to your browser's local storage</p>
                    </div>
                  </div>
                  <div className="tip-item">
                    <span className="tip-icon">🔄</span>
                    <div className="tip-content">
                      <h5>Auto-sync</h5>
                      <p>Changes will automatically sync when you reconnect to the internet</p>
                    </div>
                  </div>
                  <div className="tip-item">
                    <span className="tip-icon">⚠️</span>
                    <div className="tip-content">
                      <h5>Conflict Resolution</h5>
                      <p>If conflicts occur during sync, you'll be prompted to resolve them</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowOfflineModal(false)}
              >
                Continue Offline
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  setShowOfflineModal(false);
                  if (isOnline) {
                    handleSync();
                  }
                }}
                disabled={!isOnline}
              >
                {isOnline ? 'Sync Now' : 'Waiting for Connection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline indicator in header */}
      {!isOnline && (
        <div className="offline-banner">
          <div className="banner-content">
            <span className="banner-icon">📶</span>
            <span className="banner-text">You are offline. Working in local mode.</span>
            <button 
              className="btn-secondary btn-sm"
              onClick={() => setShowOfflineModal(true)}
            >
              Details
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OfflineSupport;