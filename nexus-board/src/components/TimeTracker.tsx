import { useState, useEffect } from 'react';

interface TimeTrackerProps {
  taskId: string;
  estimatedHours?: number;
  actualHours?: number;
  onStartTracking: () => void;
  onStopTracking: (hours: number) => void;
  onUpdateEstimate: (hours: number) => void;
}

const TimeTracker = ({ 
  taskId, 
  estimatedHours = 0, 
  actualHours = 0,
  onStartTracking, 
  onStopTracking,
  onUpdateEstimate 
}: TimeTrackerProps) => {
  const [isTracking, setIsTracking] = useState(false);
  const [trackingTime, setTrackingTime] = useState(0);
  const [showEstimateInput, setShowEstimateInput] = useState(false);
  const [newEstimate, setNewEstimate] = useState(estimatedHours.toString());

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking) {
      interval = setInterval(() => {
        setTrackingTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking]);

  const handleStartTracking = () => {
    setIsTracking(true);
    onStartTracking();
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    const trackedHours = trackingTime / 3600; // Convert seconds to hours
    onStopTracking(trackedHours);
    setTrackingTime(0);
  };

  const handleSaveEstimate = () => {
    const hours = parseFloat(newEstimate);
    if (!isNaN(hours) && hours >= 0) {
      onUpdateEstimate(hours);
      setShowEstimateInput(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatHours = (hours: number) => {
    if (hours === 0) return '0h';
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours % 1 === 0) return `${hours}h`;
    return `${hours.toFixed(1)}h`;
  };

  const progress = estimatedHours > 0 ? Math.min((actualHours / estimatedHours) * 100, 100) : 0;

  return (
    <div className="time-tracker">
      <div className="time-tracker-header">
        <h4 className="time-tracker-title">Time Tracking</h4>
        <div className="time-tracker-stats">
          <div className="time-stat">
            <span className="stat-label">Estimated</span>
            <span className="stat-value">{formatHours(estimatedHours)}</span>
          </div>
          <div className="time-stat">
            <span className="stat-label">Actual</span>
            <span className="stat-value">{formatHours(actualHours)}</span>
          </div>
          {estimatedHours > 0 && (
            <div className="time-stat">
              <span className="stat-label">Progress</span>
              <span className="stat-value">{progress.toFixed(0)}%</span>
            </div>
          )}
        </div>
      </div>

      {estimatedHours > 0 && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          <div className="progress-labels">
            <span>0h</span>
            <span>{formatHours(estimatedHours)}</span>
          </div>
        </div>
      )}

      <div className="tracking-controls">
        {isTracking ? (
          <div className="tracking-active">
            <div className="tracking-timer">
              <span className="timer-label">Tracking:</span>
              <span className="timer-value">{formatTime(trackingTime)}</span>
            </div>
            <button 
              className="btn-primary btn-sm"
              onClick={handleStopTracking}
            >
              Stop Tracking
            </button>
          </div>
        ) : (
          <div className="tracking-inactive">
            <button 
              className="btn-primary btn-sm"
              onClick={handleStartTracking}
            >
              Start Tracking
            </button>
            <button 
              className="btn-secondary btn-sm"
              onClick={() => setShowEstimateInput(true)}
            >
              Set Estimate
            </button>
          </div>
        )}
      </div>

      {showEstimateInput && (
        <div className="estimate-input">
          <div className="input-group">
            <input
              type="number"
              value={newEstimate}
              onChange={(e) => setNewEstimate(e.target.value)}
              placeholder="Estimated hours"
              min="0"
              step="0.5"
            />
            <span className="input-suffix">hours</span>
          </div>
          <div className="input-actions">
            <button 
              className="btn-secondary btn-sm"
              onClick={() => setShowEstimateInput(false)}
            >
              Cancel
            </button>
            <button 
              className="btn-primary btn-sm"
              onClick={handleSaveEstimate}
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="time-suggestions">
        <div className="suggestion-title">Common Estimates:</div>
        <div className="suggestion-buttons">
          {[0.5, 1, 2, 4, 8].map(hours => (
            <button
              key={hours}
              className="btn-secondary btn-sm"
              onClick={() => {
                setNewEstimate(hours.toString());
                onUpdateEstimate(hours);
              }}
            >
              {formatHours(hours)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;