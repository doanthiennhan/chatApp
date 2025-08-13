
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { useDispatch, useSelector } from 'react-redux';
import { createCamera, updateCamera } from '../../store/slices/cameraSlice';
import { Camera } from '../../types';
import { RootState, AppDispatch } from '../../store';

const { Option } = Select;

interface CreateCameraModalProps {
  visible: boolean;
  onClose: () => void;
}

const statusOptions = [
  { label: "Online", value: "ONLINE" },
  { label: "Offline", value: "OFFLINE" },
  { label: "Warning", value: "WARNING" },
];

const typeOptions = [
  { label: "IP", value: "IP" },
  { label: "Analog", value: "ANALOG" },
];

const CreateCameraModal: React.FC<CreateCameraModalProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const editingCameraId = useSelector((state: RootState) => state.camera.editingCameraId);
  const cameraToEdit = useSelector((state: RootState) => 
    state.camera.list.find(cam => cam.id === editingCameraId)
  );

  const [form] = Form.useForm<Omit<Camera, 'id'>>();
  const [loading, setLoading] = useState<boolean>(false);

  const isEdit = !!editingCameraId;

  useEffect(() => {
    if (visible) {
      if (isEdit && cameraToEdit) {
        form.setFieldsValue(cameraToEdit);
      } else {
        form.resetFields();
        form.setFieldsValue({ status: "ONLINE", type: "IP" });
      }
    }
  }, [visible, isEdit, cameraToEdit, form]);

  const handleSubmit = async (values: Omit<Camera, 'id'>) => {
    setLoading(true);
    try {
      if (isEdit && cameraToEdit) {
        await dispatch(updateCamera({ ...cameraToEdit, ...values })).unwrap();
        message.success("Cập nhật camera thành công!");
      } else {
        await dispatch(createCamera(values)).unwrap();
        message.success("Tạo camera thành công!");
      }
      onClose();
    } catch (err: any) {
      const errorMessage = err.message || "Thao tác thất bại";
      message.error((isEdit ? "Cập nhật" : "Tạo") + ` camera thất bại: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Sửa Camera" : "Tạo Camera mới"}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Tên camera"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên camera" }]} 
        >
          <Input placeholder="Nhập tên camera" />
        </Form.Item>
        <Form.Item
          label="RTSP URL"
          name="rtspUrl"
          rules={[{ required: true, message: "Vui lòng nhập RTSP URL" }]} 
        >
          <Input placeholder="http://..." />
        </Form.Item>
        <Form.Item
          label="Vị trí"
          name="location"
          rules={[{ required: true, message: "Vui lòng nhập vị trí" }]} 
        >
          <Input placeholder="Nhập vị trí" />
        </Form.Item>
        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: "Chọn trạng thái" }]} 
        >
          <Select options={statusOptions} placeholder="Chọn trạng thái" />
        </Form.Item>
        <Form.Item
          label="Loại camera"
          name="type"
          rules={[{ required: true, message: "Chọn loại camera" }]} 
        >
          <Select options={typeOptions} placeholder="Chọn loại camera" />
        </Form.Item>
        <Form.Item
          label="Nhà cung cấp"
          name="vendor"
          rules={[{ required: true, message: "Vui lòng nhập nhà cung cấp" }]} 
        >
          <Input placeholder="Nhập nhà cung cấp" />
        </Form.Item>
        <Form.Item style={{ textAlign: "right", marginTop: 24 }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? "Lưu thay đổi" : "Tạo mới"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateCameraModal;
