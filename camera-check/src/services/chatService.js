import axios from "axios";
import { getAccessToken } from "./identityService";

const chatApi = axios.create({
  baseURL: "http://localhost:8081/chat/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

chatApi.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// MESSAGE APIs
export const createMessage = (conversationId, message, type = "TEXT") =>
  chatApi.post("/messages/create", { conversationId, message, type });

export const getMessagesByConversation = (conversationId, page = 1, size = 10) =>
  chatApi.get(`/messages?conversationId=${conversationId}&page=${page}&size=${size}`);

// CONVERSATION APIs
export const createConversation = (name, participantIds, type = "GROUP") =>
  chatApi.post("/conversations/create", { name, participantIds, type });

export const getMyConversations = () =>
  chatApi.get("/conversations/my-conversations");

export const searchConversations = (query) =>
  chatApi.get(`/conversations/search?query=${query}`);

export const addMembersToConversation = (conversationId, newParticipantIds) =>
  chatApi.post("/conversations/add-members", {
    conversationId,
    newParticipantIds,
  });

export const leaveConversation = (conversationId) =>
  chatApi.delete(`/conversations/${conversationId}/leave`);

export const deleteConversation = (conversationId) =>
  chatApi.delete(`/conversations/${conversationId}`);

// FRIEND REQUEST APIs
export const sendFriendRequest = (receiverId) =>
  chatApi.post("/friends/request", { receiverId });

// USER APIs
export const searchUsers = (query) => chatApi.get(`/users/search?query=${query}`);

export const getAllUsers = () => chatApi.get("/users");

export default chatApi;