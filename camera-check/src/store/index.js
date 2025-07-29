import { configureStore, createSlice } from "@reduxjs/toolkit";
import cameraReducer from "./slices/cameraSlice";
import chatReducer from "./slices/chatSlice";

const initialToken = localStorage.getItem("accessToken") || null;

const authSlice = createSlice({
  name: "auth",
  initialState: {
    accessToken: initialToken,
    userInfo: null,
    roles: null,
  },
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload.token;
      localStorage.setItem("accessToken", action.payload.token);
      // userInfo và roles chỉ lưu trong Redux, không lưu localStorage
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
      // Không hydrate userInfo/roles từ localStorage
      state.userInfo = null;
      state.roles = null;
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