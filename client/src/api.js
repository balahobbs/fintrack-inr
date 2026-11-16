import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fintrack_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthCall = err.config?.url?.startsWith('/auth/login') || err.config?.url?.startsWith('/auth/register');
    if (err.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem('fintrack_token');
      window.location.assign('/login');
    }
    return Promise.reject(err);
  }
);

export default api;
