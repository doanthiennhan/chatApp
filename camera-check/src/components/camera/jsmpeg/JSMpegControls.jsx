import React from 'react';
import { Button, Badge } from 'antd';
import { PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { getStatusColor, getStatusText } from './jsmpegUtils';

const JSMpegControls = ({ connectionStatus, isStreaming, loading, onStartStream, onStopStream }) => {

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Badge status={getStatusColor(connectionStatus)} text={getStatusText(connectionStatus)} />
      {!isStreaming ? (
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={onStartStream}
          loading={loading}
        >
          Start Stream
        </Button>
      ) : (
        <Button
          danger
          icon={<StopOutlined />}
          onClick={onStopStream}
          loading={loading}
        >
          Stop Stream
        </Button>
      )}
    </div>
  );
};

export default JSMpegControls; 