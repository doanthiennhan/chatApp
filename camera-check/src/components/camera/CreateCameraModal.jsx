import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { useDispatch, useSelector } from 'react-redux';
import { createCamera, updateCamera } from '../../store/slices/cameraSlice';

const { Option } = Select;

const statusOptions = [
  { label: "Online", value: "ONLINE" },
  { label: "Offline", value: "OFFLINE" },
  { label: "Warning", value: "WARNING" },
];

const typeOptions = [
  { label: "IP", value: "IP" },
  { label: "Analog", value: "ANALOG" },
];

const CreateCameraModal = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const editingCameraId = useSelector(state => state.camera.editingCameraId);
  const cameraToEdit = useSelector(state => 
    state.camera.list.find(cam => cam.id === editingCameraId)
  );

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (isEdit) {
        await dispatch(updateCamera({ ...cameraToEdit, ...values })).unwrap();
        message.success("Cập nhật camera thành công!");
      } else {
        await dispatch(createCamera(values)).unwrap();
        message.success("Tạo camera thành công!");
      }
      if (onClose) onClose();
    } catch (err) {
      message.error((isEdit ? "Cập nhật" : "Tạo") + " camera thất bại: " + (err?.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <Modal
      title={isEdit ? "Sửa Camera" : "Tạo Camera mới"}
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={500}
      destroyOnHidden
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
          <Button onClick={handleClose} style={{ marginRight: 8 }}>
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