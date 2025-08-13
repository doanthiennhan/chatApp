import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button, message, Badge, Descriptions, Spin } from 'antd';
import { PlayCircleOutlined, StopOutlined, EyeOutlined, WifiOutlined } from '@ant-design/icons';
import { startStream, stopStream } from '../../services/cameraService';
import dayjs from 'dayjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const CameraPlayer = ({ camera, selectedCamera, isInModal = false, visible = true }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error
  const [viewerCount, setViewerCount] = useState(0);
  const [streamInfo, setStreamInfo] = useState(null);
  const videoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const stompClientRef = useRef(null);

  // Use selectedCamera if provided, otherwise use camera prop
  const currentCamera = selectedCamera || camera;

  // Bỏ STOMP WebSocket connection tự động khi component mount
  // useEffect(() => {
  //   if (!currentCamera?.id) return;
  //   // ... STOMP connection logic
  // }, [currentCamera?.id]);

  // Bỏ auto-start stream khi component mount
  // useEffect(() => {
  //   if (currentCamera?.id && !isStreaming) {
  //     handleStartStream();
  //   }
  // }, [currentCamera?.id]);

  // Function để khởi tạo SockJS connection
  const initializeSockJSConnection = () => {
    if (!currentCamera?.id) return false;

    console.log('🔧 Initializing SockJS connection for camera:', currentCamera.id);

    // Use SockJS instead of native WebSocket
    const stompClient = new Client({
      webSocketFactory: () => {
        console.log('🔧 Creating SockJS connection to: http://localhost:8082/ws');
        return new SockJS('http://localhost:8082/camera/ws');
      },
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      console.log('STOMP Connected for camera:', currentCamera.id);
      setConnectionStatus('connecting');

      // Subscribe to metadata updates
      stompClient.subscribe(`/topic/metadata/${currentCamera.id}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log('Received metadata:', data);
          
          if (data.type === 'VIEWER_COUNT_UPDATE') {
            setViewerCount(data.count);
          } else if (data.type === 'STREAM_INFO_UPDATE') {
            setStreamInfo(data.info);
          } else if (data.type === 'STREAM_STATUS') {
            setConnectionStatus(data.status);
          } else if (data.type === 'METADATA') {
            // Handle general metadata
            setStreamInfo(data);
          }
        } catch (error) {
          console.error('Error parsing STOMP message:', error);
        }
      });

      // Subscribe to viewer count updates
      stompClient.subscribe(`/topic/viewer-count/${currentCamera.id}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          setViewerCount(data.count || 0);
        } catch (error) {
          console.error('Error parsing viewer count message:', error);
        }
      });

      // Subscribe to stream status updates
      stompClient.subscribe(`/topic/stream-status/${currentCamera.id}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          setConnectionStatus(data.status);
        } catch (error) {
          console.error('Error parsing stream status message:', error);
        }
      });

      // Subscribe to WebRTC answer
      stompClient.subscribe(`/topic/webrtc/${currentCamera.id}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log('Received WebRTC answer:', data);
          
          if (data.type === 'answer' && peerConnectionRef.current) {
            peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
        } catch (error) {
          console.error('Error parsing WebRTC message:', error);
        }
      });

      // Subscribe to ICE candidates
      stompClient.subscribe(`/topic/ice-candidate/${currentCamera.id}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log('Received ICE candidate:', data);
          
          if (data.candidate && peerConnectionRef.current) {
            peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        } catch (error) {
          console.error('Error parsing ICE candidate message:', error);
        }
      });

      // Request initial metadata
      stompClient.publish({
        destination: '/app/request-metadata',
        body: JSON.stringify({ cameraId: currentCamera.id })
      });
    };

    stompClient.onStompError = (frame) => {
      console.error('STOMP Error:', frame);
      setConnectionStatus('error');
      message.error('Lỗi kết nối WebSocket: ' + frame.headers.message);
    };

    stompClient.onWebSocketError = (error) => {
      console.error('WebSocket Error:', error);
      setConnectionStatus('error');
      message.error('Lỗi kết nối WebSocket');
    };

    stompClient.onDisconnect = () => {
      console.log('STOMP Disconnected');
      setConnectionStatus('disconnected');
    };

    stompClient.activate();
    stompClientRef.current = stompClient;
    
    return true;
  };

  // Function để đóng SockJS connection
  const closeSockJSConnection = () => {
    console.log('🔧 Closing SockJS connection');
    
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }
    
    setConnectionStatus('disconnected');
    setViewerCount(0);
    setStreamInfo(null);
  };

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      console.log('🔧 Cleaning up CameraPlayer component');
      
      // Stop stream if running
      if (isStreaming) {
        handleStopStream();
      }
      
      // Close WebRTC connection
      if (peerConnectionRef.current) {
        console.log('🔧 Closing WebRTC connection');
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      
      // Close SockJS connection
      closeSockJSConnection();
      
      // Stop video
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    };
  }, [isStreaming, handleStopStream]);

  // Additional cleanup when modal closes
  useEffect(() => {
    if (isInModal && !visible) {
      console.log('🔧 Modal closed, cleaning up CameraPlayer');
      
      // Stop stream if running
      if (isStreaming) {
        handleStopStream();
      }
      
      // Close WebRTC connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      
      // Close SockJS connection
      closeSockJSConnection();
      
      // Stop video
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    }
  }, [isInModal, visible, isStreaming, handleStopStream]);

  // Cleanup when page is closed or refreshed
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('🔧 Page closing, cleaning up CameraPlayer');
      
      // Stop stream if running
      if (isStreaming) {
        handleStopStream();
      }
      
      // Close WebRTC connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      
      // Close SockJS connection
      closeSockJSConnection();
      
      // Stop video
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isStreaming, handleStopStream]);

  const handleStartStream = useCallback(() => {
    const start = async () => {
      if (!currentCamera?.id) {
        message.error('Camera ID không hợp lệ');
        return;
      }

      setLoading(true);
      setConnectionStatus('connecting');

      try {
        console.log('🔧 Starting stream for camera:', currentCamera.id);
        
        // Start stream on backend with correct request body
        const result = await startStream(currentCamera.id, false);
        console.log('🔧 Start stream API result:', result);
        
        // Check if stream started successfully
        if (result && (result.message || result.toString().includes('true'))) {
          setIsStreaming(true);
           
          message.success(`Đã bắt đầu stream camera: ${currentCamera.name}`);
          
          // Chỉ mở SockJS connection khi stream thành công
          console.log('🔧 Stream started successfully, initializing SockJS connection');
          const sockJSInitialized = initializeSockJSConnection();
          
          if (sockJSInitialized) {
            // Initialize WebRTC connection
            await initializeWebRTC();
          } else {
            setConnectionStatus('error');
             
            message.error('Không thể khởi tạo kết nối kết nối WebSocket');
          }
        } else {
          setConnectionStatus('error');
           
          message.error('Không thể bắt đầu stream');
        }
      } catch (error) {
        console.error('Error starting stream:', error);
        setConnectionStatus('error');
         
        message.error('Lỗi khi bắt đầu stream: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    start();
  }, [currentCamera, message]);

   
  const handleStopStream = useCallback(async () => {
    if (!currentCamera?.id) return;

    setLoading(true);
    try {
      console.log('🔧 Stopping stream for camera:', currentCamera.id);
      
      const result = await stopStream(currentCamera.id, false);
      console.log('🔧 Stop stream API result:', result);
      
      // Check if stream stopped successfully
      if (result && (result.message || result.toString().includes('true'))) {
        setIsStreaming(false);
        setConnectionStatus('disconnected');
        message.success(`Đã dừng stream camera: ${currentCamera.name}`);
        
        // Đóng SockJS connection khi stop stream
        console.log('🔧 Stream stopped, closing SockJS connection');
        closeSockJSConnection();
        
        // Close WebRTC connection
        if (peerConnectionRef.current) {
          console.log('🔧 Closing WebRTC connection on stop');
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }
        
        // Stop video
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.src = '';
        }
        
        // Clear stream info
        setStreamInfo(null);
        setViewerCount(0);
      } else {
        message.error('Không thể dừng stream');
      }
    } catch (error) {
      console.error('Error stopping stream:', error);
      message.error('Lỗi khi dừng stream: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [closeSockJSConnection, message]);

  const initializeWebRTC = async () => {
    try {
      console.log('🔧 Initializing WebRTC connection for camera:', currentCamera.id);
      
      // Create RTCPeerConnection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };

      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Handle incoming stream
      peerConnection.ontrack = (event) => {
        console.log('🔧 WebRTC track received:', event.streams);
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
          setConnectionStatus('connected');
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('🔧 WebRTC connection state:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'connected') {
          setConnectionStatus('connected');
        } else if (peerConnection.connectionState === 'failed') {
          setConnectionStatus('error');
          message.error('WebRTC connection failed');
        }
      };

      // Handle ICE connection state changes
      peerConnection.oniceconnectionstatechange = () => {
        console.log('🔧 ICE connection state:', peerConnection.iceConnectionState);
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🔧 Sending ICE candidate:', event.candidate);
          // Send ICE candidate to signaling server via STOMP
          if (stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.publish({
              destination: '/app/ice-candidate',
              body: JSON.stringify({
                cameraId: currentCamera.id,
                candidate: event.candidate
              })
            });
          }
        }
      };

      // Create offer
      const offer = await peerConnection.createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true
      });
      await peerConnection.setLocalDescription(offer);

      console.log('🔧 Sending WebRTC offer:', offer);

      // Send offer to signaling server via STOMP
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.publish({
          destination: '/app/offer',
          body: JSON.stringify({
            cameraId: currentCamera.id,
            offer: offer
          })
        });
      } else {
        throw new Error('STOMP client not connected');
      }

    } catch (error) {
      console.error('WebRTC initialization error:', error);
      setConnectionStatus('error');
      message.error('Lỗi khởi tạo WebRTC: ' + error.message);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'success';
      case 'connecting': return 'processing';
      case 'error': return 'error';
      default: return 'default';
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
          <Badge status={getStatusColor()} text={getStatusText()} />
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
        {connectionStatus === 'connected' ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            controls={false}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            onError={(e) => {
              console.error('Video error:', e);
              setConnectionStatus('error');
               
              message.error('Lỗi phát video');
            }}
          />
        ) : connectionStatus === 'connecting' ? (
          <div style={{ color: "#fff", textAlign: "center" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Đang kết nối...</div>
          </div>
        ) : (
          <div style={{ color: "#fff", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📹</div>
            <div>Camera chưa được stream</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
              Click "Start Stream" để bắt đầu
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
        <div><strong>Connection:</strong> WebRTC via STOMP SockJS (Port 8082)</div>
      </div>
    </Card>
  );
};

export default CameraPlayer;