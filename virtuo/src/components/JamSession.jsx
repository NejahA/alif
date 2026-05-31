import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mic, Headphones, Video, MessageSquare, Share2, Clock, UserPlus, Star, Volume2, Wifi, Radio, Play, StopCircle, Crown, Music, Zap } from 'lucide-react';

const JamSession = () => {
  const [sessionState, setSessionState] = useState('disconnected');
  const [activeSessions, setActiveSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [audioSettings, setAudioSettings] = useState({
    microphone: true,
    headphones: true,
    latency: 45,
    quality: 'high'
  });
  const [newMessage, setNewMessage] = useState('');

  // Mock data for demonstration
  const mockSessions = [
    {
      id: 'session1',
      name: 'Jazz Improv Night',
      host: 'SarahPiano',
      genre: 'Jazz',
      tempo: 120,
      participants: 4,
      skillLevel: 'Intermediate',
      privacy: 'public',
      bpm: 120
    },
    {
      id: 'session2',
      name: 'Electronic Producers',
      host: 'BeatMakerPro',
      genre: 'Electronic',
      tempo: 128,
      participants: 8,
      skillLevel: 'Advanced',
      privacy: 'public',
      bpm: 128
    },
    {
      id: 'session3',
      name: 'Acoustic Songwriting',
      host: 'GuitarHero',
      genre: 'Folk',
      tempo: 90,
      participants: 3,
      skillLevel: 'Beginner',
      privacy: 'private',
      bpm: 90
    }
  ];

  const mockParticipants = [
    { id: 'user1', name: 'SarahPiano', role: 'host', instrument: 'Piano', online: true, audioLevel: 75 },
    { id: 'user2', name: 'DrumMaster', role: 'participant', instrument: 'Drums', online: true, audioLevel: 60 },
    { id: 'user3', name: 'BassPlayer', role: 'participant', instrument: 'Bass', online: true, audioLevel: 45 },
    { id: 'user4', name: 'Saxophonist', role: 'participant', instrument: 'Saxophone', online: false, audioLevel: 0 }
  ];

  const mockChatMessages = [
    { id: 1, user: 'SarahPiano', message: 'Welcome everyone! Let\'s start with a blues progression', timestamp: '2:30 PM' },
    { id: 2, user: 'DrumMaster', message: 'Ready when you are!', timestamp: '2:31 PM' },
    { id: 3, user: 'BassPlayer', message: 'I\'ll follow the chord changes', timestamp: '2:32 PM' }
  ];

  useEffect(() => {
    // Simulate loading active sessions
    setActiveSessions(mockSessions);
    
    // Simulate connection to a session
    if (sessionState === 'connected') {
      setParticipants(mockParticipants);
      setChatMessages(mockChatMessages);
    }
  }, [sessionState]);

  const joinSession = (session) => {
    setSessionState('connecting');
    setCurrentSession(session);
    
    // Simulate connection process
    setTimeout(() => {
      setSessionState('connected');
      
      // Add welcome message
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          user: 'System',
          message: `You joined ${session.name}`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }, 2000);
  };

  const leaveSession = () => {
    setSessionState('disconnecting');
    
    // Simulate disconnection process
    setTimeout(() => {
      setSessionState('disconnected');
      setCurrentSession(null);
      setParticipants([]);
      setChatMessages([]);
    }, 1000);
  };

  const createSession = () => {
    const newSession = {
      id: `session${Date.now()}`,
      name: 'My Jam Session',
      host: 'You',
      genre: 'Custom',
      tempo: 120,
      participants: 1,
      skillLevel: 'Any',
      privacy: 'public',
      bpm: 120
    };
    
    setSessionState('creating');
    setCurrentSession(newSession);
    
    setTimeout(() => {
      setSessionState('connected');
      setParticipants([
        { id: 'you', name: 'You', role: 'host', instrument: 'Host', online: true, audioLevel: 50 }
      ]);
      
      setChatMessages([
        {
          id: Date.now(),
          user: 'System',
          message: 'Session created! Share the link to invite others',
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }, 1500);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        user: 'You',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const toggleAudioSetting = (setting) => {
    setAudioSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const getSessionStatusColor = () => {
    switch (sessionState) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-blue-400';
      case 'disconnecting': return 'text-yellow-400';
      case 'creating': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getSessionStatusIcon = () => {
    switch (sessionState) {
      case 'connected': return <Wifi className="animate-pulse" />;
      case 'connecting': return <Wifi />;
      case 'disconnecting': return <Wifi />;
      case 'creating': return <Zap className="animate-pulse" />;
      default: return <Wifi />;
    }
  };

  return (
    <div className="p-6 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-600/20 rounded-lg">
            <Users size={24} className="text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Jam Session</h2>
            <p className="text-gray-400 text-sm">Real-time music collaboration</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="flex items-center space-x-2 text-green-400">
              {getSessionStatusIcon()}
              <span className="capitalize">{sessionState}</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-400">
              <Clock size={16} />
              <span className="font-mono">{audioSettings.latency}ms latency</span>
            </div>
          </div>
        </div>
      </div>

      {/* Session Browser */}
      {sessionState === 'disconnected' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Active Sessions</h3>
            <span className="text-sm text-gray-400">{activeSessions.length} available</span>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {activeSessions.map((session) => (
              <motion.div
                key={session.id}
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-gray-800/40 hover:bg-gray-800/60 rounded-xl border border-gray-700/30 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-white">{session.name}</h4>
                    <p className="text-sm text-gray-400">Hosted by {session.host}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-yellow-400">
                    <Star size={14} />
                    <span className="text-sm">{session.skillLevel}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4 text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Music size={14} />
                      <span>{session.genre}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap size={14} />
                      <span>{session.bpm} BPM</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users size={14} />
                      <span>{session.participants}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => joinSession(session)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Join
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Create Session Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createSession}
            className="w-full mt-4 p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/30 rounded-xl text-purple-400 font-medium transition-all"
          >
            <div className="flex items-center justify-center space-x-2">
              <Zap size={20} />
              <span>Create New Session</span>
            </div>
          </motion.button>
        </motion.div>
      )}

      {/* Current Session */}
      {currentSession && sessionState !== 'disconnected' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/30"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-medium text-white">{currentSession.name}</h3>
              <p className="text-sm text-gray-400">
                {sessionState === 'connected' && 'Live session - ' + participants.length + ' participants'}
                {sessionState === 'connecting' && 'Connecting to session...'}
                {sessionState === 'creating' && 'Creating session...'}
              </p>
            </div>
            
            {sessionState === 'connected' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {}}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  title="Invite Participants"
                >
                  <UserPlus size={16} />
                </button>
                <button
                  onClick={() => {}}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  title="Share Session"
                >
                  <Share2 size={16} />
                </button>
                <button
                  onClick={leaveSession}
                  className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                  title="Leave Session"
                >
                  <StopCircle size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Audio Settings */}
          {sessionState === 'connected' && (
            <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-700/30">
              <button
                onClick={() => toggleAudioSetting('microphone')}
                className={`p-2 rounded-lg transition-colors ${
                  audioSettings.microphone
                    ? 'bg-green-600/20 text-green-400'
                    : 'bg-gray-700 text-gray-400'
                }`}
                title="Microphone"
              >
                <Mic size={18} />
              </button>
              
              <button
                onClick={() => toggleAudioSetting('headphones')}
                className={`p-2 rounded-lg transition-colors ${
                  audioSettings.headphones
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'bg-gray-700 text-gray-400'
                }`}
                title="Headphones"
              >
                <Headphones size={18} />
              </button>
              
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>Latency: {audioSettings.latency}ms</span>
                  <span className="text-green-400">Good</span>
                </div>
                <div className="w-full h-1 bg-gray-700 rounded-full">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${100 - (audioSettings.latency / 100) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Participants Grid */}
      {sessionState === 'connected' && participants.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <h4 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
            <Users size={20} className="text-blue-400" />
            <span>Participants ({participants.length})</span>
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {participants.map((participant) => (
              <motion.div
                key={participant.id}
                whileHover={{ scale: 1.02 }}
                className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/30"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      participant.online ? 'bg-green-400' : 'bg-gray-400'
                    }`}
                  />
                  <span className="text-sm font-medium text-white truncate">
                    {participant.name}
                  </span>
                  {participant.role === 'host' && (
                    <Crown size={12} className="text-yellow-400" />
                  )}
                </div>
                
                <div className="text-xs text-gray-400 mb-2">
                  {participant.instrument}
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-2 bg-gray-700 rounded-full">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${participant.audioLevel}%` }}
                    />
                  </div>
                  <Volume2 size={10} className="text-green-400" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Chat Interface */}
      {sessionState === 'connected' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800/30 rounded-xl p-4"
        >
          <h4 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
            <MessageSquare size={20} className="text-purple-400" />
            <span>Session Chat</span>
          </h4>
          
          {/* Chat Messages */}
          <div className="h-32 overflow-y-auto mb-3 space-y-2">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <span className="font-medium text-blue-300">{msg.user}: </span>
                <span className="text-gray-300">{msg.message}</span>
                <span className="text-xs text-gray-500 ml-2">{msg.timestamp}</span>
              </div>
            ))}
          </div>
          
          {/* Message Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
            >
              Send
            </button>
          </div>
        </motion.div>
      )}

      {/* Recording Controls */}
      {sessionState === 'connected' && (
        <div className="mt-6 pt-4 border-t border-gray-700/30">
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-colors">
              <Radio size={16} className="inline mr-2" />
              Record Session
            </button>
            
            <button className="px-4 py-2 bg-gray-700/50 text-gray-300 border border-gray-600/30 rounded-lg text-sm font-medium hover:bg-gray-700/70 transition-colors">
              <Video size={16} className="inline mr-2" />
              Video Chat
            </button>
            
            <button className="px-4 py-2 bg-gray-700/50 text-gray-300 border border-gray-600/30 rounded-lg text-sm font-medium hover:bg-gray-700/70 transition-colors">
              <Play size={16} className="inline mr-2" />
              Metronome
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JamSession;