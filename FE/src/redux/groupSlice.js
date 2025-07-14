import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createGroup, addMembersToGroup, getUserChannels, getGroupMessages, sendGroupMessage } from '../api/groupService';

export const fetchUserGroups = createAsyncThunk(
  'group/fetchUserGroups',
  async ({ userId, page = 0, size = 20 }) => {
    const res = await getUserChannels(userId, page, size);
    return res.data || res;
  }
);

export const fetchGroupMessages = createAsyncThunk(
  'group/fetchGroupMessages',
  async ({ groupId, page = 0, size = 20 }) => {
    const res = await getGroupMessages(groupId, page, size);
    return { groupId, data: res.data || res };
  }
);

export const sendGroupMsg = createAsyncThunk(
  'group/sendGroupMsg',
  async ({ senderId, groupId, content }) => {
    const res = await sendGroupMessage({ senderId, groupId, content });
    return { groupId, message: res.data };
  }
);

export const createGroupThunk = createAsyncThunk(
  'group/createGroup',
  async (data) => {
    const res = await createGroup(data);
    return res.data;
  }
);

export const addMemberToGroup = createAsyncThunk(
  'group/addMemberToGroup',
  async (data) => {
    const res = await addMembersToGroup(data);
    return res.data;
  }
);

const groupSlice = createSlice({
  name: 'group',
  initialState: {
    groups: [],
    groupMessages: {}, // {groupId: [msg,...]}
    activeGroupId: null,
    loading: false,
    error: null,
  },
  reducers: {
    setActiveGroup: (state, action) => {
      state.activeGroupId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload.content || action.payload;
      })
      .addCase(fetchUserGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchGroupMessages.fulfilled, (state, action) => {
        const { groupId, data } = action.payload;
        state.groupMessages[groupId] = data.content || data;
      })
      .addCase(sendGroupMsg.fulfilled, (state, action) => {
        const { groupId, message } = action.payload;
        if (!state.groupMessages[groupId]) state.groupMessages[groupId] = [];
        state.groupMessages[groupId].push(message);
      })
      .addCase(createGroupThunk.fulfilled, (state, action) => {
        state.groups.push(action.payload);
      })
      .addCase(addMemberToGroup.fulfilled, (state, action) => {
      });
  },
});

export const { setActiveGroup } = groupSlice.actions;
export default groupSlice.reducer; 