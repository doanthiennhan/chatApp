import axios from "axios";
import { getAccessToken } from "./identityService";
import "../types"; // Import JSDoc types

const baseURL = "http://localhost:8082";

const cameraApi = axios.create({
  baseURL: "http://localhost:8082/camera/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach access token if available
cameraApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Fetches a list of cameras.
 * @returns {Promise<Camera[]>} A promise that resolves to an array of camera objects.
 */
export const fetchCameras = async () => {
  const res = await cameraApi.get("/cameras");
  return res.data;
};

/**
 * Starts viewing a specific camera stream.
 * @param {string} cameraId - The ID of the camera to start viewing.
 * @returns {Promise<any>} A promise that resolves when the view is started.
 */
export const startView = async (cameraId) => {
  // This endpoint is outside the /camera/api base, so use full URL
  return await cameraApi.post(`/stream/start-view?cameraId=${cameraId}`);
};

/**
 * Stops viewing a specific camera stream.
 * @param {string} cameraId - The ID of the camera to stop viewing.
 * @returns {Promise<any>} A promise that resolves when the view is stopped.
 */
export const stopView = async (cameraId) => {
  return await cameraApi.post(`/stream/stop-view?cameraId=${cameraId}`);
};

/**
 * Gets the HLS URL for a specific camera.
 * @param {string} cameraId - The ID of the camera.
 * @returns {string} The HLS URL.
 */
export const getHlsUrl = (cameraId) => {
  return `http://localhost:8082/camera/output/${cameraId}/stream.m3u8`;
};

/**
 * Creates a new camera.
 * @param {Camera} cameraData - The camera data to create.
 * @returns {Promise<Camera>} A promise that resolves to the created camera object.
 */
export const createCamera = async (cameraData) => {
  const res = await cameraApi.post("/cameras", cameraData);
  return res.data;
};

/**
 * Deletes a camera by its ID.
 * @param {string} id - The ID of the camera to delete.
 * @returns {Promise<any>} A promise that resolves when the camera is deleted.
 */
export const deleteCamera = async (id) => {
  const res = await cameraApi.delete(`/cameras/${id}`);
  return res.data;
};

/**
 * Updates an existing camera.
 * @param {Camera} cameraData - The camera data to update.
 * @returns {Promise<Camera>} A promise that resolves to the updated camera object.
 */
export const updateCamera = async (cameraData) => {
  const res = await cameraApi.put("/cameras", cameraData);
  return res.data;
};

// Stream control APIs - Fixed to match backend StreamController
/**
 * Starts streaming for a specific camera.
 * @param {string} cameraId - The ID of the camera to start streaming.
 * @param {boolean} [forceRestart=false] - Whether to force a restart of the stream.
 * @returns {Promise<any>} A promise that resolves when the stream is started.
 */
export const startStream = async (cameraId, forceRestart = false) => {
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

/**
 * Stops streaming for a specific camera.
 * @param {string} cameraId - The ID of the camera to stop streaming.
 * @param {boolean} [forceRestart=false] - Whether to force a restart of the stream.
 * @returns {Promise<any>} A promise that resolves when the stream is stopped.
 */
export const stopStream = async (cameraId, forceRestart = false) => {
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
/**
 * Gets stream information for a specific camera.
 * @param {string} cameraId - The ID of the camera.
 * @returns {Promise<any>} A promise that resolves to the stream information.
 */
export const getStreamInfo = async (cameraId) => {
  const response = await fetch(`${baseURL}/api/streams/info/${cameraId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAccessToken()}`,
    },
  });
  return response.json();
};

// Alternative endpoint
/**
 * Gets camera stream information.
 * @param {string} cameraId - The ID of the camera.
 * @returns {Promise<any>} A promise that resolves to the camera stream information.
 */
export const getCameraStreamInfo = async (cameraId) => {
  const response = await fetch(`${baseURL}/api/cameras/${cameraId}/streamInfo`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAccessToken()}`,
    },
  });
  return response.json();
};

/**
 * Fetches cameras owned by a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Camera[]>} A promise that resolves to an array of camera objects.
 */
export const getCamerasByUserId = async (userId) => {
  const res = await cameraApi.get(`/cameras`);
  return res.data.data.filter(camera => camera.ownerId === userId); // Assuming ownerId field exists
};

export default cameraApi; 