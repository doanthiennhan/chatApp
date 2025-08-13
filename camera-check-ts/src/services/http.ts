import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { getAccessToken, setAccessToken, removeAccessToken } from './identityService';

const getBaseUrl = (key: string, fallback: string) => {
  const value = (import.meta as any).env?.[key];
  return value || fallback;
};

export const IDENTITY_BASE_URL = getBaseUrl('VITE_IDENTITY_BASE_URL', 'http://localhost:8080/identity');
export const CHAT_BASE_URL = getBaseUrl('VITE_CHAT_BASE_URL', 'http://localhost:8081/chat/api');
export const CAMERA_BASE_URL = getBaseUrl('VITE_CAMERA_BASE_URL', 'http://localhost:8082/camera/api');
export const CAMERA_PUBLIC_BASE = getBaseUrl('VITE_CAMERA_PUBLIC_BASE', 'http://localhost:8082');

// Queue for failed requests while token is refreshing
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];
let isRefreshing = false;

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

// This function will be responsible for refreshing the token
const refreshAccessToken = async (): Promise<string> => {
  try {
    // Use a direct, clean axios call to the refresh endpoint to avoid interceptor loops
    const res = await axios.post(`${IDENTITY_BASE_URL}/api/auth/refresh-token`, {}, { withCredentials: true });
    const { accessToken } = res.data.data;
    setAccessToken(accessToken);
    return accessToken;
  } catch (error) {
    removeAccessToken();
    // Use a small delay to ensure the redirect happens after any ongoing state updates.
    setTimeout(() => {
      // Redirect to login page if refresh fails
      window.location.href = '/login';
    }, 100);
    return Promise.reject(error);
  }
};

export const createHttpClient = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add the token to headers
  instance.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle errors and token refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Handle 401 Unauthorized errors for token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return instance(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newAccessToken = await refreshAccessToken();
          processQueue(null, newAccessToken);
          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
          return instance(originalRequest);
        } catch (err) {
          processQueue(err, null);
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      // Handle other server-side errors
      if (error.response) {
        const data: any = error.response.data;
        const errorMessage =
          data?.message ||
          (Array.isArray(data?.errors) && data.errors[0]) ||
          data?.error ||
          `Yêu cầu thất bại với mã lỗi ${error.response.status}`;
        message.error(errorMessage);
      } else if (error.request) {
        // Handle network errors
        message.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      } else {
        // Handle other errors
        message.error('Đã có lỗi xảy ra khi gửi yêu cầu.');
      }

      return Promise.reject(error);
    }
  );

  return instance;
}; 