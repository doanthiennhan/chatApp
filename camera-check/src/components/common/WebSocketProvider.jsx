import React, { useEffect } from 'react';
import { useCameraStatusWebSocket } from '../../hooks/useCameraStatusWebSocket';

/**
 * Provider component để khởi tạo WebSocket connection ở cấp ứng dụng
 * Đảm bảo WebSocket được kết nối một lần và chia sẻ cho toàn bộ ứng dụng
 */
const WebSocketProvider = ({ children }) => {
  // Khởi tạo WebSocket connection
  const { isConnected } = useCameraStatusWebSocket();

  useEffect(() => {
    console.log('🔧 WebSocketProvider: WebSocket connection status:', isConnected);
  }, [isConnected]);

  return (
    <>
      {children}
    </>
  );
};

export default WebSocketProvider; 