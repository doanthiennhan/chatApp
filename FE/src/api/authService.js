import api from './axiosConfig';

export const login = async (email, password) => {
  const response = await api.post('/identity/api/auth/signin', { email, password });
  return response.data;
};

export const register = async (email, password) => {
  const response = await api.post('/identity/api/auth/signup', { email, password });
  return response.data;
};

export const refreshToken = async () => {
  const response = await api.post('/identity/api/auth/refresh-token', {}, { withCredentials: true });
  return response.data;
};