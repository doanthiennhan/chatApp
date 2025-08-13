import axios from "axios";
import { jwtDecode } from "jwt-decode";
import store from "../store";
import {
  setAccessToken as setAccessTokenRedux,
  removeAccessToken as removeAccessTokenRedux,
} from "../store";
import "../types"; // Import JSDoc types

const identityApi = axios.create({
  baseURL: "http://localhost:8080/identity",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Sets the access token in localStorage and Redux store.
 * @param {string} token - The access token.
 */
export const setAccessToken = (token) => {
  let userInfo = null;
  let roles = null;
  try {
    const decoded = jwtDecode(token);
    userInfo = { email: decoded.email, sub: decoded.sub };
    roles = decoded.roles || null;
  } catch {
    // Do nothing
  }
  store.dispatch(setAccessTokenRedux({ token, userInfo, roles }));
  localStorage.setItem("accessToken", token);
};

/**
 * Gets the access token from localStorage.
 * @returns {string | null} The access token, or null if not found.
 */
export const getAccessToken = () => localStorage.getItem("accessToken");

/**
 * Removes the access token from localStorage and Redux store.
 */
export const removeAccessToken = () => {
  store.dispatch(removeAccessTokenRedux());
  localStorage.removeItem("accessToken");
};

/**
 * Checks if a token is valid (not expired).
 * @param {string} token - The token to validate.
 * @returns {boolean} True if the token is valid, false otherwise.
 */
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

/**
 * Refreshes the access token.
 * @returns {Promise<string>} A promise that resolves to the new access token.
 */
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

/**
 * Signs in a user.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<any>} A promise that resolves to the sign-in response.
 */
export const signin = async (email, password) => {
  const res = await identityApi.post("/api/auth/signin", { email, password });
  const { accessToken } = res.data.data;
  setAccessToken(accessToken);
  return res.data;
};

/**
 * Signs up a new user.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<any>} A promise that resolves to the sign-up response.
 */
export const signup = async (email, password) => {
  const res = await identityApi.post("/api/auth/signup", { email, password });
  return res.data;
};

/**
 * Logs out the current user.
 * @returns {Promise<any>} A promise that resolves when the user is logged out.
 */
export const logout = async () => {
  await identityApi.post("/auth/logout");
  removeAccessToken();
};

/**
 * Searches for users.
 * @param {string} [search=''] - The search query.
 * @param {number} [page=1] - The page number.
 * @param {number} [size=10] - The number of results per page.
 * @returns {Promise<{data: User[]}>} A promise that resolves to a paginated list of users.
 */
export const searchUsers = (search = '', page = 1, size = 10) => 
  identityApi.get(`/users?search=${search}&page=${page}&size=${size}`);

/**
 * Fetches all users.
 * @returns {Promise<User[]>} A promise that resolves to an array of all users.
 */
export const getAllUsers = () => identityApi.get("/users");

export default identityApi;
