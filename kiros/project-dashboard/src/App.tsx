import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Bell, 
  User, 
  Filter, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Users,
  Folder,
  BarChart3,
  Settings,
  Moon,
  Sun,
  X,
  Edit2,
  Eye,
  Trash2,
  Save,
  CalendarDays,
  Users as UsersIcon,
  Target,
  FileText,
  BarChart,
  Shield,
  Zap,
  Loader2
} from 'lucide-react';
import './modals.css';

type Project = {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'planning' | 'on-hold' | 'completed';
  progress: number;
  dueDate: string;
  teamSize: number;
  priority: 'high' | 'medium' | 'low';
};

type Task = {
  id: number;
  title: string;
  projectId: number;
  completed: boolean;
  dueDate: string;
  assignedTo: string;
};

type Notification = {
  id: number;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'planning' | 'on-hold' | 'completed',
    progress: 50, // Changed default to 50
    dueDate: new Date().toISOString().split('T')[0], // Today's date
    teamSize: 3,
    priority: 'medium' as 'high' | 'medium' | 'low'
  });
  
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: 'E-commerce Platform',
      description: 'Build a modern online shopping platform',
      status: 'active',
      progress: 75,
      dueDate: '2024-12-15',
      teamSize: 8,
      priority: 'high'
    },
    {
      id: 2,
      name: 'Mobile App Redesign',
      description: 'Redesign the mobile application UI/UX',
      status: 'planning',
      progress: 20,
      dueDate: '2024-11-30',
      teamSize: 5,
      priority: 'medium'
    },
    {
      id: 3,
      name: 'API Documentation',
      description: 'Create comprehensive API documentation',
      status: 'active',
      progress: 45,
      dueDate: '2024-10-30',
      teamSize: 3,
      priority: 'low'
    },
    {
      id: 4,
      name: 'Analytics Dashboard',
      description: 'Build real-time analytics dashboard',
      status: 'on-hold',
      progress: 60,
      dueDate: '2024-12-01',
      teamSize: 6,
      priority: 'high'
    },
    {
      id: 5,
      name: 'Security Audit',
      description: 'Conduct comprehensive security audit',
      status: 'completed',
      progress: 100,
      dueDate: '2024-09-15',
      teamSize: 4,
      priority: 'medium'
    },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Design wireframes', projectId: 1, completed: true, dueDate: '2024-10-15', assignedTo: 'Alex' },
    { id: 2, title: 'Setup database schema', projectId: 1, completed: true, dueDate: '2024-10-20', assignedTo: 'Sam' },
    { id: 3, title: 'Implement authentication', projectId: 1, completed: false, dueDate: '2024-10-25', assignedTo: 'Jordan' },
    { id: 4, title: 'Create user research plan', projectId: 2, completed: false, dueDate: '2024-10-18', assignedTo: 'Taylor' },
    { id: 5, title: 'Write API endpoints', projectId: 3, completed: false, dueDate: '2024-10-22', assignedTo: 'Casey' },
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: 'Project "E-commerce Platform" is 75% complete', time: '2 hours ago', read: false, type: 'info' },
    { id: 2, message: 'Task "Design wireframes" completed by Alex', time: '5 hours ago', read: false, type: 'success' },
    { id: 3, message: 'Project "Analytics Dashboard" is on hold', time: '1 day ago', read: false, type: 'warning' },
    { id: 4, message: 'New team member joined ProjectFlow', time: '2 days ago', read: true, type: 'info' },
  ]);

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    teamMembers: 26,
  };

  // Button functionality handlers
  const toggleTask = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleViewProject = (project: Project) => {
    alert(`Viewing Project: ${project.name}\n\nDescription: ${project.description}\nStatus: ${project.status}\nProgress: ${project.progress}%\nDue: ${project.dueDate}\nTeam Size: ${project.teamSize}\nPriority: ${project.priority}`);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setShowEditProjectModal(true);
  };

  const handleDeleteProject = (projectId: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== projectId));
      alert('Project deleted successfully!');
    }
  };

  const handleAddProject = () => {
    if (!newProject.name.trim()) {
      alert('Project name is required');
      return;
    }

    const newProjectObj: Project = {
      id: projects.length + 1,
      ...newProject
    };

    setProjects([...projects, newProjectObj]);
    setShowNewProjectModal(false);
    setNewProject({
      name: '',
      description: '',
      status: 'active',
      progress: 50,
      dueDate: new Date().toISOString().split('T')[0],
      teamSize: 3,
      priority: 'medium'
    });
    alert('Project added successfully!');
  };

  const handleUpdateProject = () => {
    if (!selectedProject) return;

    setProjects(projects.map(p => 
      p.id === selectedProject.id ? selectedProject : p
    ));
    setShowEditProjectModal(false);
    setSelectedProject(null);
    alert('Project updated successfully!');
  };

  const handleFilterProjects = () => {
    const statuses = ['active', 'planning', 'on-hold', 'completed'];
    const nextStatus = statuses[(statuses.indexOf('active') + 1) % statuses.length];
    
    setProjects(projects.map(p => ({
      ...p,
      status: nextStatus as any
    })));
    alert(`Filtered projects to show only: ${nextStatus}`);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const clearAllNotifications = () => {
    if (window.confirm('Clear all notifications?')) {
      setNotifications([]);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredProjects = searchTerm 
    ? projects.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : projects;

  const filteredTasks = searchTerm
    ? tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : tasks;

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4" />;
      case 'planning': return <AlertCircle className="w-4 h-4" />;
      case 'on-hold': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-yellow-500';
    }
  };

  const getPriorityText = (priority: Project['priority']) => {
    switch (priority) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Medium';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-text">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-surface border-b border-border shadow-sm">
          <div className="container py-4">
            <div className="flex-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Folder className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold">ProjectFlow</h1>
                </div>
                
                <div className="hidden md:flex items-center gap-6 ml-8">
                  <button className="text-text-secondary hover:text-text transition-colors">Dashboard</button>
                  <button className="text-text-secondary hover:text-text transition-colors">Projects</button>
                  <button className="text-text-secondary hover:text-text transition-colors">Tasks</button>
                  <button className="text-text-secondary hover:text-text transition-colors">Team</button>
                  <button className="text-text-secondary hover:text-text transition-colors">Analytics</button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Search projects, tasks..."
                    className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm w-48"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>

                <button 
                  className="p-2 hover:bg-background rounded-lg transition-colors"
                  onClick={() => setDarkMode(!darkMode)}
                  title="Toggle theme"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className="relative">
                  <button 
                    className="p-2 hover:bg-background rounded-lg transition-colors relative"
                    onClick={toggleNotifications}
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-lg shadow-lg z-50">
                      <div className="p-4 border-b border-border">
                        <div className="flex-between">
                          <h3 className="font-semibold">Notifications</h3>
                          <div className="flex gap-2">
                            <button 
                              className="text-sm text-primary hover:text-primary-dark"
                              onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                            >
                              Mark all read
                            </button>
                            <button 
                              className="text-sm text-red-500 hover:text-red-700"
                              onClick={clearAllNotifications}
                            >
                              Clear all
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-text-secondary">
                            No notifications
                          </div>
                        ) : (
                          notifications.map(notification => (
                            <div 
                              key={notification.id} 
                              className={`p-4 border-b border-border hover:bg-background cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <div className="flex-between mb-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${getNotificationColor(notification.type)}`}>
                                  {notification.type.toUpperCase()}
                                </span>
                                <span className="text-xs text-text-secondary">{notification.time}</span>
                              </div>
                              <p className="text-sm">{notification.message}</p>
                              {!notification.read && (
                                <div className="mt-2 text-xs text-primary">Click to mark as read</div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button className="flex items-center gap-2 p-2 hover:bg-background rounded-lg transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium hidden md:block">Admin</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container py-8">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card stat-card">
              <div className="flex-between">
                <div>
                  <p className="stat-label">Total Projects</p>
                  <p className="stat-value">{stats.totalProjects}</p>
                </div>
                <Folder className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="card stat-card">
              <div className="flex-between">
                <div>
                  <p className="stat-label">Active Projects</p>
                  <p className="stat-value">{stats.activeProjects}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-secondary" />
              </div>
            </div>

            <div className="card stat-card">
              <div className="flex-between">
                <div>
                  <p className="stat-label">Completed</p>
                  <p className="stat-value">{stats.completedProjects}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="card stat-card">
              <div className="flex-between">
                <div>
                  <p className="stat-label">Team Members</p>
                  <p className="stat-value">{stats.teamMembers}</p>
                </div>
                <Users className="w-8 h-8 text-warning" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Projects List */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="flex-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Active Projects</h2>
                    <p className="text-text-secondary text-sm">Track and manage your ongoing projects</p>
                    <p className="text-xs text-text-secondary mt-1">
                      Showing {filteredProjects.length} of {projects.length} projects
                      {searchTerm && ` for "${searchTerm}"`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-primary flex items-center gap-2"
                      onClick={() => setShowNewProjectModal(true)}
                    >
                      <Plus className="w-4 h-4" />
                      New Project
                    </button>
                    <button 
                      className="p-2 hover:bg-background rounded-lg transition-colors"
                      onClick={handleFilterProjects}
                      title="Filter projects"
                    >
                      <Filter className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredProjects.map(project => (
                    <div key={project.id} className="p-4 border border-border rounded-lg hover:bg-background/50 transition-colors">
                      <div className="flex-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Folder className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{project.name}</h3>
                            <p className="text-sm text-text-secondary">{project.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                                Priority: {getPriorityText(project.priority)}
                              </span>
                              <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                                Team: {project.teamSize} members
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`tag tag-${project.status}`}>
                            {getStatusIcon(project.status)}
                            <span className="ml-1 capitalize">{project.status}</span>
                          </span>
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(project.priority)}`}></div>
                        </div>
                      </div>

                      <div className="flex-between text-sm">
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-text-secondary">Progress</p>
                            <div className="w-48 bg-border rounded-full h-2 mt-1">
                              <div 
                                className="h-full bg-primary rounded-full" 
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs mt-1 text-text-secondary">{project.progress}% complete</p>
                          </div>
                          <div>
                            <p className="text-text-secondary">Due Date</p>
                            <p className="font-medium">{project.dueDate}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-background transition-colors flex items-center gap-1"
                            onClick={() => handleViewProject(project)}
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                          <button 
                            className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-1"
                            onClick={() => handleEditProject(project)}
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </button>
                          <button 
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tasks & Activity */}
            <div className="space-y-6">
              {/* Upcoming Tasks */}
              <div className="card">
                <div className="flex-between mb-6">
                  <h2 className="text-xl font-bold">Upcoming Tasks</h2>
                  <button className="text-sm text-primary hover:text-primary-dark font-medium">
                    View All
                  </button>
                </div>

                <div className="space-y-4">
                  {filteredTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <button 
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center ${task.completed ? 'bg-primary border-primary' : 'border-text-secondary'}`}
                        title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {task.completed && <CheckCircle className="w-3 h-3 text-white" />}
                      </button>
                      <div className="flex-1">
                        <p className={`font-medium ${task.completed ? 'line-through text-text-secondary' : ''}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-text-secondary mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {task.dueDate}
                          </span>
                          <span>Assigned to {task.assignedTo}</span>
                        </div>
                      </div>
                      <button 
                        className="text-text-secondary hover:text-red-500"
                        onClick={() => {
                          if (window.confirm('Delete this task?')) {
                            setTasks(tasks.filter(t => t.id !== task.id));
                          }
                        }}
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="card">
                <h2 className="text-xl font-bold mb-6">Project Status</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Active', value: stats.activeProjects, color: 'bg-primary' },
                    { label: 'Planning', value: projects.filter(p => p.status === 'planning').length, color: 'bg-warning' },
                    { label: 'On Hold', value: projects.filter(p => p.status === 'on-hold').length, color: 'bg-text-secondary' },
                    { label: 'Completed', value: stats.completedProjects, color: 'bg-secondary' },
                  ].map((stat, index) => (
                    <div key={index}>
                      <div className="flex-between text-sm mb-1">
                        <span>{stat.label}</span>
                        <span>{stat.value} projects</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-2">
                        <div 
                          className={`h-full rounded-full ${stat.color}`}
                          style={{ width: `${(stat.value / stats.totalProjects) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-border py-6">
          <div className="container">
            <div className="flex-between">
              <div className="text-text-secondary text-sm">
                © 2024 ProjectFlow. All rights reserved.
              </div>
              <div className="flex items-center gap-4">
                <button 
                  className="text-text-secondary hover:text-text transition-colors"
                  onClick={() => alert('Settings opened')}
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button 
                  className="text-text-secondary hover:text-text transition-colors"
                  onClick={() => alert('Analytics opened')}
                  title="Analytics"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* New Project Modal - Modern Design */}
      {showNewProjectModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Create New Project</h2>
                <p className="modal-subtitle">Fill in the details to add a new project to your dashboard</p>
              </div>
              <button 
                className="modal-close-btn"
                onClick={() => setShowNewProjectModal(false)}
              >
                <X />
              </button>
            </div>

            <div className="modal-body">
              {/* Basic Information Section */}
              <div className="form-section">
                <h3 className="form-section-title">Basic Information</h3>
                
                <div className="form-field">
                  <label className="form-label">
                    Project Name
                    <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    placeholder="e.g., E-commerce Platform Redesign"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Description
                    <span className="optional">Optional</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    placeholder="Describe what this project is about..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Status & Progress Section */}
              <div className="form-section">
                <h3 className="form-section-title">Status & Progress</h3>
                
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">
                      <Target size={16} />
                      Status
                    </label>
                    <select 
                      className="form-select"
                      value={newProject.status}
                      onChange={(e) => setNewProject({...newProject, status: e.target.value as any})}
                    >
                      <option value="active" className="status-option">
                        <span className="status-badge active"></span>
                        Active
                      </option>
                      <option value="planning" className="status-option">
                        <span className="status-badge planning"></span>
                        Planning
                      </option>
                      <option value="on-hold" className="status-option">
                        <span className="status-badge on-hold"></span>
                        On Hold
                      </option>
                      <option value="completed" className="status-option">
                        <span className="status-badge completed"></span>
                        Completed
                      </option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      <BarChart size={16} />
                      Progress
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="form-input"
                      value={newProject.progress}
                      onChange={(e) => setNewProject({...newProject, progress: parseInt(e.target.value) || 0})}
                      style={{ padding: '12px 16px' }}
                    />
                    <div className="progress-preview">
                      <div 
                        className="progress-fill"
                        style={{ width: `${newProject.progress}%` }}
                      ></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                      <span className="text-xs text-text-secondary">0%</span>
                      <span className="text-sm font-semibold">{newProject.progress}%</span>
                      <span className="text-xs text-text-secondary">100%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline & Team Section */}
              <div className="form-section">
                <h3 className="form-section-title">Timeline & Team</h3>
                
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">
                      <CalendarDays size={16} />
                      Due Date
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={newProject.dueDate}
                      onChange={(e) => setNewProject({...newProject, dueDate: e.target.value})}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      <UsersIcon size={16} />
                      Team Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      className="form-input"
                      value={newProject.teamSize}
                      onChange={(e) => setNewProject({...newProject, teamSize: parseInt(e.target.value) || 1})}
                      placeholder="Number of team members"
                    />
                  </div>
                </div>
              </div>

              {/* Priority Section */}
              <div className="form-section">
                <h3 className="form-section-title">Priority Settings</h3>
                
                <div className="form-field">
                  <label className="form-label">
                    <Zap size={16} />
                    Priority Level
                  </label>
                  <select 
                    className="form-select"
                    value={newProject.priority}
                    onChange={(e) => setNewProject({...newProject, priority: e.target.value as any})}
                  >
                    <option value="high" className="priority-indicator">
                      <span className="priority-dot high"></span>
                      High Priority
                    </option>
                    <option value="medium" className="priority-indicator">
                      <span className="priority-dot medium"></span>
                      Medium Priority
                    </option>
                    <option value="low" className="priority-indicator">
                      <span className="priority-dot low"></span>
                      Low Priority
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="modal-btn modal-btn-secondary"
                onClick={() => setShowNewProjectModal(false)}
              >
                <X size={18} />
                Cancel
              </button>
              <button 
                className="modal-btn modal-btn-primary"
                onClick={handleAddProject}
              >
                <Save size={18} />
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal - Modern Design */}
      {showEditProjectModal && selectedProject && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Edit Project</h2>
                <p className="modal-subtitle">Update the project details and settings</p>
              </div>
              <button 
                className="modal-close-btn"
                onClick={() => {
                  setShowEditProjectModal(false);
                  setSelectedProject(null);
                }}
              >
                <X />
              </button>
            </div>

            <div className="modal-body">
              {/* Basic Information Section */}
              <div className="form-section">
                <h3 className="form-section-title">Basic Information</h3>
                
                <div className="form-field">
                  <label className="form-label">
                    Project Name
                    <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={selectedProject.name}
                    onChange={(e) => setSelectedProject({...selectedProject, name: e.target.value})}
                    placeholder="Project name"
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">
                    Description
                    <span className="optional">Optional</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    value={selectedProject.description}
                    onChange={(e) => setSelectedProject({...selectedProject, description: e.target.value})}
                    placeholder="Project description..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Status & Progress Section */}
              <div className="form-section">
                <h3 className="form-section-title">Status & Progress</h3>
                
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">
                      <Target size={16} />
                      Status
                    </label>
                    <select 
                      className="form-select"
                      value={selectedProject.status}
                      onChange={(e) => setSelectedProject({...selectedProject, status: e.target.value as any})}
                    >
                      <option value="active" className="status-option">
                        <span className="status-badge active"></span>
                        Active
                      </option>
                      <option value="planning" className="status-option">
                        <span className="status-badge planning"></span>
                        Planning
                      </option>
                      <option value="on-hold" className="status-option">
                        <span className="status-badge on-hold"></span>
                        On Hold
                      </option>
                      <option value="completed" className="status-option">
                        <span className="status-badge completed"></span>
                        Completed
                      </option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      <BarChart size={16} />
                      Progress
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="form-input"
                      value={selectedProject.progress}
                      onChange={(e) => setSelectedProject({...selectedProject, progress: parseInt(e.target.value) || 0})}
                      style={{ padding: '12px 16px' }}
                    />
                    <div className="progress-preview">
                      <div 
                        className="progress-fill"
                        style={{ width: `${selectedProject.progress}%` }}
                      ></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                      <span className="text-xs text-text-secondary">0%</span>
                      <span className="text-sm font-semibold">{selectedProject.progress}%</span>
                      <span className="text-xs text-text-secondary">100%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline & Team Section */}
              <div className="form-section">
                <h3 className="form-section-title">Timeline & Team</h3>
                
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">
                      <CalendarDays size={16} />
                      Due Date
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={selectedProject.dueDate}
                      onChange={(e) => setSelectedProject({...selectedProject, dueDate: e.target.value})}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      <UsersIcon size={16} />
                      Team Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      className="form-input"
                      value={selectedProject.teamSize}
                      onChange={(e) => setSelectedProject({...selectedProject, teamSize: parseInt(e.target.value) || 1})}
                      placeholder="Number of team members"
                    />
                  </div>
                </div>
              </div>

              {/* Priority Section */}
              <div className="form-section">
                <h3 className="form-section-title">Priority Settings</h3>
                
                <div className="form-field">
                  <label className="form-label">
                    <Zap size={16} />
                    Priority Level
                  </label>
                  <select 
                    className="form-select"
                    value={selectedProject.priority}
                    onChange={(e) => setSelectedProject({...selectedProject, priority: e.target.value as any})}
                  >
                    <option value="high" className="priority-indicator">
                      <span className="priority-dot high"></span>
                      High Priority
                    </option>
                    <option value="medium" className="priority-indicator">
                      <span className="priority-dot medium"></span>
                      Medium Priority
                    </option>
                    <option value="low" className="priority-indicator">
                      <span className="priority-dot low"></span>
                      Low Priority
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="modal-btn modal-btn-secondary"
                onClick={() => {
                  setShowEditProjectModal(false);
                  setSelectedProject(null);
                }}
              >
                <X size={18} />
                Cancel
              </button>
              <button 
                className="modal-btn modal-btn-primary"
                onClick={handleUpdateProject}
              >
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;