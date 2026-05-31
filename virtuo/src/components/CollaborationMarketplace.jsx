import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, MessageCircle, Heart, Share2, Download, Play, Square, 
  Clock, TrendingUp, Crown, Star, Plus, Search, Filter, Globe,
  Mic, Headphones, Calendar, Navigation, Users as UsersIcon, Award, Trophy, Bell
} from 'lucide-react';

const CollaborationMarketplace = ({ currentUser, onJoinSession, onStartSession }) => {
  const [activeTab, setActiveTab] = useState('sessions');
  const [sessions, setSessions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    genre: '',
    skillLevel: '',
    status: 'open',
    sortBy: 'popularity'
  });

  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [activities, setActivities] = useState([
    { id: 1, user: 'NeonDreamer', type: 'preset_shared', detail: 'Summer Lead Synth', time: '5m ago' },
    { id: 2, user: 'ChillBeats', type: 'jam_started', detail: 'Lo-Fi Chill Hop', time: '12m ago' },
    { id: 3, user: 'SymphonyMaster', type: 'achievement', detail: 'Golden Ear Level 5', time: '20m ago' }
  ]);
  const [newSessionData, setNewSessionData] = useState({
    title: '',
    description: '',
    genre: 'electronic',
    skillLevel: 'intermediate',
    maxParticipants: 4,
    isPublic: true,
    bpm: 120,
    key: 'C major'
  });

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading collaborative sessions
    const mockSessions = [
      {
        id: '1',
        title: 'Synthwave Collaboration',
        host: { id: 'user1', name: 'NeonDreamer', avatar: '🎹', skill: 'expert' },
        description: 'Creating an 80s inspired synthwave track with retro vibes',
        genre: 'synthwave',
        skillLevel: 'intermediate',
        participants: 3,
        maxParticipants: 5,
        bpm: 128,
        key: 'D minor',
        status: 'open',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        popularity: 89,
        tags: ['synth', 'retro', '80s', 'drums'],
        isLive: true
      },
      {
        id: '2',
        title: 'Lofi Study Session',
        host: { id: 'user2', name: 'ChillBeats', avatar: '☕', skill: 'advanced' },
        description: 'Collaborative lofi hip hop session for studying vibes',
        genre: 'lofi',
        skillLevel: 'beginner',
        participants: 2,
        maxParticipants: 4,
        bpm: 85,
        key: 'F major',
        status: 'open',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        popularity: 76,
        tags: ['lofi', 'chill', 'study', 'relax'],
        isLive: false
      },
      {
        id: '3',
        title: 'Orchestral Epic Composition',
        host: { id: 'user3', name: 'SymphonyMaster', avatar: '🎻', skill: 'expert' },
        description: 'Building a cinematic orchestral piece with multiple sections',
        genre: 'orchestral',
        skillLevel: 'advanced',
        participants: 4,
        maxParticipants: 6,
        bpm: 60,
        key: 'C minor',
        status: 'open',
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        popularity: 92,
        tags: ['orchestral', 'cinematic', 'strings', 'brass'],
        isLive: true
      }
    ];

    const mockProjects = [
      {
        id: 'p1',
        title: 'Urban Nights EP',
        creator: { id: 'user4', name: 'CityProducer', avatar: '🏙️', skill: 'advanced' },
        description: '4-track EP featuring urban electronic sounds with hip hop influences',
        genre: 'electronic',
        progress: 75,
        collaborators: 3,
        lookingFor: ['drum programmer', 'vocalist', 'mix engineer'],
        bpm: 110,
        key: 'G minor',
        status: 'active',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        popularity: 84,
        tags: ['ep', 'urban', 'electronic', 'hiphop']
      }
    ];

    const mockCollaborators = [
      {
        id: 'c1',
        name: 'BeatMakerPro',
        avatar: '🥁',
        skill: 'expert',
        specialty: 'drum programming',
        genres: ['hiphop', 'electronic', 'pop'],
        rating: 4.8,
        projects: 12,
        available: true,
        location: 'New York',
        instruments: ['drums', 'percussion', 'sampling']
      }
    ];

    setSessions(mockSessions);
    setProjects(mockProjects);
    setCollaborators(mockCollaborators);
  }, []);

  const genres = [
    'electronic', 'hiphop', 'rock', 'pop', 'jazz', 'classical', 
    'ambient', 'lofi', 'synthwave', 'orchestral', 'world', 'experimental'
  ];

  const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const statusOptions = ['open', 'in-progress', 'completed', 'archived'];

  const joinSession = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session && session.participants < session.maxParticipants) {
      if (onJoinSession) {
        onJoinSession(session);
      }
      // Update session participants count
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, participants: s.participants + 1 }
          : s
      ));
    }
  };

  const startSession = () => {
    if (newSessionData.title && newSessionData.description) {
      const newSession = {
        id: Date.now().toString(),
        ...newSessionData,
        host: currentUser,
        participants: 1,
        status: 'open',
        createdAt: new Date(),
        popularity: 50,
        tags: [],
        isLive: true
      };

      setSessions(prev => [newSession, ...prev]);
      setIsCreatingSession(false);
      setNewSessionData({
        title: '',
        description: '',
        genre: 'electronic',
        skillLevel: 'intermediate',
        maxParticipants: 4,
        isPublic: true,
        bpm: 120,
        key: 'C major'
      });

      if (onStartSession) {
        onStartSession(newSession);
      }
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesGenre = !filters.genre || session.genre === filters.genre;
    const matchesSkill = !filters.skillLevel || session.skillLevel === filters.skillLevel;
    const matchesStatus = !filters.status || session.status === filters.status;

    return matchesSearch && matchesGenre && matchesSkill && matchesStatus;
  });

  const sortSessions = (sessions) => {
    switch (filters.sortBy) {
      case 'popularity':
        return [...sessions].sort((a, b) => b.popularity - a.popularity);
      case 'newest':
        return [...sessions].sort((a, b) => b.createdAt - a.createdAt);
      case 'participants':
        return [...sessions].sort((a, b) => b.participants - a.participants);
      default:
        return sessions;
    }
  };

  const getGenreColor = (genre) => {
    const colors = {
      electronic: '#8b5cf6',
      hiphop: '#ef4444',
      rock: '#f59e0b',
      pop: '#3b82f6',
      jazz: '#10b981',
      classical: '#64748b',
      ambient: '#06b6d4',
      lofi: '#84cc16',
      synthwave: '#ec4899',
      orchestral: '#a855f7',
      world: '#f97316',
      experimental: '#6366f1'
    };
    return colors[genre] || '#6b7280';
  };

  return (
    <div className="collaboration-marketplace">
      <div className="marketplace-header">
        <div className="header-left">
          <Users size={32} />
          <div>
            <h2>Collaboration Marketplace</h2>
            <p>Connect with musicians worldwide and create music together</p>
          </div>
        </div>
        
        <div className="header-stats">
          <div className="stat">
            <Users2 size={16} />
            <span>{sessions.reduce((sum, session) => sum + session.participants, 0)} musicians online</span>
          </div>
          <div className="stat">
            <Globe size={16} />
            <span>Global community</span>
          </div>
        </div>
      </div>

      <div className="marketplace-tabs">
        <button 
          className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          <MessageCircle size={18} />
          Live Sessions
          <span className="badge">{sessions.length}</span>
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <Award size={18} />
          Projects
          <span className="badge">{projects.length}</span>
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'collaborators' ? 'active' : ''}`}
          onClick={() => setActiveTab('collaborators')}
        >
          <Users size={18} />
          Collaborators
          <span className="badge">{collaborators.length}</span>
        </button>
      </div>

      <div className="search-filters">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search sessions, projects, or collaborators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select
            value={filters.genre}
            onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
          >
            <option value="">All Genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
          
          <select
            value={filters.skillLevel}
            onChange={(e) => setFilters(prev => ({ ...prev, skillLevel: e.target.value }))}
          >
            <option value="">Any Skill</option>
            {skillLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">Any Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
          >
            <option value="popularity">Popularity</option>
            <option value="newest">Newest</option>
            <option value="participants">Participants</option>
          </select>
        </div>
      </div>

      {activeTab === 'sessions' && (
        <div className="sessions-grid">
          <div className="grid-header">
            <h3>Live Collaboration Sessions</h3>
            <button 
              className="create-session-btn"
              onClick={() => setIsCreatingSession(true)}
            >
              <Plus size={18} />
              Start Session
            </button>
          </div>

          {isCreatingSession && (
            <div className="create-session-modal">
              <h4>Create New Session</h4>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Session title"
                  value={newSessionData.title}
                  onChange={(e) => setNewSessionData(prev => ({ ...prev, title: e.target.value }))}
                />
                <textarea
                  placeholder="Describe your session..."
                  value={newSessionData.description}
                  onChange={(e) => setNewSessionData(prev => ({ ...prev, description: e.target.value }))}
                />
                <div className="form-row">
                  <select
                    value={newSessionData.genre}
                    onChange={(e) => setNewSessionData(prev => ({ ...prev, genre: e.target.value }))}
                  >
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                  
                  <select
                    value={newSessionData.skillLevel}
                    onChange={(e) => setNewSessionData(prev => ({ ...prev, skillLevel: e.target.value }))}
                  >
                    {skillLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  
                  <select
                    value={newSessionData.maxParticipants}
                    onChange={(e) => setNewSessionData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                  >
                    {[2, 3, 4, 5, 6, 8, 10].map(num => (
                      <option key={num} value={num}>{num} participants</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-row">
                  <label>
                    <span>BPM:</span>
                    <input
                      type="number"
                      min="40"
                      max="240"
                      value={newSessionData.bpm}
                      onChange={(e) => setNewSessionData(prev => ({ ...prev, bpm: parseInt(e.target.value) }))}
                    />
                  </label>
                  
                  <label>
                    <span>Key:</span>
                    <select
                      value={newSessionData.key}
                      onChange={(e) => setNewSessionData(prev => ({ ...prev, key: e.target.value }))}
                    >
                      {['C major', 'G major', 'D major', 'A major', 'E major', 'B major', 
                        'F major', 'Bb major', 'Eb major', 'Ab major', 'Db major', 'Gb major',
                        'C minor', 'G minor', 'D minor', 'A minor', 'E minor', 'B minor',
                        'F minor', 'Bb minor', 'Eb minor', 'Ab minor'].map(key => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>
                  </label>
                </div>
                
                <div className="form-actions">
                  <button onClick={() => setIsCreatingSession(false)}>Cancel</button>
                  <button onClick={startSession} className="primary">Start Session</button>
                </div>
              </div>
            </div>
          )}

          {filteredSessions.length === 0 ? (
            <div className="empty-state">
              <MessageCircle size={48} />
              <p>No sessions found</p>
              <span>Start the first session or adjust your filters</span>
            </div>
          ) : (
            <div className="sessions-list">
              {sortSessions(filteredSessions).map(session => (
                <div key={session.id} className="session-card">
                  <div className="card-header">
                    <div className="host-info">
                      <span className="avatar">{session.host.avatar}</span>
                      <div>
                        <h4>{session.host.name}</h4>
                        <span className="skill-level">{session.host.skill}</span>
                      </div>
                    </div>
                    
                    <div className="session-status">
                      {session.isLive && <div className="live-indicator">LIVE</div>}
                      <span className="participants">
                        <Users size={14} />
                        {session.participants}/{session.maxParticipants}
                      </span>
                    </div>
                  </div>

                  <div className="card-content">
                    <h3>{session.title}</h3>
                    <p>{session.description}</p>
                    
                    <div className="session-meta">
                      <span 
                        className="genre-tag" 
                        style={{ backgroundColor: getGenreColor(session.genre) }}
                      >
                        {session.genre}
                      </span>
                      <span className="bpm">{session.bpm} BPM</span>
                      <span className="key">{session.key}</span>
                    </div>

                    <div className="session-tags">
                      {session.tags.map(tag => (
                        <span key={tag} className="tag">#{tag}</span>
                      ))}
                    </div>

                    <div className="session-stats">
                      <div className="stat">
                        <Clock size={12} />
                        {Math.round((Date.now() - session.createdAt) / (60 * 1000))}m ago
                      </div>
                      <div className="stat">
                        <TrendingUp size={12} />
                        {session.popularity}%
                      </div>
                      <div className="stat">
                        <Heart size={12} />
                        24
                      </div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button 
                      className={`join-btn ${session.participants >= session.maxParticipants ? 'disabled' : ''}`}
                      onClick={() => joinSession(session.id)}
                      disabled={session.participants >= session.maxParticipants}
                    >
                      {session.participants >= session.maxParticipants ? 'Full' : 'Join Session'}
                    </button>
                    
                    <button className="secondary-btn">
                      <Headphones size={16} />
                      Listen
                    </button>
                    
                    <button className="icon-btn">
                      <Heart size={16} />
                    </button>
                    
                    <button className="icon-btn">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="projects-grid">
          <h3>Collaborative Projects</h3>
          {projects.length === 0 ? (
            <div className="empty-state">
              <Award size={48} />
              <p>No projects yet</p>
              <span>Be the first to start a collaborative project</span>
            </div>
          ) : (
            <div className="projects-list">
              {projects.map(project => (
                <div key={project.id} className="project-card">
                  <div className="project-header">
                    <h4>{project.title}</h4>
                    <span className="progress">{project.progress}% complete</span>
                  </div>
                  
                  <p>{project.description}</p>
                  
                  <div className="project-meta">
                    <span className="genre">{project.genre}</span>
                    <span className="bpm">{project.bpm} BPM</span>
                    <span className="collaborators">
                      <Users size={14} />
                      {project.collaborators}
                    </span>
                  </div>

                  <div className="looking-for">
                    <strong>Looking for:</strong>
                    {project.lookingFor.map(role => (
                      <span key={role} className="role-tag">{role}</span>
                    ))}
                  </div>

                  <div className="project-actions">
                    <button className="primary-btn">Join Project</button>
                    <button className="secondary-btn">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'collaborators' && (
        <div className="collaborators-grid">
          <h3>Available Collaborators</h3>
          {collaborators.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <p>No collaborators found</p>
              <span>Try adjusting your search criteria</span>
            </div>
          ) : (
            <div className="collaborators-list">
              {collaborators.map(collaborator => (
                <div key={collaborator.id} className="collaborator-card">
                  <div className="collab-header">
                    <div className="avatar">{collaborator.avatar}</div>
                    <div className="collab-info">
                      <h4>{collaborator.name}</h4>
                      <div className="rating">
                        <Star size={12} fill="currentColor" />
                        {collaborator.rating}
                      </div>
                    </div>
                  </div>

                  <div className="collab-details">
                    <span className="specialty">{collaborator.specialty}</span>
                    <span className="skill">{collaborator.skill}</span>
                    {collaborator.available && (
                      <span className="available">Available</span>
                    )}
                  </div>

                  <div className="collab-genres">
                    {collaborator.genres.map(genre => (
                      <span key={genre} className="genre-tag">{genre}</span>
                    ))}
                  </div>

                  <div className="collab-instruments">
                    <strong>Instruments:</strong>
                    {collaborator.instruments.join(', ')}
                  </div>

                  <div className="collab-stats">
                    <span>{collaborator.projects} projects</span>
                    <span>{collaborator.location}</span>
                  </div>

                  <div className="collab-actions">
                    <button className="primary-btn">Message</button>
                    <button className="secondary-btn">Invite to Session</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="marketplace-footer">
        <div className="footer-info">
          <Bell size={16} />
          <span>Real-time collaboration • Global community • Professional networking</span>
        </div>
        <div className="footer-stats">
          <span>{sessions.length} active sessions</span>
          <span>{projects.length} ongoing projects</span>
          <span>{collaborators.length} available collaborators</span>
        </div>
      </div>
    </div>
  );
};

export default CollaborationMarketplace;