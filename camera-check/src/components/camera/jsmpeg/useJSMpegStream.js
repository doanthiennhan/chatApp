import { useState, useEffect, useRef, useCallback } from 'react';
import { message } from 'antd';
import JSMpeg from '@cycjimmy/jsmpeg-player';
import { getJSMpegOptions } from '../../../utils/webglCheck';
import { waitForCanvasRef } from '../../../utils/canvasTest';
import {
  getBackendWebSocketUrl,
  getMetadataWebSocketUrl,
  parseStreamMetadata
} from './jsmpegUtils';

export const useJSMpegStream = (camera, isInModal = false, visible = true) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [streamInfo, setStreamInfo] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [activeStreams, setActiveStreams] = useState(new Set());
  const [players, setPlayers] = useState({});
  const [streamMetadata, setStreamMetadata] = useState(null);
  const playerRef = useRef(null);
  const timeoutRef = useRef(null);
  const metadataWebSocketRef = useRef(null);

  useEffect(() => {
    return () => {
      if (isStreaming) handleStopStream();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      if (metadataWebSocketRef.current) {
        metadataWebSocketRef.current.close();
        metadataWebSocketRef.current = null;
      }
    };
  }, [isStreaming, handleStopStream]);

  useEffect(() => {
    if (isInModal && !visible) handleStopStream();
  }, [isInModal, visible, handleStopStream]);

  useEffect(() => {
    const handleBeforeUnload = () => handleStopStream();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isStreaming, handleStopStream]);

  const startStream = (cameraId) => {
    if (activeStreams.has(cameraId)) return;
    const canvas = document.getElementById(`camera-${cameraId}`);
    if (!canvas) return;

    try {
      const wsUrl = getBackendWebSocketUrl(cameraId);
      const playerOptions = getJSMpegOptions(canvas, wsUrl, {
        autoplay: true,
        audio: true,
        pauseWhenHidden: false,
        onSourceEstablished: () => {
          setActiveStreams((prev) => new Set([...prev, cameraId]));
        },
        onError: (error) => {
          console.error(error);
          stopStream(cameraId);
        },
      });

      const player = new JSMpeg.Player(wsUrl, playerOptions);
      setPlayers((prev) => ({ ...prev, [cameraId]: player }));
    } catch (error) {
      console.error(error);
    }
  };

  const stopStream = (cameraId) => {
    const player = players[cameraId];
    if (player) {
      player.destroy();
      setPlayers((prev) => {
        const updated = { ...prev };
        delete updated[cameraId];
        return updated;
      });
    }
    setActiveStreams((prev) => {
      const updated = new Set(prev);
      updated.delete(cameraId);
      return updated;
    });
  };

  const initializeMetadataWebSocket = () => {
    try {
      const metadataWsUrl = getMetadataWebSocketUrl(camera?.id);
      const metadataWs = new WebSocket(metadataWsUrl);
      metadataWebSocketRef.current = metadataWs;

      const timeout = setTimeout(() => {
        if (metadataWs.readyState === WebSocket.CONNECTING) metadataWs.close();
      }, 5000);

      metadataWs.onopen = () => clearTimeout(timeout);

      metadataWs.onmessage = (event) => {
        if (typeof event.data === 'string' && event.data.trim().startsWith('{')) {
          const metadata = parseStreamMetadata(event.data);
          if (metadata) {
            setStreamMetadata(metadata);
            setStreamInfo({
              videoCodec: 'MPEG1',
              audioCodec: 'MP2',
              resolution: metadata.resolution,
              frameRate: `${metadata.fps}fps`,
              bitRate: `${metadata.bitrate_kbps}kbps`,
              format: 'MPEG-TS',
              updatedAt: new Date(metadata.timestamp).toISOString()
            });
          }
        }
      };

      metadataWs.onerror = (error) => console.error(error);
      metadataWs.onclose = (event) => {
        if (event.code !== 1000 && isStreaming) setTimeout(() => isStreaming && initializeMetadataWebSocket(), 3000);
      };
    } catch (error) {
      console.error(error);
    }
  };

  const initializeJSMpegStream = (canvasRef) => {
    try {
      const wsUrl = getBackendWebSocketUrl(camera?.id);
      waitForCanvasRef(canvasRef, (canvas) => {
        if (!canvas) {
          setConnectionStatus('error');
          return message.error('Không tìm thấy canvas để render video');
        }

        const playerOptions = getJSMpegOptions(canvas, wsUrl, {
          autoplay: true,
          audio: true,
          loop: false,
          videoBufferSize: 2 * 1024 * 1024,
          disableWebAssembly: true,
          disableGl: true,
          renderer: 'canvas',
          pauseWhenHidden: false,
          onPlay: () => setConnectionStatus('connected'),
          onError: () => {
            setConnectionStatus('error');
            message.error('Lỗi phát video MPEG1');
          },
          onSourceEstablished: () => setConnectionStatus('connecting'),
          onDisconnect: () => setConnectionStatus('disconnected'),
        });

        const player = new JSMpeg.Player(wsUrl, playerOptions);
        playerRef.current = player;

        timeoutRef.current = setTimeout(() => {
          if (!player || player.currentTime === 0) {
            setConnectionStatus('error');
            message.error('Không thể phát video từ WebSocket stream');
          }
        }, 5000);

        player.onVideoDecode = () => setConnectionStatus('connected');

        setViewerCount(1);
        initializeMetadataWebSocket();
      });
    } catch (error) {
      setConnectionStatus('error');
      message.error('Lỗi khởi tạo JSMpeg: ' + error.message);
    }
  };

  const handleStartStream = (canvasRef) => {
    if (!camera?.id) return message.error('Camera ID không hợp lệ');
    setLoading(true);
    setConnectionStatus('connecting');
    try {
      startStream(camera.id);
      setIsStreaming(true);
      message.success(`Đang kết nối stream camera: ${camera.name}`);
      initializeJSMpegStream(canvasRef);
    } catch (error) {
      setConnectionStatus('error');
      message.error('Lỗi khi bắt đầu stream: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

   
   
   
  const handleStopStream = useCallback(() => {
    if (!camera?.id) return;
    setLoading(true);
    try {
      stopStream(camera.id);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsStreaming(false);
      setConnectionStatus('disconnected');
       
      message.success(`Đã dừng stream camera: ${camera.name}`);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      setStreamInfo(null);
      setStreamMetadata(null);
      setViewerCount(0);
      if (metadataWebSocketRef.current) {
        metadataWebSocketRef.current.close();
        metadataWebSocketRef.current = null;
      }
    } catch (error) {
       
      message.error('Lỗi khi dừng stream: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [camera?.id, camera?.name, stopStream, message]);

  return {
    isStreaming,
    loading,
    connectionStatus,
    streamInfo,
    streamMetadata,
    viewerCount,
    handleStartStream,
    handleStopStream
  };
};
