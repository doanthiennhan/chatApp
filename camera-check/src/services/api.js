import axios from "axios";
import { getAccessToken } from "./identityService";

const baseURL = "http://localhost:8082";

const api = axios.create({
  baseURL: "http://localhost:8082/camera/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach access token if available
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const callGetAllCameras = async () => {
  const res = await api.get("/cameras");
  return res.data;
};

export const startView = async (cameraId) => {
  return await api.post(`/stream/start-view?cameraId=${cameraId}`);
};

export const stopView = async (cameraId) => {
  return await api.post(`/stream/stop-view?cameraId=${cameraId}`);
};

export const getHlsUrl = (cameraId) => {
  return `http://localhost:8082/camera/output/${cameraId}/stream.m3u8`;
};

export const createCamera = async (cameraData) => {
  const res = await api.post("/cameras", cameraData);
  return res.data;
};

export const deleteCamera = async (id) => {
  const res = await api.delete(`/cameras/${id}`);
  return res.data;
};

export const updateCamera = async (cameraData) => {
  const res = await api.put("/cameras", cameraData);
  return res.data;
};

export default api; 