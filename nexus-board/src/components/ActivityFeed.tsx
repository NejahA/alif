import { useState, useEffect } from 'react';
import type { Task, User } from '../types';

interface Activity {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_completed' | 'task_deleted' | 'comment_added' | 'user_joined';
  userId: string;
  taskId?: string;
  taskTitle?: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  tasks: Task[];
  users: User[];
  currentUser: User;
}

const ActivityFeed = ({ tasks, users, currentUser }: ActivityFeedProps) => {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'task_created',
      userId: 'user-1',
      taskId: '1',
      taskTitle: 'Design System',
      description: 'created a new task',
      timestamp: new Date('2024-01-15T10:30:00')
    },
    {
      id: '2',
      type: 'task_completed',
      userId: 'user-1',
      taskId: '1',
      taskTitle: 'Design System',
      description: 'marked task as completed',
      timestamp: new Date('2024-01-20T14:45:00')
    },
    {
      id: '3',
      type: 'task_updated',
      userId: 'user-1',
      taskId: '2',
      taskTitle: 'Task Components',
      description: 'updated task priority to medium',
      timestamp: new Date('2024-01-18T09:15:00')
    },
    {
      id: '4',
      type: 'comment_added',
      userId: 'user-1',
      taskId: '2',
      taskTitle: 'Task Components',
      description: 'added a comment',
      timestamp: new Date('2024-01-19T16:20:00')
    }
  ]);
  const [filterType, setFilterType] = useState<string>('all');
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Simulate new activities
  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      const activityTypes: Activity['type'][] = [
        'task_created', 'task_updated', 'task_completed', 'comment_added'
      ];
      const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
      
      if (randomTask) {
        const newActivity: Activity = {
          id: crypto.randomUUID(),
          type: randomType,
          userId: currentUser.id,
          taskId: randomTask.id,
          taskTitle: randomTask.title,
          description: getActivityDescription(randomType, randomTask),
          timestamp: new Date(),
          metadata: { priority: randomTask.priority }
        };
        
        setActivities(prev => [newActivity, ...prev.slice(0, 49)]); // Keep last 50 activities
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [tasks, currentUser.id, isAutoRefresh]);

  const getActivityDescription = (type: Activity['type'], task: Task) => {
    switch (type) {
      case 'task_created':
        return 'created a new task';
      case 'task_updated':
        return `updated task (${task.priority} priority)`;
      case 'task_completed':
        return 'marked task as completed';
      case 'task_deleted':
        return 'deleted a task';
      case 'comment_added':
        return 'added a comment';
      case 'user_joined':
        return 'joined the project';
      default:
        return 'performed an action';
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : `User ${userId.slice(-4)}`;
  };

  const getUserAvatar = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name.charAt(0).toUpperCase() : '?';
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'task_created':
        return '➕';
      case 'task_updated':
        return '✏️';
      case 'task_completed':
        return '✅';
      case 'task_deleted':
        return '🗑️';
      case 'comment_added':
        return '💬';
      case 'user_joined':
        return '👋';
      default:
        return '📝';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredActivities = filterType === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filterType);

  const clearActivities = () => {
    setActivities([]);
  };

  const exportActivities = () => {
    const dataStr = JSON.stringify(activities, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nextus-activity-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'task_created', label: 'Task Created' },
    { value: 'task_updated', label: 'Task Updated' },
    { value: 'task_completed', label: 'Task Completed' },
    { value: 'task_deleted', label: 'Task Deleted' },
    { value: 'comment_added', label: 'Comments' },
    { value: 'user_joined', label: 'User Joined' }
  ];

  return (
    <div className="activity-feed">
      <div className="activity-header">
        <h2 className="activity-title">Activity Feed</h2>
        <div className="activity-controls">
          <div className="refresh-toggle">
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={isAutoRefresh}
                onChange={(e) => setIsAutoRefresh(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">Auto-refresh</span>
          </div>
          <button 
            className="btn-secondary btn-sm"
            onClick={exportActivities}
          >
            Export
          </button>
          <button 
            className="btn-secondary btn-sm"
            onClick={clearActivities}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="activity-filters">
        {activityTypes.map(type => (
          <button
            key={type.value}
            className={`filter-button ${filterType === type.value ? 'active' : ''}`}
            onClick={() => setFilterType(type.value)}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="activity-stats">
        <div className="activity-stat">
          <span className="stat-value">{activities.length}</span>
          <span className="stat-label">Total Activities</span>
        </div>
        <div className="activity-stat">
          <span className="stat-value">{activities.filter(a => a.type === 'task_completed').length}</span>
          <span className="stat-label">Tasks Completed</span>
        </div>
        <div className="activity-stat">
          <span className="stat-value">{new Set(activities.map(a => a.userId)).size}</span>
          <span className="stat-label">Active Users</span>
        </div>
        <div className="activity-stat">
          <span className="stat-value">
            {activities.length > 0 
              ? formatTime(activities[activities.length - 1].timestamp)
              : 'No activity'
            }
          </span>
          <span className="stat-label">Last Activity</span>
        </div>
      </div>

      <div className="activities-list">
        {filteredActivities.length === 0 ? (
          <div className="no-activities">
            <p>No activities found. Start working on tasks to see activity here!</p>
          </div>
        ) : (
          filteredActivities.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="activity-content">
                <div className="activity-user">
                  <div className="user-avatar-small">
                    {getUserAvatar(activity.userId)}
                  </div>
                  <span className="user-name">{getUserName(activity.userId)}</span>
                  <span className="activity-action">{activity.description}</span>
                </div>
                
                {activity.taskTitle && (
                  <div className="activity-task">
                    <span className="task-title">{activity.taskTitle}</span>
                    {activity.metadata?.priority && (
                      <span className={`task-priority priority-${activity.metadata.priority}`}>
                        {activity.metadata.priority}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="activity-time">
                  {formatTime(activity.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="activity-summary">
        <h4>Activity Summary</h4>
        <div className="summary-chart">
          {activityTypes.slice(1).map(type => {
            const count = activities.filter(a => a.type === type.value).length;
            const percentage = activities.length > 0 ? (count / activities.length) * 100 : 0;
            
            return (
              <div key={type.value} className="summary-item">
                <div className="summary-label">
                  <span className="summary-icon">{getActivityIcon(type.value as Activity['type'])}</span>
                  <span>{type.label}</span>
                </div>
                <div className="summary-bar">
                  <div 
                    className="summary-bar-fill" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="summary-count">{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;