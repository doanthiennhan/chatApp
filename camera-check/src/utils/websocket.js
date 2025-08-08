

export const getWebSocketUrl = (cameraId, host = 'localhost', port = '8082') => {
  return `ws://${host}:${port}/camera/stream?cameraId=${cameraId}`;
};

export const getMetadataWebSocketUrl = (cameraId, host = 'localhost', port = '8082') => {
  return `ws://${host}:${port}/camera/metadata?cameraId=${cameraId}`;
};


export const createWebSocketConnection = (url, onMessage, onOpen, onClose, onError) => {
  try {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      console.log('🔧 WebSocket connected:', url);
      if (onOpen) onOpen();
    };
    
    ws.onmessage = (event) => {
      if (onMessage) onMessage(event);
    };
    
    ws.onclose = () => {
      console.log('🔧 WebSocket disconnected:', url);
      if (onClose) onClose();
    };
    
    ws.onerror = (error) => {
      console.error('🔧 WebSocket error:', error);
      if (onError) onError(error);
    };
    
    return ws;
  } catch (error) {
    console.error('🔧 Failed to create WebSocket connection:', error);
    return null;
  }
};

export const isWebSocketSupported = () => {
  return typeof WebSocket !== 'undefined';
};

export const getWebSocketState = (ws) => {
  if (!ws) return 'CLOSED';
  
  switch (ws.readyState) {
    case WebSocket.CONNECTING:
      return 'CONNECTING';
    case WebSocket.OPEN:
      return 'OPEN';
    case WebSocket.CLOSING:
      return 'CLOSING';
    case WebSocket.CLOSED:
      return 'CLOSED';
    default:
      return 'UNKNOWN';
  }
}; 

export const parseStreamMetadata = (data) => {
  try {
    const metadata = JSON.parse(data);
    
    // Validate metadata structure
    if (metadata.cameraId && metadata.fps && metadata.resolution && metadata.bitrate && metadata.uptime) {
      return {
        cameraId: metadata.cameraId,
        fps: metadata.fps,
        resolution: metadata.resolution,
        bitrate: parseFloat(metadata.bitrate) || 0,
        timestamp: metadata.timestamp, // This might be undefined if not present in metadata
        formattedTime: metadata.timestamp ? new Date(metadata.timestamp).toLocaleString('vi-VN') : 'N/A',
        viewerCount: metadata.viewerCount,
        uptime: metadata.uptime,
        status: metadata.status 
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