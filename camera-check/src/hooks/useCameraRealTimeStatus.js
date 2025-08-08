import { useSelector } from 'react-redux';

/**
 * Hook để lấy real-time status của camera từ Redux store
 * @param {string} cameraId - ID của camera
 * @returns {Object} Real-time status của camera
 */
export const useCameraRealTimeStatus = (cameraId) => {
  const realTimeStatus = useSelector(state => state.camera.realTimeStatus);
  const camera = useSelector(state => 
    state.camera.list.find(cam => cam.id === cameraId)
  );

  // Lấy status từ realTimeStatus hoặc fallback về camera.status
  const status = realTimeStatus[cameraId]?.status || camera?.status || 'OFFLINE';
  const viewerCount = realTimeStatus[cameraId]?.viewerCount || camera?.viewerCount || 0;
  const lastUpdated = realTimeStatus[cameraId]?.lastUpdated || camera?.lastUpdated;

  return {
    status,
    viewerCount,
    lastUpdated,
    isOnline: status === 'ONLINE',
    // Thêm các thông tin khác từ camera nếu cần
    name: camera?.name,
    location: camera?.location,
    resolution: camera?.resolution,
    vendor: camera?.vendor
  };
};

/**
 * Hook để lấy real-time status của tất cả camera
 * @returns {Object} Object chứa real-time status của tất cả camera
 */
export const useAllCameraRealTimeStatus = () => {
  const realTimeStatus = useSelector(state => state.camera.realTimeStatus);
  const cameras = useSelector(state => state.camera.list);

  const allStatus = {};
  
  cameras.forEach(camera => {
    const cameraStatus = realTimeStatus[camera.id];
    allStatus[camera.id] = {
      status: cameraStatus?.status || camera.status || 'OFFLINE',
      viewerCount: cameraStatus?.viewerCount || camera.viewerCount || 0,
      lastUpdated: cameraStatus?.lastUpdated || camera.lastUpdated,
      isOnline: (cameraStatus?.status || camera.status) === 'ONLINE',
      name: camera.name,
      location: camera.location,
      resolution: camera.resolution,
      vendor: camera.vendor
    };
  });

  return allStatus;
}; 