import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button, message, Badge, Descriptions, Spin, Tooltip, Progress, Space, Tag } from 'antd';
import { 
  PlayCircleOutlined, 
  StopOutlined, 
  EyeOutlined, 
  WifiOutlined, 
  CameraOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ReloadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import JSMpeg from "@cycjimmy/jsmpeg-player";
import styled from "styled-components";
import { getWebSocketUrl, getMetadataWebSocketUrl, createWebSocketConnection } from '../../utils/websocket';
import { testCanvasRef, waitForCanvasRef } from '../../utils/canvasTest';
import { getJSMpegOptions } from '../../utils/webglCheck';
import { useCameraRealTimeStatus } from '../../hooks/useCameraRealTimeStatus';

// Styled components for enhanced UI
const StreamContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
  background: #000;
`;

const CanvasWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const StyledCanvas = styled.canvas`
  transition: transform 0.3s ease;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const ControlsOverlay = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${StreamContainer}:hover & {
    opacity: 1;
  }
`;

const MetricsOverlay = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${StreamContainer}:hover & {
    opacity: 1;
  }
`;

const StatusIndicator = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
`;

const SpringBootStreamPlayer = ({ camera, selectedCamera, isInModal = false, visible = true }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [viewerCount, setViewerCount] = useState(0);
  const [streamInfo, setStreamInfo] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fps, setFps] = useState(0);
  const [loadSpeed, setLoadSpeed] = useState(0);
  const [videoQuality, setVideoQuality] = useState('Unknown');
  const [cameraLocation, setCameraLocation] = useState('');
  const [localRealTimeStatus, setLocalRealTimeStatus] = useState({
    isOnline: false,
    lastSeen: null,
    uptime: 0,
    packetLoss: 0,
    latency: 0
  });
  
  const realTimeStatus = useCameraRealTimeStatus(selectedCamera?.id || camera?.id);
  const canvasRef = useRef(null);
  const playerRef = useRef(null);
  const timeoutRef = useRef(null);
  const metricsRef = useRef(null);
  const streamContainerRef = useRef(null);
  const metadataWebSocketRef = useRef(null);

  const currentCamera = selectedCamera || camera;

  useEffect(() => {
    if (currentCamera) {
      setCameraLocation(currentCamera.location || currentCamera.name || 'Unknown Location');
    }
  }, [currentCamera]);

  useEffect(() => {
    if (canvasRef.current) {
      testCanvasRef(canvasRef);
    }
  }, [canvasRef]);

  useEffect(() => {
    const timeout = timeoutRef.current;
    const metrics = metricsRef.current;
    return () => {
      console.log('🔧 Cleaning up SpringBootStreamPlayer component');
      if (playerRef.current) {
        handleStopStream();
      }
      if (timeout) {
        clearTimeout(timeout);
      }
      if (metrics) {
        clearInterval(metrics);
      }
      if (metadataWebSocketRef.current && metadataWebSocketRef.current.readyState !== WebSocket.CLOSED) {
        try {
          metadataWebSocketRef.current.close();
        } catch (error) {
          console.warn('Error closing metadata WebSocket in cleanup:', error);
        }
        metadataWebSocketRef.current = null;
      }
    };
  }, [handleStopStream]);

  useEffect(() => {
    if (isInModal && !visible) {
      console.log('🔧 Modal closed, cleaning up SpringBootStreamPlayer');
      if (playerRef.current) {
        handleStopStream();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (metricsRef.current) {
        clearInterval(metricsRef.current);
      }
      if (metadataWebSocketRef.current && metadataWebSocketRef.current.readyState !== WebSocket.CLOSED) {
        try {
          metadataWebSocketRef.current.close();
        } catch (error) {
          console.warn('Error closing metadata WebSocket in modal cleanup:', error);
        }
        metadataWebSocketRef.current = null;
      }
    }
  }, [isInModal, visible, handleStopStream]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      streamContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const startMetadataStream = () => {
    if (!currentCamera?.id) return;
    const metadataUrl = getMetadataWebSocketUrl(currentCamera.id);

    if (metadataWebSocketRef.current) {
      metadataWebSocketRef.current.close();
    }

    metadataWebSocketRef.current = createWebSocketConnection(
      metadataUrl,
      (event) => {
        let parsed;
        try {
          parsed = JSON.parse(event.data);
        } catch {
          return;
        }
        if (parsed) {
          setFps(Number(parsed.fps) || 0);

          const bitrate = Number(parsed.bitrate);
          setLoadSpeed(isNaN(bitrate) ? 0 : bitrate);

          setStreamInfo(prev => ({
            ...prev,
            resolution: parsed.resolution,
            updatedAt: new Date().toISOString()
          }));

          setVideoQuality(
            !isNaN(bitrate)
              ? (bitrate > 2000 ? 'HD' :
                 bitrate > 1000 ? 'SD' :
                 bitrate > 500 ? 'Low' : 'Poor')
              : 'Unknown'
          );

          setLocalRealTimeStatus(prev => ({
            ...prev,
            uptime: Number(parsed.uptime) || 0,
            isOnline: parsed.status === 'ONLINE',
            lastSeen: new Date().toISOString()
          }));
          setViewerCount(Number(parsed.viewerCount) || 0);
        }
      },
      () => console.log(' Metadata connected'),
      () => console.log(' Metadata disconnected'),
      (err) => console.error(' Metadata error:', err)
    );
  };

  const stopMetadataStream = () => {
    if (metadataWebSocketRef.current && metadataWebSocketRef.current.readyState !== WebSocket.CLOSED) {
      try {
        metadataWebSocketRef.current.close();
      } catch (error) {
        console.warn('Error closing metadata WebSocket:', error);
      }
      metadataWebSocketRef.current = null;
    }
  };

  const handleStartStream = async () => {
    if (!currentCamera) {
      message.error('Không có camera được chọn');
      return;
    }

    setLoading(true);
    setConnectionStatus('connecting');

    try {
      const wsUrl = getWebSocketUrl(currentCamera.id);
      console.log('🔧 Starting SpringBoot stream with URL:', wsUrl);

      const canvas = await waitForCanvasRef(canvasRef, 5000);
      if (!canvas) {
        throw new Error('Canvas not available');
      }

      const playerOptions = getJSMpegOptions(canvas, wsUrl, {
        autoplay: true,
        audio: true,
        loop: false,
        videoBufferSize: 2 * 1024 * 1024, // 2MB buffer for smoother playback
        preserveDrawingBuffer: false,
        disableWebAssembly: true,
        disableGl: true,
        renderer: 'canvas',
        onPlay: () => {
          console.log('🔧 SpringBoot stream started successfully');
          setIsStreaming(true);
          setConnectionStatus('connected');
          setLoading(false);
          message.success('Stream đã bắt đầu');
        },
        onError: (error) => {
          console.error('🔧 SpringBoot stream error:', error);
          setConnectionStatus('error');
          setLoading(false);
          message.error('Lỗi stream: ' + error.message);
        },
        onSourceEstablished: () => {
          console.log('🔧 SpringBoot stream source established');
          setConnectionStatus('connected');
        },
        onDisconnect: () => {
          console.log('🔧 SpringBoot stream disconnected');
          setConnectionStatus('disconnected');
        }
      });
      let player;
      try {
        player = new JSMpeg.Player(wsUrl, playerOptions);
      } catch (error) {
        console.error('🔧 Failed to create JSMpeg player with WebGL disabled, trying with basic options:', error);

        const basicOptions = {
          canvas: canvas,
          autoplay: true,
          audio: true,
          loop: false,
          videoBufferSize: 2 * 1024 * 1024,
          preserveDrawingBuffer: false,
          disableWebAssembly: true,
          disableGl: true,
          renderer: 'canvas',
          onPlay: playerOptions.onPlay,
          onError: playerOptions.onError,
          onSourceEstablished: playerOptions.onSourceEstablished,
          onDisconnect: playerOptions.onDisconnect
        };
        player = new JSMpeg.Player(wsUrl, basicOptions);
      }
      if (player) {
        playerRef.current = player;
        console.log('🔧 JSMpeg player created successfully');
        // Set stream info metadata to match BE config
        setStreamInfo({
          videoCodec: 'MPEG1',
          audioCodec: 'MP2',
          resolution: '640x480',
          frameRate: '30fps',
          bitRate: '128k',
          format: 'MPEG-TS',
          updatedAt: new Date().toISOString()
        });
        startMetadataStream();
      } else {
        throw new Error('Failed to create player');
      }
    } catch (error) {
      console.error('🔧 Error starting SpringBoot stream:', error);
      setConnectionStatus('error');
      setLoading(false);
      message.error('Lỗi khi bắt đầu stream: ' + error.message);
    }
  };

   
   
   
  const handleStopStream = useCallback(() => {
    console.log('🔧 Stopping SpringBoot stream');
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.warn('Error destroying player:', error);
      }
      playerRef.current = null;
    }
    setIsStreaming(false);
    setConnectionStatus('disconnected');
    setStreamInfo(null);
    setFps(0);
    setLoadSpeed(0);
    setVideoQuality('Unknown');
    setLocalRealTimeStatus({
      isOnline: false,
      lastSeen: null,
      uptime: 0,
      packetLoss: 0,
      latency: 0
    });
    stopMetadataStream();
     
    message.info('Stream đã dừng');
  }, [message]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'green';
      case 'connecting': return 'orange';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Đã kết nối';
      case 'connecting': return 'Đang kết nối';
      case 'error': return 'Lỗi kết nối';
      default: return 'Chưa kết nối';
    }
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'HD': return 'green';
      case 'SD': return 'blue';
      case 'Low': return 'orange';
      case 'Poor': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CameraOutlined />
          SpringBoot Stream Player
          <Badge status={getStatusColor()} text={getStatusText()} />
        </div>
      }
      extra={
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleStartStream}
            disabled={isStreaming || loading}
            loading={loading}
          >
            Bắt đầu
          </Button>
          <Button
            danger
            icon={<StopOutlined />}
            onClick={handleStopStream}
            disabled={!isStreaming}
          >
            Dừng
          </Button>
        </div>
      }
    >
      <StreamContainer ref={streamContainerRef} style={{ height: '500px' }}>
        <StatusIndicator>
          <Badge 
            status={realTimeStatus.isOnline ? 'success' : 'error'} 
            text={realTimeStatus.isOnline ? 'Online' : 'Offline'} 
          />
        </StatusIndicator>

        <ControlsOverlay>
          <Tooltip title="Phóng to">
            <Button 
              type="text" 
              icon={<ZoomInOutlined />} 
              onClick={handleZoomIn}
              style={{ color: 'white', background: 'rgba(0,0,0,0.5)' }}
            />
          </Tooltip>
          <Tooltip title="Thu nhỏ">
            <Button 
              type="text" 
              icon={<ZoomOutOutlined />} 
              onClick={handleZoomOut}
              style={{ color: 'white', background: 'rgba(0,0,0,0.5)' }}
            />
          </Tooltip>
          <Tooltip title="Reset zoom">
            <Button 
              type="text" 
              icon={<ReloadOutlined />} 
              onClick={handleResetZoom}
              style={{ color: 'white', background: 'rgba(0,0,0,0.5)' }}
            />
          </Tooltip>
          <Tooltip title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}>
            <Button 
              type="text" 
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
              onClick={handleFullscreen}
              style={{ color: 'white', background: 'rgba(0,0,0,0.5)' }}
            />
          </Tooltip>
        </ControlsOverlay>

        <CanvasWrapper>
          <StyledCanvas
            ref={canvasRef}
            width="640"
            height="480"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              display: connectionStatus === 'connected' ? 'block' : 'none'
            }}
          />
          
          {connectionStatus === 'connecting' && (
            <div style={{ 
              color: "#fff", 
              textAlign: "center",
              position: "absolute"
            }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>Đang kết nối...</div>
            </div>
          )}
          
          {connectionStatus === 'disconnected' && (
            <div style={{ 
              color: "#fff", 
              textAlign: "center",
              position: "absolute"
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📹</div>
              <div>Camera chưa được stream</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
                Click "Bắt đầu" để bắt đầu
              </div>
            </div>
          )}
          
          {connectionStatus === 'error' && (
            <div style={{ 
              color: "#fff", 
              textAlign: "center",
              position: "absolute"
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
              <div>Lỗi kết nối</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
                Vui lòng thử lại
              </div>
            </div>
          )}
        </CanvasWrapper>

        <MetricsOverlay>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>FPS: {fps}</div>
            <div>Bitrate: {loadSpeed} kbps</div>
            <div>Resolution: {streamInfo?.resolution}</div>
            <div>Quality: <Tag color={getQualityColor(videoQuality)}>{videoQuality}</Tag></div>
            <div>Uptime: {localRealTimeStatus.uptime}s</div>
            <div>Status: <Tag color={realTimeStatus.isOnline ? 'green' : 'red'}>
              {realTimeStatus.isOnline ? 'Running' : 'Offline'}
            </Tag></div>
          </div>
        </MetricsOverlay>
      </StreamContainer>
      
      {currentCamera && (
        <Descriptions size="small" style={{ marginTop: '16px' }} column={2}>
          <Descriptions.Item label="Camera ID">{currentCamera.id}</Descriptions.Item>
          <Descriptions.Item label="Tên">{currentCamera.name}</Descriptions.Item>
          <Descriptions.Item label="Vị trí">{cameraLocation}</Descriptions.Item>
          <Descriptions.Item label="Độ phân giải">{streamInfo?.resolution}</Descriptions.Item>
          <Descriptions.Item label="Bitrate">{loadSpeed} kbps</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={realTimeStatus.isOnline ? 'green' : 'red'}>
              {realTimeStatus.isOnline ? 'ONLINE' : 'OFFLINE'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Chất lượng">
            <Tag color={getQualityColor(videoQuality)}>{videoQuality}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="FPS hiện tại">{fps}</Descriptions.Item>
          <Descriptions.Item label="Tốc độ load">{loadSpeed} kbps</Descriptions.Item>
          <Descriptions.Item label="Thời gian hoạt động">{localRealTimeStatus.uptime}s</Descriptions.Item>
          <Descriptions.Item label="Số người xem hiện tại">
            <Badge count={viewerCount} overflowCount={999} showZero>
              <EyeOutlined />
            </Badge>
          </Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  );
};

export default SpringBootStreamPlayer;
