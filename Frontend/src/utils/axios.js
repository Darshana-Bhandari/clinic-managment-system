import axios from 'axios';
import { API_URL } from './constants.js';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const getStoredAccessToken = () => {
  try {
    return localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

const clearAuthStorage = () => {
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_role');
    localStorage.removeItem('auth_user');
  } catch {
    // ignore
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.skipAuth) {
      delete config.headers.Authorization;
      return config;
    }
    const token = getStoredAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    if (error.response.status === 401 && !originalRequest.skipAuth && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        isRefreshing = false;
        clearAuthStorage();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        const response = await axiosInstance.post('/auth/refresh-token', {
          refreshToken,
        }, { skipAuth: true });

        const { accessToken, refreshToken: newRefreshToken } = response.data?.data || {};

        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('auth_token', accessToken);
        }
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        isRefreshing = false;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthStorage();
        isRefreshing = false;
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response.status === 403) {
      clearAuthStorage();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;