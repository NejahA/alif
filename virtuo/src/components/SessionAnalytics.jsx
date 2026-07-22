import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, TrendingUp, Clock, Activity, Music, Zap, Target, Brain, Heart, Sparkles } from 'lucide-react';

const SessionAnalytics = () => {
  const [sessionTime, setSessionTime] = useState(0);
  const [noteCount, setNoteCount] = useState(0);
  const [noteHistory, setNoteHistory] = useState([]);
  const [velocityAvg, setVelocityAvg] = useState(0);
  const [pitchSpread, setPitchSpread] = useState(0);
  const [rhythmComplexity, setRhythmComplexity] = useState(0);
  const [genreProfile, setGenreProfile] = useState({
    classical: 0.3,
    jazz: 0.2,
    electronic: 0.35,
    ambient: 0.15
  });
  const [energyLevel, setEnergyLevel] = useState(0.5);
  const [density, setDensity] = useState(0.3);
  const [insights, setInsights] = useState([]);
  const [activeView, setActiveView] = useState('overview');
  const [isTracking, setIsTracking] = useState(false);
  const intervalRef = useRef(null);
  const noteCountRef = useRef(0);
  const velocitiesRef = useRef([]);
  const pitchHistoryRef = useRef([]);

  useEffect(() => {
    const handleMidiOn = (e) => {
      if (!isTracking) return;
      const { note, velocity } = e.detail;
      
      noteCountRef.current += 1;
      setNoteCount(noteCountRef.current);
      
      velocitiesRef.current = [...velocitiesRef.current.slice(-99), velocity];
      const avg = velocitiesRef.current.reduce((a, b) => a + b, 0) / velocitiesRef.current.length;
      setVelocityAvg(avg);

      pitchHistoryRef.current = [...pitchHistoryRef.current.slice(-199), { note, time: Date.now() }];
      
      if (pitchHistoryRef.current.length > 1) {
        const pitches = pitchHistoryRef.current.map(p => p.note);
        const min = Math.min(...pitches);
        const max = Math.max(...pitches);
        setPitchSpread(max - min);
      }

      // Calculate rhythm complexity based on timing intervals
      if (pitchHistoryRef.current.length > 10) {
        const times = pitchHistoryRef.current.slice(-20).map(p => p.time);
        const intervals = times.slice(1).map((t, i) => t - times[i]);
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((a, b) => a + (b - avgInterval) ** 2, 0) / intervals.length;
        setRhythmComplexity(Math.min(1, variance / 10000));
      }

      // Energy based on velocity and density
      setDensity(Math.min(1, pitchHistoryRef.current.length / 100));
      setEnergyLevel(Math.min(1, (avg / 127) * 0.7 + density * 0.3));
    };

    window.addEventListener('virtuo-midi-on', handleMidiOn);
    return () => window.removeEventListener('virtuo-midi-on', handleMidiOn);
  }, [isTracking]);

  useEffect(() => {
    if (!isTracking) return;
    intervalRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isTracking]);

  useEffect(() => {
    // Generate insights every 30 seconds
    const insightInterval = setInterval(() => {
      if (!isTracking) return;
      const newInsights = [];
      
      if (noteCount > 50 && velocityAvg > 100) {
        newInsights.push({ text: 'High velocity playing detected - excellent expression!', type: 'positive', icon: '🔥' });
      }
      if (pitchSpread > 40) {
        newInsights.push({ text: 'Wide pitch range - great dynamic exploration!', type: 'positive', icon: '📊' });
      }
      if (rhythmComplexity > 0.7) {
        newInsights.push({ text: 'Complex rhythmic patterns - advanced timing!', type: 'achievement', icon: '🎯' });
      }
      if (noteCount > 200 && sessionTime < 300) {
        newInsights.push({ text: 'High note density - intense session!', type: 'energy', icon: '⚡' });
      }
      if (energyLevel > 0.8) {
        newInsights.push({ text: 'Energy level peaking - great momentum!', type: 'energy', icon: '💥' });
      }
      
      if (newInsights.length > 0) {
        setInsights(prev => [...newInsights.slice(0, 3), ...prev].slice(0, 10));
      }
    }, 30000);
    return () => clearInterval(insightInterval);
  }, [isTracking, noteCount, velocityAvg, pitchSpread, rhythmComplexity, energyLevel, sessionTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderOverview = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            <Clock size={12} /> Session Time
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px' }}>{formatTime(sessionTime)}</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            <Music size={12} /> Notes Played
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px' }}>{noteCount}</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            <Activity size={12} /> Avg Velocity
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px' }}>{velocityAvg.toFixed(0)}</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            <Target size={12} /> Pitch Range
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px' }}>{pitchSpread} semitones</div>
        </div>
      </div>

      {/* Energy & Density Bars */}
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '4px' }}>
            <span>Energy Level</span>
            <span>{(energyLevel * 100).toFixed(0)}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${energyLevel * 100}%`,
              background: energyLevel > 0.7 ? '#ef4444' : energyLevel > 0.4 ? '#f59e0b' : '#22c55e',
              borderRadius: '3px',
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '4px' }}>
            <span>Note Density</span>
            <span>{(density * 100).toFixed(0)}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${density * 100}%`,
              background: '#8b5cf6',
              borderRadius: '3px',
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Rhythm Complexity */}
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '4px' }}>
          <span>Rhythm Complexity</span>
          <span>{(rhythmComplexity * 100).toFixed(0)}%</span>
        </div>
        <div style={{ height: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${rhythmComplexity * 100}%`,
            background: '#ec4899',
            borderRadius: '3px'
          }} />
        </div>
      </div>
    </div>
  );

  const renderGenreProfile = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Genre Profile</div>
      {Object.entries(genreProfile).map(([genre, value]) => (
        <div key={genre}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '3px' }}>
            <span style={{ textTransform: 'capitalize' }}>{genre}</span>
            <span>{(value * 100).toFixed(0)}%</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${value * 100}%`,
              background: genre === 'classical' ? '#3b82f6' : genre === 'jazz' ? '#f59e0b' : genre === 'electronic' ? '#8b5cf6' : '#10b981',
              borderRadius: '2px'
            }} />
          </div>
        </div>
      ))}
    </div>
  );

  const renderInsights = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>
        <Brain size={12} /> Live Insights
      </div>
      {insights.length > 0 ? insights.map((insight, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '6px',
          fontSize: '0.7rem'
        }}>
          <span>{insight.icon}</span>
          <span>{insight.text}</span>
        </div>
      )) : (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
          {isTracking ? 'Waiting for enough data...' : 'Start tracking to see insights'}
        </div>
      )}
    </div>
  );

  return (
    <div className="glass-panel" style={{ padding: '15px', width: '350px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} color="var(--accent-primary)" />
          <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Session Analytics</h4>
        </div>
        <button
          className={`btn-glass ${isTracking ? 'active' : ''}`}
          onClick={() => setIsTracking(!isTracking)}
          style={{ padding: '4px 10px', fontSize: '0.7rem' }}
        >
          {isTracking ? 'Tracking' : 'Track'}
        </button>
      </div>

      {/* View Tabs */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {['overview', 'genre', 'insights'].map(view => (
          <button
            key={view}
            className={`btn-glass ${activeView === view ? 'active' : ''}`}
            onClick={() => setActiveView(view)}
            style={{ padding: '3px 8px', fontSize: '0.65rem', textTransform: 'capitalize' }}
          >
            {view === 'overview' && <Activity size={10} />}
            {view === 'genre' && <TrendingUp size={10} />}
            {view === 'insights' && <Brain size={10} />}
            {' '}{view}
          </button>
        ))}
      </div>

      {!isTracking ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <Sparkles size={32} style={{ opacity: 0.3, marginBottom: '10px' }} />
          <div>Start tracking to analyze</div>
          <div style={{ fontSize: '0.7rem', marginTop: '4px' }}>your performance in real-time</div>
        </div>
      ) : (
        <>
          {activeView === 'overview' && renderOverview()}
          {activeView === 'genre' && renderGenreProfile()}
          {activeView === 'insights' && renderInsights()}
        </>
      )}
    </div>
  );
};

export default SessionAnalytics;