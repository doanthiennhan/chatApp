import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginApi, register as registerApi } from '../api/authService';
import { jwtDecode } from 'jwt-decode';

function isTokenValid(token) {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp && decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

const accessToken = localStorage.getItem('accessToken');
let user = null;
if (accessToken && isTokenValid(accessToken)) {
  try {
    user = jwtDecode(accessToken);
  } catch {
    user = null;
    localStorage.removeItem('accessToken');
  }
} else {
  localStorage.removeItem('accessToken');
}

const initialState = {
  user,
  accessToken,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await loginApi(email, password);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await registerApi(email, password);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Register failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem('accessToken');
    },
    setTokens: (state, action) => {
      const token = action.payload.accessToken;
      state.accessToken = token;
      localStorage.setItem('accessToken', token);
      try {
        state.user = jwtDecode(token);
      } catch {
        state.user = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        const token = action.payload.accessToken;
        state.accessToken = token;
        localStorage.setItem('accessToken', token);
        try {
          state.user = jwtDecode(token);
        } catch {
          state.user = null;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setTokens } = authSlice.actions;
export default authSlice.reducer;
