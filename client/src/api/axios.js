import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

// attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pico_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// globally handle 401 — wipe token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pico_token');
      localStorage.removeItem('pico_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
