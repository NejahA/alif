import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Trophy, Award, Star, Target, Clock, TrendingUp, 
  CheckCircle, PlayCircle, Lock, Heart, Zap, Calendar, BarChart3,
  Book, Music, Activity, Play, Disc, Mic, Headphones, Settings
} from 'lucide-react';

const LearningProgression = ({ userProgress, onCompleteLesson, onStartLesson }) => {
  const [activeTab, setActiveTab] = useState('pathways');
  const [selectedPathway, setSelectedPathway] = useState(null);
  const [userStats, setUserStats] = useState({
    totalXp: 1250,
    level: 3,
    lessonsCompleted: 12,
    practiceHours: 8.5,
    streak: 7,
    achievements: 5
  });

  const learningPathways = [
    {
      id: 'beginner-producer',
      title: 'Beginner Music Producer',
      description: 'Master the fundamentals of music production and recording',
      icon: '🎵',
      difficulty: 'beginner',
      estimatedHours: 20,
      progress: 65,
      lessons: 15,
      completed: 9,
      color: '#3b82f6',
      skills: ['recording', 'mixing', 'arrangement', 'sound-design']
    },
    {
      id: 'electronic-music',
      title: 'Electronic Music Specialist',
      description: 'Create professional electronic music across various genres',
      icon: '⚡',
      difficulty: 'intermediate',
      estimatedHours: 40,
      progress: 30,
      lessons: 25,
      completed: 7,
      color: '#8b5cf6',
      skills: ['sound-design', 'synthesis', 'beat-making', 'mixing']
    },
    {
      id: 'mixing-engineer',
      title: 'Mixing Engineer',
      description: 'Master the art of professional audio mixing and mastering',
      icon: '🎚️',
      difficulty: 'advanced',
      estimatedHours: 60,
      progress: 15,
      lessons: 30,
      completed: 4,
      color: '#10b981',
      skills: ['mixing', 'mastering', 'eq', 'compression', 'effects']
    },
    {
      id: 'live-performance',
      title: 'Live Performance',
      description: 'Develop skills for dynamic live music performances',
      icon: '🎤',
      difficulty: 'intermediate',
      estimatedHours: 35,
      progress: 0,
      lessons: 20,
      completed: 0,
      color: '#ef4444',
      skills: ['performance', 'improvisation', 'live-setup', 'audience-engagement']
    }
  ];

  const lessons = {
    'beginner-producer': [
      {
        id: 'bp-1',
        title: 'Understanding DAW Basics',
        description: 'Learn the fundamental concepts of Digital Audio Workstations',
        duration: 45,
        type: 'tutorial',
        xp: 50,
        completed: true,
        prerequisites: [],
        skills: ['daw-basics', 'navigation', 'workflow']
      },
      {
        id: 'bp-2',
        title: 'Recording Your First Track',
        description: 'Step-by-step guide to recording audio and MIDI',
        duration: 60,
        type: 'hands-on',
        xp: 75,
        completed: true,
        prerequisites: ['bp-1'],
        skills: ['recording', 'midi', 'audio-interface']
      },
      {
        id: 'bp-3',
        title: 'Basic Mixing Techniques',
        description: 'Introduction to volume balancing and panning',
        duration: 90,
        type: 'tutorial',
        xp: 100,
        completed: true,
        prerequisites: ['bp-2'],
        skills: ['mixing', 'balance', 'panning']
      },
      {
        id: 'bp-4',
        title: 'Introduction to Effects',
        description: 'Learn to use reverb, delay, and compression',
        duration: 75,
        type: 'hands-on',
        xp: 125,
        completed: false,
        prerequisites: ['bp-3'],
        skills: ['effects', 'reverb', 'delay', 'compression']
      },
      {
        id: 'bp-5',
        title: 'Creating Simple Arrangements',
        description: 'Build complete song structures',
        duration: 120,
        type: 'project',
        xp: 150,
        completed: false,
        prerequisites: ['bp-4'],
        skills: ['arrangement', 'structure', 'songwriting']
      }
    ],
    'electronic-music': [
      {
        id: 'em-1',
        title: 'Synthesis Fundamentals',
        description: 'Understand oscillators, filters, and envelopes',
        duration: 90,
        type: 'tutorial',
        xp: 100,
        completed: true,
        prerequisites: [],
        skills: ['synthesis', 'oscillators', 'filters']
      },
      {
        id: 'em-2',
        title: 'Drum Programming Patterns',
        description: 'Create professional drum patterns for electronic music',
        duration: 75,
        type: 'hands-on',
        xp: 125,
        completed: true,
        prerequisites: ['em-1'],
        skills: ['drum-programming', 'rhythm', 'patterns']
      }
    ]
  };

  const achievements = [
    {
      id: 'first-steps',
      title: 'First Steps',
      description: 'Complete your first lesson',
      icon: '👣',
      xp: 50,
      earned: true,
      earnedDate: '2024-01-15'
    },
    {
      id: 'practice-makes-perfect',
      title: 'Practice Makes Perfect',
      description: 'Complete 5 hours of practice',
      icon: '⏰',
      xp: 100,
      earned: true,
      earnedDate: '2024-01-20'
    },
    {
      id: 'quick-learner',
      title: 'Quick Learner',
      description: 'Complete 3 lessons in one day',
      icon: '⚡',
      xp: 150,
      earned: false,
      earnedDate: null
    },
    {
      id: 'music-theorist',
      title: 'Music Theorist',
      description: 'Master all music theory lessons',
      icon: '🎼',
      xp: 200,
      earned: false,
      earnedDate: null
    },
    {
      id: 'production-pro',
      title: 'Production Pro',
      description: 'Complete the beginner producer pathway',
      icon: '🏆',
      xp: 300,
      earned: false,
      earnedDate: null
    }
  ];

  const skillCategories = [
    {
      name: 'Music Theory',
      level: 4,
      progress: 75,
      icon: <Music size={20} />,
      color: '#3b82f6'
    },
    {
      name: 'Synthesis',
      level: 3,
      progress: 60,
      icon: <Activity size={20} />,
      color: '#8b5cf6'
    },
    {
      name: 'Mixing',
      level: 2,
      progress: 40,
      icon: <Settings size={20} />,
      color: '#10b981'
    },
    {
      name: 'Recording',
      level: 5,
      progress: 90,
      icon: <Mic size={20} />,
      color: '#ef4444'
    },
    {
      name: 'Performance',
      level: 1,
      progress: 20,
      icon: <Headphones size={20} />,
      color: '#f59e0b'
    }
  ];

  const startLesson = (pathwayId, lessonId) => {
    if (onStartLesson) {
      onStartLesson({ pathwayId, lessonId });
    }
  };

  const completeLesson = (pathwayId, lessonId) => {
    if (onCompleteLesson) {
      onCompleteLesson({ pathwayId, lessonId, xp: lessons[pathwayId]?.find(l => l.id === lessonId)?.xp || 50 });
      
      // Update local state for demonstration
      setUserStats(prev => ({
        ...prev,
        totalXp: prev.totalXp + (lessons[pathwayId]?.find(l => l.id === lessonId)?.xp || 50),
        lessonsCompleted: prev.lessonsCompleted + 1
      }));
    }
  };

  const getLevelInfo = (xp) => {
    const levels = [
      { level: 1, xpRequired: 0, title: 'Novice' },
      { level: 2, xpRequired: 500, title: 'Beginner' },
      { level: 3, xpRequired: 1000, title: 'Apprentice' },
      { level: 4, xpRequired: 2000, title: 'Intermediate' },
      { level: 5, xpRequired: 4000, title: 'Advanced' },
      { level: 6, xpRequired: 8000, title: 'Expert' },
      { level: 7, xpRequired: 16000, title: 'Master' },
      { level: 8, xpRequired: 32000, title: 'Grand Master' }
    ];
    
    const currentLevel = levels.reverse().find(l => xp >= l.xpRequired) || levels[0];
    const nextLevel = levels.find(l => l.xpRequired > xp) || levels[levels.length - 1];
    const progress = ((xp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100;
    
    return { currentLevel, nextLevel, progress };
  };

  const { currentLevel, nextLevel, progress } = getLevelInfo(userStats.totalXp);

  return (
    <div className="learning-progression">
      <div className="progression-header">
        <div className="header-left">
          <BookOpen size={32} />
          <div>
            <h2>Learning Progression</h2>
            <p>Track your music production journey and develop your skills</p>
          </div>
        </div>
        
        <div className="header-stats">
          <div className="stat">
            <TrendingUp size={16} />
            <span>Level {currentLevel.level} {currentLevel.title}</span>
          </div>
          <div className="stat">
            <Star size={16} />
            <span>{userStats.totalXp} XP</span>
          </div>
        </div>
      </div>

      <div className="progression-tabs">
        <button 
          className={`tab-btn ${activeTab === 'pathways' ? 'active' : ''}`}
          onClick={() => setActiveTab('pathways')}
        >
          <BookOpen size={18} />
          Learning Paths
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          <BarChart3 size={18} />
          Skills
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <Trophy size={18} />
          Achievements
          <span className="badge">{userStats.achievements}</span>
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <TrendingUp size={18} />
          Statistics
        </button>
      </div>

      <div className="level-progress">
        <div className="progress-header">
          <span>Level {currentLevel.level} - {currentLevel.title}</span>
          <span>Level {nextLevel.level} - {nextLevel.title}</span>
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%`, backgroundColor: '#3b82f6' }}
          />
        </div>
        
        <div className="progress-numbers">
          <span>{userStats.totalXp} XP</span>
          <span>{nextLevel.xpRequired} XP for next level</span>
        </div>
      </div>

      {activeTab === 'pathways' && (
        <div className="pathways-grid">
          <h3>Learning Pathways</h3>
          
          <div className="pathways-list">
            {learningPathways.map(pathway => (
              <div 
                key={pathway.id} 
                className="pathway-card"
                onClick={() => setSelectedPathway(selectedPathway?.id === pathway.id ? null : pathway)}
              >
                <div className="card-header">
                  <div className="pathway-icon">{pathway.icon}</div>
                  <div className="pathway-info">
                    <h4>{pathway.title}</h4>
                    <p>{pathway.description}</p>
                    
                    <div className="pathway-meta">
                      <span className={`difficulty ${pathway.difficulty}`}>
                        {pathway.difficulty}
                      </span>
                      <span className="hours">
                        <Clock size={12} />
                        {pathway.estimatedHours}h
                      </span>
                      <span className="lessons">
                        {pathway.completed}/{pathway.lessons} lessons
                      </span>
                    </div>
                  </div>
                  
                  <div className="progress-circle">
                    <svg width="60" height="60">
                      <circle
                        cx="30"
                        cy="30"
                        r="25"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="4"
                      />
                      <circle
                        cx="30"
                        cy="30"
                        r="25"
                        fill="none"
                        stroke={pathway.color}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 25}`}
                        strokeDashoffset={`${2 * Math.PI * 25 * (1 - pathway.progress / 100)}`}
                        transform="rotate(-90 30 30)"
                      />
                    </svg>
                    <span className="progress-percent">{pathway.progress}%</span>
                  </div>
                </div>

                {selectedPathway?.id === pathway.id && (
                  <div className="pathway-lessons">
                    <h5>Lessons</h5>
                    
                    {lessons[pathway.id]?.map(lesson => (
                      <div key={lesson.id} className="lesson-item">
                        <div className="lesson-info">
                          <div className="lesson-status">
                            {lesson.completed ? (
                              <CheckCircle size={16} color="#10b981" />
                            ) : (
                              <PlayCircle size={16} color="#3b82f6" />
                            )}
                          </div>
                          
                          <div className="lesson-details">
                            <h6>{lesson.title}</h6>
                            <p>{lesson.description}</p>
                            
                            <div className="lesson-meta">
                              <span className="duration">{lesson.duration}m</span>
                              <span className="type">{lesson.type}</span>
                              <span className="xp">{lesson.xp} XP</span>
                            </div>
                            
                            <div className="lesson-skills">
                              {lesson.skills.map(skill => (
                                <span key={skill} className="skill-tag">{skill}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="lesson-actions">
                          {lesson.completed ? (
                            <button className="completed-btn" disabled>
                              <CheckCircle size={16} />
                              Completed
                            </button>
                          ) : (
                            <button 
                              className="start-btn"
                              onClick={() => startLesson(pathway.id, lesson.id)}
                            >
                              <PlayCircle size={16} />
                              Start Lesson
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {(!lessons[pathway.id] || lessons[pathway.id].length === 0) && (
                      <div className="empty-lessons">
                        <p>No lessons available yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="skills-grid">
          <h3>Skill Development</h3>
          
          <div className="skills-list">
            {skillCategories.map(skill => (
              <div key={skill.name} className="skill-card">
                <div className="skill-header">
                  <div className="skill-icon" style={{ color: skill.color }}>
                    {skill.icon}
                  </div>
                  
                  <div className="skill-info">
                    <h4>{skill.name}</h4>
                    <span className="level">Level {skill.level}</span>
                  </div>
                </div>
                
                <div className="skill-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${skill.progress}%`, backgroundColor: skill.color }}
                    />
                  </div>
                  <span className="progress-text">{skill.progress}%</span>
                </div>
                
                <div className="skill-actions">
                  <button className="practice-btn">Practice</button>
                  <button className="lessons-btn">View Lessons</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="achievements-grid">
          <h3>Achievements</h3>
          
          <div className="achievements-list">
            {achievements.map(achievement => (
              <div key={achievement.id} className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}>
                <div className="achievement-icon">
                  {achievement.earned ? (
                    <Award size={32} color="#f59e0b" />
                  ) : (
                    <Lock size={32} color="#6b7280" />
                  )}
                  <span className="achievement-emoji">{achievement.icon}</span>
                </div>
                
                <div className="achievement-info">
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                  
                  <div className="achievement-meta">
                    <span className="xp">{achievement.xp} XP</span>
                    {achievement.earned && achievement.earnedDate && (
                      <span className="earned-date">Earned: {achievement.earnedDate}</span>
                    )}
                  </div>
                </div>
                
                {!achievement.earned && (
                  <div className="achievement-lock">
                    <Lock size={16} />
                    <span>Locked</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="stats-grid">
          <h3>Learning Statistics</h3>
          
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">
                <BookOpen size={24} />
              </div>
              <div className="stat-info">
                <h4>{userStats.lessonsCompleted}</h4>
                <p>Lessons Completed</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <h4>{userStats.practiceHours}h</h4>
                <p>Practice Time</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-info">
                <h4>{userStats.streak}</h4>
                <p>Day Streak</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Trophy size={24} />
              </div>
              <div className="stat-info">
                <h4>{userStats.achievements}</h4>
                <p>Achievements</p>
              </div>
            </div>
          </div>
          
          <div className="weekly-progress">
            <h4>Weekly Progress</h4>
            <div className="week-chart">
              {[5, 8, 6, 9, 7, 10, 8].map((hours, index) => (
                <div key={index} className="day-bar">
                  <div 
                    className="bar-fill" 
                    style={{ height: `${(hours / 10) * 100}%` }}
                  />
                  <span className="day-label">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</span>
                  <span className="hours-label">{hours}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="progression-footer">
        <div className="footer-info">
          <GraduationCap size={16} />
          <span>Structured learning • Skill tracking • Personalized progression</span>
        </div>
        <div className="footer-stats">
          <span>{userStats.lessonsCompleted} lessons completed</span>
          <span>{userStats.practiceHours} hours practiced</span>
          <span>{userStats.streak} day streak</span>
        </div>
      </div>
    </div>
  );
};

export default LearningProgression;