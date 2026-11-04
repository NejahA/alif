import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function PomodoroTab() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Session switch
      if (isWorkSession) {
        const nextSessions = sessionsCompleted + 1;
        setSessionsCompleted(nextSessions);
        setIsWorkSession(false);
        setTimeLeft(nextSessions % 4 === 0 ? 15 * 60 : 5 * 60);
      } else {
        setIsWorkSession(true);
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isWorkSession, sessionsCompleted]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isWorkSession ? 25 * 60 : 5 * 60);
  };

  const switchMode = (work: boolean) => {
    setIsRunning(false);
    setIsWorkSession(work);
    setTimeLeft(work ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  const total = isWorkSession ? 25 * 60 : (sessionsCompleted % 4 === 0 && sessionsCompleted > 0 ? 15 * 60 : 5 * 60);
  const progressPercent = ((total - timeLeft) / total) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
      <div className="hero-banner" style={{ width: '100%' }}>
        <h2>⏱️ Focus & Pomodoro Productivity Hub</h2>
        <p>Boost your deep work sessions with interval timing, breaks, and session metrics.</p>
      </div>

      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '28px',
        width: '100%',
        maxWidth: '460px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => switchMode(true)}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              border: isWorkSession ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
              background: isWorkSession ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.4)',
              color: isWorkSession ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px'
            }}
          >
            Deep Focus (25m)
          </button>
          <button
            onClick={() => switchMode(false)}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              border: !isWorkSession ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.08)',
              background: !isWorkSession ? 'rgba(52, 211, 153, 0.15)' : 'rgba(15, 23, 42, 0.4)',
              color: !isWorkSession ? '#34d399' : '#94a3b8',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px'
            }}
          >
            Break (5m)
          </button>
        </div>

        {/* Circular Display */}
        <div style={{
          position: 'relative',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `conic-gradient(${isWorkSession ? '#38bdf8' : '#34d399'} ${progressPercent}%, rgba(255,255,255,0.05) 0)`
        }}>
          <div style={{
            position: 'absolute',
            width: '210px',
            height: '210px',
            borderRadius: '50%',
            background: '#0d1322',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <span style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {isWorkSession ? 'Focus Session' : 'Rest & Recharge'}
            </span>
            <div style={{ fontSize: '52px', fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace' }}>
              {minutes}:{seconds}
            </div>
            <span style={{ fontSize: '12px', color: '#38bdf8' }}>
              Round {sessionsCompleted + 1}
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <button
            onClick={toggleTimer}
            className="btn-primary"
            style={{
              padding: '12px 28px',
              fontSize: '16px',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} />}
            {isRunning ? 'Pause' : 'Start Timer'}
          </button>
          <button
            onClick={resetTimer}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Sessions Indicator */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: i <= (sessionsCompleted % 4) ? '#38bdf8' : 'rgba(255,255,255,0.1)'
              }}
            />
          ))}
          <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '6px' }}>
            {sessionsCompleted} finished
          </span>
        </div>
      </div>
    </div>
  );
}
