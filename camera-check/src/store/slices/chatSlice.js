import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as chatService from "../../services/chatService";
import "../types"; // Import JSDoc types

/**
 * @typedef {object} ChatState
 * @property {Conversation[]} conversations
 * @property {{data: Message[], currentPage: number, totalPages: number, loading: boolean}} messages
 * @property {string | null} activeConversationId
 * @property {'idle' | 'loading' | 'succeeded' | 'failed'} status
 * @property {string | null} error
 */

// Async thunk to fetch the current user's conversations
export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  /** @param {void} _ */
  async (_, { rejectWithValue }) => {
    try {
      const res = await chatService.getMyConversations();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  /** @param {{conversationId: string}} payload */
  async ({ conversationId }, { rejectWithValue }) => {
    try {
      const res = await chatService.getMessagesByConversation(conversationId, 1);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchMoreMessages = createAsyncThunk(
  "chat/fetchMoreMessages",
  /** @param {{conversationId: string, page: number}} payload */
  async ({ conversationId, page }, { rejectWithValue }) => {
    try {
      const res = await chatService.getMessagesByConversation(conversationId, page);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk to send a message
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  /** @param {{conversationId: string, message: string, type: 'TEXT' | 'IMAGE' | 'FILE'}} payload */
  async ({ conversationId, message, type }, { rejectWithValue }) => {
    try {
      const res = await chatService.createMessage(conversationId, message, type);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk to create a new group conversation
export const createGroup = createAsyncThunk(
  "chat/createGroup",
  /** @param {{name: string, participantIds: string[]}} payload */
  async ({ name, participantIds }, { rejectWithValue }) => {
    try {
      const res = await chatService.createConversation(name, participantIds, "GROUP");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/** @type {ChatState} */
const initialState = {
  conversations: [],
  messages: {
    data: [],
    currentPage: 1,
    totalPages: 1,
    loading: false,
  },
  activeConversationId: null,
  status: 'idle',
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    /** @param {import("@reduxjs/toolkit").PayloadAction<string>} action */
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
      state.messages = { data: [], currentPage: 1, totalPages: 1, loading: false };
      state.status = 'idle';
    },
    /** @param {import("@reduxjs/toolkit").PayloadAction<Message>} action */
    addMessage: (state, action) => {
      const newMessage = action.payload;

      // --- Update Conversation List (for both sender and receiver) ---
      const conversationIndex = state.conversations.findIndex(c => c.id === newMessage.conversationId);
      if (conversationIndex !== -1) {
        const conversation = state.conversations[conversationIndex];
        conversation.lastMessage = {
          content: newMessage.message,
          timestamp: newMessage.createdDate,
        };

        // Increment unread count only for the receiver in an inactive chat
        if (newMessage.conversationId !== state.activeConversationId && !newMessage.me) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        }

        // Move the updated conversation to the top of the list
        const updatedConversation = state.conversations.splice(conversationIndex, 1)[0];
        state.conversations.unshift(updatedConversation);
      }

      if (newMessage.conversationId === state.activeConversationId && !newMessage.me) {
        if (!state.messages.data.find(msg => msg.id === newMessage.id)) {
          state.messages.data.push(newMessage);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchConversations.fulfilled,
        /** @param {import("@reduxjs/toolkit").PayloadAction<Conversation[]>} action */
        (state, action) => {
        state.status = 'succeeded';
        state.conversations = action.payload;
        if (!state.activeConversationId && action.payload.length > 0) {
          state.activeConversationId = action.payload[0].id;
        }
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // --- FETCH MESSAGES --- //
      .addCase(fetchMessages.pending, (state) => {
        state.messages.loading = true;
      })
      .addCase(fetchMessages.fulfilled,
        /** @param {import("@reduxjs/toolkit").PayloadAction<PaginatedMessages>} action */
        (state, action) => {
        state.messages.loading = false;
        state.messages.data = action.payload.data.reverse();
        state.messages.currentPage = action.payload.currentPage;
        state.messages.totalPages = action.payload.totalPages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messages.loading = false;
        state.error = action.payload;
      })

      // --- FETCH MORE MESSAGES --- //
      .addCase(fetchMoreMessages.pending, (state) => {
        state.messages.loading = true;
      })
      .addCase(fetchMoreMessages.fulfilled,
        /** @param {import("@reduxjs/toolkit").PayloadAction<PaginatedMessages>} action */
        (state, action) => {
        state.messages.loading = false;
        state.messages.data = [...action.payload.data.reverse(), ...state.messages.data];
        state.messages.currentPage = action.payload.currentPage;
      })
      .addCase(fetchMoreMessages.rejected, (state, action) => {
        state.messages.loading = false;
        state.error = action.payload;
      })

      // --- SEND MESSAGE --- //
      .addCase(sendMessage.fulfilled,
        /** @param {import("@reduxjs/toolkit").PayloadAction<Message>} action */
        (state, action) => {
        const newMessage = action.payload;
        state.messages.data.push(newMessage);
        
        const conversationIndex = state.conversations.findIndex(c => c.id === state.activeConversationId);
        if (conversationIndex !== -1) {
            const conversation = state.conversations[conversationIndex];
            conversation.lastMessage = {
                content: newMessage.message,
                timestamp: newMessage.createdDate,
            };
            const updatedConversation = state.conversations.splice(conversationIndex, 1)[0];
            state.conversations.unshift(updatedConversation);
        }
      })

      .addCase(createGroup.fulfilled,
        /** @param {import("@reduxjs/toolkit").PayloadAction<Conversation>} action */
        (state, action) => {
        state.conversations.unshift(action.payload);
        state.activeConversationId = action.payload.id;
      });
  },
});

export const { setActiveConversation, addMessage } = chatSlice.actions;
export default chatSlice.reducer;