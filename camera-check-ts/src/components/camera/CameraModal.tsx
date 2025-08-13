import React, { useEffect } from "react";
import { Modal, Badge, Spin } from "antd";
import StreamPlayer from "./StreamPlayer";
import { useCameraRealTimeStatus } from "../../hooks/useCameraRealTimeStatus";
import { Camera } from "../../types";

interface CameraModalProps {
  selectedCamera: Camera | null;
  visible: boolean;
  onClose: () => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ selectedCamera, visible, onClose }) => {
  
  const realTimeStatus = useCameraRealTimeStatus(selectedCamera?.id);

  const handleClose = () => {
    onClose();
  };

  

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