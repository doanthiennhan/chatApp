import { useState, useEffect, useRef } from 'react';
import JSMpeg from '@cycjimmy/jsmpeg-player';
import { getWebSocketUrl, getMetadataWebSocketUrl, createWebSocketConnection, parseStreamMetadata } from '../utils/websocket';

export const useJsmpegPlayer = (cameraId, isStreaming, canvasRef) => {
  const playerRef = useRef(null);
  const metadataWsRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [fps, setFps] = useState(0);
  const [bitrate, setBitrate] = useState(0);
  const [resolution, setResolution] = useState('N/A');
  const [isMuted, setIsMuted] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [uptime, setUptime] = useState(0);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    console.log(`🔧 [${cameraId}] useEffect triggered. isStreaming: ${isStreaming}, canvasRef.current: ${canvasRef.current}, isMuted: ${isMuted}`);

    const initializePlayer = () => {
      console.log(`🔧 [${cameraId}] initializePlayer called. canvasRef.cur
export const useJsmpegPlayer = (cameraId, isStreaming, canvasRef) => {
  const playerRef = useRef(null);
  const metadataWsRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  crent:`, canvasRef.current, `playerRef.current:`, playerRef.current);
      if (!canvasRef.current || playerRef.current) {
        console.log(`🔧 [${cameraId}] Initialization skipped: canvasRef.current is null or player already exists.`);
        return;
      }

      console.log(`🔧 [${cameraId}] Initializing JSMpeg player and metadata WebSocket.`);
      setConnectionStatus('connecting');

      const wsUrl = getWebSocketUrl(cameraId);
      
      const playerOptions = {
        canvas: canvasRef.current,
        autoplay: true,
        audio: true,
        volume: isMuted ? 0 : 1,
        onPlay: () => {
          console.log(`[${cameraId}] Stream playing.`);
          setConnectionStatus('connected');
        },
        onPause: () => {
            console.log(`[${cameraId}] Stream paused.`);
            setConnectionStatus('paused');
        },
        onEnded: () => {
            console.log(`[${cameraId}] Stream ended.`);
            setConnectionStatus('disconnected');
        },
        onError: (error) => {
            console.error(`[${cameraId}] Player error:`, error);
            setConnectionStatus('error');
        },
        onSourceEstablished: () => {
            console.log(`[${cameraId}] Source established.`);
        },
        onDisconnect: () => {
            console.log(`[${cameraId}] WebSocket disconnected.`);
            setConnectionStatus('disconnected');
        },
      };

      const player = new JSMpeg.Player(wsUrl, playerOptions);
      playerRef.current = player;

      const metadataUrl = getMetadataWebSocketUrl(cameraId);
      metadataWsRef.current = createWebSocketConnection(
        metadataUrl,
        (event) => {
          console.log(`  [${cameraId}] Raw metadata received:`, event.data);
          const parsed = parseStreamMetadata(event.data);
          if (parsed) {
            console.log(`  [${cameraId}] Parsed metadata:`, parsed);
            setFps(parsed.fps);
            setBitrate(parseFloat(parsed.bitrate) || 0);
            setResolution(parsed.resolution);
            setViewerCount(parsed.viewerCount || 0);
            setUptime(parsed.uptime || 0);
            setIsOnline(parsed.status === 'ONLINE');
            console.log(`  [${cameraId}] State updated: FPS=${parsed.fps}, Bitrate=${parsed.bitrate}, Resolution=${parsed.resolution}, Viewers=${parsed.viewerCount}, Uptime=${parsed.uptime}, Online=${parsed.status === 'ONLINE'}`);
          }
        },
        () => console.log(`  [${cameraId}] Metadata WS connected.`),
        () => console.log(`  [${cameraId}] Metadata WS disconnected.`),
        (err) => console.error(`  [${cameraId}] Metadata WS error:`, err)
      );
    };

    const destroyPlayer = () => {
      console.log(`🔧 [${cameraId}] destroyPlayer called.`);
      if (playerRef.current) {
        console.log(`[${cameraId}] Destroying JSMpeg player.`);
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.warn(`[${cameraId}] Error destroying player:`, error);
        }
        playerRef.current = null;
      }
      if (metadataWsRef.current && metadataWsRef.current.readyState !== WebSocket.CLOSED) {
          console.log(`[${cameraId}] Closing metadata WebSocket.`);
        try {
          metadataWsRef.current.close();
        } catch (error) {
          console.warn(`[${cameraId}] Error closing metadata WebSocket:`, error);
        }
        metadataWsRef.current = null;
      }
      setConnectionStatus('disconnected');
      setFps(0);
      setBitrate(0);
      setResolution('N/A');
      setViewerCount(0);
      setUptime(0);
      setIsOnline(false);
    };

    if (isStreaming) {
      initializePlayer();
    } else {
      destroyPlayer();
    }

    return () => {
      console.log(`[${cameraId}] Cleanup function for useEffect. isStreaming: ${isStreaming}`);
      destroyPlayer();
    };
  }, [cameraId, isStreaming, canvasRef, isMuted]);

  const toggleMute = () => {
    const player = playerRef.current;
    if (!player) {
      console.warn(`[${cameraId}] JSMpeg player is not initialized.`);
      return;
    }

    const audioOut = player.audioOut;
    if (!audioOut) {
      console.warn(`[${cameraId}] Audio output is not available for this stream.`);
      return;
    }

    const canMute = typeof audioOut.mute === 'function';
    const canUnmute = typeof audioOut.unmute === 'function';

    if (canMute && canUnmute) {
      if (audioOut.isMuted) {
        audioOut.unmute();
        setIsMuted(false);
      } else {
        audioOut.mute();
        setIsMuted(true);
      }
    } else {
      console.warn(`[${cameraId}] Audio control functions (mute: ${canMute}, unmute: ${canUnmute}) are not fully available on audio output. Audio might not be supported by the stream or JSMpeg.`);
    }
  };

  return { connectionStatus, fps, bitrate, resolution, isMuted, toggleMute, viewerCount, uptime, isOnline }
};
