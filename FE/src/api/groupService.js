import api from './axiosConfig';

export const createGroup = async (data) => {
  const response = await api.post('/api/groups', data);
  return response.data;
};

export const addMembersToGroup = async (data) => {
  const response = await api.post('/api/groups/add-members', data);
  return response.data;
};

export const getUserChannels = async (userId, page = 0, size = 20) => {
  const response = await api.get(`/api/channels`, { params: { userId, page, size } });
  return response.data;
};

export const getGroupMessages = async (groupId, page = 0, size = 20) => {
  const response = await api.get(`/api/groups/${groupId}/history`, { params: { page, size } });
  return response.data;
};

export const sendGroupMessage = async (data) => {
  // data: { senderId, groupId, content }
  const response = await api.post('/api/send', data);
  return response.data;
}; 

export const getGroup = async () => {
  const response = await api.get(`chat/api/groups`);
  return response.data;
};