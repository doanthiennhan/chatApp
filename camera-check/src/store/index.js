import { configureStore, createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import cameraReducer from "./slices/cameraSlice";
import chatReducer from "./slices/chatSlice";
import "./types"; // Import JSDoc types

const initialToken = localStorage.getItem("accessToken") || null;

/**
 * @typedef {object} AuthState
 * @property {string | null} accessToken
 * @property {User | null} userInfo
 * @property {string[] | null} roles
 */

/** @type {AuthState} */
const authSlice = createSlice({
  name: "auth",
  initialState: {
    accessToken: initialToken,
    userInfo: null,
    roles: null,
  },
  reducers: {
    /**
     * @param {import("@reduxjs/toolkit").PayloadAction<{token: string, userInfo: User, roles: string[]}>} action
     */
    setAccessToken: (state, action) => {
      state.accessToken = action.payload.token;
      localStorage.setItem("accessToken", action.payload.token);
      state.userInfo = action.payload.userInfo || null;
      state.roles = action.payload.roles || null;
    },
    removeAccessToken: (state) => {
      state.accessToken = null;
      state.userInfo = null;
      state.roles = null;
      localStorage.removeItem("accessToken");
    },
    hydrateToken: (state) => {
      state.accessToken = localStorage.getItem("accessToken") || null;
      if (state.accessToken) {
        try {
          /** @type {{sub: string, email: string, roles: string[]}} */
          const decoded = jwtDecode(state.accessToken);
          state.userInfo = { id: decoded.sub, email: decoded.email }; // Assuming 'sub' is userId
          state.roles = decoded.roles || null;
        } catch (e) {
          console.error("Failed to decode token on hydrate:", e);
          state.accessToken = null;
          state.userInfo = null;
          state.roles = null;
          localStorage.removeItem("accessToken");
        }
      } else {
        state.userInfo = null;
        state.roles = null;
      }
    },
  },
});

export const { setAccessToken, removeAccessToken, hydrateToken } = authSlice.actions;

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    camera: cameraReducer,
    chat: chatReducer, // Thêm reducer chat
  },
});

// Đồng bộ logout trên nhiều tab
window.addEventListener("storage", (event) => {
  if (event.key === "accessToken" && event.newValue === null) {
    store.dispatch(removeAccessToken());
  }
});

export default store; 