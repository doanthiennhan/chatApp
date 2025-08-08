# Camera Real-Time Status System

## Tổng quan

Hệ thống real-time status cho camera sử dụng WebSocket để cập nhật trạng thái camera theo thời gian thực. Tất cả các component trong ứng dụng đều sử dụng cùng một nguồn dữ liệu để đảm bảo tính nhất quán.

## Các Hook chính

### 1. `useCameraStatusWebSocket`
- **Mục đích**: Khởi tạo và quản lý WebSocket connection với server
- **Vị trí**: `src/hooks/useCameraStatusWebSocket.js`
- **Sử dụng**: Được sử dụng trong `WebSocketProvider` ở cấp ứng dụng

### 2. `useCameraRealTimeStatus(cameraId)`
- **Mục đích**: Lấy real-time status của một camera cụ thể
- **Tham số**: `cameraId` - ID của camera
- **Trả về**: Object chứa status, viewerCount, lastUpdated, isOnline, name, location, resolution, vendor

### 3. `useAllCameraRealTimeStatus()`
- **Mục đích**: Lấy real-time status của tất cả camera
- **Trả về**: Object với key là cameraId và value là status object

### 4. `useWebSocketStatus()`
- **Mục đích**: Lấy trạng thái kết nối WebSocket
- **Trả về**: Object chứa isConnected, lastConnected, reconnectAttempts

## Cách sử dụng

### Trong Component
```jsx
import { useCameraRealTimeStatus } from '../hooks/useCameraRealTimeStatus';

const MyComponent = ({ cameraId }) => {
  const realTimeStatus = useCameraRealTimeStatus(cameraId);
  
  return (
    <div>
      <span>Status: {realTimeStatus.status}</span>
      <span>Viewers: {realTimeStatus.viewerCount}</span>
      <span>Online: {realTimeStatus.isOnline ? 'Yes' : 'No'}</span>
    </div>
  );
};
```

### Trong Page
```jsx
import { useAllCameraRealTimeStatus } from '../hooks/useCameraRealTimeStatus';

const CameraPage = () => {
  const allCameraRealTimeStatus = useAllCameraRealTimeStatus();
  
  return (
    <div>
      {cameras.map(camera => (
        <CameraGridItem 
          key={camera.id}
          camera={camera}
          // Không cần truyền realTimeStatus prop nữa
        />
      ))}
    </div>
  );
};
```

## Redux Store Structure

```javascript
{
  camera: {
    realTimeStatus: {
      [cameraId]: {
        status: 'ONLINE' | 'OFFLINE' | 'ERROR',
        viewerCount: number,
        lastUpdated: ISO string,
        name: string,
        location: string,
        resolution: string,
        vendor: string
      }
    }
  }
}
```

## WebSocket Message Format

Server gửi message với format:
```json
{
  "cameraId": "camera-1",
  "status": "ONLINE",
  "viewerCount": 5,
  "name": "Camera 1",
  "location": "Main Entrance",
  "resolution": "1920x1080",
  "vendor": "Hikvision"
}
```

## Lợi ích

1. **Tính nhất quán**: Tất cả component đều sử dụng cùng một nguồn dữ liệu
2. **Real-time**: Cập nhật tự động khi có thay đổi từ server
3. **Hiệu suất**: Chỉ một WebSocket connection cho toàn bộ ứng dụng
4. **Dễ bảo trì**: Logic tập trung trong các hook
5. **Type safety**: Cấu trúc dữ liệu rõ ràng và nhất quán

## Migration Notes

- Loại bỏ việc truyền `realTimeStatus` prop vào `CameraGridItem`
- Sử dụng hook thay vì truyền prop
- WebSocket connection được khởi tạo ở cấp ứng dụng thông qua `WebSocketProvider` 