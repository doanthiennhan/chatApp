import { createHttpClient, CHAT_BASE_URL } from "./http";
import { Message, Conversation, User } from "../types";

const chatApi = createHttpClient(CHAT_BASE_URL);

export const createMessage = (conversationId: string, message: string, type = "TEXT") =>
  chatApi.post<{data : Message}>("/messages/create", { conversationId, message, type });

export const getMessagesByConversation = (conversationId: string, page = 0, size = 10) =>
  chatApi.get<{
    data: {
      data: Message[];
      currentPage: number;
      totalPages: number;
      pageSize: number;
      totalElements: number;
    };
  }>("/messages", {
    params: { conversationId, page, size },
  });

export const createConversation = (name: string, participantIds: string[], type = "GROUP") =>
  chatApi.post<{data : Conversation}>("/conversations/create", { name, participantIds, type });

export const getMyConversations = (page = 1, size = 10, search = "") =>
  chatApi.get<{
    data: {
      data: Conversation[];
      currentPage: number;
      totalPages: number;
      pageSize: number;
      totalElements: number;
    };
  }>("/conversations/my-conversations", {
    params: { page, size, search },
  });


export const addMembersToConversation = (conversationId: string, newParticipantIds: string[]) =>
  chatApi.post(`/conversations/add-members`, { conversationId, newParticipantIds });

export const leaveConversation = (conversationId: string) =>
  chatApi.delete(`/conversations/${conversationId}/leave`);

export const deleteConversation = (conversationId: string) =>
  chatApi.delete(`/conversations/${conversationId}`);

export const sendFriendRequest = (receiverId: string) =>
  chatApi.post("/friends/request", { receiverId });

export const searchUsers = (query: string) =>
  chatApi.get<User[]>("/users/search", { params: { query } });

export const getAllUsers = () => chatApi.get<User[]>("/users");
