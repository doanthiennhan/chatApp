import { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Form,
  Input,
  Avatar,
  Row,
  Col,
  message,
  Descriptions,
  Divider,
  Space,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const Profile = () => {
  // Example user data; replace with real data fetching logic as needed
  const [userInfo, setUserInfo] = useState({
    name: "Nguyen Van A",
    email: "user@example.com",
    phone: "0123456789",
    address: "Hanoi, Vietnam",
  });
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEdit = () => {
    setEditMode(true);
    form.setFieldsValue(userInfo);
  };

  const handleCancel = () => {
    setEditMode(false);
    form.resetFields();
  };

  const handleSave = async (values) => {
    setLoading(true);
    setTimeout(() => {
    setUserInfo({ ...userInfo, ...values });
    setEditMode(false);
      setLoading(false);
    message.success("Cập nhật thông tin thành công!");
    }, 800);
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px",
      position: "relative"
    }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined style={{ fontSize: 20 }} />}
        onClick={() => navigate("/home")}
        style={{
          position: "absolute",
          left: 16,
          top: 16,
          zIndex: 2,
          color: "#fff",
          fontWeight: 600,
          fontSize: 18,
        }}
      >
        Quay lại Home
      </Button>
        <Card
          bordered={false}
        style={{
          borderRadius: 18,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          width: "100%",
          maxWidth: 480,
          position: "relative",
        }}
        bodyStyle={{ padding: 36, paddingTop: 24 }}
        >
        {/* Nút quay lại */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined style={{ fontSize: 20 }} />}
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            left: 16,
            top: 16,
            zIndex: 2,
            color: "#1677ff",
            fontWeight: 600,
            fontSize: 18,
          }}
        >
          Quay lại
        </Button>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 24,
            marginTop: 8,
          }}
        >
          <Avatar
            size={104}
            icon={<UserOutlined />}
            style={{ marginBottom: 18, background: "#1677ff" }}
          />
          <Title level={3} style={{ marginBottom: 0, textAlign: "center" }}>
            {userInfo.name}
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            {userInfo.email}
          </Text>
          </div>
          <Divider />
          {!editMode ? (
            <>
            <Descriptions
              column={1}
              size="middle"
              style={{ marginBottom: 28 }}
              labelStyle={{ fontWeight: 500, color: "#555" }}
              contentStyle={{ fontSize: 16 }}
            >
              <Descriptions.Item label="Họ và tên">
                {userInfo.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {userInfo.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {userInfo.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {userInfo.address}
              </Descriptions.Item>
              </Descriptions>
              <Button
                type="primary"
                icon={<EditOutlined />}
                block
              size="large"
                onClick={handleEdit}
              style={{ fontWeight: 600, borderRadius: 8, marginTop: 8 }}
              >
                Chỉnh sửa thông tin
              </Button>
            </>
          ) : (
            <Form
              form={form}
              layout="vertical"
              initialValues={userInfo}
              onFinish={handleSave}
              autoComplete="off"
            style={{ marginTop: 8 }}
            >
            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input size="large" />
              </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input size="large" disabled />
              </Form.Item>
              <Form.Item label="Số điện thoại" name="phone">
              <Input size="large" />
              </Form.Item>
              <Form.Item label="Địa chỉ" name="address">
              <Input size="large" />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  style={{ width: "48%", fontWeight: 600, borderRadius: 8 }}
                  size="large"
                >
                  Lưu
                </Button>
                <Button
                  icon={<CloseOutlined />}
                  style={{ width: "48%", borderRadius: 8 }}
                  onClick={handleCancel}
                  size="large"
                  disabled={loading}
                >
                  Hủy
                </Button>
              </Space>
              </Form.Item>
            </Form>
          )}
        </Card>
    </div>
  );
};

export default Profile;