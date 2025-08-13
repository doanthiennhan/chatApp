import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as chatService from "../../services/chatService";
import { Message, Conversation, PaginatedMessages } from "../../types";

export interface PaginatedConversations {
  data: Conversation[];
  currentPage: number;
  totalPages: number;
}

export interface ChatState {
  conversations: PaginatedConversations & { loading: boolean };
  messages: PaginatedMessages & { loading: boolean };
  activeConversationId: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ChatState = {
  conversations: {
    data: [],
    currentPage: 0,
    totalPages: 1,
    loading: false,
  },
  messages: {
    data: [],
    totalPages: 1,
    currentPage: 0,
    loading: false,
  },
  activeConversationId: null,
  status: "idle",
  error: null,
};

export const fetchConversations = createAsyncThunk<
  PaginatedConversations,
  { search?: string },
  { rejectValue: string }
>("chat/fetchConversations", async ({ search }, { rejectWithValue }) => {
  try {
    const res = await chatService.getMyConversations(1, 15, search);
    if (res.data && res.data.data) {
      return res.data.data;
    } else {
      throw new Error("Invalid API response structure for conversations");
    }
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const fetchMoreConversations = createAsyncThunk<
  PaginatedConversations,
  { page: number, search?: string },
  { rejectValue: string }
>("chat/fetchMoreConversations", async ({ page, search }, { rejectWithValue }) => {
  try {
    const res = await chatService.getMyConversations(page, 15, search);
    if (res.data && res.data.data) {
      return res.data.data;
    } else {
      throw new Error("Invalid API response structure for more conversations");
    }
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const fetchMessages = createAsyncThunk<
  PaginatedMessages,
  { conversationId: string },
  { rejectValue: string }
>("chat/fetchMessages", async ({ conversationId }, { rejectWithValue }) => {
  try {
    const page = 1; // Fetch first page
    const res = await chatService.getMessagesByConversation(conversationId, page);
    if (res.data && res.data.data) {
      return res.data.data;
    } else {
      throw new Error("Invalid API response structure for messages");
    }
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const fetchMoreMessages = createAsyncThunk<
  PaginatedMessages,
  { conversationId: string; page: number },
  { rejectValue: string }
>("chat/fetchMoreMessages", async ({ conversationId, page }, { rejectWithValue }) => {
  try {
    const res = await chatService.getMessagesByConversation(conversationId, page);
    if (res.data && res.data.data) {
      return res.data.data;
    } else {
      throw new Error("Invalid API response structure for more messages");
    }
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const sendMessage = createAsyncThunk<
  Message,
  { conversationId: string; message: string; type?: string },
  { rejectValue: string }
>("chat/sendMessage", async ({ conversationId, message, type }, { rejectWithValue }) => {
  try {
    const res = await chatService.createMessage(conversationId, message, type);
    if (res.data && res.data.data) {
      return res.data.data as Message;
    } else {
      throw new Error("Invalid API response structure for sent message");
    }
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const createGroup = createAsyncThunk<
  Conversation,
  { name: string; participantIds: string[] },
  { rejectValue: string }
>("chat/createGroup", async ({ name, participantIds }, { rejectWithValue }) => {
  try {
    const res = await chatService.createConversation(name, participantIds, "GROUP");
    if (res.data && res.data.data) {
      return res.data.data as Conversation;
    } else {
      throw new Error("Invalid API response structure for created group");
    }
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveConversationId: (state, action: PayloadAction<string>) => {
      state.activeConversationId = action.payload;
      state.messages = { data: [], currentPage: 0, totalPages: 1, loading: false };
      state.status = "idle";
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const newMessage = action.payload;

      const conversationIndex = state.conversations.data.findIndex(
        (c) => c.id === newMessage.conversationId
      );
      if (conversationIndex !== -1) {
        const conversation = state.conversations.data[conversationIndex];
        conversation.lastMessage = newMessage;

        if (newMessage.conversationId !== state.activeConversationId && !newMessage.me) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        }

        const updatedConversation = state.conversations.data.splice(conversationIndex, 1)[0];
        state.conversations.data.unshift(updatedConversation);
      }

      if (newMessage.conversationId === state.activeConversationId) {
        if (!state.messages.data.find((msg) => msg.id === newMessage.id)) {
          state.messages.data.push(newMessage);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.conversations.loading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations.loading = false;
        state.conversations.data = action.payload.data;
        state.conversations.currentPage = action.payload.currentPage;
        state.conversations.totalPages = action.payload.totalPages;
        if (!state.activeConversationId && action.payload.data.length > 0) {
          state.activeConversationId = action.payload.data[0].id;
        }
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversations.loading = false;
        state.error = (action.payload as string) || null;
      })
      .addCase(fetchMoreConversations.pending, (state) => {
        state.conversations.loading = true;
      })
      .addCase(fetchMoreConversations.fulfilled, (state, action) => {
        state.conversations.loading = false;
        state.conversations.data.push(...action.payload.data);
        state.conversations.currentPage = action.payload.currentPage;
        state.conversations.totalPages = action.payload.totalPages;
      })
      .addCase(fetchMoreConversations.rejected, (state, action) => {
        state.conversations.loading = false;
        state.error = (action.payload as string) || null;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.messages.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages.loading = false;
        state.messages.data = action.payload.data.reverse() ?? [];
        state.messages.currentPage = action.payload.currentPage;
        state.messages.totalPages = action.payload.totalPages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messages.loading = false;
        state.error = (action.payload as string) || null;
        state.messages.data = [];
      })
      .addCase(fetchMoreMessages.pending, (state) => {
        state.messages.loading = true;
      })
      .addCase(fetchMoreMessages.fulfilled, (state, action) => {
        state.messages.loading = false;
        state.messages.data = [...(action.payload.data.reverse() ?? []), ...state.messages.data];
        state.messages.currentPage = action.payload.currentPage;
      })
      .addCase(fetchMoreMessages.rejected, (state, action) => {
        state.messages.loading = false;
        state.error = (action.payload as string) || null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const newMessage = action.payload;
        
        // Add message to the active conversation's message list
        if (newMessage.conversationId === state.activeConversationId) {
            state.messages.data.push(newMessage);
        }

        // Update the conversation in the conversation list
        const conversationIndex = state.conversations.data.findIndex(
          (c) => c.id === newMessage.conversationId
        );
        if (conversationIndex !== -1) {
          const conversation = state.conversations.data[conversationIndex];
          conversation.lastMessage = newMessage;
          
          // Move the updated conversation to the top of the list
          const updatedConversation = state.conversations.data.splice(conversationIndex, 1)[0];
          state.conversations.data.unshift(updatedConversation);
        }
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.conversations.data.unshift(action.payload);
        state.activeConversationId = action.payload.id;
      });
  },
});

export const { setActiveConversationId, addMessage } = chatSlice.actions;
export default chatSlice.reducer;
