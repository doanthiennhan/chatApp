
import axios from "axios";
import { getAccessToken } from "./identityService";

const baseURL = "http://localhost:8082";

const cameraApi = axios.create({
  baseURL: "http://localhost:8082/camera/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

cameraApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchCameras = async () => {
  const res = await cameraApi.get("/cameras");
  return res.data;
};

export const startView = async (cameraId : String) => {
  return await cameraApi.post(`/stream/start-view?cameraId=${cameraId}`);
};

export const stopView = async (cameraId : String) => {
  return await cameraApi.post(`/stream/stop-view?cameraId=${cameraId}`);
};

export const getHlsUrl = (cameraId : String) => {
  return `http://localhost:8082/camera/output/${cameraId}/stream.m3u8`;
};

export const createCamera = async (cameraData : any) => {
  const res = await cameraApi.post("/cameras", cameraData);
  return res.data;
};

export const deleteCamera = async (id : String) => {
  const res = await cameraApi.delete(`/cameras/${id}`);
  return res.data;
};

export const updateCamera = async (cameraData : any) => {
  const res = await cameraApi.put("/cameras", cameraData);
  return res.data;
};

// Stream control APIs - Fixed to match backend StreamController
export const startStream = async (cameraId : String, forceRestart = false) => {
  try {
    const response = await fetch(`${baseURL}/camera/api/stream/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({
        cameraId: cameraId,
        forceRestart: forceRestart
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Start stream response:', result);
    return result;
  } catch (error) {
    console.error('Error starting stream:', error);
    throw error;
  }
};

export const stopStream = async (cameraId : String, forceRestart = false) => {
  try {
    const response = await fetch(`${baseURL}/camera/api/stream/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({
        cameraId: cameraId,
        forceRestart: forceRestart
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Stop stream response:', result);
    return result;
  } catch (error) {
    console.error('Error stopping stream:', error);
    throw error;
  }
};

// Get stream info/metadata
export const getStreamInfo = async (cameraId : String) => {
  const response = await fetch(`${baseURL}/api/streams/info/${cameraId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAccessToken()}`,
    },
  });
  return response.json();
};

export const getCameraStreamInfo = async (cameraId : String) => {
  const response = await fetch(`${baseURL}/api/cameras/${cameraId}/streamInfo`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAccessToken()}`,
    },
  });
  return response.json();
};

export const getCamerasByUserId = async (userId : String) => {
  const res = await cameraApi.get(`/cameras`);
  return res.data.data.filter(camera => camera.ownerId === userId); // Assuming ownerId field exists
};

export default cameraApi;