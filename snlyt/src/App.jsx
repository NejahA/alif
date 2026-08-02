import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

const STORAGE_KEY = 'snlyt_data';
const THEME_KEY = 'snlyt_theme';
const VIEW_KEY = 'snlyt_view';
const NOTES_KEY = 'snlyt_notes';

const defaultData = {
  projects: [
    { id: '1', name: 'Launch Website', color: '#6366f1', createdAt: Date.now() },
    { id: '2', name: 'Mobile App', color: '#f59e0b', createdAt: Date.now() },
    { id: '3', name: 'Marketing', color: '#22c55e', createdAt: Date.now() },
  ],
  tasks: [
    { id: '101', projectId: '1', title: 'Design homepage', description: 'Create wireframes and high-fidelity mockups for the landing page', priority: 'high', status: 'in-progress', tags: ['design', 'frontend'], dueDate: Date.now() + 86400000 * 3, createdAt: Date.now(), assignee: '', subtasks: [{ id: 's1', title: 'Sketch wireframes', done: true }, { id: 's2', title: 'Figma mockups', done: false }], comments: [], order: 0, timeSpent: 0, isTracking: false, recurrence: null, archived: false, archivedAt: null },
    { id: '102', projectId: '1', title: 'Set up CI/CD', description: 'Configure GitHub Actions for automated deployment', priority: 'medium', status: 'todo', tags: ['devops'], dueDate: Date.now() + 86400000 * 7, createdAt: Date.now(), assignee: '', subtasks: [], comments: [], order: 1, timeSpent: 0, isTracking: false, recurrence: null, archived: false, archivedAt: null },
    { id: '103', projectId: '2', title: 'API integration', description: 'Connect mobile app to GraphQL backend', priority: 'high', status: 'done', tags: ['backend', 'api'], dueDate: Date.now() - 86400000 * 1, createdAt: Date.now(), assignee: '', subtasks: [], comments: [], order: 0, timeSpent: 0, isTracking: false, recurrence: null, archived: false, archivedAt: null },
    { id: '104', projectId: '3', title: 'Social media campaign', description: 'Plan and execute Q4 social media strategy', priority: 'low', status: 'todo', tags: ['marketing'], dueDate: Date.now() + 86400000 * 14, createdAt: Date.now(), assignee: '', subtasks: [], comments: [], order: 0, timeSpent: 0, isTracking: false, recurrence: null, archived: false, archivedAt: null },
  ],
  tags: ['design', 'frontend', 'backend', 'devops', 'api', 'marketing', 'bug', 'feature', 'docs'],
  activities: [
    { type: 'project_created', text: 'Created "Launch Website" project', time: Date.now() - 86400000 * 5 },
    { type: 'task_created', text: 'Added "Design homepage" task', time: Date.now() - 86400000 * 4 },
    { type: 'task_completed', text: 'Completed "API integration"', time: Date.now() - 86400000 * 1 },
  ],
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate legacy tasks to have new fields
      if (parsed.tasks) {
        parsed.tasks = parsed.tasks.map(t => ({
          ...t,
          order: t.order ?? 0,
          timeSpent: t.timeSpent ?? 0,
          isTracking: t.isTracking ?? false,
          recurrence: t.recurrence ?? null,
          archived: t.archived ?? false,
          archivedAt: t.archivedAt ?? null,
        }));
      }
      return parsed;
    }
  } catch {}
  return defaultData;
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'light';
  } catch { return 'light'; }
}

function loadView() {
  try {
    return localStorage.getItem(VIEW_KEY) || 'list';
  } catch { return 'list'; }
}

function loadNotes() {
  try {
    return localStorage.getItem(NOTES_KEY) || '';
  } catch { return ''; }
}

function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, notes);
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Color palette for projects
const projectColors = ['#6366f1', '#f59e0b', '#22c55e', '#ef4444', '#ec4899', '#14b8a6', '#8b5cf6', '#f97316', '#06b6d4'];

const STATUS_ORDER = { todo: 0, 'in-progress': 1, done: 2 };
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };
const PRIORITY_LABELS = { high: 'High', medium: 'Medium', low: 'Low' };
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const RECURRENCE_LABELS = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = (d - now) / 86400000;
  if (Math.abs(diff) < 1) return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (Math.abs(diff) < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

function isOverdue(ts) { return ts && ts < Date.now(); }

function daysUntil(ts) {
  if (!ts) return null;
  return Math.round((ts - Date.now()) / 86400000);
}

function isToday(ts) {
  if (!ts) return false;
  const d = new Date(ts);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function isThisWeek(ts) {
  if (!ts) return false;
  const d = new Date(ts);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return d >= startOfWeek && d < endOfWeek;
}

function formatTime(seconds) {
  if (!seconds || seconds < 0) return '0m';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function computeNextRecurrenceDate(recurrence, fromDate) {
  const d = new Date(fromDate);
  switch (recurrence) {
    case 'daily': d.setDate(d.getDate() + 1); break;
    case 'weekly': d.setDate(d.getDate() + 7); break;
    case 'monthly': d.setMonth(d.getMonth() + 1); break;
    default: return null;
  }
  return d.getTime();
}

export default function App() {
  const [data, setData] = useState(() => loadData());
  const [theme, setTheme] = useState(() => loadTheme());
  const [viewMode, setViewMode] = useState(() => loadView());
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(null);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [projectForm, setProjectForm] = useState({ name: '', color: '#6366f1' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo', tags: [], dueDate: '', assignee: '', recurrence: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [quickDateFilter, setQuickDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showImportExport, setShowImportExport] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [notes, setNotes] = useState(() => loadNotes());
  const [showNotes, setShowNotes] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [dragOverTaskId, setDragOverTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Timer interval refs
  const timerIntervals = useRef({});

  const fileInputRef = useRef(null);
  const searchRef = useRef(null);

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Save data effect
  useEffect(() => {
    saveData(data);
    // Handle recurring tasks when a task completes
    data.tasks.forEach(t => {
      if (t.status === 'done' && t.recurrence && !t._recurrenceHandled) {
        handleRecurrence(t);
      }
    });
  }, [data]);

  // Save view mode
  useEffect(() => {
    localStorage.setItem(VIEW_KEY, viewMode);
  }, [viewMode]);

  // Save notes
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Auto-select first project
  useEffect(() => {
    if (data.projects.length > 0 && !activeProjectId && !showDashboard) {
      setActiveProjectId(data.projects[0].id);
    }
  }, [data.projects, activeProjectId, showDashboard]);

  // Close context menu on click outside
  useEffect(() => {
    const handler = () => setContextMenu(null);
    if (contextMenu) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [contextMenu]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.key === 'n' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); openNewTask(); }
      if (e.key === 'p' && (e.metaKey || e.ctrlKey) && e.shiftKey) { e.preventDefault(); openNewProject(); }
      if (e.key === 'f' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === 'd' && (e.shiftKey)) { e.preventDefault(); setShowDashboard(d => !d); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timerIntervals.current).forEach(clearInterval);
    };
  }, []);

  // Handle recurrence task creation
  function handleRecurrence(task) {
    const newDueDate = computeNextRecurrenceDate(task.recurrence, task.dueDate || Date.now());
    const newTask = {
      ...task,
      id: genId(),
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: 'todo',
      tags: [...task.tags],
      dueDate: newDueDate,
      createdAt: Date.now(),
      subtasks: [],
      comments: [],
      assignee: task.assignee,
      order: task.order,
      timeSpent: 0,
      isTracking: false,
      recurrence: task.recurrence,
      archived: false,
      archivedAt: null,
      _recurrenceHandled: true,
    };
    delete newTask._recurrenceHandled;
    // Mark original as handled
    setData(prev => ({
      ...prev,
      tasks: [
        ...prev.tasks.map(t => t.id === task.id ? { ...t, _recurrenceHandled: true } : t),
        newTask,
      ],
    }));
    addActivity('task_created', `Recurring task created: "${task.title}" (${RECURRENCE_LABELS[task.recurrence]})`);
  }

  const activeProject = data.projects.find((p) => p.id === activeProjectId);

  const activeTasks = useMemo(() => {
    let tasks = data.tasks.filter((t) => t.projectId === activeProjectId && !t.archived);

    // Quick date filters
    if (quickDateFilter === 'today') {
      tasks = tasks.filter(t => t.dueDate && isToday(t.dueDate));
    } else if (quickDateFilter === 'this-week') {
      tasks = tasks.filter(t => t.dueDate && isThisWeek(t.dueDate));
    } else if (quickDateFilter === 'overdue') {
      tasks = tasks.filter(t => t.dueDate && t.dueDate < Date.now() && t.status !== 'done');
    } else if (quickDateFilter === 'upcoming') {
      tasks = tasks.filter(t => t.dueDate && t.dueDate >= Date.now() && t.status !== 'done');
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      tasks = tasks.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some(tag => tag.includes(q)));
    }
    if (filterPriority !== 'all') tasks = tasks.filter(t => t.priority === filterPriority);
    if (filterStatus !== 'all') tasks = tasks.filter(t => t.status === filterStatus);
    if (filterTag !== 'all') tasks = tasks.filter(t => t.tags.includes(filterTag));
    tasks.sort((a, b) => {
      switch (sortBy) {
        case 'priority': return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        case 'dueDate': return (a.dueDate || 0) - (b.dueDate || 0);
        case 'status': return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        case 'order': return (a.order ?? 0) - (b.order ?? 0);
        default: return b.createdAt - a.createdAt;
      }
    });
    return tasks;
  }, [data.tasks, activeProjectId, searchQuery, filterPriority, filterStatus, filterTag, sortBy, quickDateFilter]);

  // Archived tasks memo
  const archivedTasks = useMemo(() => {
    return data.tasks.filter(t => t.projectId === activeProjectId && t.archived)
      .sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0));
  }, [data.tasks, activeProjectId]);

  // Dashboard statistics
  const stats = useMemo(() => {
    const allTasks = data.tasks.filter(t => !t.archived);
    const total = allTasks.length;
    const done = allTasks.filter(t => t.status === 'done').length;
    const inProgress = allTasks.filter(t => t.status === 'in-progress').length;
    const todo = allTasks.filter(t => t.status === 'todo').length;
    const overdue = allTasks.filter(t => t.dueDate && t.dueDate < Date.now() && t.status !== 'done').length;
    const highPriority = allTasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
    const completionRate = total ? Math.round((done / total) * 100) : 0;
    const totalTimeSpent = allTasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
    const tasksByProject = data.projects.map(p => ({
      name: p.name,
      color: p.color,
      total: allTasks.filter(t => t.projectId === p.id).length,
      done: allTasks.filter(t => t.projectId === p.id && t.status === 'done').length,
    }));
    return { total, done, inProgress, todo, overdue, highPriority, completionRate, totalTimeSpent, tasksByProject };
  }, [data.tasks, data.projects]);

  // Activity log helpers
  function addActivity(type, text) {
    setData(prev => ({
      ...prev,
      activities: [{ type, text, time: Date.now() }, ...prev.activities].slice(0, 100),
    }));
  }

  // ---- PROJECT CRUD ----

  function addProject() {
    const name = projectForm.name.trim();
    if (!name) return;
    const project = { id: genId(), name, color: projectForm.color, createdAt: Date.now() };
    setData((prev) => ({ ...prev, projects: [...prev.projects, project] }));
    addActivity('project_created', `Created "${name}" project`);
    setProjectForm({ name: '', color: '#6366f1' });
    setShowProjectModal(false);
    setActiveProjectId(project.id);
  }

  function updateProject() {
    const name = projectForm.name.trim();
    if (!name || !editingProject) return;
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => p.id === editingProject.id ? { ...p, name, color: projectForm.color } : p),
    }));
    addActivity('project_updated', `Renamed project to "${name}"`);
    setEditingProject(null);
    setProjectForm({ name: '', color: '#6366f1' });
    setShowProjectModal(false);
  }

  function deleteProject(id) {
    const p = data.projects.find(x => x.id === id);
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
      tasks: prev.tasks.filter((t) => t.projectId !== id),
    }));
    if (activeProjectId === id) setActiveProjectId(null);
    addActivity('project_deleted', `Deleted "${p?.name}" project with all tasks`);
  }

  function openEditProject(project) {
    setEditingProject(project);
    setProjectForm({ name: project.name, color: project.color });
    setShowProjectModal(true);
  }

  function openNewProject() {
    setEditingProject(null);
    setProjectForm({ name: '', color: projectColors[Math.floor(Math.random() * projectColors.length)] });
    setShowProjectModal(true);
  }

  // ---- TASK CRUD ----

  function addTask() {
    const title = taskForm.title.trim();
    if (!title || !activeProjectId) return;
    const maxOrder = data.tasks
      .filter(t => t.projectId === activeProjectId && !t.archived)
      .reduce((max, t) => Math.max(max, t.order ?? 0), -1);
    const task = {
      id: genId(),
      projectId: activeProjectId,
      title,
      description: taskForm.description.trim(),
      priority: taskForm.priority,
      status: taskForm.status,
      tags: taskForm.tags,
      dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).getTime() : null,
      assignee: taskForm.assignee.trim(),
      createdAt: Date.now(),
      subtasks: [],
      comments: [],
      order: maxOrder + 1,
      timeSpent: 0,
      isTracking: false,
      recurrence: taskForm.recurrence || null,
      archived: false,
      archivedAt: null,
    };
    setData((prev) => ({ ...prev, tasks: [...prev.tasks, task] }));
    addActivity('task_created', `Added "${title}" task` + (task.recurrence ? ` (${RECURRENCE_LABELS[task.recurrence]})` : ''));
    setTaskForm({ title: '', description: '', priority: 'medium', status: 'todo', tags: [], dueDate: '', assignee: '', recurrence: '' });
    setShowTaskModal(false);
  }

  function updateTask() {
    const title = taskForm.title.trim();
    if (!title || !editingTask) return;
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === editingTask.id
          ? { ...t, title, description: taskForm.description.trim(), priority: taskForm.priority, status: taskForm.status, tags: taskForm.tags, dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).getTime() : null, assignee: taskForm.assignee.trim(), recurrence: taskForm.recurrence || null }
          : t
      ),
    }));
    addActivity('task_updated', `Updated "${title}" task`);
    setEditingTask(null);
    setTaskForm({ title: '', description: '', priority: 'medium', status: 'todo', tags: [], dueDate: '', assignee: '', recurrence: '' });
    setShowTaskModal(false);
  }

  function deleteTask(id) {
    const t = data.tasks.find(x => x.id === id);
    setData((prev) => ({ ...prev, tasks: prev.tasks.filter((x) => x.id !== id) }));
    setShowDetailPanel(null);
    addActivity('task_deleted', `Deleted "${t?.title}" task`);
  }

  function archiveTask(id) {
    const t = data.tasks.find(x => x.id === id);
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((x) => x.id === id ? { ...x, archived: true, archivedAt: Date.now() } : x),
    }));
    setShowDetailPanel(null);
    addActivity('task_archived', `Archived "${t?.title}" task`);
  }

  function restoreTask(id) {
    const t = data.tasks.find(x => x.id === id);
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((x) => x.id === id ? { ...x, archived: false, archivedAt: null } : x),
    }));
    addActivity('task_restored', `Restored "${t?.title}" task from archive`);
  }

  function duplicateTask(id) {
    const t = data.tasks.find(x => x.id === id);
    if (!t) return;
    const task = { ...t, id: genId(), title: t.title + ' (copy)', createdAt: Date.now(), archived: false, archivedAt: null, timeSpent: 0, isTracking: false };
    delete task._recurrenceHandled;
    setData((prev) => ({ ...prev, tasks: [...prev.tasks, task] }));
    addActivity('task_duplicated', `Duplicated "${t.title}" task`);
  }

  function updateTaskStatus(id, status) {
    const t = data.tasks.find(x => x.id === id);
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((x) => x.id === id ? { ...x, status } : x),
    }));
    if (status === 'done') {
      addActivity('task_completed', `Completed "${t?.title}"`);
      // Stop tracking if tracking
      if (t?.isTracking) stopTimer(id);
    } else if (t?.status === 'done') {
      addActivity('task_reopened', `Reopened "${t?.title}"`);
    }
  }

  function updateTaskPriority(id, priority) {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((x) => x.id === id ? { ...x, priority } : x),
    }));
  }

  function reorderTask(taskId, newOrder) {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => t.id === taskId ? { ...t, order: newOrder } : t),
    }));
  }

  function openEditTask(task) {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      tags: [...task.tags],
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      assignee: task.assignee || '',
      recurrence: task.recurrence || '',
    });
    setShowTaskModal(true);
  }

  function openNewTask() {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', priority: 'medium', status: 'todo', tags: [], dueDate: '', assignee: '', recurrence: '' });
    setShowTaskModal(true);
  }

  // ---- SUBTASKS ----

  function addSubtask(taskId) {
    if (!newSubtaskTitle.trim()) return;
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, subtasks: [...t.subtasks, { id: genId(), title: newSubtaskTitle.trim(), done: false }] } : t),
    }));
    setNewSubtaskTitle('');
  }

  function toggleSubtask(taskId, subId) {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, subtasks: t.subtasks.map(s => s.id === subId ? { ...s, done: !s.done } : s) } : t),
    }));
  }

  function deleteSubtask(taskId, subId) {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, subtasks: t.subtasks.filter(s => s.id !== subId) } : t),
    }));
  }

  // ---- COMMENTS ----

  function addComment(taskId) {
    if (!commentText.trim()) return;
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, comments: [...t.comments, { id: genId(), text: commentText.trim(), time: Date.now() }] } : t),
    }));
    setCommentText('');
    setShowCommentInput(null);
  }

  // ---- TAGS ----

  function addTag(tag) {
    if (!tag || data.tags.includes(tag)) return;
    setData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
  }

  function removeTag(tag) {
    setData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
      tasks: prev.tasks.map(t => ({ ...t, tags: t.tags.filter(x => x !== tag) })),
    }));
  }

  function toggleTaskTag(taskId, tag) {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, tags: t.tags.includes(tag) ? t.tags.filter(x => x !== tag) : [...t.tags, tag] } : t),
    }));
  }

  // ---- TIME TRACKING ----

  function startTimer(taskId) {
    if (timerIntervals.current[taskId]) return;
    // Stop any other active timers
    Object.keys(timerIntervals.current).forEach(id => {
      if (id !== taskId) stopTimer(id);
    });
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, isTracking: true } : t),
    }));
    timerIntervals.current[taskId] = setInterval(() => {
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, timeSpent: (t.timeSpent || 0) + 1 } : t),
      }));
    }, 1000);
  }

  function stopTimer(taskId) {
    if (timerIntervals.current[taskId]) {
      clearInterval(timerIntervals.current[taskId]);
      delete timerIntervals.current[taskId];
    }
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, isTracking: false } : t),
    }));
  }

  function toggleTimer(taskId) {
    const task = data.tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.isTracking) {
      stopTimer(taskId);
    } else {
      startTimer(taskId);
    }
  }

  // ---- IMPORT / EXPORT ----

  function exportData() {
    const exportObj = { ...data, notes };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snlyt-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (imported.projects && imported.tasks) {
          // Migrate tasks
          imported.tasks = imported.tasks.map(t => ({
            ...t,
            order: t.order ?? 0,
            timeSpent: t.timeSpent ?? 0,
            isTracking: false,
            recurrence: t.recurrence ?? null,
            archived: t.archived ?? false,
            archivedAt: t.archivedAt ?? null,
          }));
          setData(imported);
          if (imported.notes !== undefined) setNotes(imported.notes);
          addActivity('data_imported', 'Imported data from file');
        } else alert('Invalid file format');
      } catch { alert('Invalid JSON file'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // ---- DRAG & DROP ----

  function handleDragStart(e, taskId) {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e, taskId) {
    e.preventDefault();
    setDragOverTaskId(taskId);
  }

  function handleDragLeave() {
    setDragOverTaskId(null);
  }

  function handleDrop(e, targetTaskId) {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId === targetTaskId) {
      setDragOverTaskId(null);
      return;
    }
    const sourceTask = data.tasks.find(t => t.id === sourceId);
    const targetTask = data.tasks.find(t => t.id === targetTaskId);
    if (!sourceTask || !targetTask) return;

    setData(prev => {
      const tasks = [...prev.tasks];
      const srcIdx = tasks.findIndex(t => t.id === sourceId);
      const tgtIdx = tasks.findIndex(t => t.id === targetTaskId);
      if (srcIdx === -1 || tgtIdx === -1) return prev;
      const srcOrder = tasks[srcIdx].order ?? 0;
      const tgtOrder = tasks[tgtIdx].order ?? 0;
      tasks[srcIdx] = { ...tasks[srcIdx], order: tgtOrder };
      tasks[tgtIdx] = { ...tasks[tgtIdx], order: srcOrder };
      return { ...prev, tasks };
    });
    setDragOverTaskId(null);
    addActivity('task_reordered', `Reordered "${sourceTask.title}"`);
  }

  function handleKanbanDragOver(e, status) {
    e.preventDefault();
    setDragOverColumn(status);
  }

  function handleKanbanDrop(e, status) {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    const sourceTask = data.tasks.find(t => t.id === sourceId);
    if (!sourceTask) return;
    updateTaskStatus(sourceId, status);
    setDragOverColumn(null);
  }

  // ---- KANBAN ----

  function kanbanTasks(status) {
    return data.tasks
      .filter(t => t.projectId === activeProjectId && !t.archived && t.status === status)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  // ---- RENDER HELPERS ----

  const renderPriorityBadge = (p) => {
    const labels = { high: '🔥 High', medium: '⚡ Medium', low: '💤 Low' };
    return <span className={`badge badge-${p}`}>{labels[p]}</span>;
  };

  const renderStatusBadge = (s) => {
    return <span className={`status-badge status-${s}`}>{STATUS_LABELS[s]}</span>;
  };

  const renderTags = (tags) => tags.map(t => <span key={t} className="tag" onClick={(e) => { e.stopPropagation(); setFilterTag(t); }}>{t}</span>);

  const renderDueDate = (ts) => {
    if (!ts) return null;
    const overdue = isOverdue(ts);
    const d = daysUntil(ts);
    return <span className={`due-date ${overdue ? 'overdue' : ''}`} title={new Date(ts).toLocaleDateString()}>
      {overdue ? '🔴 ' : '📅 '}{formatDate(ts)}{d !== null && !overdue && d <= 3 ? ` (${d}d)` : ''}
    </span>;
  };

  const renderProgress = (subtasks) => {
    if (!subtasks || subtasks.length === 0) return null;
    const done = subtasks.filter(s => s.done).length;
    const pct = Math.round((done / subtasks.length) * 100);
    return (
      <div className="subtask-progress">
        <div className="progress-bar"><div className="progress-fill" style={{ width: pct + '%' }} /></div>
        <span>{done}/{subtasks.length}</span>
      </div>
    );
  };

  const renderTimeBadge = (task) => {
    if (!task.timeSpent && !task.isTracking) return null;
    const totalSecs = task.timeSpent || 0;
    return (
      <span className={`time-badge ${task.isTracking ? 'tracking' : ''}`} onClick={(e) => { e.stopPropagation(); toggleTimer(task.id); }} title={task.isTracking ? 'Stop timer' : 'Start timer'}>
        {task.isTracking ? '⏺ ' : '⏱ '}{formatTime(totalSecs + (task.isTracking ? timerIntervals.current[task.id] ? 0 : 0 : 0))}
      </span>
    );
  };

  const renderRecurrenceBadge = (r) => {
    if (!r) return null;
    const icons = { daily: '🔁', weekly: '🔁', monthly: '🔁' };
    return <span className="recurrence-badge" title={`Repeats ${r}`}>{icons[r]} {RECURRENCE_LABELS[r]}</span>;
  };

  const renderTaskCard = (task, isKanban = false) => (
    <div key={task.id} className={`task-card ${task.status === 'done' ? 'done' : ''} ${dragOverTaskId === task.id ? 'drag-over' : ''}`}
      draggable
      onDragStart={(e) => handleDragStart(e, task.id)}
      onDragOver={(e) => handleDragOver(e, task.id)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, task.id)}
      onClick={() => setShowDetailPanel(task.id)}
      onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, taskId: task.id }); }}
    >
      <div className="task-card-left">
        <div className={`task-priority-dot ${task.priority}`} onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done'); }} title={task.status === 'done' ? 'Reopen' : 'Complete'} />
      </div>
      <div className="task-card-body">
        <div className="task-title-row">
          <span className={`task-title ${task.status === 'done' ? 'done' : ''}`}>{task.title}</span>
          {!isKanban && renderStatusBadge(task.status)}
        </div>
        {task.description && <div className="task-desc">{task.description}</div>}
        {task.tags.length > 0 && <div className="task-tags">{renderTags(task.tags)}</div>}
        <div className="task-meta-row">
          {renderPriorityBadge(task.priority)}
          {renderDueDate(task.dueDate)}
          {renderProgress(task.subtasks)}
          {renderTimeBadge(task)}
          {renderRecurrenceBadge(task.recurrence)}
          {task.assignee && <span className="assignee">👤 {task.assignee}</span>}
          {task.comments?.length > 0 && <span className="comment-count">💬 {task.comments.length}</span>}
        </div>
      </div>
      {!isKanban && (
        <div className="task-card-actions">
          <button className="btn-icon" onClick={(e) => { e.stopPropagation(); toggleTimer(task.id); }} title={task.isTracking ? 'Stop Timer' : 'Start Timer'}>
            {task.isTracking ? '⏹' : '⏱'}
          </button>
          <button className="btn-icon" onClick={(e) => { e.stopPropagation(); openEditTask(task); }} title="Edit">✎</button>
          <button className="btn-icon" onClick={(e) => { e.stopPropagation(); duplicateTask(task.id); }} title="Duplicate">⧉</button>
          <button className="btn-icon" onClick={(e) => { e.stopPropagation(); archiveTask(task.id); }} title="Archive">📦</button>
        </div>
      )}
    </div>
  );

  // ---- MAIN RENDER ----

  return (
    <>
      {/* THEME CLASS */}
      <div className="app-container">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h1><span className="logo-icon">◆</span> snlyt</h1>
            <div className="sidebar-header-actions">
              <button className="btn-icon" onClick={() => setShowDashboard(d => !d)} title="Dashboard (Shift+D)">📊</button>
              <button className="btn-icon" onClick={() => setShowNotes(!showNotes)} title="Notes">📝</button>
              <button className="btn-icon" onClick={() => { setShowArchive(!showArchive); setShowDashboard(false); }} title="Archive">📦</button>
              <button className="btn-icon" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} title="Toggle theme">
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>

          <div className="sidebar-actions">
            <button className="btn btn-primary btn-full" onClick={openNewProject}>+ New Project</button>
          </div>

          <div className="sidebar-section-title">Projects</div>
          <div className="project-list">
            {data.projects.length === 0 && (
              <div className="sidebar-empty">No projects yet. Create one!</div>
            )}
            {data.projects.map((project) => {
              const count = data.tasks.filter((t) => t.projectId === project.id && !t.archived).length;
              const doneCount = data.tasks.filter((t) => t.projectId === project.id && !t.archived && t.status === 'done').length;
              return (
                <div key={project.id}
                  className={`project-item${activeProjectId === project.id ? ' active' : ''}`}
                  onClick={() => { setActiveProjectId(project.id); setShowDashboard(false); setShowArchive(false); }}
                >
                  <div className="project-indicator" style={{ background: project.color }} />
                  <span className="project-name">{project.name}</span>
                  <div className="project-stats">
                    {count > 0 && <span className="project-done-frac">{doneCount}/{count}</span>}
                  </div>
                  <div className="project-actions">
                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); openEditProject(project); }} title="Edit">✎</button>
                    <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); if (confirm('Delete this project and all its tasks?')) deleteProject(project.id); }} title="Delete">✕</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* NOTES WIDGET */}
          {showNotes && (
            <div className="notes-panel">
              <div className="notes-header">
                <span>📝 Notes</span>
                <button className="btn-icon" onClick={() => setShowNotes(false)}>✕</button>
              </div>
              <textarea
                className="notes-textarea"
                placeholder="Write your notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}

          {/* ARCHIVE PANEL */}
          {showArchive && (
            <div className="notes-panel archive-panel">
              <div className="notes-header">
                <span>📦 Archive ({archivedTasks.length})</span>
                <button className="btn-icon" onClick={() => setShowArchive(false)}>✕</button>
              </div>
              <div className="archive-list">
                {archivedTasks.length === 0 && <div className="sidebar-empty">No archived tasks</div>}
                {archivedTasks.map(task => (
                  <div key={task.id} className="archive-item">
                    <span className="archive-title">{task.title}</span>
                    <div className="archive-actions">
                      <button className="btn-icon" onClick={() => restoreTask(task.id)} title="Restore">↩</button>
                      <button className="btn-icon danger" onClick={() => deleteTask(task.id)} title="Delete permanently">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="sidebar-footer">
            <button className="btn btn-ghost btn-full" onClick={() => setShowActivityLog(!showActivityLog)}>
              📜 {showActivityLog ? 'Hide Log' : 'Activity Log'}
            </button>
            <button className="btn btn-ghost btn-full" onClick={() => setShowImportExport(!showImportExport)}>
              💾 {showImportExport ? 'Hide' : 'Import/Export'}
            </button>
            {showImportExport && (
              <div className="import-export-actions">
                <button className="btn btn-sm btn-full" onClick={exportData}>⬇ Export JSON</button>
                <button className="btn btn-sm btn-full" onClick={() => fileInputRef.current?.click()}>⬆ Import JSON</button>
                <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={importData} />
              </div>
            )}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="main-content">
          {/* DASHBOARD */}
          {showDashboard ? (
            <div className="dashboard">
              <div className="main-header">
                <h2>📊 Dashboard</h2>
                <button className="btn btn-ghost" onClick={() => setShowDashboard(false)}>Back to Project</button>
              </div>
              <div className="dashboard-grid">
                <div className="stat-card stat-total"><div className="stat-number">{stats.total}</div><div className="stat-label">Total Tasks</div></div>
                <div className="stat-card stat-done"><div className="stat-number">{stats.done}</div><div className="stat-label">Completed</div></div>
                <div className="stat-card stat-progress"><div className="stat-number">{stats.inProgress}</div><div className="stat-label">In Progress</div></div>
                <div className="stat-card stat-todo"><div className="stat-number">{stats.todo}</div><div className="stat-label">To Do</div></div>
                <div className="stat-card stat-overdue"><div className="stat-number">{stats.overdue}</div><div className="stat-label">Overdue</div></div>
                <div className="stat-card stat-high"><div className="stat-number">{stats.highPriority}</div><div className="stat-label">High Priority</div></div>
                <div className="stat-card stat-rate"><div className="stat-number">{stats.completionRate}%</div><div className="stat-label">Completion Rate</div></div>
                <div className="stat-card stat-time"><div className="stat-number">{formatTime(stats.totalTimeSpent)}</div><div className="stat-label">Total Time Tracked</div></div>
              </div>

              <div className="dashboard-section">
                <h3>Progress by Project</h3>
                <div className="project-progress-list">
                  {stats.tasksByProject.filter(p => p.total > 0).map(p => (
                    <div key={p.name} className="project-progress-row">
                      <div className="project-progress-name"><span className="project-indicator-sm" style={{ background: p.color }} />{p.name}</div>
                      <div className="project-progress-bar"><div className="project-progress-fill" style={{ width: p.total ? Math.round((p.done / p.total) * 100) + '%' : '0%', background: p.color }} /></div>
                      <span className="project-progress-pct">{p.total ? Math.round((p.done / p.total) * 100) : 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : !activeProject ? (
            <div className="no-project">
              <div className="icon">📋</div>
              <h2>Select or create a project</h2>
              <p>Choose a project from the sidebar or create a new one to get started</p>
              <button className="btn btn-primary" onClick={openNewProject}>+ Create Project</button>
            </div>
          ) : (
            <>
              {/* PROJECT HEADER */}
              <div className="main-header">
                <div className="main-header-left">
                  <div className="project-color-badge" style={{ background: activeProject.color }} />
                  <h2>{activeProject.name}</h2>
                  <span className="task-count">{activeTasks.length} tasks</span>
                </div>
                <div className="main-header-actions">
                  <div className="view-toggle">
                    <button className={`btn btn-icon-view ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List view">☰</button>
                    <button className={`btn btn-icon-view ${viewMode === 'kanban' ? 'active' : ''}`} onClick={() => setViewMode('kanban')} title="Kanban view">▦</button>
                  </div>
                  <button className="btn btn-primary" onClick={openNewTask} title="Ctrl+N">+ Add Task</button>
                </div>
              </div>

              {/* FILTERS & SEARCH */}
              <div className="filters-bar">
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input ref={searchRef} type="text" placeholder="Search tasks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  {searchQuery && <button className="clear-search" onClick={() => setSearchQuery('')}>✕</button>}
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select">
                  <option value="all">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="filter-select">
                  <option value="all">All Priority</option>
                  <option value="high">🔥 High</option>
                  <option value="medium">⚡ Medium</option>
                  <option value="low">💤 Low</option>
                </select>
                <select value={filterTag} onChange={e => setFilterTag(e.target.value)} className="filter-select">
                  <option value="all">All Tags</option>
                  {data.tags.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="filter-select">
                  <option value="created">Newest</option>
                  <option value="priority">Priority</option>
                  <option value="dueDate">Due Date</option>
                  <option value="status">Status</option>
                  <option value="order">Custom Order</option>
                </select>
                {(searchQuery || filterPriority !== 'all' || filterStatus !== 'all' || filterTag !== 'all') && (
                  <button className="btn btn-ghost btn-sm" onClick={() => { setSearchQuery(''); setFilterPriority('all'); setFilterStatus('all'); setFilterTag('all'); }}>Clear Filters ✕</button>
                )}
              </div>

              {/* QUICK DATE FILTERS */}
              <div className="quick-filters">
                <button className={`btn btn-sm quick-filter-btn ${quickDateFilter === 'all' ? 'active' : ''}`} onClick={() => setQuickDateFilter('all')}>All</button>
                <button className={`btn btn-sm quick-filter-btn ${quickDateFilter === 'today' ? 'active' : ''}`} onClick={() => setQuickDateFilter('today')}>Today</button>
                <button className={`btn btn-sm quick-filter-btn ${quickDateFilter === 'this-week' ? 'active' : ''}`} onClick={() => setQuickDateFilter('this-week')}>This Week</button>
                <button className={`btn btn-sm quick-filter-btn ${quickDateFilter === 'overdue' ? 'active' : ''}`} onClick={() => setQuickDateFilter('overdue')}>🔴 Overdue</button>
                <button className={`btn btn-sm quick-filter-btn ${quickDateFilter === 'upcoming' ? 'active' : ''}`} onClick={() => setQuickDateFilter('upcoming')}>Upcoming</button>
                {quickDateFilter !== 'all' && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setQuickDateFilter('all')}>✕</button>
                )}
              </div>

              {/* LIST VIEW */}
              {viewMode === 'list' && (
                <>
                  {activeTasks.length === 0 ? (
                    <div className="empty-state">
                      <div className="icon">📝</div>
                      <h3>No tasks found</h3>
                      <p>{searchQuery || quickDateFilter !== 'all' ? 'Try different search or filter criteria' : 'Add your first task to get started'}</p>
                    </div>
                  ) : (
                    <div className="task-list">
                      {activeTasks.map(task => renderTaskCard(task))}
                    </div>
                  )}
                </>
              )}

              {/* KANBAN VIEW */}
              {viewMode === 'kanban' && (
                <div className="kanban-board">
                  {['todo', 'in-progress', 'done'].map(status => (
                    <div key={status} className={`kanban-column ${dragOverColumn === status ? 'drag-over' : ''}`}
                      onDragOver={(e) => handleKanbanDragOver(e, status)}
                      onDragLeave={() => setDragOverColumn(null)}
                      onDrop={(e) => handleKanbanDrop(e, status)}
                    >
                      <div className="kanban-column-header">
                        <span className={`status-badge status-${status}`}>{STATUS_LABELS[status]}</span>
                        <span className="kanban-count">{kanbanTasks(status).length}</span>
                      </div>
                      <div className="kanban-column-body">
                        {kanbanTasks(status).length === 0 ? (
                          <div className="kanban-empty">No tasks</div>
                        ) : (
                          kanbanTasks(status).map(task => renderTaskCard(task, true))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ACTIVITY LOG */}
          {showActivityLog && (
            <div className="activity-panel">
              <div className="activity-panel-header">
                <h3>📜 Activity Log</h3>
                <button className="btn-icon" onClick={() => setShowActivityLog(false)}>✕</button>
              </div>
              <div className="activity-list">
                {data.activities.map((a, i) => (
                  <div key={i} className="activity-item">
                    <span className={`activity-icon activity-${a.type}`}>
                      {a.type.includes('created') ? '✅' : a.type.includes('deleted') ? '🗑️' : a.type.includes('completed') ? '✅' : a.type.includes('updated') ? '✏️' : a.type.includes('reopened') ? '🔄' : a.type.includes('imported') ? '📥' : a.type.includes('duplicated') ? '⧉' : a.type.includes('archived') ? '📦' : a.type.includes('restored') ? '↩' : a.type.includes('reordered') ? '↕' : '📌'}
                    </span>
                    <div className="activity-content">
                      <span className="activity-text">{a.text}</span>
                      <span className="activity-time">{formatDate(a.time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* DETAIL PANEL */}
        {showDetailPanel && (() => {
          const task = data.tasks.find(t => t.id === showDetailPanel);
          if (!task) return null;
          const project = data.projects.find(p => p.id === task.projectId);
          return (
            <aside className="detail-panel" onClick={(e) => e.target === e.currentTarget && setShowDetailPanel(null)}>
              <div className="detail-panel-content">
                <div className="detail-header">
                  <h3>{task.title}</h3>
                  <button className="btn-icon" onClick={() => setShowDetailPanel(null)}>✕</button>
                </div>

                <div className="detail-field">
                  <label>Status</label>
                  <div className="detail-status-actions">
                    {['todo', 'in-progress', 'done'].map(s => (
                      <button key={s} className={`btn btn-sm ${task.status === s ? 'btn-primary' : ''}`} onClick={() => updateTaskStatus(task.id, s)}>
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="detail-field">
                  <label>Priority</label>
                  <div className="detail-priority-actions">
                    {['high', 'medium', 'low'].map(p => (
                      <button key={p} className={`btn btn-sm ${task.priority === p ? `btn-${p === 'high' ? 'danger' : p === 'medium' ? 'warning' : 'success'}` : ''}`} onClick={() => updateTaskPriority(task.id, p)}>
                        {PRIORITY_LABELS[p]}
                      </button>
                    ))}
                  </div>
                </div>

                {task.description && (
                  <div className="detail-field">
                    <label>Description</label>
                    <p className="detail-desc">{task.description}</p>
                  </div>
                )}

                <div className="detail-field">
                  <label>Tags</label>
                  <div className="detail-tags">
                    {data.tags.map(tag => (
                      <span key={tag} className={`tag ${task.tags.includes(tag) ? 'tag-active' : ''}`} onClick={() => toggleTaskTag(task.id, tag)}>
                        {tag} {task.tags.includes(tag) ? '✓' : '+'}
                      </span>
                    ))}
                  </div>
                </div>

                {task.dueDate && (
                  <div className="detail-field">
                    <label>Due Date</label>
                    <span className={isOverdue(task.dueDate) && task.status !== 'done' ? 'overdue-text' : ''}>
                      {new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      {isOverdue(task.dueDate) && task.status !== 'done' && ' (Overdue!)'}
                    </span>
                  </div>
                )}

                {task.assignee && (
                  <div className="detail-field">
                    <label>Assignee</label>
                    <span>👤 {task.assignee}</span>
                  </div>
                )}

                {/* RECURRENCE */}
                <div className="detail-field">
                  <label>Recurrence</label>
                  <div className="detail-recurrence-actions">
                    {[null, 'daily', 'weekly', 'monthly'].map(r => (
                      <button key={r || 'none'} className={`btn btn-sm ${(task.recurrence || null) === r ? 'btn-primary' : ''}`} onClick={() => {
                        setData(prev => ({
                          ...prev,
                          tasks: prev.tasks.map(t => t.id === task.id ? { ...t, recurrence: r } : t),
                        }));
                      }}>
                        {r ? RECURRENCE_LABELS[r] : 'None'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TIME TRACKING */}
                <div className="detail-field">
                  <label>Time Tracking</label>
                  <div className="time-tracking-display">
                    <span className="time-display">⏱ {formatTime(task.timeSpent || 0)}</span>
                    <button className={`btn btn-sm ${task.isTracking ? 'btn-danger' : 'btn-primary'}`} onClick={() => toggleTimer(task.id)}>
                      {task.isTracking ? '⏹ Stop' : '▶ Start'} Timer
                    </button>
                    {task.isTracking && <span className="tracking-indicator">🔴 Recording...</span>}
                  </div>
                </div>

                <div className="detail-field">
                  <label>Subtasks ({task.subtasks.filter(s => s.done).length}/{task.subtasks.length})</label>
                  <div className="subtask-list">
                    {task.subtasks.map(sub => (
                      <div key={sub.id} className={`subtask-item ${sub.done ? 'done' : ''}`}>
                        <input type="checkbox" checked={sub.done} onChange={() => toggleSubtask(task.id, sub.id)} />
                        <span>{sub.title}</span>
                        <button className="btn-icon danger" onClick={() => deleteSubtask(task.id, sub.id)}>✕</button>
                      </div>
                    ))}
                  </div>
                  <div className="subtask-add">
                    <input type="text" placeholder="Add subtask..." value={newSubtaskTitle} onChange={e => setNewSubtaskTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSubtask(task.id)} />
                    <button className="btn btn-sm btn-primary" onClick={() => addSubtask(task.id)}>+</button>
                  </div>
                </div>

                <div className="detail-field">
                  <label>Comments ({task.comments?.length || 0})</label>
                  <div className="comment-list">
                    {task.comments?.map(c => (
                      <div key={c.id} className="comment-item">
                        <p>{c.text}</p>
                        <span className="comment-time">{formatDate(c.time)}</span>
                      </div>
                    ))}
                  </div>
                  {showCommentInput === task.id ? (
                    <div className="comment-add">
                      <textarea placeholder="Write a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} rows={2} />
                      <div className="comment-actions">
                        <button className="btn btn-sm btn-primary" onClick={() => addComment(task.id)}>Send</button>
                        <button className="btn btn-sm" onClick={() => { setShowCommentInput(null); setCommentText(''); }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn btn-sm btn-ghost" onClick={() => setShowCommentInput(task.id)}>💬 Add Comment</button>
                  )}
                </div>

                <div className="detail-actions">
                  <button className="btn btn-primary" onClick={() => { openEditTask(task); setShowDetailPanel(null); }}>✎ Edit Task</button>
                  <button className="btn" onClick={() => { archiveTask(task.id); }}>📦 Archive</button>
                  <button className="btn btn-danger" onClick={() => { if (confirm('Delete this task?')) deleteTask(task.id); }}>🗑 Delete</button>
                  <button className="btn" onClick={() => { duplicateTask(task.id); setShowDetailPanel(null); }}>⧉ Duplicate</button>
                </div>
              </div>
            </aside>
          );
        })()}

        {/* PROJECT MODAL */}
        {showProjectModal && (
          <div className="modal-overlay" onClick={() => { setShowProjectModal(false); setEditingProject(null); }}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>{editingProject ? 'Edit Project' : 'New Project'}</h3>
              <div className="form-group">
                <label>Project Name</label>
                <input type="text" value={projectForm.name} onChange={(e) => setProjectForm((f) => ({ ...f, name: e.target.value }))} placeholder="Enter project name" autoFocus onKeyDown={(e) => e.key === 'Enter' && (editingProject ? updateProject() : addProject())} />
              </div>
              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {projectColors.map(c => (
                    <div key={c} className={`color-swatch ${projectForm.color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setProjectForm(f => ({ ...f, color: c }))} />
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn" onClick={() => { setShowProjectModal(false); setEditingProject(null); }}>Cancel</button>
                <button className="btn btn-primary" onClick={editingProject ? updateProject : addProject}>{editingProject ? 'Save' : 'Create'}</button>
              </div>
            </div>
          </div>
        )}

        {/* TASK MODAL */}
        {showTaskModal && (
          <div className="modal-overlay" onClick={() => { setShowTaskModal(false); setEditingTask(null); }}>
            <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
              <h3>{editingTask ? 'Edit Task' : 'New Task'}</h3>
              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Task Title</label>
                  <input type="text" value={taskForm.title} onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))} placeholder="Enter task title" autoFocus />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={taskForm.priority} onChange={(e) => setTaskForm((f) => ({ ...f, priority: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={taskForm.status} onChange={(e) => setTaskForm((f) => ({ ...f, status: e.target.value }))}>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={taskForm.description} onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional description" rows={3} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Assignee</label>
                  <input type="text" value={taskForm.assignee} onChange={(e) => setTaskForm((f) => ({ ...f, assignee: e.target.value }))} placeholder="Name (optional)" />
                </div>
              </div>
              <div className="form-group">
                <label>Recurrence</label>
                <select value={taskForm.recurrence} onChange={(e) => setTaskForm((f) => ({ ...f, recurrence: e.target.value }))}>
                  <option value="">No recurrence</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tags</label>
                <div className="tag-selector">
                  {data.tags.map(tag => (
                    <span key={tag} className={`tag ${taskForm.tags.includes(tag) ? 'tag-active' : ''}`} onClick={() => setTaskForm(f => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag] }))}>
                      {tag} {taskForm.tags.includes(tag) ? '✓' : '+'}
                    </span>
                  ))}
                  <button className="tag tag-add" onClick={() => setShowTagModal(true)}>+ New Tag</button>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn" onClick={() => { setShowTaskModal(false); setEditingTask(null); }}>Cancel</button>
                <button className="btn btn-primary" onClick={editingTask ? updateTask : addTask}>{editingTask ? 'Save' : 'Add Task'}</button>
              </div>
            </div>
          </div>
        )}

        {/* TAG MODAL */}
        {showTagModal && (
          <div className="modal-overlay" onClick={() => { setShowTagModal(false); setTagInput(''); }}>
            <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
              <h3>Manage Tags</h3>
              <div className="tag-manager">
                {data.tags.map(tag => (
                  <div key={tag} className="tag-manager-item">
                    <span className="tag">{tag}</span>
                    <button className="btn-icon danger" onClick={() => removeTag(tag)}>✕</button>
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label>Add New Tag</label>
                <div className="tag-add-row">
                  <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Tag name" onKeyDown={e => e.key === 'Enter' && (addTag(tagInput.trim()), setTagInput(''))} />
                  <button className="btn btn-primary btn-sm" onClick={() => { addTag(tagInput.trim()); setTagInput(''); }}>Add</button>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn" onClick={() => { setShowTagModal(false); setTagInput(''); }}>Done</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CONTEXT MENU */}
      {contextMenu && (
        <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>
          <button onClick={() => { openEditTask(data.tasks.find(t => t.id === contextMenu.taskId)); setContextMenu(null); }}>✎ Edit</button>
          <button onClick={() => { toggleTimer(contextMenu.taskId); setContextMenu(null); }}>⏱ Toggle Timer</button>
          <button onClick={() => { duplicateTask(contextMenu.taskId); setContextMenu(null); }}>⧉ Duplicate</button>
          <button onClick={() => { archiveTask(contextMenu.taskId); setContextMenu(null); }}>📦 Archive</button>
          <div className="context-divider" />
          {['todo', 'in-progress', 'done'].map(s => (
            <button key={s} onClick={() => { updateTaskStatus(contextMenu.taskId, s); setContextMenu(null); }}>{STATUS_LABELS[s]}</button>
          ))}
          <div className="context-divider" />
          <button className="context-danger" onClick={() => { deleteTask(contextMenu.taskId); setContextMenu(null); }}>🗑 Delete</button>
        </div>
      )}
    </>
  );
}