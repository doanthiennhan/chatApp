import React, { useState, useEffect } from 'react';
import { Modal, Button, Checkbox, List, Avatar, Space, Typography } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { setDisplayedCameras } from '../../store/slices/cameraSlice';
import { CameraOutlined } from '@ant-design/icons';

const { Text } = Typography;

const SelectCamerasModal = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const allCameras = useSelector(state => state.camera.list);
  const currentDisplayedCameraIds = useSelector(state => state.camera.displayedCameraIds);

  const [selectedCameraIds, setSelectedCameraIds] = useState(currentDisplayedCameraIds);

  useEffect(() => {
    setSelectedCameraIds(currentDisplayedCameraIds);
  }, [currentDisplayedCameraIds]);

  const handleCheckboxChange = (cameraId, checked) => {
    setSelectedCameraIds(prev => 
      checked ? [...prev, cameraId] : prev.filter(id => id !== cameraId)
    );
  };

  const handleSave = () => {
    dispatch(setDisplayedCameras(selectedCameraIds));
    onClose();
  };

  return (
    <Modal
      title="Chọn Camera để hiển thị"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSave}>
          Lưu
        </Button>,
      ]}
      width={600}
    >
      <List
        dataSource={allCameras}
        renderItem={camera => (
          <List.Item
            actions={[
              <Checkbox 
                checked={selectedCameraIds.includes(camera.id)}
                onChange={e => handleCheckboxChange(camera.id, e.target.checked)}
              />
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<CameraOutlined />} />}
              title={<Text strong>{camera.name}</Text>}
              description={<Text type="secondary">{camera.location}</Text>}
            />
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default SelectCamerasModal;
