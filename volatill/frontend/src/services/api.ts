import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('volatill_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('volatill_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH ============
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  getMe: () => api.get('/auth/me'),
  updatePreferences: (preferences: Record<string, unknown>) =>
    api.put('/auth/preferences', preferences),
};

// ============ MARKET ============
export const marketAPI = {
  getTopCoins: (count = 50) => api.get(`/market/top?count=${count}`),
  getCoinDetails: (coinId: string) => api.get(`/market/coin/${coinId}`),
  getCoinChart: (coinId: string, days = 7) => api.get(`/market/coin/${coinId}/chart?days=${days}`),
  searchCoins: (query: string) => api.get(`/market/search?q=${query}`),
  getVolatilityRankings: (limit = 20, hours = 24) =>
    api.get(`/market/volatility?limit=${limit}&hours=${hours}`),
  getPrices: (coinIds: string[]) => api.post('/market/prices', { coinIds }),
};

// ============ WATCHLISTS ============
export const watchlistAPI = {
  getWatchlists: () => api.get('/watchlists'),
  createWatchlist: (name: string) => api.post('/watchlists', { name }),
  updateWatchlist: (id: string, name: string) => api.put(`/watchlists/${id}`, { name }),
  deleteWatchlist: (id: string) => api.delete(`/watchlists/${id}`),
  addCoin: (watchlistId: string, coin: { coinId: string; symbol: string; name: string; notes?: string }) =>
    api.post(`/watchlists/${watchlistId}/coins`, coin),
  removeCoin: (watchlistId: string, coinId: string) =>
    api.delete(`/watchlists/${watchlistId}/coins/${coinId}`),
  updateCoinNotes: (watchlistId: string, coinId: string, notes: string) =>
    api.put(`/watchlists/${watchlistId}/coins/${coinId}`, { notes }),
};

// ============ ALERTS ============
export const alertAPI = {
  getAlerts: (params?: Record<string, string>) =>
    api.get('/alerts', { params }),
  createAlert: (alert: { coinId: string; symbol: string; coinName?: string; type: string; condition: number }) =>
    api.post('/alerts', alert),
  updateAlert: (id: string, updates: Record<string, unknown>) =>
    api.put(`/alerts/${id}`, updates),
  deleteAlert: (id: string) => api.delete(`/alerts/${id}`),
  dismissAll: () => api.post('/alerts/dismiss-all'),
};

export default api;