// WebSocket utility functions

export const getWebSocketUrl = (cameraId, host = 'localhost', port = '8082') => {
  return `ws://${host}:${port}/camera/stream?cameraId=${cameraId}`;
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