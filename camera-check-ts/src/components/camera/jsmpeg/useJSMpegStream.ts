import { useState, useEffect, useRef, useCallback } from 'react';
import { message } from 'antd';
import JSMpegPlayer from '@cycjimmy/jsmpeg-player';
import { getJSMpegOptions } from '../../../utils/webglCheck';
import { waitForCanvasRef } from '../../../utils/canvasTest';
import {
  getBackendWebSocketUrl,
  getMetadataWebSocketUrl,
  parseStreamMetadata,
  StreamMetadata,
  StreamInfo,
  formatBitrate
} from './jsmpegUtils';
import { Camera } from '../../../types';

interface JSMpegPlayerInstance extends JSMpegPlayer {
  destroy: () => void;
  currentTime: number;
  onVideoDecode: () => void;
}

export const useJSMpegStream = (camera: Camera | null, isInModal = false, visible = true) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);
  const [viewerCount, setViewerCount] = useState<number>(0);
  const [activeStreams, setActiveStreams] = useState<Set<string>>(new Set());
  const [players, setPlayers] = useState<Record<string, JSMpegPlayerInstance>>({});
  const [streamMetadata, setStreamMetadata] = useState<StreamMetadata | null>(null);
  const playerRef = useRef<JSMpegPlayerInstance | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const metadataWebSocketRef = useRef<WebSocket | null>(null);

  const handleStopStream = useCallback(() => {
    if (!camera?.id) return;
    setLoading(true);
    try {
      const player = players[camera.id];
      if (player) {
        player.destroy();
        setPlayers((prev) => {
          const updated = { ...prev };
          delete updated[camera.id];
          return updated;
        });
      }
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
    } catch (error: any) {
      message.error('Lỗi khi dừng stream: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [camera?.id, camera?.name, players, message]);

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
  }, [handleStopStream]); // isStreaming is not needed here, handleStopStream already depends on it

  const initializeMetadataWebSocket = useCallback(() => {
    if (!camera?.id) return;
    try {
      const metadataWsUrl = getMetadataWebSocketUrl(camera.id);
      const metadataWs = new WebSocket(metadataWsUrl);
      metadataWebSocketRef.current = metadataWs;

      const timeout = setTimeout(() => {
        if (metadataWs.readyState === WebSocket.CONNECTING) metadataWs.close();
      }, 5000);

      metadataWs.onopen = () => clearTimeout(timeout);

      metadataWs.onmessage = (event: MessageEvent) => {
        if (typeof event.data === 'string' && event.data.trim().startsWith('{')) {
          const metadata = parseStreamMetadata(event.data);
          if (metadata) {
            setStreamMetadata(metadata);
            setStreamInfo({
              videoCodec: 'MPEG1',
              audioCodec: 'MP2',
              resolution: metadata.resolution,
              frameRate: metadata.fps,
              bitRate: formatBitrate(metadata.bitrate_kbps),
              format: 'MPEG-TS',
              updatedAt: new Date(metadata.timestamp).toISOString()
            });
          }
        }
      };

      metadataWs.onerror = (error: Event) => console.error('Metadata WebSocket error:', error);
      metadataWs.onclose = (event: CloseEvent) => {
        if (event.code !== 1000 && isStreaming) {
          // Attempt to reconnect if not a normal closure and still streaming
          setTimeout(() => isStreaming && initializeMetadataWebSocket(), 3000);
        }
      };
    } catch (error: any) {
      console.error('Error initializing metadata WebSocket:', error);
    }
  }, [camera?.id, isStreaming]);

  const initializeJSMpegStream = useCallback((canvasRef: React.RefObject<HTMLCanvasElement>) => {
    if (!camera?.id) return;
    try {
      const wsUrl = getBackendWebSocketUrl(camera.id);
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
          onPlay: () => setConnectionStatus('connected'),
          onError: (player: typeof JSMpegPlayer, error: any) => {
            setConnectionStatus('error');
            message.error('Lỗi phát video MPEG1');
            console.error('JSMpeg Player Error:', error);
          },
          onSourceEstablished: () => setConnectionStatus('connecting'),
          onDisconnect: () => setConnectionStatus('disconnected'),
        });

        const player = new JSMpegPlayer(wsUrl, playerOptions) as JSMpegPlayerInstance;
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
    } catch (error: any) {
      setConnectionStatus('error');
      message.error('Lỗi khởi tạo JSMpeg: ' + error.message);
    }
  }, [camera?.id, initializeMetadataWebSocket]);

  const handleStartStream = useCallback((canvasRef: React.RefObject<HTMLCanvasElement>) => {
    if (!camera?.id) return message.error('Camera ID không hợp lệ');
    setLoading(true);
    setConnectionStatus('connecting');
    try {
      // startStream(camera.id);
      setIsStreaming(true);
      message.success(`Đang kết nối stream camera: ${camera.name}`);
      initializeJSMpegStream(canvasRef);
    } catch (error: any) {
      message.error('Lỗi khi bắt đầu stream: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [camera?.id, camera?.name, initializeJSMpegStream, message]);

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
