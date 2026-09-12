import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const userService = {
  getHistory: async () => {
    try {
      const response = await api.get('/users/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch history' };
    }
  },

  addHistory: async (historyData) => {
    try {
      const response = await api.post('/users/history', historyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to add history' };
    }
  },

  clearHistory: async () => {
    try {
      const response = await api.delete('/users/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to clear history' };
    }
  },

  getFavorites: async () => {
    try {
      const response = await api.get('/users/favorites');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch favorites' };
    }
  },

  addFavorite: async (favData) => {
    try {
      const response = await api.post('/users/favorites', favData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to add favorite' };
    }
  },

  removeFavorite: async (articleId, language) => {
    try {
      const response = await api.delete(`/users/favorites/${articleId}${language ? `?language=${language}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to remove favorite' };
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch stats' };
    }
  }
};

export const articleService = {
  getPopular: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/articles/popular${queryParams ? `?${queryParams}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch popular articles' };
    }
  },

  getTrending: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/articles/trending${queryParams ? `?${queryParams}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch trending articles' };
    }
  },

  syncArticle: async (articleData) => {
    try {
      const response = await api.post('/articles/sync', articleData);
      return response.data;
    } catch (error) {
      console.warn('Could not sync article with backend:', error);
      return null;
    }
  }
};

export default { userService, articleService };