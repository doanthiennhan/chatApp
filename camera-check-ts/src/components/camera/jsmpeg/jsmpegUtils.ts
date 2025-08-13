import { fetchCameras } from '../../../services/cameraService';
import { Camera } from '../../../types';

export interface StreamMetadata {
  cameraId: string;
  fps: number;
  resolution: string;
  bitrate_kbps: number;
  timestamp: number;
  formattedTime: string;
}

export interface StreamInfo {
  videoCodec?: string;
  audioCodec?: string;
  resolution?: string;
  frameRate?: number | string;
  bitRate?: string;
  format?: string;
  updatedAt?: string;
}

export const getBackendWebSocketUrl = (cameraId: string, host = 'localhost', port = '8082') => {
  return `ws://${host}:${port}/camera/stream?cameraId=${cameraId}`;
};

export const getMetadataWebSocketUrl = (cameraId: string, host = 'localhost', port = '8082') => {
  return `ws://${host}:${port}/camera/metadata?cameraId=${cameraId}`;
};

export const loadCameras = async (setCameras: (cameras: Camera[]) => void, setLoading: (loading: boolean) => void) => {
  try {
    setLoading(true);
    const response = await fetchCameras();
    setCameras(response.data.data || []);
  } catch (error) {
    console.error("Failed to fetch cameras:", error);
  } finally {
    setLoading(false);
  }
};

export const getStatusColor = (status: string) => {
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

export const getStatusText = (connectionStatus: string, t: (key: string) => string) => {
  switch (connectionStatus) {
    case 'connected': return t('connected_status');
    case 'connecting': return t('connecting_status');
    case 'error': return t('error_status');
    default: return t('disconnected_status');
  }
};

export const parseStreamMetadata = (data: string): StreamMetadata | null => {
  try {
    const metadata = JSON.parse(data);
    
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
    return null;
  }
};

export const formatBitrate = (bitrate_kbps: number) => {
  if (bitrate_kbps >= 1000) {
    return `${(bitrate_kbps / 1000).toFixed(1)} Mbps`;
  }
  return `${bitrate_kbps} kbps`;
};

export const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};