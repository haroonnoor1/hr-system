import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach access token ──────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: handle 401 with silent token refresh ────────────────
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
      const code = error.response?.data?.code;

      // Only attempt refresh on expired access tokens
      if (code === 'token_expired') {
        if (isRefreshing) {
          return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
            .then(token => {
              original.headers.Authorization = `Bearer ${token}`;
              return api(original);
            });
        }

        original._retry = true;
        isRefreshing    = true;

        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        try {
          const { data } = await axios.post(
            `${BASE_URL}/auth/refresh`,
            {},
            { headers: { Authorization: `Bearer ${refreshToken}` } }
          );
          localStorage.setItem('access_token', data.access_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          processQueue(null, data.access_token);
          return api(original);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth service helpers ───────────────────────────────────────────────────────
export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  logout: () => {
    const refreshToken = localStorage.getItem('refresh_token');
    return api.post('/auth/logout', {}, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
  },

  getMe: () => api.get('/auth/me'),

  forgotPassword: email =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token, password) =>
    api.post('/auth/reset-password', { token, password }),
};

export default api;
