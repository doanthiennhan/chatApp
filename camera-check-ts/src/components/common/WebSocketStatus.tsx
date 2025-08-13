import React from 'react';
import { Typography } from 'antd';
import { WifiOutlined } from '@ant-design/icons';
import { useWebSocketStatus } from '../../hooks/useWebSocketStatus';

const { Text } = Typography;

const WebSocketStatus: React.FC = () => {
  const { isConnected } = useWebSocketStatus();
  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      gap: "4px",
      padding: "4px 8px",
      borderRadius: "4px",
      backgroundColor: isConnected ? "#f0f9ff" : "#fef2f2",
      border: `1px solid ${isConnected ? "#0ea5e9" : "#f87171"}`
    }}>
      <WifiOutlined style={{ 
        fontSize: "12px",
        color: isConnected ? "#0ea5e9" : "#f87171"
      }} />
      <div style={{
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        backgroundColor: isConnected ? "#0ea5e9" : "#f87171"
      }} />
      <Text style={{ 
        fontSize: "11px", 
        color: isConnected ? "#0ea5e9" : "#f87171",
        fontWeight: "500"
      }}>
        {isConnected ? "Connected" : "Disconnected"}
      </Text>
    </div>
  );
};

export default WebSocketStatus;