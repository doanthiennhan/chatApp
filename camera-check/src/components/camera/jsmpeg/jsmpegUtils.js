import { callGetAllCameras } from '../../../services/api';

export const getBackendWebSocketUrl = (cameraId, host = 'localhost', port = '8082') => {
  return `ws://${host}:${port}/camera/stream?cameraId=${cameraId}`;
};

export const getMetadataWebSocketUrl = (cameraId, host = 'localhost', port = '8082') => {
  return `ws://${host}:${port}/camera/metadata?cameraId=${cameraId}`;
};

export const loadCameras = async (setCameras, setLoading) => {
  try {
    const response = await callGetAllCameras();
    setCameras(response.result || []);
  } catch (error) {
    console.error("Failed to fetch cameras:", error);
  } finally {
    setLoading(false);
  }
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
    case "connected":
      return "success";
    case "offline":
    case "disconnected":
      return "default";
    case "error":
      return "error";
    case "connecting":
      return "processing";
    default:
      return "default";
  }
};

export const getStatusText = (connectionStatus) => {
  switch (connectionStatus) {
    case 'connected': return 'Đang xem';
    case 'connecting': return 'Đang kết nối';
    case 'error': return 'Lỗi kết nối';
    default: return 'Chưa kết nối';
  }
};

export const parseStreamMetadata = (data) => {
  try {
    const metadata = JSON.parse(data);
    
    // Validate metadata structure
    if (metadata.cameraId && metadata.fps && metadata.resolution && metadata.bitrate_kbps && metadata.timestamp) {
      return {
        cameraId: metadata.cameraId,
        fps: metadata.fps,
        resolution: metadata.resolution,
        bitrate_kbps: metadata.bitrate_kbps,
        timestamp: metadata.timestamp,
        formattedTime: new Date(metadata.timestamp).toLocaleString('vi-VN')
      };
    }
    return null;
  } catch (error) {
    console.error('Error parsing metadata:', error);
    return null;
  }
};

export const formatBitrate = (bitrate_kbps) => {
  if (bitrate_kbps >= 1000) {
    return `${(bitrate_kbps / 1000).toFixed(1)} Mbps`;
  }
  return `${bitrate_kbps} kbps`;
};

export const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}; 