import { useState, useEffect } from 'react';
import type { User, Task } from '../types';

interface CollaborationToolsProps {
  tasks: Task[];
  users: User[];
  currentUser: User;
  onAssignTask: (taskId: string, userId: string) => void;
  onStartVideoCall: (userIds: string[]) => void;
  onSendMessage: (userId: string, message: string) => void;
}

const CollaborationTools = ({ 
  tasks, 
  users, 
  currentUser, 
  onAssignTask, 
  onStartVideoCall,
  onSendMessage 
}: CollaborationToolsProps) => {
  const [activeUsers, setActiveUsers] = useState<User[]>([
    ...users.slice(0, 3),
    { id: 'user-4', name: 'Taylor Swift', email: 'taylor@nextus.com', status: 'active' },
    { id: 'user-5', name: 'Chris Evans', email: 'chris@nextus.com', status: 'idle' }
  ]);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    userId: string;
    userName: string;
    message: string;
    timestamp: Date;
    type: 'text' | 'task' | 'system';
  }>>([
    {
      id: 'msg-1',
      userId: 'user-2',
      userName: 'Sam Wilson',
      message: 'Just finished the design system task!',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      type: 'text'
    },
    {
      id: 'msg-2',
      userId: currentUser.id,
      userName: currentUser.name,
      message: 'Great work! Can you review my PR?',
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
      type: 'text'
    },
    {
      id: 'msg-3',
      userId: 'system',
      userName: 'System',
      message: 'Task "Design System" has been completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      type: 'system'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);

  const getTaskAssignments = () => {
    const assignments: Record<string, string[]> = {};
    tasks.forEach(task => {
      if (task.assigneeId) {
        if (!assignments[task.assigneeId]) {
          assignments[task.assigneeId] = [];
        }
        assignments[task.assigneeId].push(task.id);
      }
    });
    return assignments;
  };

  const assignments = getTaskAssignments();

  const handleAssignTask = () => {
    if (selectedTask && selectedUser) {
      onAssignTask(selectedTask, selectedUser);
      alert(`Task assigned to ${users.find(u => u.id === selectedUser)?.name}`);
      setSelectedTask(null);
      setSelectedUser(null);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: crypto.randomUUID(),
        userId: currentUser.id,
        userName: currentUser.name,
        message: newMessage,
        timestamp: new Date(),
        type: 'text' as const
      };
      setChatMessages([...chatMessages, message]);
      setNewMessage('');
      
      // Simulate reply
      setTimeout(() => {
        const randomUser = activeUsers[Math.floor(Math.random() * activeUsers.length)];
        if (randomUser.id !== currentUser.id) {
          const replies = [
            "Got it, thanks!",
            "I'll take a look at that.",
            "Can we discuss this in the next meeting?",
            "Great progress!",
            "I have some questions about this."
          ];
          const reply = replies[Math.floor(Math.random() * replies.length)];
          setChatMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            userId: randomUser.id,
            userName: randomUser.name,
            message: reply,
            timestamp: new Date(),
            type: 'text'
          }]);
        }
      }, 2000);
    }
  };

  const handleStartVideoCall = () => {
    const userIds = activeUsers.map(u => u.id);
    onStartVideoCall(userIds);
    setShowVideoCall(true);
  };

  const getUserStatus = (userId: string) => {
    // Simulate status
    const statuses = ['active', 'idle', 'offline'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'idle': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div className="collaboration-tools">
      <div className="collaboration-header">
        <h2 className="collaboration-title">Team Collaboration</h2>
        <div className="collaboration-actions">
          <button 
            className="btn-primary"
            onClick={handleStartVideoCall}
          >
            Start Video Call
          </button>
          <button 
            className="btn-secondary"
            onClick={() => {
              // Share project link
              navigator.clipboard.writeText(window.location.href);
              alert('Project link copied to clipboard!');
            }}
          >
            Share Project
          </button>
        </div>
      </div>

      <div className="collaboration-grid">
        {/* Team Members */}
        <div className="team-members-section">
          <h3 className="section-title">Team Members ({activeUsers.length})</h3>
          <div className="team-members-list">
            {activeUsers.map(user => {
              const status = getUserStatus(user.id);
              const taskCount = assignments[user.id]?.length || 0;
              
              return (
                <div key={user.id} className="team-member-card">
                  <div className="member-header">
                    <div className="member-avatar">
                      <div 
                        className="avatar-initials"
                        style={{ backgroundColor: `hsl(${parseInt(user.id.slice(-3)) % 360}, 70%, 60%)` }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div 
                        className="status-indicator"
                        style={{ backgroundColor: getStatusColor(status) }}
                      ></div>
                    </div>
                    <div className="member-info">
                      <h4 className="member-name">{user.name}</h4>
                      <p className="member-email">{user.email}</p>
                      <div className="member-stats">
                        <span className="stat-item">
                          <span className="stat-value">{taskCount}</span>
                          <span className="stat-label">tasks</span>
                        </span>
                        <span className="stat-item">
                          <span className="stat-value">{status}</span>
                          <span className="stat-label">status</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="member-actions">
                    <button 
                      className="btn-secondary btn-sm"
                      onClick={() => onSendMessage(user.id, `Hi ${user.name}, let's discuss the project.`)}
                    >
                      Message
                    </button>
                    <button 
                      className="btn-secondary btn-sm"
                      onClick={() => setSelectedUser(user.id)}
                    >
                      Assign Task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Assignment */}
        <div className="task-assignment-section">
          <h3 className="section-title">Task Assignment</h3>
          <div className="assignment-controls">
            <div className="assignment-selectors">
              <div className="selector-group">
                <label htmlFor="task-select">Select Task</label>
                <select 
                  id="task-select"
                  value={selectedTask || ''}
                  onChange={(e) => setSelectedTask(e.target.value)}
                >
                  <option value="">Choose a task...</option>
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.title} ({task.status})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="selector-group">
                <label htmlFor="user-select">Assign To</label>
                <select 
                  id="user-select"
                  value={selectedUser || ''}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">Choose a team member...</option>
                  {activeUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <button 
              className="btn-primary"
              onClick={handleAssignTask}
              disabled={!selectedTask || !selectedUser}
            >
              Assign Task
            </button>
          </div>

          <div className="assignment-stats">
            <h4>Assignment Statistics</h4>
            <div className="stats-grid">
              {Object.entries(assignments).map(([userId, taskIds]) => {
                const user = users.find(u => u.id === userId);
                return (
                  <div key={userId} className="assignment-stat">
                    <span className="stat-user">{user?.name || 'Unknown'}</span>
                    <div className="stat-bar">
                      <div 
                        className="stat-bar-fill"
                        style={{ width: `${(taskIds.length / tasks.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="stat-count">{taskIds.length} tasks</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Team Chat */}
        <div className="team-chat-section">
          <h3 className="section-title">Team Chat</h3>
          <div className="chat-container">
            <div className="chat-messages">
              {chatMessages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`chat-message ${msg.userId === currentUser.id ? 'own-message' : ''} ${msg.type}`}
                >
                  <div className="message-header">
                    <span className="message-sender">{msg.userName}</span>
                    <span className="message-time">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="message-content">{msg.message}</div>
                </div>
              ))}
            </div>
            
            <div className="chat-input">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <div className="chat-actions">
                <button 
                  className="btn-secondary btn-sm"
                  onClick={() => setNewMessage('')}
                  disabled={!newMessage.trim()}
                >
                  Clear
                </button>
                <button 
                  className="btn-primary btn-sm"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Collaboration Stats */}
        <div className="collaboration-stats-section">
          <h3 className="section-title">Collaboration Stats</h3>
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-value">{activeUsers.length}</div>
                <div className="stat-label">Active Team Members</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <div className="stat-value">{chatMessages.length}</div>
                <div className="stat-label">Chat Messages</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-value">
                  {tasks.filter(t => t.assigneeId).length}
                </div>
                <div className="stat-label">Assigned Tasks</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <div className="stat-value">24/7</div>
                <div className="stat-label">Availability</div>
              </div>
            </div>
          </div>
          
          <div className="activity-timeline">
            <h4>Recent Activity</h4>
            <div className="timeline-items">
              {chatMessages.slice(-3).map(msg => (
                <div key={msg.id} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <span className="timeline-user">{msg.userName}</span>
                    <span className="timeline-action">sent a message</span>
                    <span className="timeline-time">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showVideoCall && (
        <div className="modal-overlay" onClick={() => setShowVideoCall(false)}>
          <div className="modal-content video-call-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Video Call</h2>
              <button className="btn-icon" onClick={() => setShowVideoCall(false)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            
            <div className="video-call-content">
              <div className="video-grid">
                {activeUsers.slice(0, 4).map(user => (
                  <div key={user.id} className="video-participant">
                    <div className="video-placeholder">
                      <div className="participant-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="participant-name">{user.name}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="video-controls">
                <button 
                  className={`btn-secondary ${screenSharing ? 'active' : ''}`}
                  onClick={() => setScreenSharing(!screenSharing)}
                >
                  {screenSharing ? 'Stop Sharing' : 'Share Screen'}
                </button>
                <button className="btn-primary">
                  Mute
                </button>
                <button className="btn-danger">
                  End Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborationTools;