import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Task API functions
export const fetchTasks = async (filters = {}) => {
  try {
    const params = {};
    if (filters.completed !== null && filters.completed !== undefined) {
      params.completed = filters.completed;
    }
    if (filters.priority) {
      params.priority = filters.priority;
    }
    if (filters.tag) {
      params.tag = filters.tag;
    }
    
    const response = await axios.get(`${API_BASE_URL}/tasks`, { params });
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data?.error?.message || error.message };
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tasks`, taskData);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data?.error?.message || error.message };
  }
};

export const updateTask = async (id, taskData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/tasks/${id}`, taskData);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data?.error?.message || error.message };
  }
};

export const deleteTask = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/tasks/${id}`);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data?.error?.message || error.message };
  }
};

// Tag API functions
export const fetchTags = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tags`);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data?.error?.message || error.message };
  }
};

export const createTag = async (tagData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tags`, tagData);
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data?.error?.message || error.message };
  }
};
