import React, { useState, useEffect, useRef } from 'react';
import { Users, MessageSquare, Activity, Bell, UserPlus, Music, Heart, Zap, Share2, Globe } from 'lucide-react';

const CollaborationFeed = () => {
  const [activities, setActivities] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const [filter, setFilter] = useState('all');
  const [onlineUsers, setOnlineUsers] = useState(3);
  const [sessionName, setSessionName] = useState('My Studio Session');
  const activityIdRef = useRef(0);

  const mockUsers = [
    { id: 'u1', name: 'You', color: '#8a2be2', avatar: 'Y' },
    { id: 'u2', name: 'Alex', color: '#10b981', avatar: 'A' },
    { id: 'u3', name: 'Sam', color: '#3b82f6', avatar: 'S' },
    { id: 'u4', name: 'Jordan', color: '#f59e0b', avatar: 'J' },
    { id: 'u5', name: 'Riley', color: '#ec4899', avatar: 'R' },
  ];

  const activityTemplates = [
    { type: 'note', text: '{user} played {note} on {instrument}', icon: '🎵' },
    { type: 'chord', text: '{user} played a {chord} chord', icon: '🎹' },
    { type: 'effect', text: '{user} changed {effect} settings', icon: '⚡' },
    { type: 'tempo', text: '{user} changed tempo to {bpm} BPM', icon: '⏱️' },
    { type: 'join', text: '{user} joined the session', icon: '👋' },
    { type: 'leave', text: '{user} left the session', icon: '👋' },
    { type: 'record', text: '{user} started recording', icon: '🔴' },
    { type: 'save', text: '{user} saved a preset', icon: '💾' },
    { type: 'loop', text: '{user} created a new loop', icon: '🔄' },
    { type: 'mix', text: '{user} adjusted {track} levels', icon: '🎚️' },
  ];

  const instruments = ['Piano', 'Synth', 'Drums', 'Bass', 'Guitar', 'Violin', 'Sampler'];
  const notes = ['C4', 'E4', 'G4', 'A4', 'D5', 'F#4', 'B3'];
  const chords = ['C Major', 'Am', 'G7', 'F Major', 'Dm7', 'Em'];
  const effects = ['Reverb', 'Delay', 'Distortion', 'Filter', 'Compressor', 'Chorus'];
  const tracks = ['Master', 'Drums', 'Bass', 'Synth', 'Vocal', 'FX'];

  const generateActivity = () => {
    const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
    const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    
    let text = template.text
      .replace('{user}', user.name)
      .replace('{note}', notes[Math.floor(Math.random() * notes.length)])
      .replace('{instrument}', instruments[Math.floor(Math.random() * instruments.length)])
      .replace('{chord}', chords[Math.floor(Math.random() * chords.length)])
      .replace('{effect}', effects[Math.floor(Math.random() * effects.length)])
      .replace('{bpm}', String(80 + Math.floor(Math.random() * 80)))
      .replace('{track}', tracks[Math.floor(Math.random() * tracks.length)]);

    return {
      id: activityIdRef.current++,
      user,
      text,
      icon: template.icon,
      type: template.type,
      timestamp: Date.now(),
      isLocal: user.id === 'u1'
    };
  };

  useEffect(() => {
    if (!isLive) return;

    // Generate initial activities
    const initial = Array.from({ length: 5 }, () => generateActivity());
    setActivities(initial);

    // Generate new activities periodically
    const interval = setInterval(() => {
      const newActivity = generateActivity();
      setActivities(prev => [newActivity, ...prev].slice(0, 50));
      
      // Simulate user count changes
      if (Math.random() < 0.1) {
        setOnlineUsers(prev => Math.max(1, Math.min(10, prev + (Math.random() < 0.5 ? 1 : -1))));
      }
    }, 3000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getFilteredActivities = () => {
    if (filter === 'all') return activities;
    if (filter === 'local') return activities.filter(a => a.isLocal);
    return activities.filter(a => a.type === filter);
  };

  const formatTime = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const getFilterCount = (type) => {
    if (type === 'all') return activities.length;
    if (type === 'local') return activities.filter(a => a.isLocal).length;
    return activities.filter(a => a.type === type).length;
  };

  return (
    <div className="glass-panel" style={{ padding: '15px', width: '360px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="var(--accent-primary)" />
          <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Collaboration Feed</h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: '#22c55e' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
            {onlineUsers} online
          </div>
          <button
            className={`btn-glass ${isLive ? 'active' : ''}`}
            onClick={() => setIsLive(!isLive)}
            style={{ padding: '3px 8px', fontSize: '0.6rem' }}
          >
            {isLive ? 'LIVE' : 'Paused'}
          </button>
        </div>
      </div>

      {/* Session Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        <Globe size={12} />
        <input
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.7rem',
            flex: 1,
            outline: 'none'
          }}
        />
      </div>

      {/* Online Users */}
      <div style={{ display: 'flex', gap: '6px', padding: '6px 0' }}>
        {mockUsers.slice(0, onlineUsers).map(user => (
          <div key={user.id} style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: user.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'white',
            cursor: 'pointer',
            position: 'relative'
          }}>
            {user.avatar}
            <div style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22c55e',
              border: '2px solid var(--bg-dark)'
            }} />
          </div>
        ))}
        {onlineUsers > mockUsers.length && (
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.6rem',
            color: 'var(--text-muted)',
            border: '1px solid var(--glass-border)'
          }}>
            +{onlineUsers - mockUsers.length}
          </div>
        )}
        <button style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'rgba(139, 92, 246, 0.2)',
          border: '1px dashed #8b5cf6',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8b5cf6'
        }}>
          <UserPlus size={12} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }} className="no-scrollbar">
        {[
          { id: 'all', label: 'All', icon: <Activity size={10} /> },
          { id: 'local', label: 'You', icon: <UserPlus size={10} /> },
          { id: 'note', label: 'Notes', icon: <Music size={10} /> },
          { id: 'effect', label: 'FX', icon: <Zap size={10} /> },
        ].map(f => (
          <button
            key={f.id}
            className={`btn-glass ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
            style={{ padding: '3px 8px', fontSize: '0.6rem', whiteSpace: 'nowrap' }}
          >
            {f.icon} {f.label} ({getFilterCount(f.id)})
          </button>
        ))}
      </div>

      {/* Activity Feed */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }} className="no-scrollbar">
        {getFilteredActivities().length > 0 ? getFilteredActivities().map((activity) => (
          <div key={activity.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 8px',
            background: activity.isLocal ? 'rgba(139, 92, 246, 0.05)' : 'rgba(0,0,0,0.15)',
            borderRadius: '6px',
            borderLeft: `3px solid ${activity.isLocal ? '#8b5cf6' : 'transparent'}`,
            animation: 'fadeIn 0.3s ease'
          }}>
            <span style={{ fontSize: '0.9rem' }}>{activity.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span style={{ color: activity.user.color, fontWeight: 600 }}>{activity.user.name}</span>
                {activity.text.replace(activity.user.name, '')}
              </div>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {formatTime(activity.timestamp)}
              </div>
            </div>
            {activity.isLocal && (
              <span style={{ fontSize: '0.55rem', color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)', padding: '1px 4px', borderRadius: '3px' }}>
                you
              </span>
            )}
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
            No activities match this filter
          </div>
        )}
      </div>

      {/* Share Button */}
      <button className="btn-glass" style={{ width: '100%', justifyContent: 'center', fontSize: '0.7rem', padding: '6px' }}>
        <Share2 size={12} /> Invite Collaborators
      </button>
    </div>
  );
};

export default CollaborationFeed;