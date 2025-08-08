/* import { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { useDispatch } from "react-redux";
import { createGroup } from "../../store/slices/chatSlice";

const GroupChannelManagement = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      // Giả lập chọn thành viên, thực tế sẽ là danh sách user
      const members = values.members.split(",").map(s => s.trim()).filter(Boolean);
      await dispatch(createGroup({
        name: values.name,
        description: values.description,
        createdBy: localStorage.getItem("userId") || "1",
        members,
      })).unwrap();
      message.success("Tạo nhóm thành công!");
      form.resetFields();
      onClose();
    } catch (err) {
      message.error("Tạo nhóm thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onCancel={onClose} onOk={handleOk} title="Tạo nhóm mới" confirmLoading={loading} okText="Tạo nhóm">
      <Form form={form} layout="vertical">
        <Form.Item label="Tên nhóm" name="name" rules={[{ required: true, message: "Nhập tên nhóm" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Mô tả" name="description">
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
        </Form.Item>
        <Form.Item label="Thành viên (nhập userId, cách nhau dấu phẩy)" name="members">
          <Input placeholder="2,3,4" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default GroupChannelManagement; */