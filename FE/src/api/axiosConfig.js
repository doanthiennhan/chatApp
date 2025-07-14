import axios from 'axios';
import { setTokens, logout } from '../redux/authSlice';
import { showNotification } from '../redux/notificationSlice';
import { refreshToken as refreshTokenApi } from './authService';

const getAccessToken = () => localStorage.getItem('accessToken');

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Tách interceptor thành hàm setup
export const setupInterceptors = (store) => {
  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
      if (error) prom.reject(error);
      else prom.resolve(token);
    });
    failedQueue = [];
  };

  api.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      if (token) config.headers['Authorization'] = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (
        error.response &&
        error.response.status === 401 &&
        !originalRequest._retry
      ) {
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }
        originalRequest._retry = true;
        isRefreshing = true;
        try {
          const storedRefreshToken = localStorage.getItem('refreshToken');
          const res = await refreshTokenApi(storedRefreshToken);
          const { accessToken, refreshToken } = res;
          store.dispatch(setTokens({ accessToken, refreshToken }));
          localStorage.setItem('accessToken', accessToken);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          processQueue(null, accessToken);
          originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
          return api(originalRequest);
        } catch (err) {
          processQueue(err, null);
          store.dispatch(logout());
          store.dispatch(showNotification({ type: 'error', message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' }));
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );
};

export default api;