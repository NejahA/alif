import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const MODES = {
  focus: { label: 'Focus', duration: 25, color: '#e74c3c' },
  short: { label: 'Short Break', duration: 5, color: '#2ecc71' },
  long: { label: 'Long Break', duration: 15, color: '#3498db' },
};

export default function CreativeTimer() {
  const [mode, setMode] = useLocalStorage('timer-mode', 'focus');
  const [timeLeft, setTimeLeft] = useLocalStorage('timer-time', MODES.focus.duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useLocalStorage('timer-sessions', 0);
  const intervalRef = useRef(null);

  const currentMode = MODES[mode];

  const resetTimer = useCallback((newMode) => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setTimeLeft(MODES[newMode].duration * 60);
  }, [setTimeLeft]);

  const switchMode = useCallback((newMode) => {
    setMode(newMode);
    resetTimer(newMode);
  }, [setMode, resetTimer]);

  const toggleTimer = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const skipSession = useCallback(() => {
    resetTimer(mode);
  }, [mode, resetTimer]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            // Play notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Time is up!', { body: `${currentMode.label} session complete.` });
            }
            // Auto-switch modes
            const nextMode = mode === 'focus' ? 'short' : 'focus';
            setMode(nextMode);
            return MODES[nextMode].duration * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode, currentMode.label, setTimeLeft, setMode]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / (currentMode.duration * 60);

  return (
    <div className="feature-card timer-card">
      <div className="card-header">
        <h2>⏱ Creative Timer</h2>
        <p className="card-subtitle">Focus sessions with Pomodoro technique.</p>
      </div>

      <div className="timer-modes">
        {Object.entries(MODES).map(([key, m]) => (
          <button
            key={key}
            className={`mode-btn ${mode === key ? 'active' : ''}`}
            style={{ '--mode-color': m.color }}
            onClick={() => switchMode(key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="timer-display" style={{ '--progress': progress, '--mode-color': currentMode.color }}>
        <svg className="timer-ring" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" className="ring-bg" />
          <circle
            cx="100" cy="100" r="90"
            className="ring-progress"
            style={{ strokeDashoffset: 565.48 * (1 - progress) }}
          />
        </svg>
        <div className="timer-time">
          <span className="time-value">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
          <span className="time-label">{currentMode.label}</span>
        </div>
      </div>

      <div className="timer-controls">
        <button className="btn primary" onClick={toggleTimer}>
          {isRunning ? '⏸ Pause' : '▶ Start'}
        </button>
        <button className="btn secondary" onClick={skipSession}>
          ⏭ Skip
        </button>
      </div>

      <div className="timer-stats">
        <span>Completed sessions: <strong>{sessions}</strong></span>
      </div>
    </div>
  );
}