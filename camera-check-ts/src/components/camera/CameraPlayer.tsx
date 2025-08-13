import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button, message, Badge, Descriptions, Spin } from 'antd';
import { PlayCircleOutlined, StopOutlined, EyeOutlined } from '@ant-design/icons';
import { startStream, stopStream } from '../../services/cameraService';
import dayjs from 'dayjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Camera } from '../../types';

interface StreamInfo {
  videoCodec?: string;
  audioCodec?: string;
  resolution?: string;
  frameRate?: string;
  bitRate?: string;
  format?: string;
  updatedAt?: string;
}

interface CameraPlayerProps {
  camera: Camera;
  selectedCamera?: Camera;
  isInModal?: boolean;
  visible?: boolean;
}

const CameraPlayer: React.FC<CameraPlayerProps> = ({ camera, selectedCamera, isInModal = false, visible = true }) => {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [viewerCount, setViewerCount] = useState<number>(0);
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const stompClientRef = useRef<Client | null>(null);

  const currentCamera = selectedCamera || camera;

  const initializeSockJSConnection = (): boolean => {
    if (!currentCamera?.id) return false;
    const stompClient = new Client({
      webSocketFactory: () => {
        return new SockJS('http://localhost:8082/camera/ws') as WebSocket;
      },
      debug: (str: string) => {
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      setConnectionStatus('connecting');

      stompClient.subscribe(`/topic/metadata/${currentCamera.id}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          
          if (data.type === 'VIEWER_COUNT_UPDATE') {
            setViewerCount(data.count);
          } else if (data.type === 'STREAM_INFO_UPDATE') {
            setStreamInfo(data.info);
          } else if (data.type === 'STREAM_STATUS') {
            setConnectionStatus(data.status);
          } else if (data.type === 'METADATA') {
            setStreamInfo(data);
          }
        } catch (error) {
          console.error('Error parsing STOMP message:', error);
        }
      });

      stompClient.subscribe(`/topic/viewer-count/${currentCamera.id}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          setViewerCount(data.count || 0);
        } catch (error) {
          console.error('Error parsing viewer count message:', error);
        }
      });

      stompClient.subscribe(`/topic/stream-status/${currentCamera.id}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          setConnectionStatus(data.status);
        } catch (error) {
          console.error('Error parsing stream status message:', error);
        }
      });

      stompClient.subscribe(`/topic/webrtc/${currentCamera.id}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          
          if (data.type === 'answer' && peerConnectionRef.current) {
            peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
        } catch (error) {
          console.error('Error parsing WebRTC message:', error);
        }
      });

      stompClient.subscribe(`/topic/ice-candidate/${currentCamera.id}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          
          if (data.candidate && peerConnectionRef.current) {
            peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        } catch (error) {
          console.error('Error parsing ICE candidate message:', error);
        }
      });

      stompClient.publish({
        destination: '/app/request-metadata',
        body: JSON.stringify({ cameraId: currentCamera.id })
      });
    };

    stompClient.onStompError = (frame: any) => {
      console.error('STOMP Error:', frame);
      setConnectionStatus('error');
      message.error('Lỗi kết nối WebSocket: ' + frame.headers.message);
    };

    stompClient.onWebSocketError = (error: Event) => {
      console.error('WebSocket Error:', error);
      setConnectionStatus('error');
      message.error('Lỗi kết nối WebSocket');
    };

    stompClient.onDisconnect = () => {    
      setConnectionStatus('disconnected');
    };

    stompClient.activate();
    stompClientRef.current = stompClient;
    
    return true;
  };

  const closeSockJSConnection = () => {
    
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }
    
    setConnectionStatus('disconnected');
    setViewerCount(0);
    setStreamInfo(null);
  };

  const handleStartStream = useCallback(() => {
    const start = async () => {
      if (!currentCamera?.id) {
        message.error('Camera ID không hợp lệ');
        return;
      }

      setLoading(true);
      setConnectionStatus('connecting');

      try {
        
        const result = await startStream(currentCamera.id, false);
        
        if (result && (result.message || String(result).includes('true'))) {
          setIsStreaming(true);
           
          message.success(`Đã bắt đầu stream camera: ${currentCamera.name}`);
          
          const sockJSInitialized = initializeSockJSConnection();
          
          if (sockJSInitialized) {
            await initializeWebRTC();
          } else {
            setConnectionStatus('error');
             
            message.error('Không thể khởi tạo kết nối kết nối WebSocket');
          }
        } else {
          setConnectionStatus('error');
           
          message.error('Không thể bắt đầu stream');
        }
      } catch (error: any) {
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
      
      const result = await stopStream(currentCamera.id, false);
      
      if (result && (result.message || String(result).includes('true'))) {
        setIsStreaming(false);
        setConnectionStatus('disconnected');
        message.success(`Đã dừng stream camera: ${currentCamera.name}`);
        
        closeSockJSConnection();
        
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }
        
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.src = '';
        }
        
        setStreamInfo(null);
        setViewerCount(0);
      } else {
        message.error('Không thể dừng stream');
      }
    } catch (error: any) {
      console.error('Error stopping stream:', error);
      message.error('Lỗi khi dừng stream: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [closeSockJSConnection, message, currentCamera?.id, currentCamera?.name]);

  useEffect(() => {
    return () => {
      if (isStreaming) {
        handleStopStream();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      closeSockJSConnection();
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    };
  }, [isStreaming, handleStopStream, closeSockJSConnection]);

  useEffect(() => {
    if (isInModal && !visible) {

      if (isStreaming) {
        handleStopStream();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      closeSockJSConnection();
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    }
  }, [isInModal, visible, isStreaming, handleStopStream, closeSockJSConnection]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      
      if (isStreaming) {
        handleStopStream();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      closeSockJSConnection();
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isStreaming, handleStopStream, closeSockJSConnection]);

  const initializeWebRTC = async () => {
    try {
      
      
      const configuration: RTCConfiguration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };

      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      peerConnection.ontrack = (event: RTCTrackEvent) => {
        
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
          setConnectionStatus('connected');
        }
      };

      peerConnection.onconnectionstatechange = () => {
        
        if (peerConnection.connectionState === 'connected') {
          setConnectionStatus('connected');
        } else if (peerConnection.connectionState === 'failed') {
          setConnectionStatus('error');
          message.error('WebRTC connection failed');
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        
      };

      peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate) {
          
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

      const offer = await peerConnection.createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true
      });
      await peerConnection.setLocalDescription(offer);



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

    } catch (error: any) {
      console.error('WebRTC initialization error:', error);
      setConnectionStatus('error');
      message.error('Lỗi khởi tạo WebRTC: ' + error.message);
    }
  };

  const getStatusColor = (): 'success' | 'processing' | 'error' | 'default' => {
    switch (connectionStatus) {
      case 'connected': return 'success';
      case 'connecting': return 'processing';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (): string => {
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
            onError={(e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
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