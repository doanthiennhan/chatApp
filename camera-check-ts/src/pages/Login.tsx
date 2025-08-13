
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Form, Input, Button, Typography, Card, App as AntdApp, Layout } from "antd";
import { signin } from "../services/identityService";
import { useTranslation } from 'react-i18next';

const { Title } = Typography;
const { Content } = Layout;

const isTokenValid = (token: string) => {
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
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (isTokenValid(token as string)) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await signin(values.email, values.password);
      messageApi.success(t("login_success"));
      setTimeout(() => {
        window.location.href = "/";
      }, 700);    
    } catch {
      messageApi.error(t("login_failure"));
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
          <Title level={3} style={{ textAlign: "center" }}>{t("login")}</Title>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item label={t("email")} name="email" rules={[{ required: true, message: t("email_required") }]}> 
              <Input type="email" placeholder={t("email")} autoComplete="email" />
            </Form.Item>
            <Form.Item label={t("password")} name="password" rules={[{ required: true, message: t("password_required") }]}> 
              <Input.Password placeholder={t("password")} autoComplete="current-password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>{t("login")}</Button>
            </Form.Item>
          </Form>
          <div style={{ textAlign: "center" }}>
            {t("no_account_yet")} <a href="/register">{t("register")}</a>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default Login;