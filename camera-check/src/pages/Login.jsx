import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Form, Input, Button, Typography, Card, App as AntdApp, Layout } from "antd";
import { signin } from "../services/identityService";

const { Title } = Typography;
const { Content } = Layout;

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return false;
    const now = Date.now() / 1000;
    return decoded.exp > now;
  } catch {
    return true;
  }
};

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { message: messageApi } = AntdApp.useApp();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (isTokenValid(token)) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await signin(values.email, values.password);
      messageApi.success("Đăng nhập thành công!");
      setTimeout(() => {
        window.location.href = "/";
      }, 700);
    } catch {
      messageApi.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f6fa" }}>
      <Content style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "20px"
      }}>
        <Card style={{ 
          width: "100%", 
          maxWidth: 400,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <Title level={3} style={{ textAlign: "center" }}>Đăng nhập</Title>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item label="Email" name="email" rules={[{ required: true, message: "Vui lòng nhập email!" }]}> 
              <Input type="email" placeholder="Email" autoComplete="email" />
            </Form.Item>
            <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}> 
              <Input.Password placeholder="Mật khẩu" autoComplete="current-password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>Đăng nhập</Button>
            </Form.Item>
          </Form>
          <div style={{ textAlign: "center" }}>
            Chưa có tài khoản? <a href="/register">Đăng ký</a>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default Login; 