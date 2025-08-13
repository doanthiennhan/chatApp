import axios from "axios";
import { getAccessToken } from "./identityService";
import "../types"; // Import JSDoc types

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
/**
 * Creates a new message.
 * @param {string} conversationId - The ID of the conversation.
 * @param {string} message - The content of the message.
 * @param {'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM'} [type='TEXT'] - The type of the message.
 * @returns {Promise<Message>} A promise that resolves to the created message.
 */
export const createMessage = (conversationId, message, type = "TEXT") =>
  chatApi.post("/messages/create", { conversationId, message, type });

/**
 * Fetches messages for a given conversation.
 * @param {string} conversationId - The ID of the conversation.
 * @param {number} [page=1] - The page number.
 * @param {number} [size=10] - The number of messages per page.
 * @returns {Promise<PaginatedMessages>} A promise that resolves to a paginated list of messages.
 */
export const getMessagesByConversation = (conversationId, page = 1, size = 10) =>
  chatApi.get(`/messages?conversationId=${conversationId}&page=${page}&size=${size}`);

// CONVERSATION APIs
/**
 * Creates a new conversation (group or direct).
 * @param {string} name - The name of the conversation (for groups).
 * @param {string[]} participantIds - An array of participant IDs.
 * @param {'GROUP' | 'DIRECT'} [type='GROUP'] - The type of the conversation.
 * @returns {Promise<Conversation>} A promise that resolves to the created conversation.
 */
export const createConversation = (name, participantIds, type = "GROUP") =>
  chatApi.post("/conversations/create", { name, participantIds, type });

/**
 * Fetches all conversations for the current user.
 * @returns {Promise<Conversation[]>} A promise that resolves to an array of conversations.
 */
export const getMyConversations = () =>
  chatApi.get("/conversations/my-conversations");

/**
 * Searches for conversations by query.
 * @param {string} query - The search query.
 * @returns {Promise<Conversation[]>} A promise that resolves to an array of matching conversations.
 */
export const searchConversations = (query) =>
  chatApi.get(`/conversations/search?query=${query}`);

/**
 * Adds members to an existing conversation.
 * @param {string} conversationId - The ID of the conversation.
 * @param {string[]} newParticipantIds - An array of new participant IDs to add.
 * @returns {Promise<Conversation>} A promise that resolves to the updated conversation.
 */
export const addMembersToConversation = (conversationId, newParticipantIds) =>
  chatApi.post("/conversations/add-members", {
    conversationId,
    newParticipantIds,
  });

/**
 * Leaves a conversation.
 * @param {string} conversationId - The ID of the conversation to leave.
 * @returns {Promise<any>} A promise that resolves when the user leaves the conversation.
 */
export const leaveConversation = (conversationId) =>
  chatApi.delete(`/conversations/${conversationId}/leave`);

/**
 * Deletes a conversation.
 * @param {string} conversationId - The ID of the conversation to delete.
 * @returns {Promise<any>} A promise that resolves when the conversation is deleted.
 */
export const deleteConversation = (conversationId) =>
  chatApi.delete(`/conversations/${conversationId}`);

// FRIEND REQUEST APIs
/**
 * Sends a friend request to another user.
 * @param {string} receiverId - The ID of the user to send the friend request to.
 * @returns {Promise<any>} A promise that resolves when the friend request is sent.
 */
export const sendFriendRequest = (receiverId) =>
  chatApi.post("/friends/request", { receiverId });

// USER APIs
/**
 * Searches for users by query.
 * @param {string} query - The search query.
 * @returns {Promise<User[]>} A promise that resolves to an array of matching users.
 */
export const searchUsers = (query) => chatApi.get(`/users/search?query=${query}`);

/**
 * Fetches all users.
 * @returns {Promise<User[]>} A promise that resolves to an array of all users.
 */
export const getAllUsers = () => chatApi.get("/users");

export default chatApi;