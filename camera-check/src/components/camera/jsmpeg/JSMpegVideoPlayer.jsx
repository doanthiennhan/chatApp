import React, { useRef, useEffect } from 'react';
import { Spin } from 'antd';
import { testCanvasRef } from '../../../utils/canvasTest';

const JSMpegVideoPlayer = ({ connectionStatus, canvasRef }) => {
  // Ensure canvas ref is available
  useEffect(() => {
    if (canvasRef.current) {
      testCanvasRef(canvasRef);
    }
  }, [canvasRef.current]);

  return (
    <div style={{ 
      width: "100%", 
      height: 300, 
      background: "#000", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      borderRadius: 8,
      overflow: "hidden",
      position: "relative"
    }}>
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{ 
          width: "100%", 
          height: "100%", 
          objectFit: "contain",
          maxWidth: "100%",
          maxHeight: "100%",
          display: connectionStatus === 'connected' ? 'block' : 'none'
        }}
      />
      
      {connectionStatus === 'connecting' && (
        <div style={{ 
          color: "#fff", 
          textAlign: "center",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang kết nối...</div>
        </div>
      )}
      
      {connectionStatus === 'disconnected' && (
        <div style={{ 
          color: "#fff", 
          textAlign: "center",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📹</div>
          <div>Camera chưa được stream</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
            Click "Start Stream" để bắt đầu
          </div>
        </div>
      )}
      
      {connectionStatus === 'error' && (
        <div style={{ 
          color: "#fff", 
          textAlign: "center",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <div>Lỗi kết nối</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
            Vui lòng thử lại
          </div>
        </div>
      )}
    </div>
  );
};

export default JSMpegVideoPlayer; 