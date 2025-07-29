import { Card, Badge, Button, Popconfirm, Space, Tooltip } from "antd";
import { VideoCameraOutlined, EditOutlined, DeleteOutlined, HeartOutlined } from "@ant-design/icons";

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

const CameraCard = ({ camera, onClick, onEdit, onDelete, onCheckHealth }) => (
  <Badge.Ribbon text={camera.status} color={statusColor[camera.status]}>
    <Card
      hoverable
      cover={
        <img
          src={camera.snapshotUrl || "https://hikvision.vn/wp-content/uploads/2023/09/DS-2GN655-V.jpg"}
          alt={camera.name}
          style={{
            width: '100%',
            height: '200px',
            objectFit: 'cover',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'box-shadow 0.3s',
            display: 'block',
          }}
          className="camera-card-img"
        />
      }
      onClick={() => onClick(camera)}
      style={{ marginBottom: 16 }}
      actions={[
        <Tooltip title="Sửa camera" key="edit"><EditOutlined onClick={e => { e.stopPropagation(); onEdit(camera); }} /></Tooltip>,
        <Popconfirm
          title="Bạn có chắc muốn xóa camera này?"
          onConfirm={e => { e.stopPropagation(); onDelete(camera); }}
          okText="Xóa"
          cancelText="Hủy"
          onCancel={e => e.stopPropagation()}
        >
          <DeleteOutlined key="delete" onClick={e => e.stopPropagation()} style={{ color: 'red' }} />
        </Popconfirm>,
        <Tooltip title="Kiểm tra tình trạng" key="health">
          <HeartOutlined style={{ color: '#eb2f96' }} onClick={e => { e.stopPropagation(); onCheckHealth(camera); }} />
        </Tooltip>
      ]}
    >
      <Card.Meta
        avatar={<VideoCameraOutlined />}
        title={camera.name}
        description={
          <div>
            <Badge color={qualityColor[camera.imageQuality]} text={camera.imageQuality} />
            <div style={{ fontSize: 12, color: "#888" }}>
              {camera.lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        }
      />
    </Card>
  </Badge.Ribbon>
);

export default CameraCard; 