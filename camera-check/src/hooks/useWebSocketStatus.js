import { useSelector } from 'react-redux';

export const useWebSocketStatus = () => {
  return {
    isConnected: true,
    lastConnected: new Date().toISOString(),
    reconnectAttempts: 0
  };
}; 