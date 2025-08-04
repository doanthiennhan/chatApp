import { Modal, Badge, Spin } from "antd";
import { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import StreamPlayer from "./StreamPlayer";
import { clearSelectedCameraId } from '../../store/slices/cameraSlice';

const statusColor = {
  ONLINE: "green",
  WARNING: "gold",
  OFFLINE: "red",
};

const CameraModal = () => {
  const dispatch = useDispatch();
  const selectedCameraId = useSelector(state => state.camera.selectedCameraId);
  const camera = useSelector(state => 
    state.camera.list.find(cam => cam.id === selectedCameraId)
  );

  const visible = !!selectedCameraId;

  const handleClose = () => {
    dispatch(clearSelectedCameraId());
  };

  useEffect(() => {
    if (camera) {
      console.log('🔧 CameraModal: Camera ready for streaming:', camera?.id);
    }
  }, [camera]);

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>{camera?.name || 'Camera'}</span>
          <Badge 
            status={camera?.status === 'ONLINE' ? 'success' : 'error'} 
            text={camera?.status || 'unknown'} 
          />
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={900}
      style={{ top: 20 }}
      styles={{ body: { padding: 0 } }}
    >
      {camera ? (
        <StreamPlayer 
          camera={camera} 
          selectedCamera={camera}
          isInModal={true} // Flag để biết đang ở trong modal
          visible={visible} // Truyền trạng thái visible để cleanup
          playerType="springboot" // Sử dụng Spring Boot player
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📹</div>
          <div>Không có thông tin camera</div>
        </div>
      )}
    </Modal>
  );
};

export default CameraModal; 