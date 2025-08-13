import React, { useEffect, ReactNode } from 'react';
import { useCameraStatusWebSocket } from '../../hooks/useCameraStatusWebSocket';

interface WebSocketProviderProps {
  children: ReactNode;
}

const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { isConnected } = useCameraStatusWebSocket();

  return (
    <>
      {children}
    </>
  );
};

export default WebSocketProvider;