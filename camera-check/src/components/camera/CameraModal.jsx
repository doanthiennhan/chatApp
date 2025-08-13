import { Modal, Badge, Spin } from "antd";
import { useEffect } from "react";
import StreamPlayer from "./StreamPlayer";
import { useCameraRealTimeStatus } from "../../hooks/useCameraRealTimeStatus";

const CameraModal = ({ selectedCamera, visible, onClose }) => {
  
  const realTimeStatus = useCameraRealTimeStatus(selectedCamera?.id);

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    if (selectedCamera) {
      console.log('🔧 CameraModal: Camera ready for streaming:', selectedCamera?.id);
    }
  }, [selectedCamera]);

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>{selectedCamera?.name || 'Camera'}</span>
          <Badge 
            status={realTimeStatus.isOnline ? 'success' : 'error'} 
            text={realTimeStatus.status || 'unknown'} 
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
      {selectedCamera ? (
        <StreamPlayer 
          camera={selectedCamera} 
          selectedCamera={selectedCamera}
          isInModal={true}
          visible={visible}
          playerType="springboot"
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
