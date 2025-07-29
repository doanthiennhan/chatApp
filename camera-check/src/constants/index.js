// API Endpoints
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Camera Types
export const CAMERA_TYPES = {
  IP_CAMERA: 'IP_CAMERA',
  USB_CAMERA: 'USB_CAMERA',
  RTSP_CAMERA: 'RTSP_CAMERA'
};

// Stream Types
export const STREAM_TYPES = {
  HLS: 'HLS',
  JSMpeg: 'JSMpeg',
  WebRTC: 'WebRTC'
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  GUEST: 'GUEST'
};

// Route Paths
export const ROUTES = {
  HOME: '/home',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CAMERA: '/camera',
  CHAT: '/chat',
  PROFILE: '/profile'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  USER_INFO: 'userInfo',
  SELECTED_CHANNEL: 'selectedChannel'
};

// WebSocket Events
export const WS_EVENTS = {
  CAMERA_HEALTH: 'camera_health',
  CHAT_MESSAGE: 'chat_message',
  STREAM_UPDATE: 'stream_update'
}; 