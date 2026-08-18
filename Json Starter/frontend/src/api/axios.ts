import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token might be expired
      localStorage.removeItem('token');
      // We don't want to force redirect on every 401 as it might just be the initial check,
      // but the AuthContext will handle state.
    }
    return Promise.reject(error);
  }
);

export default api;
