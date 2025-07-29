import { Modal, Badge, Descriptions, Spin, message } from "antd";
import { useEffect, useState } from "react";
import StreamPlayer from "./StreamPlayer";

const statusColor = {
  online: "green",
  warning: "gold",
  offline: "red",
};

const qualityColor = {
  excellent: "green",
  good: "blue",
  poor: "red",
};

const CameraModal = ({ camera, visible, onClose }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Không cần gọi API startView/stopView nữa
    // JSMpegPlayer sẽ tự kết nối WebSocket khi cần
    console.log('🔧 CameraModal: Camera ready for streaming:', camera?.id);
  }, [visible, camera?.id]);

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>{camera?.name || 'Camera'}</span>
          <Badge 
            status={camera?.status === 'online' ? 'success' : 'error'} 
            text={camera?.status || 'unknown'} 
          />
        </div>
      }
      open={visible}
      onCancel={onClose}
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