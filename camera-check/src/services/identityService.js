import axios from "axios";
import { jwtDecode } from "jwt-decode";
import store from "../store";
import {
  setAccessToken as setAccessTokenRedux,
  removeAccessToken as removeAccessTokenRedux,
} from "../store";

const identityApi = axios.create({
  baseURL: "http://localhost:8080/identity",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAccessToken = (token) => {
  let userInfo = null;
  let roles = null;
  try {
    const decoded = jwtDecode(token);
    userInfo = { email: decoded.email, sub: decoded.sub };
    roles = decoded.roles || null;
  } catch {}
  store.dispatch(setAccessTokenRedux({ token, userInfo, roles }));
  localStorage.setItem("accessToken", token);
};

export const getAccessToken = () => localStorage.getItem("accessToken");

export const removeAccessToken = () => {
  store.dispatch(removeAccessTokenRedux());
  localStorage.removeItem("accessToken");
};

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    return decoded.exp > now;
  } catch {
    return false;
  }
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const refreshAccessToken = async () => {
  const res = await identityApi.post("/auth/refresh-token");
  const { accessToken } = res.data.data;
  setAccessToken(accessToken);
  return accessToken;
};

// --- Axios Interceptors ---
identityApi.interceptors.request.use(
  async (config) => {
    const token = getAccessToken();

    if (token && isTokenValid(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

identityApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return identityApi(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const token = await refreshAccessToken();
        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return identityApi(originalRequest);
      } catch (err) {
        processQueue(err, null);
        removeAccessToken();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const signin = async (email, password) => {
  const res = await identityApi.post("/api/auth/signin", { email, password });
  const { accessToken } = res.data.data;
  setAccessToken(accessToken);
  return res.data;
};

export const signup = async (email, password) => {
  const res = await identityApi.post("/api/auth/signup", { email, password });
  return res.data;
};

export const logout = async () => {
  await identityApi.post("/auth/logout");
  removeAccessToken();
};

export const searchUsers = (search = '', page = 1, size = 10) => 
  identityApi.get(`/users?search=${search}&page=${page}&size=${size}`);

export default identityApi;
