import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach access token ────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Silent token refresh on 401 ───────────────────────────────────────────────
let isRefreshing = false;
let failedQueue  = [];

function processQueue(error, token = null) {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
}

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (error.response?.data?.code === 'token_expired') {
        if (isRefreshing) {
          return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
            .then(token => { original.headers.Authorization = `Bearer ${token}`; return api(original); });
        }
        original._retry = true;
        isRefreshing    = true;
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) { localStorage.clear(); window.location.href = '/login'; return Promise.reject(error); }
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` },
          });
          localStorage.setItem('access_token', data.access_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          processQueue(null, data.access_token);
          return api(original);
        } catch (err) {
          processQueue(err, null);
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(err);
        } finally { isRefreshing = false; }
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth service ───────────────────────────────────────────────────────────────
export const authService = {
  login:         (email, password) => api.post('/auth/login', { email, password }),
  logout:        ()  => api.post('/auth/logout', {}, { headers: { Authorization: `Bearer ${localStorage.getItem('refresh_token')}` } }),
  getMe:         ()  => api.get('/auth/me'),
  forgotPassword: email => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token, password) => api.post('/auth/reset-password', { token, password }),
};

// ── User service ───────────────────────────────────────────────────────────────
export const userService = {
  list:         ()       => api.get('/users'),
  stats:        ()       => api.get('/users/stats'),
  get:          id       => api.get(`/users/${id}`),
  create:       data     => api.post('/users', data),
  update:       (id, data) => api.put(`/users/${id}`, data),
  remove:       id       => api.delete(`/users/${id}`),
  toggleStatus: id       => api.patch(`/users/${id}/toggle-status`),
};

export default api;
