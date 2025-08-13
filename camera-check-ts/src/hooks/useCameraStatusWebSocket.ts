
import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateCameraStatus } from '../store/slices/cameraSlice';

const WEBSOCKET_URL = 'ws://localhost:8082/camera/status';

// Fallback URL nếu server chính không hoạt động
const FALLBACK_WEBSOCKET_URL = 'ws://localhost:8080/camera/status';

export const useCameraStatusWebSocket = () => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connectWebSocket = useCallback(() => {
    console.log('Đang cố gắng kết nối tới WebSocket...');
    
    // Kiểm tra xem WebSocket đã tồn tại chưa
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket đã kết nối, không cần kết nối lại');
      return;
    }
    
    try {
      // Thử kết nối tới server chính trước
      socketRef.current = new WebSocket(WEBSOCKET_URL);

      socketRef.current.onopen = () => {
        console.log('Kết nối WebSocket thành công!');
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      socketRef.current.onmessage = (event) => {
        try {
          const cameraStatusUpdate = JSON.parse(event.data);
          console.log('Nhận được cập nhật trạng thái:', cameraStatusUpdate);

          dispatch(updateCameraStatus({
            cameraId: cameraStatusUpdate.cameraId,
            status: cameraStatusUpdate.status,
            viewerCount: cameraStatusUpdate.viewerCount,
            name: cameraStatusUpdate.name,
            location: cameraStatusUpdate.location,
            resolution: cameraStatusUpdate.resolution,
            vendor: cameraStatusUpdate.vendor
          }));

        } catch (error) {
          console.error('Lỗi khi phân tích dữ liệu từ WebSocket:', error);
        }
      };



      socketRef.current.onclose = (event) => {
        console.log('Kết nối WebSocket đã đóng. Mã:', event.code, 'Lý do:', event.reason);
        
        // Chỉ thử kết nối lại nếu không phải là intentional close
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Đang thử kết nối lại...');
            connectWebSocket();
          }, 5000);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('Lỗi WebSocket:', error);
        // Không cần xử lý gì thêm vì onclose sẽ được gọi
      };

    } catch (error) {
      console.error('Lỗi khi tạo WebSocket connection:', error);
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 5000);
    }
  }, [dispatch]);

  const disconnectWebSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    connectWebSocket();


    
    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket]);

  return {
    isConnected: socketRef.current?.readyState === WebSocket.OPEN,
    connect: connectWebSocket,
    disconnect: disconnectWebSocket
  };
};
