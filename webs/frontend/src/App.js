import React, { useState, useEffect } from 'react';
import './App.css';
import * as api from './services/api';
import Header from './components/Header';
import TaskForm from './components/TaskForm';

function App() {
  // State management
  const [tasks, setTasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [filters, setFilters] = useState({
    completed: null,
    priority: null,
    tag: null
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch tasks and tags on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    // Fetch tasks
    const tasksResult = await api.fetchTasks();
    if (tasksResult.error) {
      setError(tasksResult.error);
    } else {
      setTasks(tasksResult.data);
    }

    // Fetch tags
    const tagsResult = await api.fetchTags();
    if (tagsResult.error) {
      setError(tagsResult.error);
    } else {
      setTags(tagsResult.data);
    }

    setLoading(false);
  };

  // CRUD operation handlers
  const handleCreateTask = async (taskData) => {
    setLoading(true);
    setError(null);

    const result = await api.createTask(taskData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return { success: false, error: result.error };
    }

    setTasks([...tasks, result.data]);
    setLoading(false);
    return { success: true, data: result.data };
  };

  const handleUpdateTask = async (id, taskData) => {
    setLoading(true);
    setError(null);

    const result = await api.updateTask(id, taskData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return { success: false, error: result.error };
    }

    setTasks(tasks.map(task => task._id === id ? result.data : task));
    setLoading(false);
    return { success: true, data: result.data };
  };

  const handleDeleteTask = async (id) => {
    setLoading(true);
    setError(null);

    const result = await api.deleteTask(id);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return { success: false, error: result.error };
    }

    setTasks(tasks.filter(task => task._id !== id));
    setLoading(false);
    return { success: true };
  };

  const handleToggleComplete = async (id, currentStatus) => {
    return handleUpdateTask(id, { completed: !currentStatus });
  };

  // Filter and sort handlers
  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };

  const handleClearFilters = () => {
    setFilters({
      completed: null,
      priority: null,
      tag: null
    });
  };

  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
  };

  // Filter tasks based on active filters
  const filterTasks = (tasksToFilter) => {
    let filtered = tasksToFilter;

    if (filters.completed !== null) {
      filtered = filtered.filter(task => task.completed === filters.completed);
    }

    if (filters.priority !== null) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.tag !== null) {
      filtered = filtered.filter(task => task.tags.includes(filters.tag));
    }

    return filtered;
  };

  // Sort tasks based on selected sort option
  const sortTasks = (tasksToSort) => {
    const sorted = [...tasksToSort];

    switch (sortBy) {
      case 'dueDate':
        return sorted.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });

      case 'priority':
        const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
        return sorted.sort((a, b) =>
          priorityOrder[a.priority] - priorityOrder[b.priority]
        );

      case 'createdAt':
        return sorted.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );

      default:
        return sorted;
    }
  };

  // Get filtered and sorted tasks
  const getDisplayTasks = () => {
    const filtered = filterTasks(tasks);
    const sorted = sortTasks(filtered);
    return sorted;
  };

  const displayTasks = getDisplayTasks();

  return (
    <div className="App">
      <Header tasks={displayTasks} />
      <TaskForm onCreateTask={handleCreateTask} availableTags={tags} />
      {loading && <p>Loading...</p>}
      {error && <p className="error">Error: {error}</p>}
      {/* Components will be added in subsequent tasks */}
    </div>
  );
}

export default App;
