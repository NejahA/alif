'use client';

import { useState, useEffect } from 'react';
import type { Task, Status, User, Comment } from '@/types';
import Board from '@/components/Board';
import TaskModal from '@/components/TaskModal';
import ThemeToggle from '@/components/ThemeToggle';
import SearchBar from '@/components/SearchBar';
import FilterPanel from '@/components/FilterPanel';
import StatisticsDashboard from '@/components/StatisticsDashboard';
import UserProfile from '@/components/UserProfile';
import ExportImport from '@/components/ExportImport';
import Notifications from '@/components/Notifications';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import CalendarView from '@/components/CalendarView';
import AIAssistant from '@/components/AIAssistant';
import ActivityFeed from '@/components/ActivityFeed';
import ProjectTemplates from '@/components/ProjectTemplates';
import OfflineSupport from '@/components/OfflineSupport';
import CollaborationTools from '@/components/CollaborationTools';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';
import WorkflowAutomation from '@/components/WorkflowAutomation';
import DataVisualization from '@/components/DataVisualization';
import ReportGenerator from '@/components/ReportGenerator';
import IntegrationHub from '@/components/IntegrationHub';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import TimeTracker from '@/components/TimeTracker';
import SmartAssistant from '@/components/SmartAssistant';
import Gamification from '@/components/Gamification';
import DevOpsDashboard from '@/components/DevOpsDashboard';
import WorkflowBuilder from '@/components/WorkflowBuilder';
import AdvancedSearch from '@/components/AdvancedSearch';
import KnowledgeBase from '@/components/KnowledgeBase';
import ResourcePlanner from '@/components/ResourcePlanner';
import SecurityAudit from '@/components/SecurityAudit';
import MLPredictions from '@/components/MLPredictions';
import ARVisualization from '@/components/ARVisualization';
import AutoScheduler from '@/components/AutoScheduler';
import BlockchainVerification from '@/components/BlockchainVerification';
import CodeReview from '@/components/CodeReview';
import APITest from '@/components/APITest';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  fetchUsers,
  fetchComments,
  createComment,
  deleteComment,
  fetchIntegrations,
  updateIntegration,
  fetchWorkflows,
  createWorkflow,
  fetchBlockchainVerifications,
  createBlockchainVerification,
  seedDatabase,
  checkHealth
} from '@/services/api';
import './page.css';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'board' | 'stats' | 'profile' | 'settings' | 'calendar' | 'templates' | 'activity' | 'collaboration' | 'analytics' | 'automation' | 'visualization' | 'reports' | 'integrations' | 'performance' | 'time' | 'smart' | 'gamification' | 'devops' | 'search' | 'knowledge' | 'resources' | 'security' | 'ar' | 'scheduler' | 'code' | 'workflow' | 'blockchain' | 'ml' | 'comments' | 'api'>('board');
  const [user, setUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<{
    priority?: 'low' | 'medium' | 'high';
    status?: Status;
    labels?: string[];
  }>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [blockchainVerifications, setBlockchainVerifications] = useState<any[]>([]);

  // Compute filtered tasks directly
  const filteredTasks = tasks.filter(task => {
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!task.title.toLowerCase().includes(query) && 
          !task.description.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    // Apply filters
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    
    if (filters.status && task.status !== filters.status) {
      return false;
    }
    
    if (filters.labels && filters.labels.length > 0) {
      if (!task.labels.some(label => filters.labels!.includes(label))) {
        return false;
      }
    }
    
    return true;
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Check backend health
        await checkHealth();
        
        // Fetch all data
        const [tasksData, usersData, commentsData, integrationsData, workflowsData, verificationsData] = await Promise.all([
          fetchTasks(),
          fetchUsers(),
          fetchComments(),
          fetchIntegrations(),
          fetchWorkflows(),
          fetchBlockchainVerifications()
        ]);
        
        setTasks(tasksData);
        setTeamMembers(usersData);
        setComments(commentsData);
        setIntegrations(integrationsData);
        setWorkflows(workflowsData);
        setBlockchainVerifications(verificationsData);
        
        // Set current user (first user for demo)
        if (usersData.length > 0) {
          setUser(usersData[0]);
          setUserPoints(usersData[0].points || 0);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load data:', error);
        alert('Backend server not running. Please start the backend server.');
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const addTask = async (task: Omit<Task, 'id' | 'status' | 'labels' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTask = await createTask(task);
      setTasks([...tasks, newTask]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task');
    }
  };

  const moveTask = async (id: string, newStatus: Status) => {
    try {
      const updatedTask = await updateTask(id, { status: newStatus });
      setTasks(tasks.map(t => t.id === id ? updatedTask : t));
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task');
    }
  };

  const handleImport = (importedTasks: Task[]) => {
    setTasks(importedTasks);
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const handleLogout = () => {
    alert('Logged out successfully!');
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    alert(`Task ${taskId} clicked. In a real app, this would open task details.`);
  };

  const handleAISuggestion = (suggestion: Partial<Task>) => {
    const newTask: Task = {
      ...suggestion as Task,
      id: crypto.randomUUID(),
      status: 'todo',
      labels: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTasks([...tasks, newTask]);
  };

  const handleApplyTemplate = (templateTasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    const newTasks = templateTasks.map(task => ({
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    setTasks([...tasks, ...newTasks]);
  };

  const handleSync = () => {
    alert('Changes synced successfully!');
  };

  const handleRetry = () => {
    alert('Retrying sync...');
  };

  const handleAssignTask = (taskId: string, userId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, assigneeId: userId, updatedAt: new Date() }
        : task
    ));
  };

  const handleStartVideoCall = (userIds: string[]) => {
    alert(`Starting video call with ${userIds.length} participants`);
  };

  const handleSendMessage = (userId: string, message: string) => {
    alert(`Message sent to user ${userId}: ${message}`);
  };

  const handleAddRule = (rule: any) => {
    alert(`Rule added: ${rule.name}`);
  };

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    alert(`Rule ${ruleId} ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleDeleteRule = (ruleId: string) => {
    alert(`Rule ${ruleId} deleted`);
  };

  const handleTestRule = (ruleId: string) => {
    alert(`Testing rule ${ruleId}`);
  };

  const handleAddComment = async (taskId: string, content: string) => {
    if (!user) return;
    
    try {
      const newComment = await createComment({
        taskId,
        userId: user.id,
        content
      });
      setComments([...comments, newComment]);
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment');
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-left">
          <h1>Nextus</h1>
          <div className="header-controls">
            <SearchBar onSearch={setSearchQuery} />
            <button 
              className={`view-toggle ${activeView === 'board' ? 'active' : ''}`}
              onClick={() => setActiveView('board')}
              title="Board View"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M1 3C1 1.89543 1.89543 1 3 1H7C8.10457 1 9 1.89543 9 3V7C9 8.10457 8.10457 9 7 9H3C1.89543 9 1 8.10457 1 7V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M11 3C11 1.89543 11.8954 1 13 1H17C18.1046 1 19 1.89543 19 3V7C19 8.10457 18.1046 9 17 9H13C11.8954 9 11 8.10457 11 7V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M1 13C1 11.8954 1.89543 11 3 11H7C8.10457 11 9 11.8954 9 13V17C9 18.1046 8.10457 19 7 19H3C1.89543 19 1 18.1046 1 17V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M11 13C11 11.8954 11.8954 11 13 11H17C18.1046 11 19 11.8954 19 13V17C19 18.1046 18.1046 19 17 19H13C11.8954 19 11 18.1046 11 17V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <button 
              className={`view-toggle ${activeView === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveView('stats')}
              title="Statistics View"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 17V7M7 17V3M11 17V11M15 17V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="header-right">
          <OfflineSupport onSync={handleSync} onRetry={handleRetry} />
          <AIAssistant tasks={tasks} onSuggestionAccept={handleAISuggestion} />
          <KeyboardShortcuts />
          <Notifications />
          <ThemeToggle />
          <button 
            className={`view-toggle ${activeView === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveView('profile')}
            title="User Profile"
          >
            <div className="user-avatar-small">
              {user ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            + New Task
          </button>
        </div>
      </header>

      <div className="main-content">
        <div className="sidebar">
          <FilterPanel onFilterChange={setFilters} />
          <div className="sidebar-section">
            <h3 className="sidebar-title">Views</h3>
            <button 
              className={`btn-secondary ${activeView === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveView('calendar')}
            >
              <span className="sidebar-icon">📅</span>
              Calendar
            </button>
            <button 
              className={`btn-secondary ${activeView === 'templates' ? 'active' : ''}`}
              onClick={() => setActiveView('templates')}
            >
              <span className="sidebar-icon">📋</span>
              Templates
            </button>
            <button 
              className={`btn-secondary ${activeView === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveView('activity')}
            >
              <span className="sidebar-icon">📊</span>
              Activity Feed
            </button>
            <button 
              className={`btn-secondary ${activeView === 'collaboration' ? 'active' : ''}`}
              onClick={() => setActiveView('collaboration')}
            >
              <span className="sidebar-icon">👥</span>
              Collaboration
            </button>
            <button 
              className={`btn-secondary ${activeView === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveView('analytics')}
            >
              <span className="sidebar-icon">📈</span>
              Analytics
            </button>
            <button 
              className={`btn-secondary ${activeView === 'automation' ? 'active' : ''}`}
              onClick={() => setActiveView('automation')}
            >
              <span className="sidebar-icon">🤖</span>
              Automation
            </button>
            <button 
              className={`btn-secondary ${activeView === 'visualization' ? 'active' : ''}`}
              onClick={() => setActiveView('visualization')}
            >
              <span className="sidebar-icon">📊</span>
              Visualization
            </button>
            <button 
              className={`btn-secondary ${activeView === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveView('reports')}
            >
              <span className="sidebar-icon">📄</span>
              Reports
            </button>
            <button 
              className={`btn-secondary ${activeView === 'integrations' ? 'active' : ''}`}
              onClick={() => setActiveView('integrations')}
            >
              <span className="sidebar-icon">🔗</span>
              Integrations
            </button>
            <button 
              className={`btn-secondary ${activeView === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveView('performance')}
            >
              <span className="sidebar-icon">📈</span>
              Performance
            </button>
            <button 
              className={`btn-secondary ${activeView === 'time' ? 'active' : ''}`}
              onClick={() => setActiveView('time')}
            >
              <span className="sidebar-icon">⏱️</span>
              Time Tracking
            </button>
            <button 
              className={`btn-secondary ${activeView === 'smart' ? 'active' : ''}`}
              onClick={() => setActiveView('smart')}
            >
              <span className="sidebar-icon">🤖</span>
              Smart Assistant
            </button>
            <button 
              className={`btn-secondary ${activeView === 'gamification' ? 'active' : ''}`}
              onClick={() => setActiveView('gamification')}
            >
              <span className="sidebar-icon">🏆</span>
              Gamification
            </button>
            <button 
              className={`btn-secondary ${activeView === 'devops' ? 'active' : ''}`}
              onClick={() => setActiveView('devops')}
            >
              <span className="sidebar-icon">🚀</span>
              DevOps
            </button>
            <button 
              className={`btn-secondary ${activeView === 'search' ? 'active' : ''}`}
              onClick={() => setActiveView('search')}
            >
              <span className="sidebar-icon">🔍</span>
              Advanced Search
            </button>
            <button 
              className={`btn-secondary ${activeView === 'knowledge' ? 'active' : ''}`}
              onClick={() => setActiveView('knowledge')}
            >
              <span className="sidebar-icon">📚</span>
              Knowledge Base
            </button>
            <button 
              className={`btn-secondary ${activeView === 'resources' ? 'active' : ''}`}
              onClick={() => setActiveView('resources')}
            >
              <span className="sidebar-icon">👥</span>
              Resource Planner
            </button>
            <button 
              className={`btn-secondary ${activeView === 'security' ? 'active' : ''}`}
              onClick={() => setActiveView('security')}
            >
              <span className="sidebar-icon">🔒</span>
              Security Audit
            </button>
            <button 
              className={`btn-secondary ${activeView === 'ar' ? 'active' : ''}`}
              onClick={() => setActiveView('ar')}
            >
              <span className="sidebar-icon">👁️</span>
              AR Visualization
            </button>
            <button 
              className={`btn-secondary ${activeView === 'scheduler' ? 'active' : ''}`}
              onClick={() => setActiveView('scheduler')}
            >
              <span className="sidebar-icon">📅</span>
              Auto Scheduler
            </button>
            <button 
              className={`btn-secondary ${activeView === 'code' ? 'active' : ''}`}
              onClick={() => setActiveView('code')}
            >
              <span className="sidebar-icon">👨‍💻</span>
              Code Review
            </button>
            <button 
              className={`btn-secondary ${activeView === 'workflow' ? 'active' : ''}`}
              onClick={() => setActiveView('workflow')}
            >
              <span className="sidebar-icon">🔧</span>
              Workflow Builder
            </button>
            <button 
              className={`btn-secondary ${activeView === 'blockchain' ? 'active' : ''}`}
              onClick={() => setActiveView('blockchain')}
            >
              <span className="sidebar-icon">⛓️</span>
              Blockchain
            </button>
            <button 
              className={`btn-secondary ${activeView === 'ml' ? 'active' : ''}`}
              onClick={() => setActiveView('ml')}
            >
              <span className="sidebar-icon">🧠</span>
              ML Predictions
            </button>
            <button 
              className={`btn-secondary ${activeView === 'comments' ? 'active' : ''}`}
              onClick={() => setActiveView('comments')}
            >
              <span className="sidebar-icon">💬</span>
              Task Comments
            </button>
            <button 
              className={`btn-secondary ${activeView === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveView('settings')}
            >
              <span className="sidebar-icon">⚙️</span>
              Settings
            </button>
            <button 
              className={`btn-secondary ${activeView === 'api' ? 'active' : ''}`}
              onClick={() => setActiveView('api')}
            >
              <span className="sidebar-icon">🔌</span>
              API Test
            </button>
          </div>
          
          <div className="sidebar-section">
            <h3 className="sidebar-title">Quick Actions</h3>
            <button 
              className="btn-secondary"
              onClick={() => {
                const text = `Tasks: ${tasks.length}\nCompleted: ${tasks.filter(t => t.status === 'done').length}\nIn Progress: ${tasks.filter(t => t.status === 'inprogress').length}`;
                navigator.clipboard.writeText(text);
                alert('Statistics copied to clipboard!');
              }}
            >
              Copy Stats
            </button>
            <button 
              className="btn-secondary"
              onClick={() => {
                // Export all data
                const data = {
                  tasks,
                  comments,
                  user,
                  teamMembers,
                  exportedAt: new Date().toISOString()
                };
                const dataStr = JSON.stringify(data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `nextus-full-export-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
            >
              Export All Data
            </button>
          </div>
        </div>

        <div className="content-area">
          {activeView === 'board' && (
            <>
              <div className="content-header">
                <h2>Task Board</h2>
                <div className="content-stats">
                  <span className="stat-badge total">{filteredTasks.length} tasks</span>
                  <span className="stat-badge todo">{filteredTasks.filter(t => t.status === 'todo').length} to do</span>
                  <span className="stat-badge inprogress">{filteredTasks.filter(t => t.status === 'inprogress').length} in progress</span>
                  <span className="stat-badge done">{filteredTasks.filter(t => t.status === 'done').length} done</span>
                </div>
              </div>
              <Board tasks={filteredTasks} onMoveTask={moveTask} onDeleteTask={deleteTask} />
            </>
          )}
          
          {activeView === 'stats' && (
            <StatisticsDashboard tasks={tasks} />
          )}
          
          {activeView === 'profile' && (
            loading ? (
              <div className="loading-message">Loading profile...</div>
            ) : user ? (
              <UserProfile 
                user={user} 
                onLogout={handleLogout}
                onUpdateProfile={updateUserProfile}
              />
            ) : (
              <div className="error-message">No user data available</div>
            )
          )}
          
          {activeView === 'settings' && (
            <div className="settings-view">
              <h2>Settings</h2>
              <div className="settings-sections">
                <ExportImport tasks={tasks} onImport={handleImport} />
              </div>
            </div>
          )}
          
          {activeView === 'calendar' && (
            <CalendarView tasks={tasks} onTaskClick={handleTaskClick} />
          )}
          
          {activeView === 'templates' && (
            <ProjectTemplates onApplyTemplate={handleApplyTemplate} />
          )}
          
          {activeView === 'activity' && (
            loading ? (
              <div className="loading-message">Loading activity feed...</div>
            ) : user ? (
              <ActivityFeed 
                tasks={tasks} 
                users={teamMembers} 
                currentUser={user} 
              />
            ) : (
              <div className="error-message">No user data available</div>
            )
          )}
          
          {activeView === 'collaboration' && (
            loading ? (
              <div className="loading-message">Loading collaboration tools...</div>
            ) : user ? (
              <CollaborationTools 
                tasks={tasks}
                users={teamMembers}
                currentUser={user}
                onAssignTask={handleAssignTask}
                onStartVideoCall={handleStartVideoCall}
                onSendMessage={handleSendMessage}
              />
            ) : (
              <div className="error-message">No user data available</div>
            )
          )}
          
          {activeView === 'analytics' && (
            <AdvancedAnalytics 
              tasks={tasks}
              timeRange="week"
            />
          )}
          
          {activeView === 'automation' && (
            <WorkflowAutomation 
              tasks={tasks}
              onAddRule={handleAddRule}
              onToggleRule={handleToggleRule}
              onDeleteRule={handleDeleteRule}
              onTestRule={handleTestRule}
            />
          )}
          
          {activeView === 'visualization' && (
            <DataVisualization tasks={tasks} />
          )}
          
          {activeView === 'reports' && (
            <ReportGenerator tasks={tasks} />
          )}
          
          {activeView === 'integrations' && (
            <IntegrationHub 
              onConnect={(integration) => alert(`Connected to ${integration}`)}
              onDisconnect={(integration) => alert(`Disconnected from ${integration}`)}
            />
          )}
          
          {activeView === 'performance' && (
            <PerformanceMonitor tasks={tasks} />
          )}
          
          {activeView === 'time' && (
            <div className="time-tracking-view">
              <h2>Time Tracking</h2>
              <div className="time-tracking-grid">
                {tasks.map(task => (
                  <div key={task.id} className="task-time-tracker">
                    <div className="task-time-header">
                      <h4>{task.title}</h4>
                      <div className="task-time-stats">
                        <span className="time-stat">Est: {task.estimatedHours || 0}h</span>
                        <span className="time-stat">Act: {task.actualHours || 0}h</span>
                      </div>
                    </div>
                    <TimeTracker 
                      taskId={task.id}
                      estimatedHours={task.estimatedHours}
                      actualHours={task.actualHours}
                      onStartTracking={() => alert(`Started tracking time for task: ${task.title}`)}
                      onStopTracking={(hours) => {
                        // Update task with tracked hours
                        setTasks(tasks.map(t => 
                          t.id === task.id 
                            ? { ...t, actualHours: (t.actualHours || 0) + hours, updatedAt: new Date() }
                            : t
                        ));
                        alert(`Tracked ${hours.toFixed(2)} hours for task: ${task.title}`);
                      }}
                      onUpdateEstimate={(hours) => {
                        setTasks(tasks.map(t => 
                          t.id === task.id 
                            ? { ...t, estimatedHours: hours, updatedAt: new Date() }
                            : t
                        ));
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeView === 'smart' && (
            <SmartAssistant 
              tasks={tasks}
              onTaskSuggestion={(suggestion) => {
                const newTask: Task = {
                  ...suggestion as Task,
                  id: crypto.randomUUID(),
                  status: 'todo',
                  labels: [],
                  createdAt: new Date(),
                  updatedAt: new Date()
                };
                setTasks([...tasks, newTask]);
              }}
              onWorkflowOptimization={(optimization) => {
                alert(`Workflow optimization applied: ${optimization}`);
              }}
            />
          )}
          
          {activeView === 'gamification' && (
            <Gamification 
              tasks={tasks}
              userPoints={userPoints}
              onPointsUpdate={setUserPoints}
            />
          )}
          
          {activeView === 'devops' && (
            <DevOpsDashboard 
              onDeploy={(environment) => alert(`Deploying to ${environment}`)}
              onRollback={(version) => alert(`Rolling back to ${version}`)}
              onMonitor={(service) => alert(`Monitoring ${service}`)}
            />
          )}
          
          {activeView === 'search' && (
            <AdvancedSearch 
              tasks={tasks}
              onSearchResults={(results) => {
                alert(`Found ${results.length} tasks matching your search`);
              }}
            />
          )}
          
          {activeView === 'knowledge' && (
            <KnowledgeBase 
              onSearch={(query) => alert(`Searching knowledge base for: ${query}`)}
              onArticleSelect={(articleId) => alert(`Selected article: ${articleId}`)}
            />
          )}
          
          {activeView === 'resources' && (
            <ResourcePlanner 
              tasks={tasks}
              teamMembers={teamMembers}
              onResourceAllocation={(allocations) => {
                alert(`Allocated ${allocations.length} tasks to team members`);
              }}
            />
          )}
          
          {activeView === 'security' && (
            <SecurityAudit 
              onScanStart={() => alert('Security scan started!')}
              onVulnerabilityFix={(vulnerabilityId) => alert(`Fixing vulnerability: ${vulnerabilityId}`)}
              onReportGenerate={() => alert('Security report generated!')}
            />
          )}
          
          {activeView === 'ar' && (
            <ARVisualization 
              tasks={tasks}
              onTaskSelect={(taskId) => alert(`Selected task in AR: ${taskId}`)}
            />
          )}
          
          {activeView === 'scheduler' && (
            <AutoScheduler 
              tasks={tasks}
              onScheduleTasks={(scheduledTasks) => {
                const updatedTasks = tasks.map(task => {
                  const scheduledTask = scheduledTasks.find(t => t.id === task.id);
                  return scheduledTask ? { ...task, dueDate: scheduledTask.dueDate } : task;
                });
                setTasks(updatedTasks);
                alert(`Scheduled ${scheduledTasks.length} tasks!`);
              }}
            />
          )}
          
          {activeView === 'code' && (
            <CodeReview 
              onReviewSubmit={(review) => alert(`Review submitted: ${review.title}`)}
              onReviewApprove={(reviewId) => alert(`Review approved: ${reviewId}`)}
              onReviewReject={(reviewId, comments) => alert(`Review rejected: ${reviewId} with comments: ${comments}`)}
            />
          )}
          
          {activeView === 'workflow' && (
            <WorkflowBuilder 
              onWorkflowCreate={(workflow) => alert(`Workflow created: ${workflow.name}`)}
              onWorkflowTest={(workflowId) => alert(`Testing workflow: ${workflowId}`)}
              onWorkflowDeploy={(workflowId) => alert(`Deploying workflow: ${workflowId}`)}
            />
          )}
          
          {activeView === 'blockchain' && (
            <BlockchainVerification 
              onVerifyTask={(taskId) => alert(`Verifying task ${taskId} on blockchain`)}
              onViewTransaction={(txId) => alert(`Viewing transaction: ${txId}`)}
              onGenerateProof={(taskId) => alert(`Generating proof for task: ${taskId}`)}
            />
          )}
          
          {activeView === 'ml' && (
            <MLPredictions 
              tasks={tasks}
              onPredictionGenerate={(predictions) => alert(`Generated ${predictions.length} predictions`)}
              onInsightView={(insight) => alert(`Viewing insight: ${insight}`)}
            />
          )}
          
          {activeView === 'comments' && (
            <div className="all-comments-view">
              <h2>All Task Comments</h2>
              {loading ? (
                <div className="loading-message">Loading comments...</div>
              ) : (
                <div className="comments-grid">
                  {tasks.map(task => {
                    const taskComments = comments.filter(comment => comment.taskId === task.id);
                    const taskUser = teamMembers.find(user => user.id === task.assigneeId) || user;
                    
                    return (
                      <div key={task.id} className="task-comments-card">
                        <div className="task-comments-header">
                          <h3>{task.title}</h3>
                          <span className={`task-status-badge ${task.status}`}>{task.status}</span>
                        </div>
                        <div className="task-comments-list">
                          {taskComments.length === 0 ? (
                            <div className="no-comments">No comments yet</div>
                          ) : (
                            taskComments.map(comment => {
                              const commentUser = typeof comment.userId === 'object' 
                                ? comment.userId 
                                : teamMembers.find(user => user.id === comment.userId) || user;
                              return (
                                <div key={comment.id} className="comment-item">
                                  <div className="comment-header">
                                    <div className="comment-avatar">
                                      {commentUser?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="comment-author">
                                      <span className="author-name">{commentUser?.name || 'Unknown User'}</span>
                                      <span className="comment-time">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    {user && typeof comment.userId === 'string' && comment.userId === user.id && (
                                      <button 
                                        className="btn-icon btn-sm"
                                        onClick={() => handleDeleteComment(comment.id)}
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                  <div className="comment-content">{comment.content}</div>
                                </div>
                              );
                            })
                          )}
                        </div>
                        <div className="add-comment-form">
                          <textarea 
                            placeholder={`Add comment to ${task.title}...`}
                            className="comment-input"
                            rows={2}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                e.preventDefault();
                                const content = e.currentTarget.value.trim();
                                if (content && user) {
                                  handleAddComment(task.id, content);
                                  e.currentTarget.value = '';
                                }
                              }
                            }}
                          />
                          <button 
                            className="btn-primary btn-sm"
                            onClick={(e) => {
                              const input = e.currentTarget.parentElement?.querySelector('textarea');
                              if (input && user) {
                                const content = input.value.trim();
                                if (content) {
                                  handleAddComment(task.id, content);
                                  input.value = '';
                                }
                              }
                            }}
                          >
                            Add Comment
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          {activeView === 'api' && (
            <APITest />
          )}
        </div>
      </div>

      {isModalOpen && (
        <TaskModal 
          onClose={() => setIsModalOpen(false)} 
          onAdd={addTask} 
        />
      )}
    </div>
  );
}