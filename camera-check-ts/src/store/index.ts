import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import cameraReducer from "./slices/cameraSlice";
import chatReducer from "./slices/chatSlice";
import { User } from "../types";

const initialToken = localStorage.getItem("accessToken") || null;

interface DecodedToken {
  sub: string;
  email: string;
  username: string;
  roles: string[];
}

interface AuthState {
  accessToken: string | null;
  userInfo: User | null;
  roles: string[] | null;
}

const initialState: AuthState = {
  accessToken: initialToken,
  userInfo: null,
  roles: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<{ token: string; userInfo?: User; roles?: string[] }>) => {
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
      console.log("Attempting to hydrate token...");
      state.accessToken = localStorage.getItem("accessToken") || null;
      if (state.accessToken) {
        try {
          const decoded = jwtDecode<DecodedToken>(state.accessToken);
          console.log("Token decoded:", decoded);
          state.userInfo = {
            id: decoded.sub,
            email: decoded.email,
            username: decoded.username,
            role: decoded.roles.join(','),
          };
          state.roles = decoded.roles || null;
          console.log("userInfo set:", state.userInfo);
        } catch (e) {
          console.error("Error decoding token:", e);
          state.accessToken = null;
          state.userInfo = null;
          state.roles = null;
          localStorage.removeItem("accessToken");
        }
      } else {
        console.log("No access token found in localStorage.");
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
    chat: chatReducer,
  },
});

window.addEventListener("storage", (event) => {
  if (event.key === "accessToken" && event.newValue === null) {
    store.dispatch(removeAccessToken());
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;