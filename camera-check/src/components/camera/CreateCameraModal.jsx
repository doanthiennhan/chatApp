import React from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { createCamera } from "../../services/cameraService";

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

const CreateCameraModal = ({ visible, onClose, onSuccess, initialValues, onFinish, isEdit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (isEdit && onFinish) {
        await onFinish(values);
      } else {
        await createCamera(values);
        message.success("Tạo camera thành công!");
        form.resetFields();
        onSuccess && onSuccess();
        onClose();
      }
    } catch (err) {
      message.error((isEdit ? "Cập nhật" : "Tạo") + " camera thất bại: " + (err?.response?.data?.message || err.message));
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
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues || { status: "ONLINE", type: "IP" }}
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