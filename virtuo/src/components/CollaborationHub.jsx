import React, { useState, useEffect, useRef } from 'react';
import { Users, Share2, Copy, Mic, Headphones, MessageSquare, UserPlus, Video, Bell } from 'lucide-react';

// Mock WebRTC/WebSocket implementation - in real implementation, you'd use:
// - WebRTC for peer-to-peer audio/video
// - WebSocket server for signaling and presence
// - Web Audio API for low-latency audio streaming

const COLLABORATION_SERVICES = {
  audio: {
    name: 'Audio Streaming',
    description: 'Share your instrument audio in real-time',
    enabled: false
  },
  video: {
    name: 'Video Chat', 
    description: 'See and hear your collaborators',
    enabled: false
  },
  midi: {
    name: 'MIDI Sync',
    description: 'Sync note data and patterns across sessions',
    enabled: true
  },
  session: {
    name: 'Session Control',
    description: 'Shared transport and arrangement control',
    enabled: true
  }
};

const MOCK_USERS = [
  { id: '1', name: 'You', color: '#8a2be2', instrument: 'Piano', online: true },
  { id: '2', name: 'Alex', color: '#10b981', instrument: 'Drums', online: true },
  { id: '3', name: 'Sam', color: '#3b82f6', instrument: 'Bass', online: false }
];

export default function CollaborationHub() {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [users, setUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [services, setServices] = useState(COLLABORATION_SERVICES);
  const [isSharingAudio, setIsSharingAudio] = useState(false);
  
  const audioStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);

  // Generate session code
  const generateSessionCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  const createSession = async () => {
    const code = generateSessionCode();
    setSessionCode(code);
    setIsConnected(true);
    
    // Mock connection to server
    console.log('Creating collaboration session:', code);
    
    // Simulate other users joining
    setTimeout(() => {
      setUsers(MOCK_USERS);
    }, 1000);
  };

  const joinSession = (code) => {
    if (!code) return;
    
    setSessionCode(code.toUpperCase());
    setIsConnected(true);
    
    // Mock joining existing session
    console.log('Joining session:', code);
    
    setTimeout(() => {
      setUsers(MOCK_USERS);
    }, 1000);
  };

  const leaveSession = () => {
    setIsConnected(false);
    setSessionCode('');
    setUsers([]);
    setChatMessages([]);
    
    if (isSharingAudio) {
      stopAudioSharing();
    }
    
    console.log('Left collaboration session');
  };

  const copySessionCode = () => {
    navigator.clipboard.writeText(sessionCode);
    // Show copied notification
  };

  const toggleService = (serviceId) => {
    setServices(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        enabled: !prev[serviceId].enabled
      }
    }));
  };

  const startAudioSharing = async () => {
    try {
      // In real implementation, this would capture audio from Web Audio API
      // and stream it via WebRTC to other participants
      
      console.log('Starting audio sharing...');
      setIsSharingAudio(true);
      
      // Mock audio stream setup
      audioStreamRef.current = {
        id: 'audio-stream-' + Date.now(),
        active: true
      };
      
    } catch (error) {
      console.error('Failed to start audio sharing:', error);
      setIsSharingAudio(false);
    }
  };

  const stopAudioSharing = () => {
    if (audioStreamRef.current) {
      console.log('Stopping audio sharing...');
      audioStreamRef.current = null;
    }
    setIsSharingAudio(false);
  };

  const sendChatMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now(),
      user: 'You',
      text: newMessage,
      timestamp: new Date(),
      type: 'chat'
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // In real implementation, this would send via WebSocket
    console.log('Sending chat message:', newMessage);
  };

  const syncTransportState = (state) => {
    // Sync play/pause/stop with other users
    console.log('Syncing transport state:', state);
    
    // Broadcast to other users via WebSocket
    if (services.session.enabled) {
      window.dispatchEvent(new CustomEvent('virtuo-collab-transport', {
        detail: state
      }));
    }
  };

  const syncMidiData = (noteData) => {
    // Sync MIDI notes with other users
    if (services.midi.enabled) {
      console.log('Syncing MIDI data:', noteData);
      
      window.dispatchEvent(new CustomEvent('virtuo-collab-midi', {
        detail: noteData
      }));
    }
  };

  // Listen for collaboration events
  useEffect(() => {
    const handleTransportSync = (e) => {
      console.log('Received transport sync:', e.detail);
      // Update local transport state to match
    };

    const handleMidiSync = (e) => {
      console.log('Received MIDI sync:', e.detail);
      // Play received MIDI notes
    };

    window.addEventListener('virtuo-collab-transport', handleTransportSync);
    window.addEventListener('virtuo-collab-midi', handleMidiSync);

    return () => {
      window.removeEventListener('virtuo-collab-transport', handleTransportSync);
      window.removeEventListener('virtuo-collab-midi', handleMidiSync);
    };
  }, []);

  return (
    <div className="glass-panel" style={{ 
      padding: '20px', 
      width: '350px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '15px' 
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <Users size={24} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Collaboration</h3>
      </div>

      {/* Session Management */}
      {!isConnected ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button 
            className="btn-glass" 
            onClick={createSession}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <UserPlus size={16} />
            Create Session
          </button>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Enter session code"
              style={{ 
                flex: 1, 
                padding: '8px 12px', 
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid var(--glass-border)',
                borderRadius: '6px',
                color: 'var(--text-main)',
                fontSize: '0.9rem'
              }}
              onChange={(e) => joinSession(e.target.value)}
            />
            <button 
              className="btn-glass"
              onClick={() => joinSession(sessionCode)}
              style={{ padding: '8px' }}
            >
              Join
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Connected Session */}
          <div style={{ 
            background: 'rgba(0,0,0,0.2)', 
            borderRadius: '8px', 
            padding: '15px',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Session Active</span>
              <span style={{ 
                fontSize: '0.8rem', 
                color: '#22c55e', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px' 
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                Connected
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <code style={{ 
                fontSize: '1.2rem', 
                fontWeight: 'bold', 
                letterSpacing: '2px',
                color: 'var(--accent-primary)'
              }}>
                {sessionCode}
              </code>
              <button 
                className="btn-glass" 
                onClick={copySessionCode}
                style={{ padding: '4px' }}
                title="Copy session code"
              >
                <Copy size={14} />
              </button>
            </div>
            
            <button 
              className="btn-glass" 
              onClick={leaveSession}
              style={{ 
                width: '100%', 
                marginTop: '10px',
                borderColor: '#ef4444',
                color: '#ef4444'
              }}
            >
              Leave Session
            </button>
          </div>

          {/* Online Users */}
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Online Users ({users.filter(u => u.online).length})
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {users.filter(u => u.online).map(user => (
                <div 
                  key={user.id}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '6px',
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  <div 
                    style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      background: user.color 
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{user.name}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.6, marginLeft: 'auto' }}>
                    {user.instrument}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Collaboration Services */}
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Services
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(services).map(([id, service]) => (
                <label 
                  key={id}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '6px',
                    border: '1px solid var(--glass-border)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={service.enabled}
                    onChange={() => toggleService(id)}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>{service.name}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{service.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Audio Sharing */}
          <div>
            <button 
              className={`btn-glass ${isSharingAudio ? 'active' : ''}`}
              onClick={isSharingAudio ? stopAudioSharing : startAudioSharing}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {isSharingAudio ? <Headphones size={16} /> : <Mic size={16} />}
              {isSharingAudio ? ' Stop Sharing Audio' : ' Share Audio'}
            </button>
          </div>

          {/* Chat */}
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Chat
            </h4>
            
            <div style={{ 
              height: '100px', 
              overflowY: 'auto', 
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '6px',
              padding: '8px',
              marginBottom: '8px'
            }}>
              {chatMessages.length === 0 ? (
                <div style={{ 
                  color: 'var(--text-muted)', 
                  fontSize: '0.8rem', 
                  textAlign: 'center',
                  padding: '20px 0'
                }}>
                  No messages yet
                </div>
              ) : (
                chatMessages.map(msg => (
                  <div key={msg.id} style={{ marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#8a2be2' }}>
                      {msg.user}:
                    </span>
                    <span style={{ fontSize: '0.8rem', marginLeft: '6px' }}>
                      {msg.text}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                style={{ 
                  flex: 1, 
                  padding: '6px 10px', 
                  background: 'rgba(255,255,255,0.1)', 
                  border: '1px solid var(--glass-border)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem'
                }}
              />
              <button 
                className="btn-glass"
                onClick={sendChatMessage}
                style={{ padding: '6px' }}
              >
                <MessageSquare size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}