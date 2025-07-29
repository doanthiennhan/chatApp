import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, message, Badge, Descriptions, Spin } from 'antd';
import { PlayCircleOutlined, StopOutlined, EyeOutlined, WifiOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import JSMpeg from "@cycjimmy/jsmpeg-player";
import { getWebSocketUrl } from '../../utils/websocketTest';
import { callGetAllCameras } from '../../services/api';
import { getJSMpegOptions } from '../../utils/webglCheck';

// WebSocket URL cho backend Spring Boot
const getBackendWebSocketUrl = (cameraId, host = 'localhost', port = '8082') => {
  return `ws://${host}:${port}/camera/stream?cameraId=${cameraId}`;
};
import { testCanvasRef, waitForCanvasRef } from '../../utils/canvasTest';

const JSMpegPlayer = ({ camera, selectedCamera, isInModal = false, visible = true }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error
  const [viewerCount, setViewerCount] = useState(0);
  const [streamInfo, setStreamInfo] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [activeStreams, setActiveStreams] = useState(new Set());
  const [players, setPlayers] = useState({});
  const canvasRef = useRef(null);
  const playerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Use selectedCamera if provided, otherwise use camera prop
  const currentCamera = selectedCamera || camera;

  // Fetch cameras on component mount
  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    try {
      const response = await callGetAllCameras();
      setCameras(response.result || []);
    } catch (error) {
      console.error("Failed to fetch cameras:", error);
    } finally {
      setLoading(false);
    }
  };

  // Ensure canvas ref is available
  useEffect(() => {
    if (canvasRef.current) {
      testCanvasRef(canvasRef);
    }
  }, [canvasRef.current]);

  useEffect(() => {
    return () => {
      console.log('🔧 Cleaning up JSMpegPlayer component');

      if (isStreaming) {
        handleStopStream();
      }
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Destroy JSMpeg player
      if (playerRef.current) {
        console.log('🔧 Destroying JSMpeg player');
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isStreaming]);

  // Additional cleanup when modal closes
  useEffect(() => {
    if (isInModal && !visible) {
      console.log('🔧 Modal closed, cleaning up JSMpegPlayer');
      
      // Stop stream if running
      if (isStreaming) {
        handleStopStream();
      }
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Destroy JSMpeg player
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    }
  }, [isInModal, visible, isStreaming]);

  // Cleanup when page is closed or refreshed
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('🔧 Page closing, cleaning up JSMpegPlayer');
      
      // Stop stream if running
      if (isStreaming) {
        handleStopStream();
      }
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Destroy JSMpeg player
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isStreaming]);

  const startStream = (cameraId) => {
    if (activeStreams.has(cameraId)) return;

    const canvas = document.getElementById(`camera-${cameraId}`);
    if (!canvas) return;

    try {
      const wsUrl = `ws://localhost:8084/stream?cameraId=${cameraId}`;
      const playerOptions = getJSMpegOptions(canvas, wsUrl, {
        autoplay: true,
        audio: true,
        pauseWhenHidden: false,
        onSourceEstablished: () => {
          console.log(`Stream established for camera ${cameraId}`);
          setActiveStreams((prev) => new Set([...prev, cameraId]));
        },
        onError: (error) => {
          console.error(`Stream error for camera ${cameraId}:`, error);
          stopStream(cameraId);
        },
      });

      const player = new JSMpeg.Player(wsUrl, playerOptions);

      setPlayers((prev) => ({ ...prev, [cameraId]: player }));
    } catch (error) {
      console.error(`Failed to start stream for camera ${cameraId}:`, error);
    }
  };

  const stopStream = (cameraId) => {
    const player = players[cameraId];
    if (player) {
      player.destroy();
      setPlayers((prev) => {
        const newPlayers = { ...prev };
        delete newPlayers[cameraId];
        return newPlayers;
      });
    }
    setActiveStreams((prev) => {
      const newStreams = new Set(prev);
      newStreams.delete(cameraId);
      return newStreams;
    });
  };

  const handleStartStream = () => {
    if (!currentCamera?.id) {
      message.error('Camera ID không hợp lệ');
      return;
    }

    setLoading(true);
    setConnectionStatus('connecting');

    try {
      console.log('🔧 Starting JSMpeg stream for camera:', currentCamera.id);
      
      // Start stream using the new method
      startStream(currentCamera.id);
      
      // Không gọi API, chỉ kết nối WebSocket trực tiếp
      setIsStreaming(true);
      message.success(`Đang kết nối stream camera: ${currentCamera.name}`);
      
      // Initialize JSMpeg WebSocket connection
      initializeJSMpegStream();
    } catch (error) {
      console.error('Error starting stream:', error);
      setConnectionStatus('error');
      message.error('Lỗi khi bắt đầu stream: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStopStream = () => {
    if (!currentCamera?.id) return;

    setLoading(true);
    try {
      console.log('🔧 Stopping JSMpeg stream for camera:', currentCamera.id);
      
      // Stop stream using the new method
      stopStream(currentCamera.id);
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Không gọi API, chỉ destroy JSMpeg player
      setIsStreaming(false);
      setConnectionStatus('disconnected');
      message.success(`Đã dừng stream camera: ${currentCamera.name}`);
      
      // Destroy JSMpeg player (this will also close WebSocket)
      if (playerRef.current) {
        console.log('🔧 Destroying JSMpeg player on stop');
        playerRef.current.destroy();
        playerRef.current = null;
      }
      
      // Clear stream info
      setStreamInfo(null);
      setViewerCount(0);
    } catch (error) {
      console.error('Error stopping stream:', error);
      message.error('Lỗi khi dừng stream: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeJSMpegStream = () => {
    try {
      console.log('🔧 Initializing JSMpeg stream for camera:', currentCamera.id);
      
      // Get WebSocket URL for Spring Boot backend
      const wsUrl = getBackendWebSocketUrl(currentCamera.id);
      console.log('🔧 WebSocket URL for Spring Boot:', wsUrl);
      
      // Wait for canvas ref to be available using utility
      waitForCanvasRef(canvasRef, (canvas) => {
        if (canvas) {
          console.log('🔧 Canvas ref available, creating JSMpeg player');
          
          const playerOptions = getJSMpegOptions(canvas, wsUrl, {
            autoplay: true,
            audio: true,
            loop: false,
            videoBufferSize: 2 * 1024 * 1024,
            preserveDrawingBuffer: false,
            disableWebAssembly: true,
            disableGl: true,
            renderer: 'canvas',
            onPlay: () => {
              console.log('🔧 JSMpeg player started');
              setConnectionStatus('connected');
            },
            onError: (error) => {
              console.error('🔧 JSMpeg player error:', error);
              setConnectionStatus('error');
              message.error('Lỗi phát video MPEG1');
            },
            onSourceEstablished: () => {
              console.log('🔧 JSMpeg WebSocket connected');
              setConnectionStatus('connecting');
            },
            onDisconnect: () => {
              console.log('🔧 JSMpeg WebSocket disconnected');
              setConnectionStatus('disconnected');
            }
          });
          const player = new JSMpeg.Player(wsUrl, playerOptions);
          playerRef.current = player;
          // Nếu sau 5 giây chưa có khung hình thì báo lỗi
          timeoutRef.current = setTimeout(() => {
            if (!player || player.currentTime === 0) {
              message.error('Không thể phát video từ WebSocket stream');
              setConnectionStatus('error');
            }
          }, 5000);
          // Nếu đang decode video -> cập nhật trạng thái
          player.onVideoDecode = () => {
            console.log('🔧 Video decode started');
            setConnectionStatus('connected');
          };
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
          // Simulate viewer count (you can replace this with real data)
          setViewerCount(1);
        } else {
          console.error('🔧 Canvas ref not available after waiting');
          setConnectionStatus('error');
          message.error('Không thể khởi tạo JSMpeg player - canvas không có sẵn');
        }
      });
      
    } catch (error) {
      console.error('JSMpeg initialization error:', error);
      setConnectionStatus('error');
      message.error('Lỗi khởi tạo JSMpeg: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "connected":
        return "success";
      case "offline":
      case "disconnected":
        return "default";
      case "error":
        return "error";
      case "connecting":
        return "processing";
      default:
        return "default";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Đang xem';
      case 'connecting': return 'Đang kết nối';
      case 'error': return 'Lỗi kết nối';
      default: return 'Chưa kết nối';
    }
  };

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>{currentCamera?.name || 'Unknown Camera'} - Live View 📹</span>
          <Badge count={viewerCount} showZero>
            <EyeOutlined style={{ fontSize: 20, color: "#1677ff" }} />
          </Badge>
        </div>
      }
      extra={
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Badge status={getStatusColor(connectionStatus)} text={getStatusText()} />
          {!isStreaming ? (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleStartStream}
              loading={loading}
            >
              Start Stream
            </Button>
          ) : (
            <Button
              danger
              icon={<StopOutlined />}
              onClick={handleStopStream}
              loading={loading}
            >
              Stop Stream
            </Button>
          )}
        </div>
      }
      style={{ width: "100%", marginBottom: 16 }}
    >
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
      
      {/* Stream Metadata */}
      {streamInfo && (
        <Descriptions 
          title="Stream Information" 
          size="small" 
          column={2} 
          style={{ marginTop: 16 }}
          bordered
        >
          <Descriptions.Item label="Video Codec">{streamInfo.videoCodec || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Audio Codec">{streamInfo.audioCodec || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Resolution">{streamInfo.resolution || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Frame Rate">{streamInfo.frameRate || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Bitrate">{streamInfo.bitRate || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Format">{streamInfo.format || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Last Updated" span={2}>
            {streamInfo.updatedAt ? dayjs(streamInfo.updatedAt).format('DD/MM/YYYY HH:mm:ss') : 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      )}
      
      <div style={{ marginTop: 16, fontSize: 12, color: "#666" }}>
        <div><strong>Camera ID:</strong> {currentCamera?.id}</div>
        <div><strong>RTSP URL:</strong> {currentCamera?.rtspUrl || 'N/A'}</div>
        <div><strong>Connection:</strong> JSMpeg.Player with WebSocket URL</div>
        <div><strong>WebSocket URL:</strong> {getWebSocketUrl(currentCamera?.id)}</div>
      </div>
    </Card>
  );
};

export default JSMpegPlayer; 