import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

export const fetchDirectMessages = createAsyncThunk(
  'chat/fetchDirectMessages',
  async ({ user1, user2, page = 0, size = 20 }) => {
    const res = await api.get('/api/history', { params: { user1, user2, page, size } });
    return { user1, user2, data: res.data.data };
  }
);

export const sendDirectMessage = createAsyncThunk(
  'chat/sendDirectMessage',
  async ({ senderId, receiverId, content }) => {
    const res = await api.post('/api/send', { senderId, receiverId, content });
    return { senderId, receiverId, message: res.data.data };
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    directMessages: {},
    activeChatId: null,
    loading: false,
    error: null,
  },
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChatId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDirectMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDirectMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { user1, user2, data } = action.payload;
        const chatId = [user1, user2].sort().join('-');
        state.directMessages[chatId] = data.content || [];
      })
      .addCase(fetchDirectMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(sendDirectMessage.fulfilled, (state, action) => {
        const { senderId, receiverId, message } = action.payload;
        const chatId = [senderId, receiverId].sort().join('-');
        if (!state.directMessages[chatId]) state.directMessages[chatId] = [];
        state.directMessages[chatId].push(message);
      });
  },
});

export const { setActiveChat } = chatSlice.actions;
export default chatSlice.reducer; 