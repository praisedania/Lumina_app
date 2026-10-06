import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor to attach Authorization Bearer token from localStorage
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('lumina_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global 401s and format error messages
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ status?: string; message?: string }>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        // Avoid redirecting if already on login or register or public routes
        const isAuthRoute = path === '/login' || path === '/register';
        if (!isAuthRoute && !path.startsWith('/courses')) {
          localStorage.removeItem('lumina_token');
          localStorage.removeItem('lumina_user');
          window.dispatchEvent(new Event('lumina_auth_logout'));
        }
      }
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
