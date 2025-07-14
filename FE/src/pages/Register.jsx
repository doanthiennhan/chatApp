import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../redux/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Alert, Typography, Card } from 'antd';

const { Title, Text } = Typography;

const Register = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleFinish = async (values) => {
    const result = await dispatch(register({ email: values.email, password: values.password }));
    if (register.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdfa 0%, #e0e7ff 100%)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1,
    }}>
      <Card
        style={{ width: 380, borderRadius: 16, boxShadow: '0 8px 32px rgba(31, 41, 55, 0.15)' }}
        bodyStyle={{ padding: 32 }}
      >
        <Title level={2} style={{ textAlign: 'center', color: '#16a34a', marginBottom: 16 }}>Đăng ký</Title>
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
          {success && (
            <Form.Item>
              <Alert message="Đăng ký thành công! Đang chuyển hướng..." type="success" showIcon style={{ marginBottom: 8 }} />
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
              Đăng ký
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 15 }}>
          <Text>Đã có tài khoản? </Text>
          <Link to="/login" style={{ color: '#16a34a', textDecoration: 'underline', fontWeight: 500 }}>Đăng nhập</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register; 