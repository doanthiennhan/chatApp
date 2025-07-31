import React from 'react';
import { getWebSocketUrl } from '../../../utils/websocket';

const JSMpegCameraDetails = ({ camera }) => {
  return (
    <div style={{ marginTop: 16, fontSize: 12, color: "#666" }}>
      <div><strong>Camera ID:</strong> {camera?.id}</div>
      <div><strong>RTSP URL:</strong> {camera?.rtspUrl || 'N/A'}</div>
      <div><strong>Connection:</strong> JSMpeg.Player with WebSocket URL</div>
      <div><strong>WebSocket URL:</strong> {getWebSocketUrl(camera?.id)}</div>
    </div>
  );
};

export default JSMpegCameraDetails; 