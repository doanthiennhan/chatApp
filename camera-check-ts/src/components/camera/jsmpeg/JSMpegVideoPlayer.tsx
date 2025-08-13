import React, { useEffect } from 'react';
import { Spin } from 'antd';
import { testCanvasRef } from '../../../utils/canvasTest';
import { useTranslation } from 'react-i18next';

interface JSMpegVideoPlayerProps {
  connectionStatus: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const JSMpegVideoPlayer: React.FC<JSMpegVideoPlayerProps> = ({ connectionStatus, canvasRef }) => {
  const { t } = useTranslation();

  // Ensure canvas ref is available
  useEffect(() => {
    if (canvasRef.current) {
      testCanvasRef(canvasRef);
    }
  }, [canvasRef]);

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
          <div style={{ marginTop: 16 }}>{t('connecting')}</div>
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
          <div>{t('camera_not_streamed')}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
            {t('click_start_stream_hint')}
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
          <div>{t('connection_error')}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
            {t('please_try_again')}
          </div>
        </div>
      )}
    </div>
  );
};

export default JSMpegVideoPlayer;