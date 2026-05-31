import { useState, useEffect } from 'react';
import { Users, Share2, Copy, Globe, Lock, Unlock, MessageSquare, UserPlus, Video, Mic as MicIcon } from 'lucide-react';

const CollaborationHub = () => {
  const [sessionCode, setSessionCode] = useState('');
  const [isHosting, setIsHosting] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionVisibility, setSessionVisibility] = useState('public');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);

  const generateSessionCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const startHosting = () => {
    const code = generateSessionCode();
    setSessionCode(code);
    setIsHosting(true);
    
    // Simulate initial users joining
    setTimeout(() => {
      setConnectedUsers([
        { id: 1, name: 'You', role: 'host', color: '#3b82f6' },
        { id: 2, name: 'Alex', role: 'musician', color: '#10b981' },
        { id: 3, name: 'Jordan', role: 'producer', color: '#8b5cf6' }
      ]);
      
      setChatMessages([
        { id: 1, user: 'System', message: 'Session created! Share the code with collaborators.', time: 'Just now' },
        { id: 2, user: 'Alex', message: 'Hey everyone! Ready to jam?', time: 'Just now' },
        { id: 3, user: 'Jordan', message: 'I\'ll handle the drums!', time: 'Just now' }
      ]);
    }, 500);
  };

  const stopHosting = () => {
    setIsHosting(false);
    setSessionCode('');
    setConnectedUsers([]);
    setChatMessages([]);
  };

  const joinSession = () => {
    if (sessionCode && sessionCode.length === 6) {
      setIsHosting(false);
      
      // Simulate joining
      setTimeout(() => {
        setConnectedUsers([
          { id: 1, name: 'Host', role: 'host', color: '#3b82f6' },
          { id: 2, name: 'You', role: 'musician', color: '#f59e0b' },
          { id: 3, name: 'Taylor', role: 'vocalist', color: '#ec4899' },
          { id: 4, name: 'Morgan', role: 'producer', color: '#06b6d4' }
        ]);
        
        setChatMessages([
          { id: 1, user: 'System', message: 'You joined the session!', time: 'Just now' },
          { id: 2, user: 'Host', message: 'Welcome! We\'re working on a synthwave track.', time: '1 min ago' },
          { id: 3, user: 'Taylor', message: 'Nice to have you here!', time: 'Just now' }
        ]);
      }, 500);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: chatMessages.length + 1,
        user: 'You',
        message: newMessage,
        time: 'Just now'
      };
      setChatMessages([...chatMessages, message]);
      setNewMessage('');
    }
  };

  const copySessionCode = () => {
    navigator.clipboard.writeText(sessionCode);
    alert(`Session code ${sessionCode} copied to clipboard!`);
  };

  const inviteUser = () => {
    const inviteLink = `${window.location.origin}/join/${sessionCode}`;
    navigator.clipboard.writeText(inviteLink);
    alert(`Invite link copied: ${inviteLink}`);
  };

  const shareRecording = () => {
    // In a real app, this would upload to cloud and generate shareable link
    alert('Recording would be uploaded and shared with collaborators.');
  };

  return (
    <div className="glass-panel" style={{ padding: '30px', width: '100%', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <Users size={24} color="var(--accent-primary)" />
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Collaboration Hub</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Session Control */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Host Session */}
          <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Globe size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Host Session</h3>
            </div>
            
            {!isHosting ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '10px' }}>Session Visibility</h4>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setSessionVisibility('public')}
                      className={`btn-glass ${sessionVisibility === 'public' ? 'active' : ''}`}
                      style={{ flex: 1, justifyContent: 'center', gap: '8px' }}
                    >
                      <Globe size={14} />
                      Public
                    </button>
                    <button
                      onClick={() => setSessionVisibility('private')}
                      className={`btn-glass ${sessionVisibility === 'private' ? 'active' : ''}`}
                      style={{ flex: 1, justifyContent: 'center', gap: '8px' }}
                    >
                      <Lock size={14} />
                      Private
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    className={`btn-glass ${isAudioEnabled ? 'active' : ''}`}
                    style={{ flex: 1, justifyContent: 'center', gap: '8px' }}
                  >
                    <MicIcon size={14} />
                    {isAudioEnabled ? 'Audio On' : 'Audio Off'}
                  </button>
                  <button
                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                    className={`btn-glass ${isVideoEnabled ? 'active' : ''}`}
                    style={{ flex: 1, justifyContent: 'center', gap: '8px' }}
                  >
                    <Video size={14} />
                    {isVideoEnabled ? 'Video On' : 'Video Off'}
                  </button>
                </div>

                <button
                  onClick={startHosting}
                  className="btn-glass active"
                  style={{ width: '100%', justifyContent: 'center', gap: '10px' }}
                >
                  <Share2 size={16} />
                  Start Hosting Session
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '10px' }}>Session Code</h4>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{
                      padding: '15px 20px',
                      background: 'rgba(var(--accent-primary-rgb), 0.1)',
                      border: '1px solid var(--accent-primary)',
                      borderRadius: '8px',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      letterSpacing: '2px',
                      flex: 1,
                      textAlign: 'center'
                    }}>
                      {sessionCode}
                    </div>
                    <button
                      onClick={copySessionCode}
                      className="btn-glass"
                      style={{ padding: '15px' }}
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={inviteUser}
                    className="btn-glass"
                    style={{ flex: 1, justifyContent: 'center', gap: '8px' }}
                  >
                    <UserPlus size={14} />
                    Invite
                  </button>
                  <button
                    onClick={shareRecording}
                    className="btn-glass"
                    style={{ flex: 1, justifyContent: 'center', gap: '8px' }}
                  >
                    <Share2 size={14} />
                    Share Recording
                  </button>
                  <button
                    onClick={stopHosting}
                    className="btn-glass"
                    style={{ flex: 1, justifyContent: 'center', gap: '8px', borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    End Session
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Join Session */}
          <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={20} color="var(--accent-secondary)" />
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Join Session</h3>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '10px' }}>Enter Session Code</h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  placeholder="ABCDEF"
                  maxLength={6}
                  style={{
                    flex: 1,
                    padding: '15px 20px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    fontSize: '1.2rem',
                    letterSpacing: '2px',
                    textAlign: 'center',
                    textTransform: 'uppercase'
                  }}
                />
                <button
                  onClick={joinSession}
                  disabled={!sessionCode || sessionCode.length !== 6}
                  className="btn-glass active"
                  style={{ padding: '15px 25px' }}
                >
                  Join
                </button>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.5 }}>
              <p>Ask the host for the 6-character session code to join their collaborative music session.</p>
            </div>
          </div>
        </div>

        {/* Connected Users */}
        {(isHosting || sessionCode) && (
          <div className="glass-panel" style={{ padding: '25px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Users size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Connected Users ({connectedUsers.length})</h3>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {connectedUsers.map(user => (
                <div
                  key={user.id}
                  className="glass-panel"
                  style={{
                    padding: '15px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    border: '1px solid',
                    borderColor: user.color,
                    minWidth: '200px'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: user.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{user.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat */}
        {(isHosting || sessionCode) && (
          <div className="glass-panel" style={{ padding: '25px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <MessageSquare size={18} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Session Chat</h3>
            </div>

            <div style={{
              height: '200px',
              overflowY: 'auto',
              marginBottom: '20px',
              padding: '15px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    padding: '10px 15px',
                    background: msg.user === 'You' ? 'rgba(var(--accent-primary-rgb), 0.1)' : 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    borderLeft: `3px solid ${msg.user === 'You' ? 'var(--accent-primary)' : 'var(--accent-secondary)'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{msg.user}</span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{msg.time}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{msg.message}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                style={{
                  flex: 1,
                  padding: '12px 15px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  color: 'var(--text-main)'
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="btn-glass active"
                style={{ padding: '12px 25px' }}
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* Features Info */}
        <div style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.5, textAlign: 'center' }}>
          <p>
            <strong>Real-time collaboration features:</strong> Share session codes for others to join, 
            chat with collaborators, share recordings, and work together on music projects in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CollaborationHub;