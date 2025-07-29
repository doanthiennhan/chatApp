import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as chatService from "../../services/chatService";


export const fetchChannels = createAsyncThunk(
  "chat/fetchChannels",
  async (userId) => {
    const res = await chatService.getUserChannels(userId);
    return res.data.data;
  }
);

export const fetchDirectMessages = createAsyncThunk(
  "chat/fetchDirectMessages",
  async ({ user1, user2, page = 0, size = 30 }) => {
    const res = await chatService.getDirectMessageHistory(user1, user2, page, size);
    return res.data.data;
  }
);

export const fetchGroupMessages = createAsyncThunk(
  "chat/fetchGroupMessages",
  async ({ groupId, page = 0, size = 30 }) => {
    const res = await chatService.getGroupMessageHistory(groupId, page, size);
    return res.data.data;
  }
);

export const sendDirectMessage = createAsyncThunk(
  "chat/sendDirectMessage",
  async ({ senderId, receiverId, content }) => {
    const res = await chatService.sendDirectMessage(senderId, receiverId, content);
    return res.data.data;
  }
);

export const sendGroupMessage = createAsyncThunk(
  "chat/sendGroupMessage",
  async ({ senderId, groupId, content }) => {
    const res = await chatService.sendGroupMessage(senderId, groupId, content);
    return res.data.data;
  }
);

export const createGroup = createAsyncThunk(
  "chat/createGroup",
  async ({ name, description, createdBy, members }) => {
    const res = await chatService.createGroup(name, description, createdBy, members);
    return res.data.data;
  }
);

export const addGroupMembers = createAsyncThunk(
  "chat/addGroupMembers",
  async ({ groupId, memberIds }) => {
    const res = await chatService.addGroupMembers(groupId, memberIds);
    return res.data.data;
  }
);

export const fetchAllGroups = createAsyncThunk(
  "chat/fetchAllGroups",
  async () => {
    const res = await chatService.getAllGroups();
    return res.data.data;
  }
);

// --- Slice ---
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    channels: [],
    messages: [],
    selectedChannel: null, // id group hoặc id user
    selectedType: null,    // 'group' | 'direct'
    loading: false,
    error: null,
    allGroups: [],
  },
  reducers: {
    setSelectedChannel: (state, action) => {
      state.selectedChannel = action.payload.id;
      state.selectedType = action.payload.type; // 'group' | 'direct'
      state.messages = [];
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // --- CHANNELS ---
      .addCase(fetchChannels.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChannels.fulfilled, (state, action) => {
        state.loading = false;
        state.channels = action.payload;
      })
      .addCase(fetchChannels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // --- DIRECT MESSAGES ---
      .addCase(fetchDirectMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDirectMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchDirectMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // --- GROUP MESSAGES ---
      .addCase(fetchGroupMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGroupMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchGroupMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // --- SEND MESSAGE (Realtime push) ---
      .addCase(sendDirectMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(sendGroupMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })

      // --- GROUPS ---
      .addCase(createGroup.fulfilled, (state, action) => {
        state.channels.push(action.payload);
      })
      .addCase(fetchAllGroups.fulfilled, (state, action) => {
        state.allGroups = action.payload;
      })
      .addCase(addGroupMembers.fulfilled, (state, action) => {
        // Optional: cập nhật thành viên nhóm nếu lưu trong state
      });
  },
});

// --- Export actions + reducer ---
export const { setSelectedChannel, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
