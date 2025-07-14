import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Alert, Spin, Typography, Card } from 'antd';

const { Title, Text } = Typography;

const Login = () => {
  const dispatch = useDispatch();
  const { loading, error, user } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleFinish = (values) => {
    dispatch(login({ email: values.email, password: values.password }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1,
    }}>
      <Card
        style={{ width: 380, borderRadius: 16, boxShadow: '0 8px 32px rgba(31, 41, 55, 0.15)' }}
        bodyStyle={{ padding: 32 }}
      >
        <Title level={2} style={{ textAlign: 'center', color: '#2563eb', marginBottom: 16 }}>Đăng nhập</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input prefix="📧" placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' },
            ]}
          >
            <Input.Password prefix="🔒" placeholder="Mật khẩu" size="large" />
          </Form.Item>
          {error && (
            <Form.Item>
              <Alert message={error} type="error" showIcon style={{ marginBottom: 8 }} />
            </Form.Item>
          )}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{ fontWeight: 600, letterSpacing: 1 }}
              disabled={loading}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 15 }}>
          <Text>Chưa có tài khoản? </Text>
          <Link to="/register" style={{ color: '#6366f1', textDecoration: 'underline', fontWeight: 500 }}>Đăng ký</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login; 