import axios from "axios";

const chatApi = axios.create({
  baseURL: "http://localhost:8081/chat/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

chatApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    console.log("Access Token:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getDirectMessageHistory = (user1, user2, page = 0, size = 30) =>
  chatApi.get("/history", {
    params: { user1, user2, page, size },
  });

export const sendDirectMessage = (senderId, receiverId, content) =>
  chatApi.post("/send", { senderId, receiverId, content });


export const createGroup = (name, type, participantIds) =>
  chatApi.post("/conversations/create", {
    name,
    type,
    participantIds
   });




export const addGroupMembers = (groupId, memberIds) =>
  chatApi.post("/groups/add-members", {
    groupId,
    memberIds,
  });


export const getUserChannels = (userId, page = 0, size = 30) =>
  chatApi.get("/conversations/my-conversations");


export const getGroupMessageHistory = (groupId, page = 0, size = 30) =>
  chatApi.get(`/groups/${groupId}/history`, {
    params: { page, size },
  });


export const sendGroupMessage = (senderId, groupId, content) =>
  chatApi.post("/send", { senderId, groupId, content });

export const getAllGroups = () => chatApi.get("/groups");
