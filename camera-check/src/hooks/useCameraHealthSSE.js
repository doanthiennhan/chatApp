/* import { useEffect, useRef, useState } from "react";
import SockJS from 'sockjs-client';

export default function useCameraHealthSSE(cameraId, enabled) {
  const [health, setHealth] = useState(null);
  const sockRef = useRef(null);

  useEffect(() => {
    if (!enabled || !cameraId) return;

    const url = `http://localhost:8082/camera-status?cameraId=${cameraId}`;
    const sock = new SockJS(url);
    sockRef.current = sock;

    sock.onopen = () => {
      console.log('SockJS connection opened for camera health');
    };

    sock.onmessage = (event) => {
      try {
        setHealth(JSON.parse(event.data));
      } catch (e) {
        setHealth(null);
      }
    };

    sock.onerror = (err) => {
      console.error('SockJS error:', err);
      sock.close();
      setHealth(null);
    };

    sock.onclose = () => {
      console.log('SockJS connection closed');
      setHealth(null);
    };

    return () => {
      if (sock.readyState === SockJS.OPEN) {
        sock.close();
      }
      sockRef.current = null;
    };
  }, [cameraId, enabled]);

  return health;
} */